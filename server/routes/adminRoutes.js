const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getAdminStats, getRecentActivities } = require("../controllers/adminController");

// @route   GET /api/admin/stats
router.get("/stats", protect, getAdminStats);

// @route   GET /api/admin/activity
// @desc    Get recent database events for the live feed
router.get("/activity", protect, getRecentActivities);

module.exports = router;