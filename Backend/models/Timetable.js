const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({
  schoolId: { type: Number, default: 1 },
  gradeNumber: { type: String, required: true },
  sectionName: { type: String, required: true },
  weekday: { type: String, required: true, enum: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] },
  assignments: [{
    slotId: String, // References id in Routine.slots
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    topic: { type: String, default: 'Normal Class' }
  }]
}, { collection: 'timetables', timestamps: true });

// Ensure one timetable per grade/section/weekday per school
timetableSchema.index({ schoolId: 1, gradeNumber: 1, sectionName: 1, weekday: 1 }, { unique: true });

const Timetable = mongoose.model('Timetable', timetableSchema);

module.exports = Timetable;
