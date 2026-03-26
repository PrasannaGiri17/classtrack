const express = require('express');
const router = express.Router();
const diaryController = require('../controllers/diaryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Secure all diary routes

router.get('/', diaryController.getDiaryForDate);
router.get('/class', diaryController.getDiaryForClass);
router.post('/save', diaryController.saveDiaryEntry);

module.exports = router;
