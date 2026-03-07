const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');

router.get('/', examController.getExamData);
router.post('/config', examController.saveExamConfig);
router.post('/schedule', examController.saveExamSchedule);
router.patch('/term-status', examController.updateTermStatus);
router.patch('/publish-status', examController.updatePublishStatus);

module.exports = router;
