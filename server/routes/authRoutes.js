const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  signup,
  login,
  googleAuth,
  updateRole,
} = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/update-role", protect, updateRole);

module.exports = router;
