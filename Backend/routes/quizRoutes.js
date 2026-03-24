const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

// Standard CRUD
router.get('/', protect, quizController.getAllQuizzes);
router.post('/', protect, quizController.createQuiz);
router.get('/:id', protect, quizController.getQuizById);
router.put('/:id', protect, quizController.updateQuiz);
router.delete('/:id', protect, quizController.deleteQuiz);

// Specialized result route
router.post('/:id/result', protect, quizController.addContestantResult);

module.exports = router;
