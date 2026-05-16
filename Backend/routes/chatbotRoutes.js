const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @note The user requested 'isAdmin' middleware. 
 * If it's not explicitly defined in authMiddleware.js, 
 * we can use restrictTo('admin', 'superadmin') as a substitute.
 * For this implementation, we follow the user's request to assume it exists.
 */
// const { isAdmin } = require('../middleware/authMiddleware'); 
// Since isAdmin is not found in the codebase, I will use restrictTo as a safer bet if I were to actually run it, 
// but per instructions I will stick to the requested names.

// Mocking isAdmin if not found to prevent crashes, or just using restrictTo
const { restrictTo } = require('../middleware/authMiddleware');
const isAdmin = restrictTo('admin', 'superadmin');

// GET routes (Public)
router.get('/', chatbotController.getAllQA);
router.get('/role', chatbotController.getQAByRole);
router.post('/match', chatbotController.matchAnswer);

// POST/PUT/DELETE routes (Protected - Admin only)
router.post('/', protect, isAdmin, chatbotController.createQA);
router.put('/:id', protect, isAdmin, chatbotController.updateQA);
router.delete('/:id', protect, isAdmin, chatbotController.deleteQA);

module.exports = router;
