// controllers/userAuthController.js
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/UserModal");

// helper to create JWT
function createJwt(payload) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing");
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
}

// helper: read Bearer token
function getTokenFromHeader(req) {
  const h = req.headers.authorization || "";
  const [type, token] = h.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

// email transporter (Gmail app password) [web:362]
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ---------- REGISTER ---------- */
exports.register = async (req, res) => {
  try {
    const { email, password, role, teacherId, studentId } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "email, password, role required" });
    }

    const existing = await User.findOne({ email: email.trim() });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const user = new User({
      email: email.trim(),
      password, // hashed in model
      role,
      teacherId: teacherId || null,
      studentId: studentId || null,
      mustChangePassword: true,
    });

    await user.save();
    return res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ---------- LOGIN (email + password) ---------- */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email?.trim() });
    if (!user) return res.status(404).json({ message: "EMAIL_NOT_FOUND" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "INVALID_PASSWORD" });

    const token = createJwt({ id: user._id, role: user.role });

    return res.json({
      token,
      role: user.role,
      mustChangePassword: user.mustChangePassword === true,
      email: user.email,
      userId: user._id,
      studentId: user.studentId,
      teacherId: user.teacherId,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ---------- GOOGLE LOGIN ---------- */
exports.googleLogin = async (req, res) => {
  try {
    const { email, googleId } = req.body;

    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email: email.trim() });
    if (!user) return res.status(403).json({ message: "EMAIL_NOT_REGISTERED" });

    if (!user.googleId) {
      user.googleId = googleId || user.googleId;
      user.authProvider = "google";
      await user.save();
    }

    const token = createJwt({ id: user._id, role: user.role });

    return res.json({
      token,
      role: user.role,
      mustChangePassword: user.mustChangePassword === true,
      email: user.email,
      userId: user._id,
      studentId: user.studentId,
      teacherId: user.teacherId,
    });
  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ---------- FIRST LOGIN: CHANGE PASSWORD (JWT protected) ---------- */
exports.changePasswordFirstLogin = async (req, res) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return res.status(401).json({ message: "NO_TOKEN" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ message: "INVALID_TOKEN" });
    }

    const { password } = req.body;
    if (!password || String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "USER_NOT_FOUND" });

    // Set new password and mark first-login done
    user.password = password; // hashed by model pre-save
    user.mustChangePassword = false;

    await user.save();

    return res.json({
      message: "Password changed successfully",
      mustChangePassword: false,
    });
  } catch (err) {
    console.error("CHANGE PASSWORD FIRST LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ---------- FORGOT PASSWORD (EMAIL LINK) ---------- */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.trim() });
    if (!user) return res.status(404).json({ message: "EMAIL_NOT_FOUND" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 15;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset?token=${token}&email=${encodeURIComponent(
      email.trim()
    )}`;

    await transporter.sendMail({
      to: email.trim(),
      from: process.env.EMAIL_USER,
      subject: "Reset your password",
      html: `
        <p>You requested a password reset.</p>
        <p>Click this link to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    return res.json({ message: "Reset link sent to email" });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ---------- RESET PASSWORD (EMAIL LINK FLOW) ---------- */
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { email, password } = req.body;

    if (!password) return res.status(400).json({ message: "Password is required" });

    const user = await User.findOne({
      email: email?.trim(),
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired link" });

    user.password = password; // hashed by pre-save
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.mustChangePassword = false;
    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
