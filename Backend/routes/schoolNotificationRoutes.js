const express = require("express");
const router = express.Router();
const schoolNotificationController = require("../controllers/schoolNotificationController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", schoolNotificationController.createNotification);
router.get("/", schoolNotificationController.getNotifications);
router.patch("/read-all", schoolNotificationController.markAllAsRead);
router.delete("/:id", schoolNotificationController.deleteNotification);
router.patch("/:id/read", schoolNotificationController.markAsRead);

module.exports = router;
