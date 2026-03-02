const TeacherRoutine = require('../models/teacherRoutine');
const Diary = require('../models/diary');

/**
 * GET /api/teacher-routine/:teacherId?date=YYYY-MM-DD
 * Returns teacher schedule for the day with any existing diary entries merged.
 */
exports.getTeacherRoutineForDate = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { date } = req.query;

    if (!teacherId || !date) {
      return res.status(400).json({ message: "Teacher ID and date are required" });
    }

    const queryDate = new Date(date);
    const dayOfWeek = queryDate.getDay(); // 0 (Sun) - 6 (Sat)

    // 1. Get Teacher's Schedule for this day of week
    const schedule = await TeacherRoutine.find({ teacherId, dayOfWeek });

    // 2. Get Diary entries for this teacher and date
    // Normalize date to YYYY-MM-DD for comparison if stored that way, 
    // but here we'll assume the date is exact or we search for the full day.
    const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

    const diaries = await Diary.find({
      teacherId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    // 3. Merge schedule with diary data
    const mergedData = schedule.map(period => {
      const diaryEntry = diaries.find(d => d.periodId === period.periodId);
      return {
        periodId: period.periodId,
        className: period.className,
        subject: period.subject,
        timeSlot: period.timeSlot,
        activity: diaryEntry ? diaryEntry.activity : "",
        homework: diaryEntry ? diaryEntry.homework : ""
      };
    });

    res.status(200).json(mergedData);
  } catch (error) {
    console.error("Error fetching routine:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
