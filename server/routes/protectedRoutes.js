const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.get(
  "/student",
  protect,
  authorizeRoles("student"),
  (req, res) => {
    res.json({ message: "Student content accessed" });
  }
);

router.get(
  "/admin",
  protect,
  authorizeRoles("admin", "superadmin"),
  (req, res) => {
    res.json({ message: "Admin content accessed" });
  }
);

module.exports = router;
