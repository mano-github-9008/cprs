const fs = require("fs");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Assessment = require("../models/Assessment");
const Batch = require("../models/Batch");
const StudentProfile = require("../models/StudentProfile");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* =========================================================
   AUTOPILOT CONFIG
========================================================= */
const AUTOPILOT_MAP = {
  "10th": { categories: ["logical", "communication"], difficulty: "easy", questionCount: 10, timePerQuestion: 60 },
  "12th": { categories: ["logical", "problemSolving"], difficulty: "medium", questionCount: 15, timePerQuestion: 60 },
  "Diploma": { categories: ["technical", "logical"], difficulty: "medium", questionCount: 20, timePerQuestion: 75 },
  "UG": { categories: ["technical", "logical", "problemSolving"], difficulty: "medium", questionCount: 25, timePerQuestion: 90 },
  "PG": { categories: ["technical", "logical", "problemSolving", "communication"], difficulty: "hard", questionCount: 30, timePerQuestion: 90 },
};

/* =========================================================
   HELPER: GEMINI WITH TIMEOUT
========================================================= */
const generateWithTimeout = (promise, ms = 25000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI response timeout")), ms)
    ),
  ]);
};

/* =========================================================
   GENERATE & STORE AI ASSESSMENT
========================================================= */
exports.generateAndStoreAssessment = async (req, res) => {
  try {
    const payload = req.parsedPayload;
    if (!payload) return res.status(400).json({ message: "Payload missing" });

    const { mode, config, institutionId, slot } = payload;
    let targetBatch = null;
    let profileContext = "";

    /* ================= BATCH RESOLUTION (AI AUTOPILOT) ================= */
    if (mode === "autopilot") {
      // 1. Find existing batch by class name
      targetBatch = await Batch.findOne({ 
        className: config.className, 
        institutionId: institutionId || req.user.institutionId 
      });

      // 2. Fetch Student Profiles to build context or create batch
      const profiles = await StudentProfile.find({ 
        institutionId: institutionId || req.user.institutionId 
      }).limit(15);

      if (profiles.length > 0) {
        profileContext = profiles.map(p => 
          `Edu: ${p.education}, Stream: ${p.stream}, Skills: ${p.skills.join(",")}, Goal: ${p.careerGoal}`
        ).join(" | ");
      }

      // 3. Auto-create batch if it doesn't exist
      if (!targetBatch && config.autopilotSettings?.createBatchesIfMissing) {
        const firstProfile = profiles[0];
        const detectedLevel = firstProfile?.education || "UG";
        
        targetBatch = await Batch.create({
          batchId: `AUTO-${Date.now()}`,
          name: config.className || `AI Batch - ${firstProfile?.stream || detectedLevel}`,
          className: config.className || "General",
          educationLevel: detectedLevel,
          institutionId: institutionId || req.user.institutionId,
          createdBy: req.user.id,
          slot: {
            date: slot?.date || new Date(),
            startTime: slot?.startTime || "10:00 AM",
            endTime: slot?.endTime || "11:00 AM"
          }
        });
      }
    } else {
      // Manual Mode
      targetBatch = await Batch.findOne({ batchId: config.batchId });
    }

    if (!targetBatch) return res.status(404).json({ message: "Batch context not found" });

    /* ================= DUPLICATE CHECK ================= */
    const existing = await Assessment.findOne({ batchId: targetBatch.batchId });
    if (existing) return res.status(409).json({ message: "Assessment already exists for this batch" });

    /* ================= SOURCE PREPARATION ================= */
    let pdfText = "";
    const uploadedFile = req.file;

    if (uploadedFile) {
      const buffer = fs.readFileSync(uploadedFile.path);
      const pdfData = await pdfParse(buffer);
      pdfText = pdfData.text.slice(0, 7000); 
      fs.unlinkSync(uploadedFile.path);
    }

    /* ================= AI PARAMETERS ================= */
    let categories, difficulty, questionCount, timePerQuestion;

    if (mode === "autopilot") {
      const eduLevel = targetBatch.educationLevel || "UG";
      const auto = AUTOPILOT_MAP[eduLevel] || AUTOPILOT_MAP["UG"];
      categories = auto.categories;
      difficulty = auto.difficulty;
      questionCount = Number(config.questionCount) || auto.questionCount;
      timePerQuestion = auto.timePerQuestion;
    } else {
      categories = Array.isArray(config.categories) && config.categories.length
          ? config.categories.map((c) => c.toLowerCase())
          : ["logical"];
      difficulty = config.difficulty || "medium";
      questionCount = Number(config.questionCount) || 10;
      timePerQuestion = Number(config.timePerQuestion) || 60;
    }

    /* ================= AI PROMPT (PROFILE AWARE) ================= */
    let prompt = `Return ONLY a valid JSON array. No markdown, no prose.
    [{"question": "","options": ["", "", "", ""],"correctAnswer": "","category": ""}]

    Contextual Rules:
    - Generate ${questionCount} questions for ${targetBatch.educationLevel} level students.
    - Focus on categories: ${categories.join(", ")}
    - Target Difficulty: ${difficulty}
    ${profileContext ? `- Align questions with these student skills/goals: ${profileContext.slice(0, 1500)}` : ""}
    ${pdfText ? `- Use this PDF material as the primary source: ${pdfText}` : ""}
    ${config.customPrompt ? `- Additional logic: ${config.customPrompt}` : ""}
    `;

    /* ================= AI CALL ================= */
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await generateWithTimeout(model.generateContent(prompt), 25000);

    const raw = result.response.text();
    const jsonStart = raw.indexOf("[");
    const jsonEnd = raw.lastIndexOf("]");
    const questions = JSON.parse(raw.slice(jsonStart, jsonEnd + 1));

    /* ================= VALIDATION & SAVE ================= */
    const assessment = await Assessment.create({
      batchId: targetBatch.batchId,
      createdBy: req.user.id,
      mode,
      categories,
      difficulty,
      questionCount,
      timePerQuestion,
      questions,
      source: pdfText ? "PDF_REFERENCE" : (profileContext ? "PROFILE_MATCHING" : "GENERAL_KNOWLEDGE"),
    });

    res.json({
      message: "AI Autopilot: Batch & Assessment Synced",
      assessmentId: assessment._id,
      batchId: targetBatch.batchId,
      autoCreated: mode === "autopilot"
    });

  } catch (err) {
    console.error("AI ERROR:", err.message);
    res.status(500).json({ message: err.message || "Generation failed" });
  }
};

exports.rollbackAssessment = async (req, res) => {
  try {
    const deleted = await Assessment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Rollback successful" });
  } catch (err) {
    res.status(500).json({ message: "Rollback failed" });
  }
};