// routes/UserAuth.js
const express = require("express");
const router = express.Router();

const authController = require("../controllers/userAuthController");

// normal auth
router.post("/register", authController.register);
router.post("/login", authController.login);

// Google OAuth login (email must already exist)
router.post("/google-login", authController.googleLogin);

// forgot / reset password
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;
