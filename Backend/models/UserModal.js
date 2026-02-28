// models/UserModal.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    schoolId: { type: Number, required: true, default: 1 },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true }, // hashed by pre-save

    role: {
      type: String,
      enum: ["teacher", "student", "admin"],
      required: true,
    },

    
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", default: null },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null },

    mustChangePassword: { type: Boolean, default: true },

    // google login (optional)
    googleId: { type: String, default: null },
    authProvider: { type: String, default: "local" },

    // forgot/reset password (email link)
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },

    // forgot/reset password via OTP
    resetPasswordOtp: { type: String, default: null },
    resetPasswordOtpExpires: { type: Date, default: null },
    resetPasswordOtpAttempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// hash password before save (pre-save middleware) [web:66]
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// compare password
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
