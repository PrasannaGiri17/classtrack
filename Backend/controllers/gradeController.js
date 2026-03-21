const { Grade, School, Subject } = require("../models/School");
const Teacher = require("../models/teacherModel");
const { syncTeacherAssignedClasses } = require("../utils/teacherSync");

// Helper to generate sections
const generateSections = (count) => {
  const sections = [];
  for (let i = 0; i < count; i++) {
    sections.push({
      sectionName: String.fromCharCode(65 + i), // A, B, C...
      capacity: 40,
      isActive: true
    });
  }
  return sections;
};

// Get all grades (populated with subjects)
const getGrades = async (req, res) => {
  try {
    const rawSchoolId = req.query.schoolId || req.headers['x-school-id'];
    if (!rawSchoolId) {
      return res.status(400).json({ message: "School ID is required as a query parameter or header." });
    }

    const schoolId = parseInt(rawSchoolId);
    if (isNaN(schoolId)) {
        return res.status(400).json({ message: "Valid numeric School ID is required." });
    }

    // 1. Fetch current school span
    const school = await School.findOne({ schoolId: schoolId });
    if (!school) {
      return res.status(404).json({ message: "School config not found" });
    }

    const { start, end } = school.gradeSpan || { start: 1, end: 10 };

    // 2. Filter grades based on span
    const grades = await Grade.find({
      schoolId: schoolId,
      gradeNumber: { $gte: start, $lte: end }
    })
      .sort({ gradeNumber: 1 })
      .populate('subjects.subjectId');
    res.status(200).json(grades);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update section count for a single grade
const updateGradeSections = async (req, res) => {
  try {
    const { gradeNumber: gNum, sectionCount: sCount, schoolId: sId } = req.body;

    const schoolId = parseInt(sId);
    const gradeNumber = parseInt(gNum);
    const sectionCount = parseInt(sCount);

    if (isNaN(schoolId)) return res.status(400).json({ message: "Valid schoolId required" });
    if (isNaN(gradeNumber)) return res.status(400).json({ message: "Valid gradeNumber required" });
    if (isNaN(sectionCount)) return res.status(400).json({ message: "Valid sectionCount required" });

    // Check if grade exists
    let grade = await Grade.findOne({ schoolId, gradeNumber });

    if (grade) {
      // Update existing grade
      let currentSections = [...(grade.sections || [])];

      if (sectionCount > currentSections.length) {
        // Add new sections
        const addedCount = sectionCount - currentSections.length;
        const startCharCode = 65 + currentSections.length;
        for (let i = 0; i < addedCount; i++) {
          currentSections.push({
            sectionName: String.fromCharCode(startCharCode + i),
            capacity: 40,
            isActive: true
          });
        }
      } else if (sectionCount < currentSections.length) {
        // Remove sections from the end
        currentSections = currentSections.slice(0, sectionCount);
      }

      grade.sections = currentSections;
      grade.isActive = true;

      // Save
      grade.markModified('sections');
      await grade.save();
      res.status(200).json(grade);
    } else {
      // Create new grade
      const newGrade = new Grade({
        schoolId,
        gradeNumber,
        gradeName: `Grade ${gradeNumber}`,
        sections: generateSections(sectionCount),
        displayOrder: gradeNumber,
        isActive: true
      });
      await newGrade.save();
      res.status(201).json(newGrade);
    }
  } catch (error) {
    console.error("Update Grade Sections Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Sync all sections
const syncSections = async (req, res) => {
  try {
    const { sectionCount: sCount, gradeList, schoolId: sId } = req.body;
    
    const schoolId = parseInt(sId);
    const count = parseInt(sCount);

    if (isNaN(schoolId)) return res.status(400).json({ message: "schoolId required" });
    
    // Validation
    if (isNaN(count) || count < 1 || count > 10) {
      return res.status(400).json({ message: "Invalid section count (1-10)" });
    }

    if (!gradeList || !Array.isArray(gradeList) || gradeList.length === 0) {
      return res.status(400).json({ message: "No grades provided to sync" });
    }

    // Process each grade in the list
    const updates = gradeList.map(async (gradeNumStr) => {
      const gradeNumber = parseInt(gradeNumStr);
      if (isNaN(gradeNumber)) return null;

      // Find existing to see current sections
      let grade = await Grade.findOne({ schoolId, gradeNumber });
      let newSections = [];

      if (grade) {
        newSections = [...(grade.sections || [])];
        if (count > newSections.length) {
          const addedCount = count - newSections.length;
          const startCharCode = 65 + newSections.length; // 65 = A
          for (let i = 0; i < addedCount; i++) {
            newSections.push({
              sectionName: String.fromCharCode(startCharCode + i),
              capacity: 40,
              isActive: true
            });
          }
        } else {
          newSections = newSections.slice(0, count);
        }
      } else {
        // New Grade
        newSections = generateSections(count);
      }

      return Grade.findOneAndUpdate(
        { schoolId, gradeNumber },
        {
          $set: {
            schoolId,
            gradeNumber,
            gradeName: `Grade ${gradeNumber}`,
            sections: newSections,
            displayOrder: gradeNumber,
            isActive: true
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    });

    await Promise.all(updates);
    res.status(200).json({ message: `Sections synced successfully for ${gradeList.length} grades` });

  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add Subject to Grade
const addSubjectToGrade = async (req, res) => {
  try {
    const { gradeNumber, subjectName, type, schoolId } = req.body; // type: 'core' or 'elective'
    if (!schoolId) return res.status(400).json({ message: "schoolId required" });

    // 1. Find or Create Subject
    let subject = await Subject.findOne({ schoolId, subjectName: new RegExp(`^${subjectName}$`, 'i') });
    if (!subject) {
      subject = new Subject({
        schoolId,
        subjectName,
        subjectType: type || 'core',
        subjectCode: subjectName.substring(0, 3).toUpperCase() // Simple code gen
      });
      await subject.save();
    }

    // 2. Add to Grade
    const grade = await Grade.findOne({ schoolId, gradeNumber });
    if (!grade) {
      return res.status(404).json({ message: "Grade not found. Please setup grade first." });
    }

    // Check availability
    const exists = grade.subjects.some(s => s.subjectId.equals(subject._id));
    if (exists) {
      return res.status(400).json({ message: "Subject already added to this grade" });
    }

    grade.subjects.push({
      subjectId: subject._id,
      isMandatory: type === 'core',
      periodsPerWeek: 5
    });

    await grade.save();
    // Re-fetch to return populated data
    const updatedGrade = await Grade.findById(grade._id).populate('subjects.subjectId');

    res.status(200).json(updatedGrade);

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove Subject from Grade
const removeSubjectFromGrade = async (req, res) => {
  try {
    const { gradeNumber, subjectName, schoolId } = req.body;
    if (!schoolId) return res.status(400).json({ message: "schoolId required" });

    // Find Subject ID first
    const subject = await Subject.findOne({ schoolId, subjectName: new RegExp(`^${subjectName}$`, 'i') });
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const grade = await Grade.findOne({ schoolId, gradeNumber });
    if (!grade) return res.status(404).json({ message: "Grade not found" });

    grade.subjects = grade.subjects.filter(s => !s.subjectId.equals(subject._id));
    await grade.save();

    const updatedGrade = await Grade.findById(grade._id).populate('subjects.subjectId');
    res.status(200).json(updatedGrade);

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add Subject to All Grades (Global Core)
const addSubjectToAllGrades = async (req, res) => {
  try {
    const { subjectName, type, schoolId } = req.body; // type usually 'core'
    if (!schoolId) return res.status(400).json({ message: "schoolId required" });

    // 1. Find or Create Subject
    let subject = await Subject.findOne({ schoolId, subjectName: new RegExp(`^${subjectName}$`, 'i') });
    if (!subject) {
      subject = new Subject({
        schoolId,
        subjectName,
        subjectType: type || 'core',
        subjectCode: subjectName.substring(0, 3).toUpperCase()
      });
      await subject.save();
    }

    // 2. Add to ALL Grades
    const grades = await Grade.find({ schoolId });
    // Use Promise.all to update in parallel
    await Promise.all(grades.map(async (grade) => {
      const exists = grade.subjects.some(s => s.subjectId.equals(subject._id));
      if (!exists) {
        grade.subjects.push({
          subjectId: subject._id,
          isMandatory: true, // Always mandatory for global core
          periodsPerWeek: 5
        });
        await grade.save();
      }
    }));

    res.status(200).json({ message: `Subject ${subjectName} added to ${grades.length} grades.` });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove Subject from All Grades
const removeSubjectFromAllGrades = async (req, res) => {
  try {
    const { subjectName, schoolId } = req.body;
    if (!schoolId) return res.status(400).json({ message: "schoolId required" });

    const subject = await Subject.findOne({ schoolId, subjectName: new RegExp(`^${subjectName}$`, 'i') });
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Update all grades
    await Grade.updateMany(
      { schoolId },
      { $pull: { subjects: { subjectId: subject._id } } }
    );

    res.status(200).json({ message: `Subject ${subjectName} removed from all grades.` });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update section's custom name
const updateSectionName = async (req, res) => {
  try {
    const { gradeNumber, sectionName, classRoomName, schoolId } = req.body;
    if (!schoolId) return res.status(400).json({ message: "schoolId required" });

    const grade = await Grade.findOne({ schoolId, gradeNumber });
    if (!grade) return res.status(404).json({ message: "Grade not found" });

    const section = grade.sections.find(s => s.sectionName === sectionName);
    if (!section) return res.status(404).json({ message: "Section not found" });

    section.classRoomName = classRoomName;
    await grade.save();

    res.status(200).json(grade);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Assign class teacher to a section
const assignClassTeacher = async (req, res) => {
  try {
    const { gradeNumber, sectionName, teacherId, schoolId } = req.body;
    if (!schoolId) return res.status(400).json({ message: "schoolId required" });

    const grade = await Grade.findOne({ schoolId, gradeNumber });
    if (!grade) return res.status(404).json({ message: "Grade not found" });

    const section = grade.sections.find(s => s.sectionName === sectionName);
    if (!section) return res.status(404).json({ message: "Section not found" });

    // Check if teacher is already a class teacher for another section
    if (teacherId) {
      const existingGrade = await Grade.findOne({
        schoolId,
        "sections.classTeacherId": teacherId
      });
      if (existingGrade) {
        // If it's a different grade OR a different section in the same grade, it's a conflict
        const existingSection = existingGrade.sections.find(s => s.classTeacherId?.toString() === teacherId.toString());
        if (existingGrade._id.toString() !== grade._id.toString() || existingSection.sectionName !== sectionName) {
           return res.status(400).json({ message: `Teacher is already assigned as Class Teacher for Grade ${existingGrade.gradeNumber} - Section ${existingSection.sectionName}` });
        }
      }
    }

    const oldTeacherId = section.classTeacherId;
    section.classTeacherId = teacherId || null;
    await grade.save();

    const classRoomInfo = `Grade ${gradeNumber}-${sectionName}`;

    // 1. If there was a previous teacher, clear their fields
    if (oldTeacherId && oldTeacherId.toString() !== teacherId) {
      await Teacher.findOneAndUpdate({ _id: oldTeacherId, schoolId: req.schoolId }, {
        $set: { classTeacher: null }
      });
      // Sync their assignedClasses just in case, though it's mainly from timetable
      await syncTeacherAssignedClasses(oldTeacherId);
    }

    // 2. Update the new teacher's fields
    if (teacherId) {
      await Teacher.findOneAndUpdate({ _id: teacherId, schoolId: req.schoolId }, {
        $set: {
          classTeacher: classRoomInfo
        }
      });
      // Sync their assignedClasses from timetable
      await syncTeacherAssignedClasses(teacherId);
    }

    res.status(200).json(grade);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Assign class monitor to a section
const assignClassMonitor = async (req, res) => {
  try {
    const { sectionId, studentId } = req.body;

    const grade = await Grade.findOne({ "sections._id": sectionId });
    if (!grade) return res.status(404).json({ message: "Section not found" });

    const section = grade.sections.id(sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });

    section.classMonitorId = studentId || null;
    await grade.save();

    res.status(200).json({ message: "Class monitor updated successfully", classMonitorId: section.classMonitorId });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Update monthly fee for a grade
const updateGradeFee = async (req, res) => {
  try {
    const { gradeNumber, monthlyFee, schoolId } = req.body;
    if (!schoolId) return res.status(400).json({ message: "schoolId required" });

    const grade = await Grade.findOneAndUpdate(
      { schoolId, gradeNumber },
      { $set: { monthlyFee } },
      { new: true }
    );

    if (!grade) {
      return res.status(404).json({ message: "Grade not found" });
    }

    res.status(200).json(grade);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get section info by teacher ID
const getSectionByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const grade = await Grade.findOne({ "sections.classTeacherId": teacherId });
    if (!grade) {
      return res.status(404).json({ message: "No assigned class found for this teacher." });
    }
    const section = grade.sections.find(s => s.classTeacherId?.toString() === teacherId);
    if (!section) {
      return res.status(404).json({ message: "Section details not found." });
    }
    res.status(200).json({ 
      gradeId: grade._id,
      gradeNumber: grade.gradeNumber,
      gradeName: grade.gradeName,
      sectionId: section._id,
      sectionName: section.sectionName,
      classRoomName: section.classRoomName,
      classMonitorId: section.classMonitorId
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getGrades,
  updateGradeSections,
  syncSections,
  addSubjectToGrade,
  removeSubjectFromGrade,
  addSubjectToAllGrades,
  removeSubjectFromAllGrades,
  updateSectionName,
  assignClassTeacher,
  assignClassMonitor,
  updateGradeFee,
  getSectionByTeacher,
  getSectionById: async (req, res) => {
    try {
        const { sectionId } = req.params;
        const grade = await Grade.findOne({ "sections._id": sectionId }).populate("sections.classTeacherId");
        if (!grade) {
          return res.status(404).json({ message: "No class found for this section ID." });
        }
        const section = grade.sections.id(sectionId);
        if (!section) {
          return res.status(404).json({ message: "Section details not found." });
        }
        res.status(200).json({ 
          gradeId: grade._id,
          gradeNumber: grade.gradeNumber,
          gradeName: grade.gradeName,
          sectionId: section._id,
          sectionName: section.sectionName,
          classRoomName: section.classRoomName,
          classMonitorId: section.classMonitorId,
          classTeacherName: section.classTeacherId ? `${section.classTeacherId.firstName} ${section.classTeacherId.lastName || ''}`.trim() : "None"
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};
