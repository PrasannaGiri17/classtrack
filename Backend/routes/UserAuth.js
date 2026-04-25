// routes/UserAuth.js
const express = require("express");
const router = express.Router();

const authController = require("../controllers/userAuthController");

// normal auth
router.get("/check-email", authController.checkEmail);
router.post("/register", authController.register);
router.post("/login", authController.login);

// Google OAuth login (email must already exist)
router.post("/google-login", authController.googleLogin);

// forgot / reset password
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

// ✅ first login force change password (JWT protected)
router.post(
  "/change-password-first-login",
  authController.changePasswordFirstLogin
);

// forgot / reset password via OTP
router.post("/forgot-password-otp", authController.forgotPasswordOtp);
router.post("/reset-password-otp", authController.resetPasswordOtp);

module.exports = router;
