const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');

// Create a resource
router.post('/create', contentController.createResource);

// Get all resources for a specific teacher
router.get('/teacher/:teacherId', contentController.getAllResources);

// Get resources for a student
router.get('/student/:grade/:section', contentController.getStudentResources);

// Get resources by type
router.get('/type/:type', contentController.getResourcesByType);

// Get resources by subject
router.get('/subject/:subject', contentController.getResourcesBySubject);

// Get resource by ID
router.get('/:id', contentController.getResourceById);

// Update a resource
router.put('/:id', contentController.updateResource);

// Archive a resource (soft delete)
router.patch('/:id/archive', contentController.archiveResource);

// Delete a resource permanently
router.delete('/:id', contentController.deleteResource);

module.exports = router;
