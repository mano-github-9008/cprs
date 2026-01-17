const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* SIGNUP */
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, role: user.role });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* LOGIN */
exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (user.role !== role)
      return res.status(403).json({ message: "Role mismatch" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, role: user.role });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* GOOGLE LOGIN */
exports.googleAuth = async (req, res) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: req.body.token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email } = ticket.getPayload();
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: "google-auth",
        role: null, // 🔑 IMPORTANT
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, role: user.role });
  } catch {
    res.status(401).json({ message: "Google authentication failed" });
  }
};

/* UPDATE ROLE */
exports.updateRole = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { role: req.body.role },
      { new: true }
    );

    res.json({ role: user.role });
  } catch {
    res.status(500).json({ message: "Role update failed" });
  }
};
