const SchoolNotification = require("../models/SchoolNotification");

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a School-Wide Notification (legacy)
// @route   POST /api/school-notifications
// ─────────────────────────────────────────────────────────────────────────────
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
      receiverId,
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Send a targeted notification immediately to a grade/section
// @route   POST /api/school-notifications/send
// ─────────────────────────────────────────────────────────────────────────────
exports.sendNotification = async (req, res) => {
  try {
    const { title, message, sender, targetGrade, targetSection, payload } = req.body;
    const schoolId = req.schoolId;

    if (!title || !message || !sender || !targetGrade) {
      return res.status(400).json({ message: "title, message, sender and targetGrade are required." });
    }

    await SchoolNotification.sendTargeted({
      schoolId,
      title,
      message,
      sender,
      targetGrade,
      targetSection: targetSection || "ALL",
      payload: payload || null,
    });

    res.status(201).json({ message: "Targeted notifications dispatched." });
  } catch (error) {
    console.error("[sendNotification] Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Schedule a targeted reminder notification 24 hours before deadline
// @route   POST /api/school-notifications/schedule-reminder
// ─────────────────────────────────────────────────────────────────────────────
exports.scheduleReminder = async (req, res) => {
  try {
    const { title, message, sender, targetGrade, targetSection, payload, deadline } = req.body;
    const schoolId = req.schoolId;

    if (!deadline) {
      return res.status(400).json({ message: "deadline is required." });
    }

    const reminderTime = new Date(deadline).getTime() - 24 * 60 * 60 * 1000; // 24 h before deadline
    const delayMs = reminderTime - Date.now();

    const dispatch = () =>
      SchoolNotification.sendTargeted({
        schoolId,
        title,
        message,
        sender,
        targetGrade,
        targetSection: targetSection || "ALL",
        payload: payload || null,
      }).catch((err) => console.error("[scheduleReminder] dispatch error:", err));

    if (delayMs <= 0) {
      // Deadline is within 24 h – send immediately
      await dispatch();
      console.log("[scheduleReminder] Deadline within 24 h – reminder sent immediately.");
    } else {
      // Schedule for later
      setTimeout(dispatch, delayMs);
      console.log(`[scheduleReminder] Reminder scheduled in ${Math.round(delayMs / 60000)} min.`);
    }

    res.status(201).json({ message: "Reminder scheduled.", scheduledAt: new Date(reminderTime).toISOString() });
  } catch (error) {
    console.error("[scheduleReminder] Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get All Notifications for a School (filtered by role/id)
// @route   GET /api/school-notifications
// ─────────────────────────────────────────────────────────────────────────────
exports.getNotifications = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const { role, receiverId } = req.query;

    const query = { schoolId };

    if (role || receiverId) {
      const orConditions = [];
      if (role) {
        orConditions.push({ receiver: role });
        orConditions.push({ receiver: "all" });
      }
      if (receiverId && receiverId !== "undefined" && receiverId !== "null") {
        // Pull student-targeted notifications for this student profile ID
        orConditions.push({ receiverId: receiverId });
      }

      if (orConditions.length > 0) {
        query.$or = orConditions;
      }
    }

    const notifications = await SchoolNotification.find(query).sort({ createdAt: -1 });

    // De-duplicate by title (keep only the latest), but allow multiple fee payments
    const uniqueTitles = new Set();
    const deDuplicated = notifications.filter((notif) => {
      if (notif.title === "Fee Payment Success") return true;
      if (uniqueTitles.has(notif.title)) return false;
      uniqueTitles.add(notif.title);
      return true;
    });

    res.status(200).json(deDuplicated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a Notification
// @route   DELETE /api/school-notifications/:id
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Mark Notification as Read
// @route   PATCH /api/school-notifications/:id/read
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Mark All Notifications as Read for a user
// @route   PATCH /api/school-notifications/read-all
// ─────────────────────────────────────────────────────────────────────────────
exports.markAllAsRead = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const userId = req.user._id;
    const { role } = req.query;

    const query = { schoolId };

    const orConditions = [];
    if (role) {
      orConditions.push({ receiver: role });
      orConditions.push({ receiver: "all" });
    }
    // Also mark targeted notifications aimed at this user
    orConditions.push({ receiverId: userId });

    // If the user is a student, also pull their student profile ID
    if (req.user.studentId) {
      orConditions.push({ receiverId: req.user.studentId });
    }

    query.$or = orConditions;

    await SchoolNotification.updateMany(query, { $addToSet: { readBy: userId } });

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
