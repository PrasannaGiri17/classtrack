const express = require('express');
const router = express.Router();
const { getQuizDetails, submitQuiz, getStudentAttempts } = require('../controllers/studentQuizController');

// @route   GET /api/student/quiz/attempts/:studentId
// @desc    Get student attempts
router.get('/attempts/:studentId', getStudentAttempts);

// @route   GET /api/student/quiz/:id
// @desc    Fetch quiz for student
router.get('/:id', getQuizDetails);

// @route   POST /api/student/quiz/submit
// @desc    Submit student quiz answers
router.post('/submit', submitQuiz);

module.exports = router;
