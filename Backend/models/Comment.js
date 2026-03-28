const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  schoolId: {
    type: String,
    required: true,
    index: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion',
    required: true,
    index: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'authorRoleModel'
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
  body: {
    type: String,
    required: true
  },
  imageUrls: {
    type: [String],
    validate: [arrayLimit, '{PATH} exceeds the limit of 3']
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

// Index for specific post's comments within a school
commentSchema.index({ schoolId: 1, postId: 1 });

module.exports = mongoose.model('Comment', commentSchema);
