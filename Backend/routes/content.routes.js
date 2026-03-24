const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const { protect } = require('../middleware/authMiddleware');

// Resource management routes
router.post('/create', protect, contentController.createResource);
router.get('/teacher/:teacherId', protect, contentController.getAllResources);
router.get('/:id', protect, contentController.getResourceById);
router.put('/:id', protect, contentController.updateResource);
router.patch('/:id/archive', protect, contentController.archiveResource);
router.delete('/:id', protect, contentController.deleteResource);

// Filtering routes
router.get('/type/:type', protect, contentController.getResourcesByType);
router.get('/subject/:subject', protect, contentController.getResourcesBySubject);

// Student resource route (grade/section based)
router.get('/student/:grade/:section', protect, contentController.getStudentResources);

module.exports = router;
