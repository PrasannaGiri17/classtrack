const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { 
    type: String, 
    required: [true, 'Question text is required'] 
  },
  options: { 
    type: [String], 
    validate: {
      validator: function(v) {
        return v.length === 4;
      },
      message: 'A question must have exactly 4 options'
    },
    required: [true, 'Options are required'] 
  },
  correctIndex: { 
    type: Number, 
    required: [true, 'Correct option index is required'],
    min: 0,
    max: 3
  }
});

const quizSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Quiz title is required'],
    trim: true
  },
  subject: { 
    type: String, 
    required: [true, 'Subject is required'] 
  },
  grade: { 
    type: String, 
    required: [true, 'Grade is required'] 
  },
  section: { 
    type: String, 
    required: [true, 'Section is required'] 
  },
  startTime: { 
    type: Date, 
    required: [true, 'Start time is required'] 
  },
  endTime: { 
    type: Date, 
    required: [true, 'End time is required'] 
  },
  status: { 
    type: String, 
    enum: ['Upcoming', 'Active', 'Completed'],
    default: 'Upcoming'
  },
  questions: [questionSchema],
  stats: {
    attempted: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
    passRate: { type: Number, default: 0 },
    topScore: { type: Number, default: 0 },
    contestants: [{
      name: { type: String },
      score: { type: Number }
    }]
  }
}, {
  timestamps: true
});

// Middleware to validate startTime < endTime
quizSchema.pre('save', function(next) {
  if (this.startTime >= this.endTime) {
    return next(new Error('Start time must be before end time'));
  }
  next();
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
