const mongoose = require("mongoose");

const BatchSchema = new mongoose.Schema({
  /* ================= IDENTIFIERS ================= */
  batchId: {
    type: String,
    required: true,
    unique: true, // e.g. "BATCH-AI-001"
  },

  name: {
    type: String,
    required: true, // e.g. "AI Morning Batch"
  },

  /* ================= ACADEMIC TAGS ================= */
  className: {
    type: String,
    trim: true,
    default: null, // e.g. "CSE-A", "III-B"
  },

  educationLevel: {
    type: String,
    enum: ["10th", "12th", "Diploma", "UG", "PG"],
    default: null, // backward compatible
  },

  /* ================= INSTITUTION ================= */
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
  },

  /* ================= ADMIN ================= */
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // admin
    required: true,
  },

  /* ================= SLOT / TIME LOCK ================= */
  slot: {
    date: {
      type: String, // "2026-01-20"
      required: true,
    },
    startTime: {
      type: String, // "09:00"
      required: true,
    },
    endTime: {
      type: String, // "10:00"
      required: true,
    },
  },

  /* ================= STUDENT LIMIT ================= */
  maxStudents: {
    type: Number,
    default: 50,
    min: 1,
  },

  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  /* ================= AUTO JOIN ================= */
  allowAutoJoin: {
    type: Boolean,
    default: true,
  },

  /* ================= ASSESSMENT CONTROL ================= */
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assessment",
    default: null,
  },

  isAssessmentLocked: {
    type: Boolean,
    default: false,
  },

  /* ================= STATUS ================= */
  isActive: {
    type: Boolean,
    default: true,
  },

  /* ================= META ================= */
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* ================= VIRTUALS ================= */
BatchSchema.virtual("currentStudentCount").get(function () {
  return this.students.length;
});

module.exports = mongoose.model("Batch", BatchSchema);
