const Exam = require("../models/Exam");
const { Grade } = require("../models/School");

// @desc    Get Exam Data (Config & Schedules)
// @route   GET /api/exams
exports.getExamData = async (req, res) => {
  try {
    let exam = await Exam.findOne({ schoolId: 1 });
    if (!exam) {
      // Create default if not exists
      exam = new Exam({ schoolId: 1 });
      await exam.save();
    }
    // Populate subjects in schedules
    const populatedExam = await Exam.findById(exam._id).populate('schedules.entries.subjectId');
    res.json(populatedExam);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Save/Update Global Exam Config
// @route   POST /api/exams/config
exports.saveExamConfig = async (req, res) => {
  try {
    const { termsCount, includeMidTerm, globalStartTime, globalDuration } = req.body;

    let exam = await Exam.findOne({ schoolId: 1 });
    if (!exam) {
      exam = new Exam({ schoolId: 1 });
    }

    exam.config = {
      termsCount,
      includeMidTerm,
      globalStartTime,
      globalDuration
    };

    await exam.save();
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Save/Update Schedule for a Grade & Term
// @route   POST /api/exams/schedule
exports.saveExamSchedule = async (req, res) => {
  try {
    const { gradeNumber, term, entries } = req.body;

    let exam = await Exam.findOne({ schoolId: 1 });
    if (!exam) {
      exam = new Exam({ schoolId: 1 });
    }

    // Find if schedule exists for this grade and term
    const scheduleIndex = exam.schedules.findIndex(
      s => s.gradeNumber === Number(gradeNumber) && s.term === term
    );

    if (scheduleIndex > -1) {
      // Update existing
      exam.schedules[scheduleIndex].entries = entries;
    } else {
      // Add new
      exam.schedules.push({
        gradeNumber: Number(gradeNumber),
        term,
      entries
      });
    }

    await exam.save();
    
    // Return populated
    const populatedExam = await Exam.findById(exam._id).populate('schedules.entries.subjectId');
    res.json(populatedExam);

  } catch (error) {
    console.error("Error saving schedule:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update Term Status (Open/Close Marking Portal)
// @route   PATCH /api/exams/term-status
exports.updateTermStatus = async (req, res) => {
  try {
    const { term, isOpen } = req.body;

    let exam = await Exam.findOne({ schoolId: 1 });
    if (!exam) {
      exam = new Exam({ schoolId: 1 });
    }

    const statusIndex = exam.termStatuses.findIndex(s => s.term === term);

    if (statusIndex > -1) {
      exam.termStatuses[statusIndex].isOpen = isOpen;
    } else {
      exam.termStatuses.push({ term, isOpen });
    }

    await exam.save();
    res.json(exam);
  } catch (error) {
    console.error("Error updating term status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
