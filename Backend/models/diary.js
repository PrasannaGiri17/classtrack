const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema({
  schoolId: { type: Number, required: true },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  periodId: {
    type: String,
    required: true
  },
  className: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  activity: {
    type: String,
    default: ""
  },
  homework: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

// Compound unique index: teacherId + periodId + date
diarySchema.index({ teacherId: 1, periodId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Diary', diarySchema);
