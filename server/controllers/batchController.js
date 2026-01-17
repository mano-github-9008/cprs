const Batch = require("../models/Batch");
const User = require("../models/User");
const Institution = require("../models/Institution");
const crypto = require("crypto");

/* =========================
   CREATE BATCH (ADMIN)
========================= */
exports.createBatch = async (req, res) => {
  try {
    const {
      name,
      slot,
      maxStudents = 50,
      className,
      educationLevel,
    } = req.body;

    /* ===== BASIC VALIDATION ===== */
    if (!name || !slot) {
      return res.status(400).json({ message: "Missing batch data" });
    }

    if (!className || !educationLevel) {
      return res.status(400).json({
        message: "Class name and education level are required",
      });
    }

    /* ===== INSTITUTION CHECK ===== */
    const institution = await Institution.findOne({
      createdBy: req.user.id,
    });

    if (!institution) {
      return res.status(403).json({
        message: "Create institution before creating batches",
      });
    }

    /* ===== CREATE BATCH ===== */
    const batch = await Batch.create({
      name,
      className,          // ✅ NEW
      educationLevel,     // ✅ NEW
      batchId: crypto.randomUUID(),
      institutionId: institution._id,
      createdBy: req.user.id,
      slot,
      maxStudents,
      students: [],
    });

    res.json({ batch });
  } catch (err) {
    console.error("CREATE BATCH ERROR:", err.message);
    res.status(500).json({ message: "Batch creation failed" });
  }
};

/* =========================
   GET ALL BATCHES (ADMIN)
========================= */
exports.getAllBatches = async (req, res) => {
  try {
    const institution = await Institution.findOne({
      createdBy: req.user.id,
    });

    if (!institution) {
      return res.json({ batches: [] });
    }

    const batches = await Batch.find({
      institutionId: institution._id,
    })
      .populate("students", "name email")
      .sort({ createdAt: -1 });

    res.json({ batches });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch batches" });
  }
};

/* =========================
   ASSIGN STUDENT TO BATCH
========================= */
exports.addStudentToBatch = async (req, res) => {
  try {
    const { batchId, studentEmail } = req.body;

    if (!batchId || !studentEmail) {
      return res.status(400).json({ message: "Missing data" });
    }

    const student = await User.findOne({
      email: studentEmail,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const batch = await Batch.findOne({ batchId });
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    /* 🔒 Institution match */
    if (!student.institutionId?.equals(batch.institutionId)) {
      return res.status(403).json({
        message: "Student belongs to a different institution",
      });
    }

    /* 🔒 Student limit */
    if (batch.students.length >= batch.maxStudents) {
      return res.status(403).json({
        message: "Batch student limit reached",
      });
    }

    /* ✅ Already assigned */
    if (batch.students.includes(student._id)) {
      return res.json({ message: "Student already in batch" });
    }

    /* ===== ASSIGN ===== */
    batch.students.push(student._id);
    await batch.save();

    student.batchId = batch.batchId;
    student.batchRef = batch._id;
    student.isActive = true;
    await student.save();

    res.json({ message: "Student assigned to batch successfully" });
  } catch (err) {
    console.error("ASSIGN STUDENT ERROR:", err.message);
    res.status(500).json({ message: "Assignment failed" });
  }
};
