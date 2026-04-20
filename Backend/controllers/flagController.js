// controllers/flagController.js
const { StudentFlag } = require('../models/StudentFlag');
const { calculateAndSaveFlags } = require('../services/flagService');

/**
 * POST /api/flags/calculate
 * Body: { schoolId, academicYear }
 * Triggers full flag recalculation for all active students in a school.
 */
const calculateFlags = async (req, res) => {
  try {
    const { schoolId, academicYear } = req.body;

    if (!schoolId || !academicYear) {
      return res.status(400).json({ message: 'schoolId and academicYear are required.' });
    }

    const summary = await calculateAndSaveFlags(Number(schoolId), Number(academicYear));

    return res.status(200).json({
      message: 'Flag calculation complete.',
      processed: summary.processed,
      errors: summary.errors,
    });
  } catch (err) {
    console.error('calculateFlags error:', err);
    return res.status(500).json({ message: 'Internal server error.', error: err.message });
  }
};

/**
 * GET /api/flags/school/:schoolId
 * Query: academicYear (required), termPair (optional), flagColor (optional)
 * Returns all flag records for a school, with student details populated.
 */
const getFlagsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { academicYear, termPair, flagColor } = req.query;

    if (!academicYear) {
      return res.status(400).json({ message: 'academicYear query param is required.' });
    }

    const filter = {
      schoolId: Number(schoolId),
      academicYear: Number(academicYear),
    };
    if (termPair) filter.termPair = termPair;
    if (flagColor) filter.flagColor = flagColor;

    const flags = await StudentFlag.find(filter)
      .populate('studentId', 'firstName lastName rollNumber studentId sectionName')
      .sort({ termPair: 1, flagColor: 1 })
      .lean();

    return res.status(200).json(flags);
  } catch (err) {
    console.error('getFlagsBySchool error:', err);
    return res.status(500).json({ message: 'Internal server error.', error: err.message });
  }
};

/**
 * GET /api/flags/student/:studentId
 * Returns full flag history for one student, sorted by year and termPair.
 */
const getStudentFlagHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    const flags = await StudentFlag.find({ studentId })
      .sort({ academicYear: -1, termPair: 1 })
      .lean();

    return res.status(200).json(flags);
  } catch (err) {
    console.error('getStudentFlagHistory error:', err);
    return res.status(500).json({ message: 'Internal server error.', error: err.message });
  }
};

/**
 * GET /api/flags/summary/:schoolId
 * Query: academicYear (required), termPair (optional)
 * Returns { green, amber, red, total }
 */
const getFlagSummary = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { academicYear, termPair } = req.query;

    if (!academicYear) {
      return res.status(400).json({ message: 'academicYear query param is required.' });
    }

    const matchStage = {
      schoolId: Number(schoolId),
      academicYear: Number(academicYear),
    };
    if (termPair) matchStage.termPair = termPair;

    const agg = await StudentFlag.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$flagColor',
          count: { $sum: 1 },
        },
      },
    ]);

    const summary = { green: 0, amber: 0, red: 0, total: 0 };
    for (const item of agg) {
      if (item._id in summary) {
        summary[item._id] = item.count;
        summary.total += item.count;
      }
    }

    return res.status(200).json(summary);
  } catch (err) {
    console.error('getFlagSummary error:', err);
    return res.status(500).json({ message: 'Internal server error.', error: err.message });
  }
};

module.exports = {
  calculateFlags,
  getFlagsBySchool,
  getStudentFlagHistory,
  getFlagSummary,
};
