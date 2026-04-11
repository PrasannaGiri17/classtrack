// routes/flagRoutes.js
const express = require('express');
const router = express.Router();
const {
  calculateFlags,
  getFlagsBySchool,
  getStudentFlagHistory,
  getFlagSummary,
} = require('../controllers/flagController');

// POST   /api/flags/calculate              → trigger full recalculation
router.post('/calculate', calculateFlags);

// GET    /api/flags/school/:schoolId       → all flags for a school
//        Query: academicYear (required), termPair, flagColor (optional)
router.get('/school/:schoolId', getFlagsBySchool);

// GET    /api/flags/student/:studentId     → flag history for one student
router.get('/student/:studentId', getStudentFlagHistory);

// GET    /api/flags/summary/:schoolId      → { green, amber, red, total }
//        Query: academicYear (required), termPair (optional)
router.get('/summary/:schoolId', getFlagSummary);

module.exports = router;
