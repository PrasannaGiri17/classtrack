const mongoose = require('mongoose');

const teacherRoutineSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
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
  timeSlot: {
    type: String,
    required: true
  },
  periodId: {
    type: String,
    required: true,
    unique: true
  },
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TeacherRoutine', teacherRoutineSchema);
