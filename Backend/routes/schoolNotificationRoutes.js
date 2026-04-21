const express = require("express");
const router = express.Router();
const schoolNotificationController = require("../controllers/schoolNotificationController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", schoolNotificationController.createNotification);
router.get("/", schoolNotificationController.getNotifications);
router.delete("/:id", schoolNotificationController.deleteNotification);

module.exports = router;
