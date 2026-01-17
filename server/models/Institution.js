const mongoose = require("mongoose");

const InstitutionSchema = new mongoose.Schema({
  /* ================= BASIC DETAILS ================= */
  name: {
    type: String,
    required: true,
    trim: true, // e.g. "ABC Engineering College"
  },

  code: {
    type: String,
    unique: true,
    required: true, // short code e.g. "ABC-ENG"
    uppercase: true,
  },

  address: {
    type: String,
  },

  website: {
    type: String,
  },

  /* ================= OWNERSHIP ================= */
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Admin who controls this institution
    required: true,
  },

  /* ================= SETTINGS ================= */
  isActive: {
    type: Boolean,
    default: true,
  },

  allowAutoJoin: {
    type: Boolean,
    default: true, // students can auto-join visible batches
  },

  /* ================= META ================= */
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Institution", InstitutionSchema);
