// models/studentModel.js
const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    
    schoolId: { type: Number, required: true, index: true },

    // Auto generated
    studentId: { type: String, required: true, unique: true },

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },

    email: { type: String, unique: true, sparse: true, trim: true },
    phone: { type: String, default: null, trim: true },

    profilePhoto: { type: String, default: null },
    birthdate: { type: Date, default: null },
    gender: { type: String, enum: ["male", "female", "other"], default: null },

    fatherName: { type: String, default: null, trim: true },
    fatherPhone: { type: String, default: null, trim: true },
    motherName: { type: String, default: null, trim: true },
    motherPhone: { type: String, default: null, trim: true },
    Address: { type: String, default: null, trim: true },

    // NEW: class as Number (1..10)
    studentClass: { type: Number, min: 1, max: 13, default: null },

    // NEW: flag
    flag: { type: String, enum: ["red", "green", "yellow", "amber"], default: "green" },

    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Grade", default: null },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Section", default: null },

    rollNumber: { type: Number, default: null },

    status: { type: String, enum: ["active", "inactive", "graduated"], default: "active" },
    graduationYear: { type: String, default: null }, // NEW: Tracking graduation cycle
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Helper function to generate a 6-digit studentId
async function generateStudentId(model) {
  let isUnique = false;
  let newId;
  const currentYear = new Date().getFullYear();
  const yearLastTwoDigits = currentYear.toString().slice(-2);

  while (!isUnique) {
    const randomFourDigits = Math.floor(1000 + Math.random() * 9000);
    newId = `${randomFourDigits}${yearLastTwoDigits}`;

    // Check if it already exists
    const existingStudent = await model.findOne({ studentId: newId });
    if (!existingStudent) {
      isUnique = true;
    }
  }

  return newId;
}

// Generate studentId BEFORE validation runs
StudentSchema.pre("validate", async function (next) {
  if (!this.studentId) {
    // this.constructor points to the compiled Model
    this.studentId = await generateStudentId(this.constructor);
  }
  next();
});

// Cascade delete: Remove associated User when Student is deleted
StudentSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const User = mongoose.model("User");
    await User.deleteOne({ studentId: doc._id });
  }
});

module.exports = mongoose.model("Student", StudentSchema);
