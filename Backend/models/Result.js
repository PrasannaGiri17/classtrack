const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  schoolId: { type: Number, required: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  gradeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Grade', required: true },
  sectionName: { type: String, required: true },
  term: { type: String, required: true }, // e.g., "Mid-Term 1"
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

// Pre-save hook to calculate total, percentage, etc.
resultSchema.pre('save', function(next) {
    if (this.marks && this.marks.length > 0) {
        let total = 0;
        this.marks.forEach(m => {
            total += (m.theoryMarks || 0) + (m.practicalMarks || 0);
        });
        this.summary.total = total;
        // Percentage calculation (assuming each subject is out of 100)
        this.summary.percentage = (total / (this.marks.length * 100)) * 100;
        
        // Simple GPA logic (customizable)
        if (this.summary.percentage >= 90) this.summary.gpa = '4.0';
        else if (this.summary.percentage >= 80) this.summary.gpa = '3.5';
        else if (this.summary.percentage >= 70) this.summary.gpa = '3.0';
        else if (this.summary.percentage >= 60) this.summary.gpa = '2.5';
        else if (this.summary.percentage >= 50) this.summary.gpa = '2.0';
        else if (this.summary.percentage >= 40) this.summary.gpa = '1.0';
        else this.summary.gpa = '0.0';

        this.summary.status = this.summary.percentage >= 40 ? 'Passed' : 'Failed';
    }
    next();
});

const Result = mongoose.model('Result', resultSchema);
module.exports = Result;
