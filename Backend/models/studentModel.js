// models/studentModel.js
const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    schoolId: { type: Number, required: true, default: 1 },

    // Auto generated
    studentId: { type: String, required: true, unique: true },

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },

    email: { type: String, unique: true, sparse: true, trim: true },
    phone: { type: String, default: null, trim: true },

    profilePhoto: { type: String, default: null },

    parentName: { type: String, default: null, trim: true },
    parentPhone: { type: String, default: null, trim: true },
    Address: { type: String, default: null, trim: true },

    // NEW: class as Number (1..10)
    studentClass: { type: Number, min: 1, max: 10, default: null },

    // NEW: flag
    flag: { type: String, enum: ["red", "green", "yellow"], default: "green" },

    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", default: null },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Section", default: null },

    rollNumber: { type: Number, default: null },

    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

// Generate studentId BEFORE validation runs
StudentSchema.pre("validate", function (next) {
  if (!this.studentId) {
    const random = Math.floor(1000 + Math.random() * 9000);
    this.studentId = `STU-${Date.now()}-${random}`;
  }
  next();
});

module.exports = mongoose.model("Student", StudentSchema);
