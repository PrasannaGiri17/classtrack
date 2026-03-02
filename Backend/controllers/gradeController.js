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
    // 1. Fetch current school span
    const school = await School.findOne({ _id: 1 });
    if (!school) {
      return res.status(404).json({ message: "School config not found" });
    }

    const { start, end } = school.gradeSpan;

    // 2. Filter grades based on span
    const grades = await Grade.find({
      schoolId: 1,
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
    const { gradeNumber, sectionCount } = req.body;

    // Check if grade exists
    let grade = await Grade.findOne({ schoolId: 1, gradeNumber });

    if (grade) {
      // Update existing grade
      const currentSections = grade.sections || [];
      const newCount = parseInt(sectionCount);

      if (newCount > currentSections.length) {
        // Add new sections
        const addedCount = newCount - currentSections.length;
        const startCharCode = 65 + currentSections.length;
        for (let i = 0; i < addedCount; i++) {
          currentSections.push({
            sectionName: String.fromCharCode(startCharCode + i),
            capacity: 40,
            isActive: true
          });
        }
      } else if (newCount < currentSections.length) {
        // Remove sections from the end
        grade.sections = currentSections.slice(0, newCount);
      }

      // Save
      await grade.save();
      res.status(200).json(grade);
    } else {
      // Create new grade
      const newGrade = new Grade({
        schoolId: 1,
        gradeNumber,
        gradeName: `Grade ${gradeNumber}`,
        sections: generateSections(sectionCount),
        displayOrder: gradeNumber
      });
      await newGrade.save();
      res.status(201).json(newGrade);
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Sync all sections
const syncSections = async (req, res) => {
  try {
    const { sectionCount, gradeList } = req.body; // gradeList is expected to be ["1", "2", ... "10"]
    const count = parseInt(sectionCount);

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
      let grade = await Grade.findOne({ schoolId: 1, gradeNumber });
      let newSections = [];

      if (grade) {
        newSections = [...grade.sections];
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
        { schoolId: 1, gradeNumber },
        {
          $set: {
            schoolId: 1,
            gradeNumber,
            gradeName: `Grade ${gradeNumber}`,
            sections: newSections,
            displayOrder: gradeNumber,
            isActive: true
          }
        },
        { upsert: true, new: true }
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
    const { gradeNumber, subjectName, type } = req.body; // type: 'core' or 'elective'

    // 1. Find or Create Subject
    let subject = await Subject.findOne({ schoolId: 1, subjectName: new RegExp(`^${subjectName}$`, 'i') });
    if (!subject) {
      subject = new Subject({
        schoolId: 1,
        subjectName,
        subjectType: type || 'core',
        subjectCode: subjectName.substring(0, 3).toUpperCase() // Simple code gen
      });
      await subject.save();
    }

    // 2. Add to Grade
    const grade = await Grade.findOne({ schoolId: 1, gradeNumber });
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
    const { gradeNumber, subjectName } = req.body;

    // Find Subject ID first
    const subject = await Subject.findOne({ schoolId: 1, subjectName: new RegExp(`^${subjectName}$`, 'i') });
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const grade = await Grade.findOne({ schoolId: 1, gradeNumber });
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
    const { subjectName, type } = req.body; // type usually 'core'

    // 1. Find or Create Subject
    let subject = await Subject.findOne({ schoolId: 1, subjectName: new RegExp(`^${subjectName}$`, 'i') });
    if (!subject) {
      subject = new Subject({
        schoolId: 1,
        subjectName,
        subjectType: type || 'core',
        subjectCode: subjectName.substring(0, 3).toUpperCase()
      });
      await subject.save();
    }

    // 2. Add to ALL Grades
    const grades = await Grade.find({ schoolId: 1 });
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
    const { subjectName } = req.body;

    const subject = await Subject.findOne({ schoolId: 1, subjectName: new RegExp(`^${subjectName}$`, 'i') });
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Update all grades
    await Grade.updateMany(
      { schoolId: 1 },
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
    const { gradeNumber, sectionName, classRoomName } = req.body;

    const grade = await Grade.findOne({ schoolId: 1, gradeNumber });
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
    const { gradeNumber, sectionName, teacherId } = req.body;

    const grade = await Grade.findOne({ schoolId: 1, gradeNumber });
    if (!grade) return res.status(404).json({ message: "Grade not found" });

    const section = grade.sections.find(s => s.sectionName === sectionName);
    if (!section) return res.status(404).json({ message: "Section not found" });

    const oldTeacherId = section.classTeacherId;
    section.classTeacherId = teacherId || null;
    await grade.save();

    const classRoomInfo = `Grade ${gradeNumber}-${sectionName}`;

    // 1. If there was a previous teacher, clear their fields
    if (oldTeacherId && oldTeacherId.toString() !== teacherId) {
      await Teacher.findByIdAndUpdate(oldTeacherId, {
        $set: { classTeacher: null }
      });
      // Sync their assignedClasses just in case, though it's mainly from timetable
      await syncTeacherAssignedClasses(oldTeacherId);
    }

    // 2. Update the new teacher's fields
    if (teacherId) {
      await Teacher.findByIdAndUpdate(teacherId, {
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
    const { gradeNumber, monthlyFee } = req.body;

    const grade = await Grade.findOneAndUpdate(
      { schoolId: 1, gradeNumber },
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
  getSectionByTeacher
};
