const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getAdminStats } = require("../controllers/adminController");

// Admin stats
router.get("/stats", protect, getAdminStats);

module.exports = router;
