const SchoolNotification = require("../models/SchoolNotification");

// @desc    Create a School-Wide Notification
// @route   POST /api/school-notifications
exports.createNotification = async (req, res) => {
  try {
    const { title, message, sender } = req.body;
    const schoolId = req.schoolId;

    const notification = new SchoolNotification({
      schoolId,
      title,
      message,
      sender
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get All Notifications for a School
// @route   GET /api/school-notifications
exports.getNotifications = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const notifications = await SchoolNotification.find({ schoolId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a Notification
// @route   DELETE /api/school-notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.schoolId;

    const notification = await SchoolNotification.findOneAndDelete({ _id: id, schoolId });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
