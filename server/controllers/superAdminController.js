const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* ===============================================
   GET SUPER ADMIN PROFILE
=============================================== */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email role");

    if (!user || user.role !== "superadmin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error.message);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/* ===============================================
   GET SUPER ADMIN STATS
=============================================== */
exports.getStats = async (req, res) => {
  try {
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalStudents = await User.countDocuments({ role: "student" });
    const activeStudents = await User.countDocuments({
      role: "student",
      batchId: { $ne: null },
    });

    res.json({
      totalAdmins,
      totalStudents,
      activeStudents,
    });
  } catch (error) {
    console.error("GET STATS ERROR:", error.message);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

/* ===============================================
   GET ALL USERS
=============================================== */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["admin", "student"] },
    })
      .select("name email role isActive createdAt")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    console.error("GET USERS ERROR:", error.message);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/* ===============================================
   CREATE USER (ADMIN OR STUDENT)
=============================================== */
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate role
    if (!["admin", "student"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("CREATE USER ERROR:", error.message);
    res.status(500).json({ message: "Failed to create user" });
  }
};

/* ===============================================
   DELETE USER
=============================================== */
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting superadmin
    if (user.role === "superadmin") {
      return res.status(403).json({ message: "Cannot delete super admin" });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE USER ERROR:", error.message);
    res.status(500).json({ message: "Failed to delete user" });
  }
};