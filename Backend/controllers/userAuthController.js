// controllers/userAuthController.js
const jwt = require("jsonwebtoken"); // test edit
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/UserModal");
const Teacher = require("../models/teacherModel");
const Student = require("../models/studentModel");
const Admin = require("../models/AdminModel");

// helper to create JWT
function createJwt(payload) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing");
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });
}

// helper: read Bearer token
function getTokenFromHeader(req) {
  const h = req.headers.authorization || "";
  const [type, token] = h.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}



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
    const token = createJwt({ id: user._id, role: user.role, adminId: user.adminId, teacherId: user.teacherId, studentId: user.studentId, schoolId: user.schoolId });

    // Fetch profile to prevent crossover
    let profileData = null;
    if (user.role === "student" && user.studentId) profileData = await Student.findById(user.studentId).select("firstName lastName profilePhoto sectionId classId");
    else if (user.role === "teacher" && user.teacherId) profileData = await Teacher.findById(user.teacherId).select("firstName lastName profilePhoto");
    else if (user.role === "admin" && user.adminId) profileData = await Admin.findById(user.adminId).select("firstName lastName profilePhoto");

    return res.json({
      token,
      role: user.role,
      mustChangePassword: user.mustChangePassword === true,
      email: user.email,
      userId: user._id,
      studentId: user.studentId,
      gradeId: profileData?.classId || null,
      sectionId: profileData?.sectionId || null,
      teacherId: user.teacherId,
      adminId: user.adminId, 
      schoolId: user.schoolId,
      profilePhoto: profileData?.profilePhoto || null,
      firstName: profileData?.firstName || null,
      lastName: profileData?.lastName || null,
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

    const token = createJwt({ id: user._id, role: user.role, adminId: user.adminId, teacherId: user.teacherId, studentId: user.studentId, schoolId: user.schoolId });

    // Fetch profile to prevent crossover
    let profileData = null;
    if (user.role === "student" && user.studentId) profileData = await Student.findById(user.studentId).select("firstName lastName profilePhoto sectionId classId");
    else if (user.role === "teacher" && user.teacherId) profileData = await Teacher.findById(user.teacherId).select("firstName lastName profilePhoto");
    else if (user.role === "admin" && user.adminId) profileData = await Admin.findById(user.adminId).select("firstName lastName profilePhoto");

    return res.json({
      token,
      role: user.role,
      mustChangePassword: user.mustChangePassword === true,
      email: user.email,
      userId: user._id,
      studentId: user.studentId,
      gradeId: profileData?.classId || null,
      sectionId: profileData?.sectionId || null,
      teacherId: user.teacherId,
      adminId: user.adminId,
      schoolId: user.schoolId,
      profilePhoto: profileData?.profilePhoto || null,
      firstName: profileData?.firstName || null,
      lastName: profileData?.lastName || null,
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

    await sendEmail({
      to: email.trim(),
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

/* ---------- FORGOT PASSWORD (OTP FLOW) ---------- */
exports.forgotPasswordOtp = async (req, res) => {
  try {
    const { email, type } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.trim() });
    if (!user) return res.status(404).json({ message: "EMAIL_NOT_FOUND" });

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash OTP before storing
    const hashedOtp = await require("bcryptjs").hash(otp, 10);
    
    user.resetPasswordOtp = hashedOtp;
    user.resetPasswordOtpExpires = Date.now() + 1000 * 60 * 10; // 10 minutes
    user.resetPasswordOtpAttempts = 0;
    await user.save();

    let subject = "Your Password Reset OTP";
    let bodyText = "You requested a password reset via OTP.";

    if (type === "year_switch") {
      subject = "Next Year Switch Confirmation OTP";
      bodyText = "You requested to transition the school records to the next academic cycle.";
    }

    await sendEmail({
      to: email.trim(),
      subject,
      html: `
        <p>${bodyText}</p>
        <p>Your 6-digit verification code is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>Do not share this code with anyone.</p>
      `,
    });

    return res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("FORGOT PASSWORD OTP ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ---------- RESET PASSWORD (OTP FLOW) ---------- */
exports.resetPasswordOtp = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    const user = await User.findOne({ email: email.trim() });
    if (!user) return res.status(404).json({ message: "USER_NOT_FOUND" });

    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
      return res.status(400).json({ message: "No OTP request found for this user" });
    }

    if (Date.now() > user.resetPasswordOtpExpires) {
      // Clear expired OTP
      user.resetPasswordOtp = null;
      user.resetPasswordOtpExpires = null;
      user.resetPasswordOtpAttempts = 0;
      await user.save();
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (user.resetPasswordOtpAttempts >= 5) {
       return res.status(429).json({ message: "Too many failed attempts. Please request a new OTP." });
    }

    const isMatch = await require("bcryptjs").compare(otp, user.resetPasswordOtp);
    if (!isMatch) {
      user.resetPasswordOtpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.password = password; // hashed by pre-save
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpires = null;
    user.resetPasswordOtpAttempts = 0;
    user.mustChangePassword = false;
    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("RESET PASSWORD OTP ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
