const express = require("express");
const router = express.Router();
const schoolNotificationController = require("../controllers/schoolNotificationController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

// ── Targeted dispatch routes (must come before /:id routes) ──────────────────
router.post("/send", schoolNotificationController.sendNotification);
router.post("/schedule-reminder", schoolNotificationController.scheduleReminder);

// ── General CRUD ─────────────────────────────────────────────────────────────
router.post("/", schoolNotificationController.createNotification);
router.get("/", schoolNotificationController.getNotifications);
router.patch("/read-all", schoolNotificationController.markAllAsRead);
router.delete("/:id", schoolNotificationController.deleteNotification);
router.patch("/:id/read", schoolNotificationController.markAsRead);

module.exports = router;
