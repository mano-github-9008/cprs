const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const StudentProfile = require("../models/StudentProfile");
const User = require("../models/User");

/*
====================================================
 POST /api/student/profile
 → Create / Update Student Profile (NEW VERSION)
====================================================
*/
router.post("/profile", protect, async (req, res) => {
  try {
    /* ==========================================
       AUTH & ROLE CHECK
    ========================================== */
    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({
        message: "Access denied. Students only.",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    /* ==========================================
       REQUEST BODY EXTRACTION
    ========================================== */
    const {
      phone,
      age,
      gender,
      education,
      stream,
      personalityType,
      city,
      state,
      interests,
      skills,
      careerGoal,
    } = req.body;

    /* ==========================================
       BASIC VALIDATION
    ========================================== */
    if (!phone || !age || !gender || !education) {
      return res.status(400).json({
        message: "Missing required profile fields",
      });
    }

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        message: "At least one skill is required",
      });
    }

    if (!careerGoal) {
      return res.status(400).json({
        message: "Career goal is required",
      });
    }

    /* ==========================================
       PROFILE PAYLOAD
    ========================================== */
    const profileData = {
      userId: req.user.id,
      phone,
      age,
      gender,
      education,
      stream: stream || "",
      personalityType: personalityType || "",
      city: city || "",
      state: state || "",
      interests: interests || "",
      skills,
      careerGoal,
      completed: true,
    };

    /* ==========================================
       CREATE OR UPDATE PROFILE
    ========================================== */
    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user.id },
      profileData,
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    /* ==========================================
       MARK USER PROFILE COMPLETE
    ========================================== */
    user.isProfileComplete = true;
    await user.save();

    /* ==========================================
       RESPONSE
    ========================================== */
    res.status(200).json({
      message: "Profile saved successfully",
      profile,
    });
  } catch (err) {
    console.error("PROFILE ROUTE ERROR:", err);
    res.status(500).json({
      message: "Failed to save profile",
    });
  }
});

module.exports = router;
