const SchoolNotification = require("../models/SchoolNotification");

// @desc    Create a School-Wide Notification
// @route   POST /api/school-notifications
exports.createNotification = async (req, res) => {
  try {
    const { title, message, sender, receiver, receiverId } = req.body;
    const schoolId = req.schoolId;

    const notification = new SchoolNotification({
      schoolId,
      title,
      message,
      sender,
      receiver,
      receiverId
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get All Notifications for a School (filtered by role/id)
// @route   GET /api/school-notifications
exports.getNotifications = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const { role, receiverId } = req.query;

    const query = { schoolId };

    if (role || receiverId) {
      const orConditions = [];
      if (role) {
        orConditions.push({ receiver: role });
        orConditions.push({ receiver: 'all' });
      }
      if (receiverId && receiverId !== 'undefined' && receiverId !== 'null') {
        orConditions.push({ receiverId: receiverId });
      }
      
      if (orConditions.length > 0) {
        query.$or = orConditions;
      }
    }

    const notifications = await SchoolNotification.find(query).sort({ createdAt: -1 });

    // De-duplicate by title (keep only the latest), but allow multiple fee payments
    const uniqueTitles = new Set();
    const deDuplicated = notifications.filter(notif => {
      if (notif.title === 'Fee Payment Success') {
        return true;
      }
      if (uniqueTitles.has(notif.title)) {
        return false;
      }
      uniqueTitles.add(notif.title);
      return true;
    });

    res.status(200).json(deDuplicated);
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

// @desc    Mark Notification as Read
// @route   PATCH /api/school-notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await SchoolNotification.findByIdAndUpdate(
      id,
      { $addToSet: { readBy: userId } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Mark All Notifications as Read for a user
// @route   PATCH /api/school-notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const userId = req.user._id;
    const { role } = req.query;

    const query = { schoolId };
    
    // We only mark as read notifications that are relevant to this user
    const orConditions = [];
    if (role) {
      orConditions.push({ receiver: role });
      orConditions.push({ receiver: 'all' });
    }
    orConditions.push({ receiverId: userId });
    query.$or = orConditions;

    await SchoolNotification.updateMany(
      query,
      { $addToSet: { readBy: userId } }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
