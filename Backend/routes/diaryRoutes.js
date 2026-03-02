const express = require('express');
const router = express.Router();
const diaryController = require('../controllers/diaryController');

// GET /api/diary?teacherId=&date=
router.get('/', diaryController.getDiaryForDate);

// POST /api/diary/save
router.post('/save', diaryController.saveDiaryEntry);

module.exports = router;
