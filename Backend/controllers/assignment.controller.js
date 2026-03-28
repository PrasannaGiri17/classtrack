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

    // Attach schoolId from token
    const assignmentData = {
      ...req.body,
      schoolId: req.schoolId
    };

    if (!assignmentData.schoolId) {
      return res.status(401).json({ message: "School identification missing. Please relogin." });
    }

    const assignment = await Assignment.create(assignmentData);
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
    const schoolId = req.schoolId;
    console.log(`[ASSIGNMENT] Teacher Fetch - TeacherId: ${teacherId}, SchoolId: ${schoolId}`);
    
    const assignments = await Assignment.find({ schoolId: schoolId,  teacherId }).sort({ createdAt: -1 });
    console.log(`[ASSIGNMENT] Teacher Found ${assignments.length} assignments.`);
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
    const assignment = await Assignment.findOne({ _id: req.params.id, schoolId: req.schoolId });
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
    const assignment = await Assignment.findOneAndUpdate({ _id: req.params.id, schoolId: req.schoolId },
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
    const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, schoolId: req.schoolId });
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
    const assignment = await Assignment.findOne({ _id: req.params.id, schoolId: req.schoolId });
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
    const assignment = await Assignment.findOne({ _id: req.params.id, schoolId: req.schoolId });
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const subs = assignment.submissions || [];
    const latestSubsMap = new Map();
    subs.forEach(s => {
      const sId = s.studentId ? s.studentId.toString() : null;
      if (sId) {
        const existing = latestSubsMap.get(sId);
        if (!existing || new Date(s.submittedAt) > new Date(existing.submittedAt)) {
          latestSubsMap.set(sId, s);
        }
      }
    });

    res.status(200).json(Array.from(latestSubsMap.values()));
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
      { _id: id, schoolId: req.schoolId, "submissions._id": submissionId },
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
      { _id: id, schoolId: req.schoolId, "submissions._id": submissionId },
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

/**
 * @desc    Get assignments for a specific student (based on grade/section)
 * @route   GET /api/assignments/student/:grade/:section
 */
exports.getStudentAssignments = async (req, res) => {
  try {
    const { grade, section } = req.params;
    const { studentId } = req.query;
    const schoolId = req.schoolId;
    
    console.log(`[ASSIGNMENT] Student Fetch - Grade: ${grade}, Section: ${section}, SchoolId: ${schoolId}, StudentId: ${studentId}`);
    
    // Find assignments that target 'ALL' sections of that grade OR the specific section
    const gradeStr = String(grade).trim();
    const sectionStr = String(section).trim();
    const numericGrade = Number(gradeStr);

    // Determine query for grade - support numeric, "Grade X", or "GX"
    const gradeQuery = {
      $or: [
        { grade: gradeStr },
        { grade: isNaN(numericGrade) ? gradeStr : numericGrade }, // Support numeric matches
        { grade: `Grade ${gradeStr}` },
        { grade: { $regex: new RegExp(`^(\\s*Grade\\s+|G)?${gradeStr}\\s*$`, 'i') } }
      ]
    };

    // Determine query for section - support "ALL", the section name, or a Mongo ID
    const sectionQuery = {
      $or: [
        { section: 'ALL' },
        { section: sectionStr },
        { section: { $regex: new RegExp(`^${sectionStr}$`, 'i') } }
      ]
    };

    console.log(`[ASSIGNMENT] Querying with gradeQuery:`, JSON.stringify(gradeQuery));
    console.log(`[ASSIGNMENT] Querying with sectionQuery:`, JSON.stringify(sectionQuery));

    const assignments = await Assignment.find({ 
      schoolId: schoolId,
      $and: [ gradeQuery, sectionQuery ]
    }).populate('teacherId', 'firstName lastName')
      .populate('submissions.studentId', 'firstName lastName')
      .sort({ createdAt: -1 });

    console.log(`[ASSIGNMENT] Result: Found ${assignments.length} docs for schoolId: ${schoolId}`);

    // Privacy: Only return the submission of the requesting student if studentId is provided
    const filteredAssignments = assignments.map(doc => {
      // Use toJSON to ensure virtuals are included correctly as per schema options
      const a = doc.toJSON();
      const subs = a.submissions || [];
      
      if (studentId) {
        // Find only the current student's LATEST submission (sort by date descending if multiple exist)
        const studentSubs = subs.filter(s => {
          if (!s.studentId) return false;
          const sId = s.studentId._id ? s.studentId._id.toString() : s.studentId.toString();
          return sId === studentId.toString();
        }).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

        a.submission = studentSubs[0] || null;
        a.submissions = a.submission ? [a.submission] : [];
      } else {
        // For teacher view (or when studentId not provided), we might still want to group by student
        // to only show the latest for each student in the report
        const latestSubsMap = new Map();
        subs.forEach(s => {
          const sId = s.studentId ? (s.studentId._id ? s.studentId._id.toString() : s.studentId.toString()) : null;
          if (sId) {
            const existing = latestSubsMap.get(sId);
            if (!existing || new Date(s.submittedAt) > new Date(existing.submittedAt)) {
              latestSubsMap.set(sId, s);
            }
          }
        });
        a.submissions = Array.from(latestSubsMap.values());
      }
      return a;
    });

    res.status(200).json(filteredAssignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Submit an assignment
 * @route   POST /api/assignments/:id/submit
 */
exports.submitAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, studentName, fileName, fileUrl } = req.body;

    const assignment = await Assignment.findOne({ _id: id, schoolId: req.schoolId });
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Check if portal is closed
    const status = assignment.status;
    if (status === 'closed') {
      return res.status(403).json({ message: "Assignment portal is closed" });
    }

    // Check if student already has a submission
    const existingSubmissionIndex = assignment.submissions.findIndex(s => {
      const sId = s.studentId ? s.studentId.toString() : null;
      return sId === studentId.toString();
    });

    const newSubmission = {
      studentId,
      studentName,
      fileName,
      fileUrl,
      submittedAt: new Date(),
      remark: "",
      gradingStatus: "none"
    };

    if (existingSubmissionIndex !== -1) {
      // Replace existing submission
      assignment.submissions[existingSubmissionIndex] = newSubmission;
    } else {
      // Add new submission
      assignment.submissions.push(newSubmission);
    }

    await assignment.save();
    res.status(200).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
