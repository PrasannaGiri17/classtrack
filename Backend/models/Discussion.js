const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  schoolId: {
    type: String,
    required: true,
    index: true
  },
  gradeId: {
    type: String,
    required: true
  },
  subjectId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true
  },
  imageUrls: {
    type: [String],
    validate: [arrayLimit, '{PATH} exceeds the limit of 3']
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'authorRoleModel' // Dynamic ref based on role
  },
  authorRoleModel: {
    type: String,
    required: true,
    enum: ['Student', 'Teacher']
  },
  authorName: {
    type: String,
    required: true
  },
  authorRole: {
    type: String,
    enum: ['student', 'teacher'],
    required: true
  },
  authorAvatar: {
    type: String
  },
  commentCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

function arrayLimit(val) {
  return val.length <= 3;
}

// Indexes for performance and multi-tenancy
discussionSchema.index({ schoolId: 1, gradeId: 1 });
discussionSchema.index({ schoolId: 1, subjectId: 1 });

// Text index for search functionality
discussionSchema.index({ title: 'text', body: 'text' });

module.exports = mongoose.model('Discussion', discussionSchema);
