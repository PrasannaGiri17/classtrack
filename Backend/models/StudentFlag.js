const mongoose = require('mongoose');

const studentFlagSchema = new mongoose.Schema(
  {
    schoolId: {
      type: Number,
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    gradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade',
      required: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    sectionName: {
      type: String,
    },
    academicYear: {
      type: Number,
      required: true,
    },
    termPair: {
      type: String,
      required: true,
    },
    attendancePct: {
      type: Number,
    },
    attendanceMonthsIncluded: {
      type: [String],
    },
    midTermScore: {
      type: Number,
    },
    finalTermScore: {
      type: Number,
    },
    weightedScore: {
      type: Number,
    },
    attendancePoints: {
      type: Number,
    },
    examPoints: {
      type: Number,
    },
    totalPoints: {
      type: Number,
    },
    flagColor: {
      type: String,
      enum: ['green', 'amber', 'red'],
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

studentFlagSchema.index(
  { studentId: 1, schoolId: 1, academicYear: 1, termPair: 1 },
  { unique: true }
);

module.exports = mongoose.model('StudentFlag', studentFlagSchema);
