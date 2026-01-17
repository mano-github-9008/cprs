const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");

/* ==========================================
   CREATE / UPDATE STUDENT PROFILE (NEW)
========================================== */
exports.saveStudentProfile = async (req, res) => {
  try {
    // 1️⃣ Ensure user exists
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2️⃣ Extract ALL fields from frontend
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

    // 3️⃣ Prepare profile payload
    const profileData = {
      userId: req.user.id,
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
      completed: true,
    };

    // 4️⃣ Create or Update profile
    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user.id },
      profileData,
      { upsert: true, new: true }
    );

    // 5️⃣ Mark profile completed on User
    user.isProfileComplete = true;
    await user.save();

    // 6️⃣ Respond
    res.json({
      message: "Profile saved successfully",
      profile,
    });
  } catch (err) {
    console.error("PROFILE SAVE ERROR:", err);
    res.status(500).json({ message: "Failed to save profile" });
  }
};
