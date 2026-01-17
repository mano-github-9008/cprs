const User = require("../models/User");

exports.getAdminStats = async (req, res) => {
  try {
    // ✅ Get admin details
    const admin = await User.findById(req.user.id).select("name");

    // ✅ Total students
    const totalStudents = await User.countDocuments({
      role: "student",
    });

    // ✅ Active students (assigned to batch)
    const activeStudents = await User.countDocuments({
      role: "student",
      batchId: { $ne: null },
    });

    res.json({
      totalStudents,
      activeStudents,
      adminName: admin?.name || "Admin", // ✅ NEW: Return admin name
    });
  } catch (err) {
    console.error("ADMIN STATS ERROR:", err.message);
    res.status(500).json({
      message: "Failed to fetch admin stats",
    });
  }
};