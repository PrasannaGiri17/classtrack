const express = require('express');
const studentController = require('../controllers/studentController');
const router = express.Router();

router.get('/', studentController.getAllStudents);
router.post('/add', studentController.addStudent);
router.get('/:id',studentController.getStudentById);
router.get('/name/:name', studentController.getStudentByName);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);
module.exports = router;
