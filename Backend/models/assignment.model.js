const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  studentName: { 
    type: String 
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  fileName: { 
    type: String 
  },
  fileUrl: { 
    type: String 
  },
  remark: { 
    type: String,
    default: ""
  },
  gradingStatus: { 
    type: String, 
    enum: ['none', 'pass', 'fail'], 
    default: 'none' 
  }
});

const assignmentSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Assignment title is required'],
    trim: true
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'] 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  closeTime: { 
    type: Date, 
    required: [true, 'Close time is required'] 
  },
  isManuallyLocked: { 
    type: Boolean, 
    default: false 
  },
  priority: { 
    type: String, 
    default: "Normal" 
  },
  grade: { 
    type: String, 
    required: [true, 'Grade is required'] 
  },
  section: { 
    type: String, 
    required: [true, 'Section is required'] 
  },
  subject: { 
    type: String, 
    required: [true, 'Subject is required'] 
  },
  fileName: { 
    type: String 
  },
  questionFileUrl: { 
    type: String 
  },
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Teacher ID is required'] 
  },
  submissions: [submissionSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for dynamic status calculation
assignmentSchema.virtual('status').get(function() {
  const now = new Date();
  const isPast = now > this.closeTime;
  
  if (isPast) {
    // Past deadline: Default is closed. isManuallyLocked=true means teacher manually reopened (unlocked) it.
    return this.isManuallyLocked ? 'late' : 'closed';
  } else {
    // Before deadline: Default is open. isManuallyLocked=true means teacher manually locked it early.
    return this.isManuallyLocked ? 'closed' : 'open';
  }
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
