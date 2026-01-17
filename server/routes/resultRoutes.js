const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const {
  submitAssessment,
  getMyResult,
  getBatchAnalytics,
} = require("../controllers/resultController");

/* =====================================================
   STUDENT
===================================================== */

/* 📝 Submit Assessment (1 attempt only) */
router.post("/submit", protect, role("student"), submitAssessment);

/* 📊 Get My Result */
router.get("/my", protect, role("student"), getMyResult);

/* =====================================================
   ADMIN / SUPERADMIN
===================================================== */

/* 📈 Batch Analytics */
router.get(
  "/batch/:batchId",
  protect,
  role("admin", "superadmin"),
  getBatchAnalytics
);

module.exports = router;
