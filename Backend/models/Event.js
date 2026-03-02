const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  school_id: {
    type: Number,
    required: true,
    default: 1
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Event type is required'],
    enum: ['HOLIDAY', 'EXAMS', 'EVENT', 'DEADLINE', 'OTHER', 'CLASS TEST', 'HOMEWORK'],
    default: 'EVENT'
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  color: {
    type: String, // e.g., 'red', 'blue', '#FF5733'
    default: 'blue'
  },
  audience: {
    type: String,
    required: [true, 'Audience is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true // Made optional for now per requirements if req.user is missing
  }
}, {
  timestamps: true
});

// Validate endDate >= startDate
eventSchema.pre('save', function(next) {
  if (this.startDate > this.endDate) {
    next(new Error('End date must be greater than or equal to start date'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Event', eventSchema);
