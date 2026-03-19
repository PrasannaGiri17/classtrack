const mongoose = require("mongoose");

const routineSchema = new mongoose.Schema({
  schoolId: { type: Number, required: true, index: true },
  gradeNumber: { type: String, required: true }, // Using String to match frontend "1", "2" etc.
  slots: [{
    id: String,
    type: { type: String, enum: ['subject', 'break', 'sport'], required: true },
    label: String,
    durationMinutes: Number,
    breakType: String // Optional, for 'break' type
  }],
  isLocked: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'routines' });

// Ensure one routine per grade per school
routineSchema.index({ schoolId: 1, gradeNumber: 1 }, { unique: true });

const Routine = mongoose.model('Routine', routineSchema);

module.exports = Routine;
