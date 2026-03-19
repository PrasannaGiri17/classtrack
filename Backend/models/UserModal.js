// models/UserModal.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    schoolId: { type: Number, required: true, index: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true }, // hashed by pre-save

    role: {
      type: String,
      enum: ["teacher", "student", "admin"],
      required: true,
    },

    
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", default: null },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },

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

// Cascade delete: Remove associated Student, Teacher, or Admin when User is deleted
userSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    if (doc.role === "student" && doc.studentId) {
      const Student = mongoose.model("Student");
      await Student.deleteOne({ _id: doc.studentId });
    } else if (doc.role === "teacher" && doc.teacherId) {
      const Teacher = mongoose.model("Teacher");
      await Teacher.deleteOne({ _id: doc.teacherId });
    } else if (doc.role === "admin" && doc.adminId) {
      const Admin = mongoose.model("Admin");
      await Admin.deleteOne({ _id: doc.adminId });
    }
  }
});

module.exports = mongoose.model("User", userSchema);
