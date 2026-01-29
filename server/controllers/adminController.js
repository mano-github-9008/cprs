const User = require("../models/User");

// ✅ Optimized Stats (Parallel fetching)
exports.getAdminStats = async (req, res) => {
  try {
    const [admin, totalStudents, activeStudents] = await Promise.all([
      User.findById(req.user.id).select("name").lean(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "student", batchId: { $ne: null } }),
    ]);

    res.json({
      totalStudents,
      activeStudents,
      adminName: admin?.name || "Admin",
    });
  } catch (err) {
    console.error("ADMIN STATS ERROR:", err.message);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
};

// ✅ Updated: Returns SEPARATE activities for each milestone
exports.getRecentActivities = async (req, res) => {
  try {
    // Fetch recent student records
    const students = await User.find({ role: "student" })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select("name createdAt updatedAt batchId isProfileComplete")
      .lean();

    const activities = [];

    students.forEach((student) => {
      // 1. Always create an activity for Registration
      activities.push({
        id: `${student._id}_reg`, // Unique ID for registration event
        text: `New student registered: ${student.name}`,
        time: student.createdAt,
        type: "new",
      });

      // 2. Separate activity for Profile Completion
      if (student.isProfileComplete) {
        activities.push({
          id: `${student._id}_profile`, // Unique ID for profile event
          text: `${student.name} completed their profile setup`,
          time: student.updatedAt,
          type: "profile",
        });
      }

      // 3. Separate activity for Batch Assignment
      if (student.batchId) {
        activities.push({
          id: `${student._id}_batch`, // Unique ID for batch event
          text: `${student.name} assigned to batch ${student.batchId}`,
          time: student.updatedAt,
          type: "enrollment",
        });
      }
    });

    // Sort all combined events by time (newest first) and limit to 10
    const finalFeed = activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);

    res.json(finalFeed);
  } catch (err) {
    console.error("RECENT ACTIVITY ERROR:", err.message);
    res.status(500).json({ message: "Failed to fetch activities" });
  }
};