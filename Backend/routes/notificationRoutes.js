const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

router.post("/create", notificationController.createNotification);
router.get("/", notificationController.getNotifications);
router.get("/:id", notificationController.getNotificationById);
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
