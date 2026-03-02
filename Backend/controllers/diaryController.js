const Diary = require('../models/diary');

/**
 * POST /api/diary/save
 * Saves or updates a diary entry.
 */
exports.saveDiaryEntry = async (req, res) => {
  try {
    const { teacherId, periodId, date, className, subject, activity, homework } = req.body;

    if (!teacherId || !periodId || !date) {
      return res.status(400).json({ message: "Teacher ID, Period ID, and Date are required" });
    }

    // Normalize date to start of day for indexing consistency
    const entryDate = new Date(date);
    entryDate.setHours(0, 0, 0, 0);

    const filter = { teacherId, periodId, date: entryDate };
    const update = { 
      className, 
      subject, 
      activity, 
      homework 
    };

    // Upsert the entry
    const savedEntry = await Diary.findOneAndUpdate(
      filter,
      { $set: update },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: "Diary entry saved successfully",
      data: savedEntry
    });
  } catch (error) {
    console.error("Error saving diary entry:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * GET /api/diary?teacherId=&date=
 * Returns all diary entries for a specific teacher and date.
 */
exports.getDiaryForDate = async (req, res) => {
  try {
    const { teacherId, date } = req.query;

    if (!teacherId || !date) {
      return res.status(400).json({ message: "Teacher ID and date are required" });
    }

    const queryDate = new Date(date);
    const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

    const diaries = await Diary.find({
      teacherId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    res.status(200).json(diaries);
  } catch (error) {
    console.error("Error fetching diary:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
