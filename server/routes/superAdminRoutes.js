const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getProfile,
  getStats,
  getAllUsers,
  createUser,
  deleteUser,
} = require("../controllers/superAdminController");

/* ===============================================
   GET SUPER ADMIN PROFILE
=============================================== */
router.get("/profile", protect, getProfile);

/* ===============================================
   GET SUPER ADMIN STATS
=============================================== */
router.get("/stats", protect, getStats);

/* ===============================================
   GET ALL USERS
=============================================== */
router.get("/users", protect, getAllUsers);

/* ===============================================
   CREATE USER (ADMIN OR STUDENT)
=============================================== */
router.post("/users", protect, createUser);

/* ===============================================
   DELETE USER
=============================================== */
router.delete("/users/:userId", protect, deleteUser);

module.exports = router;