// routes/UserAuth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModal");

const router = express.Router();

/* ---------- REGISTER (create user) ---------- */
router.post("/register", async (req, res) => {
  try {
    const { email, password, role, teacherId, studentId } = req.body;

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "email, password, role required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = new User({
      email,
      password, // will be hashed
      role,
      teacherId: teacherId || null,
      studentId: studentId || null,
    });

    await user.save();
    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---------- LOGIN ---------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.log("LOGIN: user not found");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("LOGIN: password mismatch");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("LOGIN ERROR: JWT_SECRET is missing");
      return res.status(500).json({ message: "Server config error" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
