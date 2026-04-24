const Exam = require('../models/Exam');
const SchoolNotification = require('../models/SchoolNotification');
const ORDINALS = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'];

// Build the canonical term names from config
const buildTermNames = (termsCount, includeMidTerm) => {
  const terms = [];
  for (let i = 0; i < termsCount; i++) {
    const ord = ORDINALS[i] || `${i + 1}th`;
    if (includeMidTerm) terms.push(`${ord} Mid Term`);
    terms.push(`${ord} Term`);
  }
  return terms;
};

// @desc    Get Exam Data (Config & Schedules) — auto-syncs termStatuses from config
// @route   GET /api/exams
exports.getExamData = async (req, res) => {
  try {
    const { academicYear } = req.query;
    const filter = { schoolId: req.schoolId };
    if (academicYear) filter.academicYear = Number(academicYear);

    let exam = await Exam.findOne(filter);
    if (!exam) {
      exam = new Exam({ 
        schoolId: req.schoolId,
        academicYear: academicYear ? Number(academicYear) : undefined
      });
      await exam.save();
    }

    // Sync termStatuses to match current config naming
    const { termsCount = 2, includeMidTerm = true } = exam.config || {};
    const canonicalTerms = buildTermNames(termsCount, includeMidTerm);

    // Build new termStatuses — preserve existing values for matching names
    const existingMap = {};
    (exam.termStatuses || []).forEach(ts => {
      existingMap[ts.term] = { isOpen: ts.isOpen, isPublished: ts.isPublished };
    });

    const newStatuses = canonicalTerms.map(term => ({
      term,
      isOpen: existingMap[term]?.isOpen ?? false,
      isPublished: existingMap[term]?.isPublished ?? false
    }));

    // Only update if something changed (different set of terms)
    const existingNames = (exam.termStatuses || []).map(t => t.term).sort().join(',');
    const newNames = canonicalTerms.sort().join(',');
    if (existingNames !== newNames) {
      exam.termStatuses = newStatuses;
      await exam.save();
    }

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
    const { termsCount, includeMidTerm, globalStartTime, globalDuration, termDates, academicYear } = req.body;

    const filter = { schoolId: req.schoolId };
    if (academicYear) filter.academicYear = Number(academicYear);

    let exam = await Exam.findOne(filter);
    if (!exam) {
      exam = new Exam({ 
        schoolId: req.schoolId,
        academicYear: academicYear ? Number(academicYear) : undefined
      });
    }

    exam.config = {
      termsCount,
      includeMidTerm,
      globalStartTime,
      globalDuration,
      termDates // Store the universal date sequence
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
    const { gradeNumber, term, entries, academicYear } = req.body;

    const filter = { schoolId: req.schoolId };
    if (academicYear) filter.academicYear = Number(academicYear);

    let exam = await Exam.findOne(filter);
    if (!exam) {
      exam = new Exam({ 
        schoolId: req.schoolId,
        academicYear: academicYear ? Number(academicYear) : undefined
      });
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
    const { term, isOpen, academicYear } = req.body;

    const filter = { schoolId: req.schoolId };
    if (academicYear) filter.academicYear = Number(academicYear);

    let exam = await Exam.findOne(filter);
    if (!exam) {
      exam = new Exam({ 
        schoolId: req.schoolId,
        academicYear: academicYear ? Number(academicYear) : undefined
      });
    }

    const statusIndex = exam.termStatuses.findIndex(s => s.term === term);

    if (statusIndex > -1) {
      exam.termStatuses[statusIndex].isOpen = isOpen;
    } else {
      exam.termStatuses.push({ term, isOpen });
    }

    await exam.save();

    // --- Create School-Wide Notification (For Teachers) ---
    const senderName = req.user?.name || "School Administration";
    const title = `Marking Portal ${isOpen ? 'Opened' : 'Closed'} - ${term}`;
    const message = isOpen 
      ? `The marking portal for ${term} (${academicYear || 'Current'}) has been OPENED. Teachers can now enter student marks.`
      : `The marking portal for ${term} (${academicYear || 'Current'}) has been CLOSED.`;

    await new SchoolNotification({
      schoolId: req.schoolId,
      title,
      message,
      sender: senderName,
      receiver: 'teacher'
    }).save();

    res.json(exam);
  } catch (error) {
    console.error("Error updating term status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// @desc    Update Term Publish Status (Show/Hide Results for Students)
// @route   PATCH /api/exams/publish-status
exports.updatePublishStatus = async (req, res) => {
  try {
    const { term, isPublished, academicYear } = req.body;
 
    const filter = { schoolId: req.schoolId };
    if (academicYear) filter.academicYear = Number(academicYear);

    let exam = await Exam.findOne(filter);
    if (!exam) {
      exam = new Exam({ 
        schoolId: req.schoolId,
        academicYear: academicYear ? Number(academicYear) : undefined
      });
    }
 
    const statusIndex = exam.termStatuses.findIndex(s => s.term === term);
 
    if (statusIndex > -1) {
      exam.termStatuses[statusIndex].isPublished = isPublished;
    } else {
      exam.termStatuses.push({ term, isPublished });
    }
 
    await exam.save();

    // --- Create School-Wide Notification (For Students) only when Published ---
    if (isPublished) {
      const senderName = req.user?.name || "School Administration";
      const title = `Results Published - ${term}`;
      const message = `The official results for ${term} (${academicYear || 'Current'}) have been PUBLISHED. You can now view your academic report.`;

      await new SchoolNotification({
        schoolId: req.schoolId,
        title,
        message,
        sender: senderName,
        receiver: 'student'
      }).save();
    }

    res.json(exam);
  } catch (error) {
    console.error("Error updating publish status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
