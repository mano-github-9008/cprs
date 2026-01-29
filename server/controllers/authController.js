const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");
const twilio = require("twilio");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Initialize Twilio
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

/* ---------------- SIGNUP ---------------- */
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ success: false, message: "User already exists" });

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
    
    // Aligned response structure
    res.json({ success: true, token, role: user.role, message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ---------------- LOGIN ---------------- */
exports.login = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });
    if (user.role !== role) return res.status(403).json({ success: false, message: "Role mismatch" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );
    
    res.json({ success: true, token, role: user.role, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ---------------- GOOGLE LOGIN ---------------- */
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
        password: "google-auth-placeholder", // Security tip: use a random string
        role: null,
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    
    // role might be null here, which triggers the Role Modal on frontend
    res.json({ success: true, token, role: user.role });
  } catch (err) {
    res.status(401).json({ success: false, message: "Google authentication failed" });
  }
};

/* ---------------- UPDATE ROLE ---------------- */
exports.updateRole = async (req, res) => {
  try {
    // req.user.id is populated by your 'protect' middleware
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { role: req.body.role },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, role: user.role, message: "Role updated successfully" });
  } catch (err) {
    console.error("UPDATE ROLE ERROR:", err);
    res.status(500).json({ success: false, message: "Role update failed" });
  }
};

/* ---------------- OTP SYSTEM ---------------- */

/* FORGOT PASSWORD */
exports.forgotPassword = async (req, res) => {
  const { email, phone } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Twilio WhatsApp
    if (phone) {
      try {
        await twilioClient.messages.create({
          from: process.env.TWILIO_WHATSAPP_NUMBER,
          to: `whatsapp:${phone}`,
          body: `Your Password Reset OTP is: ${otp}. It will expire in 10 minutes.`,
        });
      } catch (twilioErr) {
        console.error("Twilio Error:", twilioErr.message);
      }
    }

    // Nodemailer Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `<h3>Reset Your Password</h3>
             <p>Your OTP for password reset is: <strong>${otp}</strong></p>
             <p>This code expires in 10 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "OTP sent to your email and WhatsApp!" });

  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to process request" });
  }
};

/* RESET PASSWORD */
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetOTP: otp,
      resetOTPExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetOTP = null;
    user.resetOTPExpires = null;
    await user.save();

    res.json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

