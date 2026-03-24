// models/TeacherModel.js
const mongoose = require("mongoose");

// ─── Helper: Generate T-xxxxYY format ────────────────────────────────────────
// xxxx = zero-padded 4-digit random number (0000–9999)
// YY   = last 2 digits of the current year
const generateTeacherId = () => {
  const year = String(new Date().getFullYear()).slice(-2); // e.g. "26"
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, "0"); // e.g. "0823"
  return `T-${rand}${year}`; // e.g. "T-082326"
};

const TeacherSchema = new mongoose.Schema(
  {
    schoolId: { type: Number, required: true, index: true },

    // ─── Custom teacher identifier (NOT MongoDB _id) ────────────────────────
    teacherCode: {
      type: String,
      unique: true,
      required: true,
      match: /^T-\d{4}\d{2}$/,
      trim: true,
    },

    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },

    email:     { type: String, required: true, unique: true, trim: true },
    phone:     { type: String, default: null, trim: true },
    birthdate: { type: Date,   default: null },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    qualification:  { type: String, default: null, trim: true },
    profilePhoto:   { type: String, default: null },
    currentAddress: { type: String, default: null, trim: true },

    assignedGrades:   [{ type: mongoose.Schema.Types.ObjectId, ref: "Grade" }],
    assignedSections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],

    primarySubject:   { type: mongoose.Schema.Types.ObjectId, ref: "Subject", default: null },
    secondarySubject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", default: null },

    classTeacher:   { type: String, default: null, trim: true },
    assignedClasses: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// ─── Auto-generate teacherCode before validation (with collision retry) ─────────
TeacherSchema.pre("validate", async function (next) {
  // Only generate for NEW documents that do not have a teacherCode yet
  if (!this.isNew || this.teacherCode) return next();

  let attempts = 0;
  let candidate;

  do {
    candidate = generateTeacherId();
    const existing = await mongoose.model("Teacher").findOne({ teacherCode: candidate }).lean();
    if (!existing) break; // unique — use it
    attempts++;
  } while (attempts < 10); // safety cap: 10 retries max

  if (attempts >= 10) {
    return next(new Error("Could not generate a unique teacherCode after 10 attempts."));
  }

  this.teacherCode = candidate;
  next();
});

// ─── Cascade delete: Remove associated User when Teacher is deleted ───────────
TeacherSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const User = mongoose.model("User");
    await User.deleteOne({ teacherId: doc._id });
  }
});

module.exports = mongoose.model("Teacher", TeacherSchema);
