const express = require("express");
const router = express.Router();
const { 
  signup, 
  login, 
  forgotPassword, 
  resetPassword, 
  googleAuth, 
  updateRole 
} = require("../controllers/authController");

// Import your existing auth middleware
const protect = require("../middleware/authMiddleware");

/* ================= PUBLIC ROUTES ================= */

// Standard Authentication
router.post("/signup", signup);
router.post("/login", login);

// Google Authentication
router.post("/google", googleAuth);

// Password Recovery
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword); 

/* ================= PROTECTED ROUTES ================= */

/**
 * UPDATE ROLE: 
 * We added 'protect' here so the controller knows WHICH user to update.
 * The middleware decodes the JWT and sets req.user.id.
 */
router.post("/update-role", protect, updateRole);

module.exports = router;