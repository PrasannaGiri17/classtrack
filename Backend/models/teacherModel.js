// models/TeacherModel.js
const mongoose = require("mongoose");

const TeacherSchema = new mongoose.Schema(
  {
    schoolId: { type: Number, required: true },

    // Auto generated like studentId
    teacherCode: { type: String, required: true, unique: true },

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },

    email: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, default: null, trim: true },
    birthdate: { type: Date, default: null },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    qualification: { type: String, default: null, trim: true },

    profilePhoto: { type: String, default: null },

    currentAddress: { type: String, default: null, trim: true },

    assignedGrades: [{ type: mongoose.Schema.Types.ObjectId, ref: "Grade" }],
    assignedSections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],

    primarySubject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", default: null },
    secondarySubject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", default: null },

    classTeacher: { type: String, default: null, trim: true },
    assignedClasses: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// Generate teacherCode BEFORE validation runs
TeacherSchema.pre("validate", function (next) {
  if (!this.teacherCode) {
    const random = Math.floor(1000 + Math.random() * 9000);
    this.teacherCode = `TCH-${Date.now()}-${random}`;
  }
  next();
});

// Cascade delete: Remove associated User when Teacher is deleted
TeacherSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const User = mongoose.model("User");
    await User.deleteOne({ teacherId: doc._id });
  }
});

module.exports = mongoose.model("Teacher", TeacherSchema);
