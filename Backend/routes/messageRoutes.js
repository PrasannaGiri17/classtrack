const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// All message routes are protected
router.use(protect);

// Send message
router.post('/send', messageController.sendMessage);

// Get messages for a specific conversation
router.get('/:receiverId', messageController.getConversation);

// Get list of conversations (latest messages)
router.get('/', messageController.getConversationsList);

// Mark as read
router.put('/read/:conversationId', messageController.markAsRead);

// Delete message
router.delete('/:id', messageController.deleteMessage);

// Blocking
router.post('/block/:userId', messageController.blockUser);
router.post('/unblock/:userId', messageController.unblockUser);

module.exports = router;
