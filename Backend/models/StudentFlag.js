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
      enum: ['first', 'second'],
      required: true,
    },
    flagBasis: {
      type: String,
    },
    attendancePct: {
      type: Number,
    },
    attendanceMonthsIncluded: {
      type: [String],
    },
    termScore: {
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

const StudentFlag = mongoose.model('StudentFlag', studentFlagSchema);

/**
 * Resolves the single most recent "complete" term for a student.
 * A term is complete if all expected subjects have marks.
 * Sort by academic year DESC, then Second Term before First Term.
 * 
 * @param {Array} resultDocs - Array of result documents for the student.
 * @param {Number} expectedSubjectCount - Number of subjects expected in a complete result.
 * @returns {Object|null} The most recent complete result document.
 */
const resolveLastResultBasis = (resultDocs, expectedSubjectCount) => {
  if (!resultDocs || resultDocs.length === 0) return null;

  const termMapping = {
    'First Term': 1,
    'first': 1,
    '1st Term': 1,
    'Second Term': 2,
    'second': 2,
    '2nd Term': 2,
    'Final Term': 3,
    'Third Term': 3,
  };

  // Exclude mid terms
  const completeResults = resultDocs.filter(r => {
    const term = (r.term || "").toLowerCase();
    const isMid = term.includes('mid');
    const hasEnoughMarks = (r.marks?.length || 0) >= expectedSubjectCount;
    return !isMid && hasEnoughMarks;
  });

  if (completeResults.length === 0) return null;

  // Sort: Year DESC, then Term Priority DESC
  return [...completeResults].sort((a, b) => {
    if (b.academicYear !== a.academicYear) {
      return b.academicYear - a.academicYear;
    }
    const prioA = termMapping[a.term] || 0;
    const prioB = termMapping[b.term] || 0;
    return prioB - prioA;
  })[0];
};

/**
 * Calculates scores and color, then upserts the student flag record.
 * 
 * @param {Object} params
 * @param {Number} params.schoolId
 * @param {Object} params.student - Student document (with gradeId, sectionId, etc.)
 * @param {Object} params.result - The resolved result document which forms the basis.
 * @param {Number} params.attendancePct - Pre-calculated attendance % for the term window.
 * @param {Array} params.attendanceMonths - Array of month strings included in the window.
 */
const upsertStudentFlag = async ({ schoolId, student, result, attendancePct, attendanceMonths }) => {
  const academicPct = result.summary?.percentage || 0;
  
  // Color rules:
  // 🟢 Green: attendance ≥ 80% AND academic percentage ≥ 75%
  // 🟡 Amber/Yellow: attendance 60–79% AND academic percentage 60–74%
  // 🔴 Red: attendance below 60% OR academic percentage below 60%
  
  let flagColor = 'red';
  if (attendancePct >= 80 && academicPct >= 75) {
    flagColor = 'green';
  } else if (attendancePct >= 60 && academicPct >= 60) {
    flagColor = 'amber';
  }

  const termMapping = {
    'First Term': 'first',
    'first': 'first',
    'Second Term': 'second',
    'second': 'second',
    'Third Term': 'third',
    'third': 'third',
    'Final Term': 'third',
  };
  const normalizedTerm = termMapping[result.term] || 'first';

  const flagBasis = `${result.academicYear} – ${result.term} basis (+ attendance)`;

  const flagData = {
    gradeId: student.gradeId || result.gradeId,
    sectionId: student.sectionId || result.sectionId,
    sectionName: result.sectionName || student.sectionName,
    flagBasis,
    attendancePct: Number(attendancePct.toFixed(2)),
    attendanceMonthsIncluded: attendanceMonths,
    termScore: Number(academicPct.toFixed(2)),
    // Optional point fields can remain if needed for DB schema, set to 0 or remove
    attendancePoints: 0,
    examPoints: 0,
    totalPoints: 0,
    flagColor,
    generatedAt: new Date(),
  };

  return StudentFlag.findOneAndUpdate(
    {
      studentId: student._id,
      schoolId,
      academicYear: result.academicYear,
      termPair: normalizedTerm,
    },
    { $set: flagData },
    { upsert: true, new: true }
  );
};

module.exports = {
  StudentFlag,
  resolveLastResultBasis,
  upsertStudentFlag
};
