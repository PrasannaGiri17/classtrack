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

    // Normalize date to start of day UTC for consistent indexing
    const entryDate = new Date(date);
    entryDate.setUTCHours(0, 0, 0, 0);

    const schoolId = Number(req.schoolId); 
    const mongoose = require('mongoose');
    const tId = new mongoose.Types.ObjectId(teacherId);

    const filter = { schoolId, teacherId: tId, periodId, date: entryDate };
    const update = { 
      schoolId,
      teacherId: tId, // Ensure it's part of the update for new docs
      className, 
      subject, 
      activity, 
      homework 
    };

    // Upsert the entry
    const savedEntry = await Diary.findOneAndUpdate(
      filter,
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message: "Diary entry saved successfully",
      data: savedEntry
    });
  } catch (error) {
    console.error("DIARY SAVE ERROR:", error);
    res.status(500).json({ message: "Server error during publication", error: error.message });
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
    const startOfDay = new Date(queryDate.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setUTCHours(23, 59, 59, 999));

    const mongoose = require('mongoose');
    const tId = new mongoose.Types.ObjectId(teacherId);

    const diaries = await Diary.find({ 
      schoolId: Number(req.schoolId), 
      teacherId: tId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    res.status(200).json(diaries);
  } catch (error) {
    console.error("DIARY FETCH ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * GET /api/diary/class?className=&date=
 * Returns all diary entries for a specific class and date.
 */
exports.getDiaryForClass = async (req, res) => {
  try {
    const { className, date } = req.query;

    if (!className || !date) {
      return res.status(400).json({ message: "Class name and date are required" });
    }

    const queryDate = new Date(date);
    const startOfDay = new Date(queryDate.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setUTCHours(23, 59, 59, 999));

    const diaries = await Diary.find({ 
      schoolId: Number(req.schoolId), 
      className,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('teacherId', 'firstName lastName profilePhoto');

    res.status(200).json(diaries);
  } catch (error) {
    console.error("DIARY CLASS FETCH ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
