const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Get messageable users filtered by permissions and school
router.get('/', protect, userController.getContactableUsers);

module.exports = router;
