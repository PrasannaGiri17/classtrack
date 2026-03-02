const Assignment = require('../models/assignment.model');

/**
 * @desc    Create a new assignment
 * @route   POST /api/assignments/create
 */
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, closeTime, grade, section, subject, teacherId } = req.body;

    // Basic validation
    if (!title || !description || !closeTime || !grade || !section || !subject || !teacherId) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    const assignment = await Assignment.create(req.body);
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all assignments for a specific teacher
 * @route   GET /api/assignments/teacher/:teacherId
 */
exports.getAllAssignments = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const assignments = await Assignment.find({ teacherId }).sort({ createdAt: -1 });
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single assignment by ID
 * @route   GET /api/assignments/:id
 */
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    res.status(200).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update assignment info
 * @route   PUT /api/assignments/:id
 */
exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    res.status(200).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete an assignment
 * @route   DELETE /api/assignments/:id
 */
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Toggle manual lock on the assignment portal
 * @route   PATCH /api/assignments/:id/toggle-lock
 */
exports.toggleLockAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    
    assignment.isManuallyLocked = !assignment.isManuallyLocked;
    await assignment.save();
    
    res.status(200).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get submissions report for an assignment
 * @route   GET /api/assignments/:id/report
 */
exports.getAssignmentReport = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    res.status(200).json(assignment.submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Grade a student submission
 * @route   PATCH /api/assignments/:id/submission/:submissionId/grade
 */
exports.gradeSubmission = async (req, res) => {
  try {
    const { id, submissionId } = req.params;
    const { gradingStatus } = req.body;

    if (!['none', 'pass', 'fail'].includes(gradingStatus)) {
      return res.status(400).json({ message: "Invalid grading status" });
    }

    const assignment = await Assignment.findOneAndUpdate(
      { _id: id, "submissions._id": submissionId },
      { 
        $set: { "submissions.$.gradingStatus": gradingStatus } 
      },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({ message: "Assignment or submission not found" });
    }

    res.status(200).json({ message: "Submission graded successfully", assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update teacher remark for a submission
 * @route   PATCH /api/assignments/:id/submission/:submissionId/remark
 */
exports.updateSubmissionRemark = async (req, res) => {
  try {
    const { id, submissionId } = req.params;
    const { remark } = req.body;

    const assignment = await Assignment.findOneAndUpdate(
      { _id: id, "submissions._id": submissionId },
      { 
        $set: { "submissions.$.remark": remark } 
      },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({ message: "Assignment or submission not found" });
    }

    res.status(200).json({ message: "Remark updated successfully", assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
