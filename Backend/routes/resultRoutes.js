const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');

router.post('/', resultController.upsertResult);
router.get('/', resultController.getResults);
router.get('/student/:studentId', resultController.getStudentResults);

module.exports = router;
