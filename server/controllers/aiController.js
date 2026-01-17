const fs = require("fs");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Assessment = require("../models/Assessment");
const Batch = require("../models/Batch");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* =========================================================
   AUTOPILOT CONFIG
========================================================= */
const AUTOPILOT = {
  "10th": {
    categories: ["logical", "communication"],
    difficulty: "easy",
    questionCount: 10,
    timePerQuestion: 60,
  },
  "12th": {
    categories: ["logical", "problemSolving"],
    difficulty: "medium",
    questionCount: 15,
    timePerQuestion: 60,
  },
  Diploma: {
    categories: ["technical", "logical"],
    difficulty: "medium",
    questionCount: 20,
    timePerQuestion: 75,
  },
  UG: {
    categories: ["technical", "logical", "problemSolving"],
    difficulty: "medium",
    questionCount: 25,
    timePerQuestion: 90,
  },
  PG: {
    categories: ["technical", "logical", "problemSolving", "communication"],
    difficulty: "hard",
    questionCount: 30,
    timePerQuestion: 90,
  },
};

/* =========================================================
   HELPER: GEMINI WITH TIMEOUT (CRITICAL FIX)
========================================================= */
const generateWithTimeout = (promise, ms = 20000) => {
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
    /* ================= PAYLOAD ================= */
    const payload = req.parsedPayload;
    if (!payload) {
      return res.status(400).json({ message: "Payload missing" });
    }

    const { mode, config } = payload;

    if (!config?.batchId || !config?.slot) {
      return res.status(400).json({ message: "Batch & slot required" });
    }

    /* ================= DUPLICATE CHECK ================= */
    const existing = await Assessment.findOne({ batchId: config.batchId });
    if (existing) {
      return res.status(409).json({
        message: "Assessment already exists for this batch",
      });
    }

    /* ================= FETCH BATCH ================= */
    const batch = await Batch.findOne({ batchId: config.batchId });
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    /* ================= PDF (OPTIONAL) ================= */
    let pdfText = "";
    let source = mode;

    const uploadedFile = req.file;

    if (uploadedFile) {
      const buffer = fs.readFileSync(uploadedFile.path);
      const pdfData = await pdfParse(buffer);
      pdfText = pdfData.text.slice(0, 6000);
      fs.unlinkSync(uploadedFile.path);
      source = "pdf";
    }

    /* ================= FINAL CONFIG ================= */
    let categories, difficulty, questionCount, timePerQuestion;

    if (mode === "autopilot") {
      const auto =
        AUTOPILOT[batch.educationLevel] || AUTOPILOT["UG"];

      categories = auto.categories;
      difficulty = auto.difficulty;
      questionCount = auto.questionCount;
      timePerQuestion = auto.timePerQuestion;
    } else {
      categories =
        Array.isArray(config.categories) && config.categories.length
          ? config.categories.map((c) => c.toLowerCase())
          : ["logical"];

      difficulty = config.difficulty || "medium";
      questionCount = Number(config.questionCount) || 10;
      timePerQuestion = Number(config.timePerQuestion) || 60;
    }

    /* ================= AI PROMPT ================= */
    let prompt = `
Return ONLY valid JSON.
No markdown. No explanation.

[
  {
    "question": "",
    "options": ["", "", "", ""],
    "correctAnswer": "",
    "category": ""
  }
]

Rules:
- Generate exactly ${questionCount} questions
- Categories must be ONE of: ${categories.join(", ")}
- Difficulty: ${difficulty}
- Every question MUST have a category
`;

    if (config.customPrompt) {
      prompt += `\nAdditional instructions:\n${config.customPrompt}\n`;
    }

    if (pdfText) {
      prompt += `\nReference material:\n${pdfText}`;
    }

    /* ================= AI CALL (SAFE) ================= */
    console.log("🧠 Calling Gemini AI...");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const result = await generateWithTimeout(
      model.generateContent(prompt),
      20000 // 20 seconds timeout
    );

    console.log("🧠 Gemini responded");

    const raw = result.response.text();

    const jsonStart = raw.indexOf("[");
    const jsonEnd = raw.lastIndexOf("]");

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("AI did not return valid JSON");
    }

    const questions = JSON.parse(
      raw.slice(jsonStart, jsonEnd + 1)
    );

    /* ================= VALIDATION ================= */
    questions.forEach((q, i) => {
      if (!q.question || !q.options || !q.correctAnswer) {
        throw new Error(`Invalid question at index ${i}`);
      }

      q.category = q.category?.toLowerCase() || categories[0];

      if (!categories.includes(q.category)) {
        q.category = categories[0];
      }
    });

    /* ================= SAVE ================= */
    const assessment = await Assessment.create({
      batchId: config.batchId,
      slot: config.slot,
      createdBy: req.user.id,
      mode,
      categories,
      difficulty,
      questionCount,
      timePerQuestion,
      questions,
      source,
    });

    console.log("✅ Assessment saved");

    res.json({
      message: "Assessment generated successfully",
      assessmentId: assessment._id,
    });
  } catch (err) {
    console.error("❌ AI GENERATION ERROR:", err.message);
    res.status(500).json({
      message: err.message || "Failed to generate assessment",
    });
  }
};

/* =========================================================
   ROLLBACK ASSESSMENT
========================================================= */
exports.rollbackAssessment = async (req, res) => {
  try {
    const deleted = await Assessment.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Assessment not found",
      });
    }

    res.json({
      message: "Assessment rollback successful",
    });
  } catch (err) {
    res.status(500).json({
      message: "Rollback failed",
      error: err.message,
    });
  }
};
