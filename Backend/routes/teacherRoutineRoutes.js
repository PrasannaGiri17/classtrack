const express = require('express');
const router = express.Router();
const teacherRoutineController = require('../controllers/teacherRoutineController');

// GET /api/teacher-routine/teacher/:teacherId?date=YYYY-MM-DD
router.get('/teacher/:teacherId', teacherRoutineController.getTeacherRoutineForDate);

module.exports = router;
