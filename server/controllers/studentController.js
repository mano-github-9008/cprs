const Assessment = require("../models/Assessment");
const Batch = require("../models/Batch");
const User = require("../models/User");
const Institution = require("../models/Institution");
const Result = require("../models/Result");

/* ======================================================
   SAVE / UPDATE STUDENT PROFILE
====================================================== */
exports.saveStudentProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "student") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    user.profile = req.body;
    user.isProfileComplete = true;
    await user.save();

    res.json({
      message: "Profile saved successfully",
      profile: user.profile,
    });
  } catch {
    res.status(500).json({ message: "Failed to save profile" });
  }
};

/* ======================================================
   SELECT INSTITUTION
====================================================== */
exports.selectInstitution = async (req, res) => {
  try {
    const { institutionId } = req.body;

    const institution = await Institution.findById(institutionId);
    if (!institution || !institution.isActive) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const user = await User.findById(req.user.id);
    user.institutionId = institution._id;

    user.batchId = null;
    user.batchRef = null;
    user.isActive = false;

    await user.save();

    res.json({ message: "Institution selected" });
  } catch {
    res.status(500).json({ message: "Failed to select institution" });
  }
};

/* ======================================================
   FETCH AVAILABLE BATCHES (EDUCATION FILTERED)
====================================================== */
exports.fetchAvailableBatches = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "student") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!user.institutionId) {
      return res.json({ batches: [] });
    }

    if (!user.profile?.education) {
      return res.json({ batches: [] });
    }

    const batches = await Batch.find({
      institutionId: user.institutionId,
      isActive: true,
      $or: [
        { educationLevel: null },
        { educationLevel: user.profile.education },
      ],
    })
      .select("name batchId slot className educationLevel maxStudents students")
      .sort({ createdAt: -1 });

    const available = batches.filter(
      (b) => !b.students.includes(user._id)
    );

    res.json({ batches: available });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch batches" });
  }
};

/* ======================================================
   JOIN BATCH
====================================================== */
exports.joinBatch = async (req, res) => {
  try {
    const { batchId } = req.body;

    const user = await User.findById(req.user.id);
    if (!user || user.role !== "student") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!user.profile?.education) {
      return res.status(400).json({
        message: "Complete profile before joining batch",
      });
    }

    const batch = await Batch.findOne({
      batchId,
      isActive: true,
    });

    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    if (!user.institutionId?.equals(batch.institutionId)) {
      return res.status(403).json({ message: "Institution mismatch" });
    }

    if (
      batch.educationLevel &&
      batch.educationLevel !== user.profile.education
    ) {
      return res.status(403).json({
        message: "Batch not available for your education level",
      });
    }

    if (batch.students.length >= batch.maxStudents) {
      return res.status(403).json({
        message: "Batch student limit reached",
      });
    }

    if (!batch.students.includes(user._id)) {
      batch.students.push(user._id);
      await batch.save();
    }

    user.batchId = batch.batchId;
    user.batchRef = batch._id;
    user.isActive = true;
    await user.save();

    res.json({ message: "Joined batch successfully" });
  } catch {
    res.status(500).json({ message: "Failed to join batch" });
  }
};

/* ======================================================
   GET ASSESSMENT FOR STUDENT
====================================================== */
exports.getAssessmentForStudent = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.batchId) {
      return res.json({ locked: true, reason: "Join batch first" });
    }

    const batch = await Batch.findOne({
      batchId: user.batchId,
      students: user._id,
      isActive: true,
    });

    if (!batch) {
      return res.json({ locked: true, reason: "Batch inactive" });
    }

    const assessment = await Assessment.findOne({
      batchId: batch.batchId,
    }).select("-questions.correctAnswer");

    if (!assessment) {
      return res.json({
        locked: true,
        reason: "Assessment not created yet",
      });
    }

    const existingResult = await Result.findOne({
      studentId: user._id,
      batchId: user.batchId,
    });

    if (existingResult) {
      return res.json({
        locked: true,
        reason: "Assessment already attempted",
      });
    }

    const slot = assessment.slot;
    const now = new Date();

    const [y, m, d] = slot.date.split("-").map(Number);
    const [eh, em] = slot.endTime.split(":").map(Number);
    const end = new Date(y, m - 1, d, eh, em);

    if (now > end) {
      return res.json({
        locked: true,
        reason: "Assessment slot ended",
        slot,
      });
    }

    res.json({
      locked: false,
      assessment,
      timePerQuestion: assessment.timePerQuestion,
      slot,
      serverTime: now,
    });
  } catch {
    res.json({
      locked: true,
      reason: "Assessment unavailable",
    });
  }
};
