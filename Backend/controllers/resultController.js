const Result = require("../models/Result");
const Student = require("../models/studentModel");


// @desc    Save or Update Student Result
// @route   POST /api/results
exports.upsertResult = async (req, res) => {
  try {
    const { studentId, gradeId, sectionName, term, marks, academicYear } = req.body;

    // Use academicYear to find the correct partitioned record
    let result = await Result.findOne({ 
      schoolId: req.schoolId, 
      studentId, 
      term, 
      academicYear: academicYear || undefined // Result model pre-save will handle if not provided
    });

    if (result) {
      result.gradeId = gradeId;
      result.sectionName = sectionName;
      if (academicYear) result.academicYear = academicYear;
      
      // Merge marks: update if subject matches, otherwise push
      const incomingMarks = Array.isArray(marks) ? marks : [marks];
      incomingMarks.forEach(m => {
        const idx = result.marks.findIndex(nm => nm.subjectId.toString() === m.subjectId.toString());
        if (idx > -1) {
          result.marks[idx].theoryMarks = m.theoryMarks;
          result.marks[idx].practicalMarks = m.practicalMarks;
          result.marks[idx].remark = m.remark || "";
        } else {
          result.marks.push(m);
        }
      });
      
      await result.save();
    } else {
      result = new Result({
        schoolId: req.schoolId,
        studentId,
        gradeId,
        sectionName,
        term,
        academicYear,
        marks: Array.isArray(marks) ? marks : [marks]
      });
      await result.save();
    }

    const populatedResult = await Result.findById(result._id)
      .populate('studentId')
      .populate('gradeId')
      .populate('marks.subjectId');

    res.status(200).json(populatedResult);


  } catch (error) {
    console.error("Error saving result:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get Results with filters
// @route   GET /api/results
exports.getResults = async (req, res) => {
  try {
    const { gradeId, sectionName, term, academicYear } = req.query;
    const filter = { schoolId: req.schoolId };
    if (gradeId) filter.gradeId = gradeId;
    if (sectionName) filter.sectionName = sectionName;
    if (term) filter.term = term;
    if (academicYear) filter.academicYear = academicYear;

    const results = await Result.find(filter)
      .populate('studentId')
      .populate('gradeId')
      .populate('marks.subjectId');

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get Specific Student Result
// @route   GET /api/results/student/:studentId
exports.getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear } = req.query;

    const filter = { schoolId: req.schoolId, studentId };
    if (academicYear) filter.academicYear = academicYear;

    const results = await Result.find(filter)
      .populate('gradeId')
      .populate('marks.subjectId');
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get Performance Analytics (Averages)
// @route   GET /api/results/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const { academicYear, gradeId, sectionName, term } = req.query;
    const schoolId = req.schoolId;

    const match = { schoolId: Number(schoolId) };
    if (academicYear) match.academicYear = Number(academicYear);
    if (term) match.term = term;

    // 1. Grade-wise Averages
    const gradeAverages = await Result.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$gradeId",
          average: { $avg: "$summary.percentage" }
        }
      },
      {
        $lookup: {
          from: "grades", 
          localField: "_id",
          foreignField: "_id",
          as: "gradeDetails"
        }
      },
      { $unwind: "$gradeDetails" },
      {
        $project: {
          grade: "$gradeDetails.gradeNumber",
          average: { $round: ["$average", 1] }
        }
      },
      { $sort: { grade: 1 } }
    ]);

    // 2. Section-wise Averages for a specific Grade
    let sectionAverages = [];
    if (gradeId) {
      const sectionMatch = { ...match, gradeId: new (require('mongoose').Types.ObjectId)(gradeId) };
      sectionAverages = await Result.aggregate([
        { $match: sectionMatch },
        {
          $group: {
            _id: "$sectionName",
            average: { $avg: "$summary.percentage" }
          }
        },
        {
          $project: {
            section: "$_id",
            average: { $round: ["$average", 1] }
          }
        },
        { $sort: { section: 1 } }
      ]);
    }

    res.status(200).json({ gradeAverages, sectionAverages });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  upsertResult: exports.upsertResult,
  getResults: exports.getResults,
  getStudentResults: exports.getStudentResults,
  getAnalytics: exports.getAnalytics
};
