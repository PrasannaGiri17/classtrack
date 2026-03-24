const Result = require("../models/Result");
const Student = require("../models/studentModel");

// @desc    Save or Update Student Result
// @route   POST /api/results
exports.upsertResult = async (req, res) => {
  try {
    const { studentId, gradeId, sectionName, term, marks } = req.body;

    let result = await Result.findOne({ schoolId: req.schoolId,  studentId, term });

    if (result) {
      result.gradeId = gradeId;
      result.sectionName = sectionName;
      
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
    const { gradeId, sectionName, term } = req.query;
    const filter = { schoolId: req.schoolId };
    if (gradeId) filter.gradeId = gradeId;
    if (sectionName) filter.sectionName = sectionName;
    if (term) filter.term = term;

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
    const results = await Result.find({ schoolId: req.schoolId,  studentId })
      .populate('gradeId')
      .populate('marks.subjectId');
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
