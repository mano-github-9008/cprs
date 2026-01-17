// models/StudentProfile.js
const mongoose = require("mongoose");

const StudentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },

    // Basic Info
    phone: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      required: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    // Education Info
    education: {
      type: String,
      required: true,
    },

    stream: {
      type: String,
    },

    // Personal Info
    personalityType: {
      type: String,
      enum: ["Introvert", "Extrovert", "Ambivert"],
    },

    city: {
      type: String,
    },

    state: {
      type: String,
    },

    interests: {
      type: String, // kept as string from textarea
    },

    // Career & Skills
    skills: {
      type: [String],
      required: true,
    },

    careerGoal: {
      type: String,
      required: true,
    },

    // Status
    completed: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentProfile", StudentProfileSchema);
