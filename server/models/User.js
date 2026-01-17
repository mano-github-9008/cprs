const mongoose = require("mongoose");

/* ================= PROFILE SUB-SCHEMA ================= */
const ProfileSchema = new mongoose.Schema(
  {
    phone: String,
    age: Number,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    education: String,
    skills: [String],
    careerGoal: String,
  },
  { _id: false }
);

/* ================= USER SCHEMA ================= */
const UserSchema = new mongoose.Schema({
  /* ================= BASIC AUTH ================= */
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["student", "admin", "superadmin"],
    default: "student",
  },

  /* ================= STUDENT PROFILE ================= */
  profile: ProfileSchema,

  isProfileComplete: {
    type: Boolean,
    default: false,
  },

  /* ================= INSTITUTION ================= */
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    default: null,
  },

  /* ================= BATCH ASSIGNMENT ================= */
  batchId: {
    type: String, // e.g. "BATCH-AI-001"
    default: null,
  },

  batchRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    default: null,
  },

  /* ================= STATUS ================= */
  isActive: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
