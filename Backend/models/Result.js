const mongoose = require("mongoose");
const { getCurrentNepaliYear } = require('../utils/nepaliYear');

// Standard GPA mapping (4.0 scale)
function getSubjectGradePoint(pct) {
  if (pct >= 90) return 4.0;   // A+ (90-100%)
  if (pct >= 80) return 3.6;   // A (80-89%)
  if (pct >= 70) return 3.2;   // B+ (70-79%)
  if (pct >= 60) return 2.8;   // B (60-69%)
  if (pct >= 50) return 2.4;   // C+ (50-59%)
  if (pct >= 40) return 2.0;   // C (40-49%)
  if (pct >= 30) return 1.6;   // D (30-39%)
  return 0.0;                   // NG (<30%)
}
// OR use this more standard mapping:
function getSubjectGradePointStandard(pct) {
  if (pct >= 90) return 4.0;
  if (pct >= 80) return 3.0;   // 80-89% = 3.0
  if (pct >= 70) return 2.5;   // 70-79% = 2.5  
  if (pct >= 60) return 2.0;   // 60-69% = 2.0
  if (pct >= 50) return 1.5;
  if (pct >= 40) return 1.0;
  return 0.0;
}

const resultSchema = new mongoose.Schema({
  schoolId: { type: Number, required: true, index: true },
  academicYear: { type: Number, default: getCurrentNepaliYear, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  gradeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Grade', required: true },
  sectionName: { type: String, required: true },
  term: { type: String, required: true },
  marks: [{
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    theoryMarks: { type: Number, default: 0 },
    practicalMarks: { type: Number, default: 0 },
    remark: { type: String, default: "" }
  }],
  summary: {
    total: Number,
    percentage: Number,
    gpa: String,
    status: { type: String, enum: ['Passed', 'Failed', 'Incomplete'], default: 'Incomplete' }
  }
}, { timestamps: true });

// Pre-save hook
resultSchema.pre('save', function (next) {
  if (!this.academicYear) {
    this.academicYear = getCurrentNepaliYear();
  }

  if (this.marks && this.marks.length > 0) {
    let total = 0;
    let totalGradePoints = 0;
    let failedSubjects = 0;

    this.marks.forEach(m => {
      // Get subject's full marks from your Grade-Subject association
      // Assuming each subject has theoryFullMarks + practicalFullMarks
      const maxTheory = m.theoryFullMarks || 100;
      const maxPractical = m.practicalFullMarks || 0;
      const maxTotal = maxTheory + maxPractical;

      const obtained = (m.theoryMarks || 0) + (m.practicalMarks || 0);
      const subjectPct = maxTotal > 0 ? (obtained / maxTotal) * 100 : 0;

      total += obtained;

      const gradePoint = getSubjectGradePoint(subjectPct);
      totalGradePoints += gradePoint;

      if (subjectPct < 40) failedSubjects++;
    });

    const numSubjects = this.marks.length;

    // Calculate overall percentage correctly
    const maxPossibleTotal = numSubjects * 100; // If each subject max is 100
    this.summary.total = total;
    this.summary.percentage = parseFloat(((total / maxPossibleTotal) * 100).toFixed(2));

    const rawGpa = totalGradePoints / numSubjects;
    this.summary.gpa = rawGpa.toFixed(2);
    this.summary.status = failedSubjects > 0 ? 'Failed' : 'Passed';
  }

  next();
});

const Result = mongoose.model('Result', resultSchema);
module.exports = Result;