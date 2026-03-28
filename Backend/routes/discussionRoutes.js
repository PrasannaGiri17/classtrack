const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussionController');
const { protect } = require('../middleware/authMiddleware');

// All discussion routes are protected by default (requires JWT)

// POST   /api/discussions
// GET    /api/discussions (with optional filters ?subjectId=math&search=exam)
router.route('/')
  .post(protect, discussionController.createDiscussion)
  .get(protect, discussionController.getDiscussions);

// GET    /api/discussions/:id
// DELETE /api/discussions/:id (Author-only matched in controller)
router.route('/:id')
  .get(protect, discussionController.getDiscussionById)
  .delete(protect, discussionController.deleteDiscussion);

// POST   /api/discussions/:id/report
router.post('/:id/report', protect, discussionController.reportDiscussion);

// COMMENTS
// POST   /api/discussions/:id/comments
// GET    /api/discussions/:id/comments
router.route('/:id/comments')
  .post(protect, discussionController.addComment)
  .get(protect, discussionController.getCommentsByPost);

module.exports = router;
