const express = require('express');
const router = express.Router();
const diaryController = require('../controllers/diaryController');

// GET /api/diary?teacherId=&date=
router.get('/', diaryController.getDiaryForDate);

// GET /api/diary/class?className=&date=
router.get('/class', diaryController.getDiaryForClass);

// POST /api/diary/save
router.post('/save', diaryController.saveDiaryEntry);

module.exports = router;
