const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  saveStudentProfile,
  selectInstitution,
  joinBatch,
  getAssessmentForStudent,
  fetchAvailableBatches,
} = require("../controllers/studentController");

const Batch = require("../models/Batch");
const User = require("../models/User");

/* ===============================
   PROFILE
================================ */
router.post("/profile", protect, saveStudentProfile);

/* ===============================
   SELECT INSTITUTION
================================ */
router.post("/select-institution", protect, selectInstitution);

/* ===============================
   DASHBOARD STATUS
================================ */
router.get("/batch-status", protect, async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!user.isProfileComplete) {
    return res.json({
      profileComplete: false,
      assigned: false,
      userName: user.name, // ✅ ADDED: Return username
    });
  }

  if (!user.institutionId || !user.batchId) {
    return res.json({
      profileComplete: true,
      institutionId: user.institutionId || null,
      assigned: false,
      userName: user.name, // ✅ ADDED: Return username
    });
  }

  const batch = await Batch.findOne({
    batchId: user.batchId,
    students: user._id,
  });

  if (!batch) {
    return res.json({
      profileComplete: true,
      assigned: false,
      userName: user.name, // ✅ ADDED: Return username
    });
  }

  res.json({
    profileComplete: true,
    institutionId: user.institutionId,
    assigned: true,
    batchId: batch.batchId,
    slot: batch.slot,
    isSlotActive: true,
    userName: user.name, // ✅ ADDED: Return username
  });
});

/* ===============================
   AVAILABLE BATCHES (FIXED)
================================ */
router.get(
  "/available-batches",
  protect,
  fetchAvailableBatches
);

/* ===============================
   JOIN BATCH
================================ */
router.post("/join-batch", protect, joinBatch);

/* ===============================
   GET ASSESSMENT
================================ */
router.get("/assessment", protect, getAssessmentForStudent);

module.exports = router;