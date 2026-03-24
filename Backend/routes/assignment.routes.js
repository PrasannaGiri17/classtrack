const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');
const { protect } = require('../middleware/authMiddleware');

// Create a new assignment
router.post('/create', protect, assignmentController.createAssignment);

// Get all assignments for a teacher
router.get('/teacher/:teacherId', protect, assignmentController.getAllAssignments);

// Get assignments for a student
router.get('/student/:grade/:section', protect, assignmentController.getStudentAssignments);

// Get submission report for a specific assignment
router.get('/:id/report', protect, assignmentController.getAssignmentReport);

// Get single assignment details
router.get('/:id', protect, assignmentController.getAssignmentById);

// Update assignment info
router.put('/:id', protect, assignmentController.updateAssignment);

// Delete an assignment
router.delete('/:id', protect, assignmentController.deleteAssignment);

// Toggle manual lock on homework portal
router.patch('/:id/toggle-lock', protect, assignmentController.toggleLockAssignment);

// Grade a specific submission
router.patch('/:id/submission/:submissionId/grade', protect, assignmentController.gradeSubmission);

// Update remark for a specific submission
router.patch('/:id/submission/:submissionId/remark', protect, assignmentController.updateSubmissionRemark);

// Submit an assignment
router.post('/:id/submit', protect, assignmentController.submitAssignment);

module.exports = router;
