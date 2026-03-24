const express = require('express');
const router = express.Router();
const { getQuizDetails, submitQuiz, getStudentAttempts } = require('../controllers/studentQuizController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/student/quiz/attempts/:studentId
// @desc    Get student attempts
router.get('/attempts/:studentId', protect, getStudentAttempts);

// @route   GET /api/student/quiz/:id
// @desc    Fetch quiz for student
router.get('/:id', protect, getQuizDetails);

// @route   POST /api/student/quiz/submit
// @desc    Submit student quiz answers
router.post('/submit', protect, submitQuiz);

module.exports = router;
