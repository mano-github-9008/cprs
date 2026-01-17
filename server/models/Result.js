const mongoose = require("mongoose");

/* ================= CATEGORY SCORE ================= */
const CategoryScoreSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    correct: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

/* ================= RESULT SCHEMA ================= */
const ResultSchema = new mongoose.Schema({
  /* 👤 STUDENT */
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  /* 🧪 BATCH */
  batchId: {
    type: String,
    required: true,
    index: true,
  },

  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assessment",
    required: true,
  },

  /* 📊 SCORES */
  categoryScores: {
    type: [CategoryScoreSchema],
    required: true,
  },

  totalCorrect: {
    type: Number,
    required: true,
  },

  totalQuestions: {
    type: Number,
    required: true,
  },

  overallPercentage: {
    type: Number,
    required: true,
  },

  /* 🧠 AI OUTPUT — STRENGTHS */
  strengths: {
    type: [String],
    default: [],
  },

  /* ❌ AI OUTPUT — WEAK AREAS */
  weaknesses: {
    type: [
      {
        category: String,
        reason: String,
        improvementTips: [String],
      },
    ],
    default: [],
  },

  /* 🧠 AI EXPLANATIONS (WHY FIT / NOT FIT) */
  explanations: {
    type: [String],
    default: [],
  },

  /* 🎓 CAREER RECOMMENDATIONS */
  recommendedCareers: {
    type: [String],
    default: [],
  },

  /* ⏱ TIME TRACKING (SECONDS) */
  timeSpent: {
    type: Number,
    default: 0,
  },

  /* 🔒 HARD LOCK AFTER SUBMISSION */
  isLocked: {
    type: Boolean,
    default: true,
    index: true,
  },

  /* 🔐 ATTEMPT */
  attempt: {
    type: Number,
    default: 1,
  },

  /* 🕒 META */
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

/* ================= INDEXES ================= */
ResultSchema.index({ studentId: 1, batchId: 1 }, { unique: true });
ResultSchema.index({ batchId: 1, createdAt: -1 });

module.exports = mongoose.model("Result", ResultSchema);
