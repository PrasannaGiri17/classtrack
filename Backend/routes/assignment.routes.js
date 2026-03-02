const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');

// Create a new assignment
router.post('/create', assignmentController.createAssignment);

// Get all assignments for a teacher
router.get('/teacher/:teacherId', assignmentController.getAllAssignments);

// Get submission report for a specific assignment
router.get('/:id/report', assignmentController.getAssignmentReport);

// Get single assignment details
router.get('/:id', assignmentController.getAssignmentById);

// Update assignment info
router.put('/:id', assignmentController.updateAssignment);

// Delete an assignment
router.delete('/:id', assignmentController.deleteAssignment);

// Toggle manual lock on homework portal
router.patch('/:id/toggle-lock', assignmentController.toggleLockAssignment);

// Grade a specific submission
router.patch('/:id/submission/:submissionId/grade', assignmentController.gradeSubmission);

// Update remark for a specific submission
router.patch('/:id/submission/:submissionId/remark', assignmentController.updateSubmissionRemark);

module.exports = router;
