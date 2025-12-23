// models/UserModal.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true }, // hashed by pre-save

    role: {
      type: String,
      enum: ["teacher", "student", "admin"],
      required: true,
    },

    // ✅ relationship fields (one-to-one link)
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", default: null },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null },

    mustChangePassword: { type: Boolean, default: true },

    // google login (optional)
    googleId: { type: String, default: null },
    authProvider: { type: String, default: "local" },

    // forgot/reset password (email link)
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
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
