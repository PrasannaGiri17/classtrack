const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  schoolId: { type: Number, required: true },
  name: { 
    type: String, 
    trim: true
  },
    type: { 
    type: String, 
    required: [true, 'Resource type is required']
  },
  sharedOn: { 
    type: Date, 
    default: Date.now 
  },
  size: { 
    type: String, 
    default: "-" 
  },
  url: { 
    type: String,
    required: function() { return this.type === 'link'; }
  },
  fileName: { 
    type: String 
  },
  fileUrl: { 
    type: String 
  },
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Teacher ID is required'] 
  },
  subject: { 
    type: String 
  },
  grade: { 
    type: String 
  },
  section: { 
    type: String 
  },
  isArchived: { 
    type: Boolean, 
    default: false 
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    default: null
  }
}, {
  timestamps: true
});

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;
