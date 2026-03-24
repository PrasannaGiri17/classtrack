const Notification = require("../models/Notification");

// Create Notification
exports.createNotification = async (req, res) => {
  try {
    const { title, message, priority, targetGroup, sender, senderId, senderType } = req.body;
    
    if (!title || !message || !targetGroup || !sender || !senderId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newNotification = new Notification({
      title,
      message,
      priority,
      targetGroup,
      sender,
      senderId,
      senderType: senderType || 'admin',
      schoolId: req.schoolId  // Always from JWT — never from body
    });

    await newNotification.save();
    res.status(201).json({ message: "Notification created successfully", notification: newNotification });
  } catch (error) {
    res.status(500).json({ message: "Error creating notification", error: error.message });
  }
};

// Get All Notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ schoolId: req.schoolId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error: error.message });
  }
};

// Get Notification by ID
exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notification", error: error.message });
  }
};

// Delete Notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, schoolId: req.schoolId });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting notification", error: error.message });
  }
};
