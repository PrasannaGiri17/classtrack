const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  schoolId: { type: Number, default: 1 },
  config: {
    termsCount: { type: Number, default: 3 },
    includeMidTerm: { type: Boolean, default: true },
    globalStartTime: { type: String, default: "09:00" },
    globalDuration: { type: Number, default: 120 } // in minutes
  },
  schedules: [{
    gradeNumber: { type: Number, required: true },
    term: { type: String, required: true },
    entries: [{
      subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
      date: { type: Date }
    }]
  }],
  termStatuses: [{
    term: { type: String, required: true },
    isOpen: { type: Boolean, default: false }
  }]
}, { collection: 'exams' });

const Exam = mongoose.model('Exam', examSchema);
module.exports = Exam;
