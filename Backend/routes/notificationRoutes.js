const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

router.post("/create", protect, notificationController.createNotification);
router.get("/", protect, notificationController.getNotifications);
router.get("/:id", protect, notificationController.getNotificationById);
router.delete("/:id", protect, notificationController.deleteNotification);

module.exports = router;
