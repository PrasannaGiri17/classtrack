const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// Standard CRUD
router.get('/', quizController.getAllQuizzes);
router.post('/', quizController.createQuiz);
router.get('/:id', quizController.getQuizById);
router.put('/:id', quizController.updateQuiz);
router.delete('/:id', quizController.deleteQuiz);

// Specialized result route
router.post('/:id/result', quizController.addContestantResult);

module.exports = router;
