const Timetable = require("../models/Timetable");
const Routine = require("../models/Routine");
const { Grade, Subject } = require("../models/School");
const Teacher = require("../models/teacherModel");

// Get Timetable for a specific grade and section
const getTimetable = async (req, res) => {
  try {
    const { gradeNumber, sectionName } = req.query;

    if (!gradeNumber || !sectionName) {
      return res.status(400).json({ message: "Grade number and section name are required" });
    }

    // 1. Get Routine structure (slots)
    const routine = await Routine.findOne({ schoolId: 1, gradeNumber });
    if (!routine) {
      return res.status(404).json({ message: `Routine for Grade ${gradeNumber} not found` });
    }

    // 2. Get Timetable assignments
    const timetable = await Timetable.findOne({ schoolId: 1, gradeNumber, sectionName })
      .populate("assignments.subjectId", "subjectName")
      .populate("assignments.teacherId", "firstName lastName");

    // 3. Transform assignments into a map for easier frontend consumption
    const assignmentsMap = {};
    if (timetable && timetable.assignments) {
      timetable.assignments.forEach(a => {
        assignmentsMap[a.slotId] = {
          subjectId: a.subjectId?._id || a.subjectId,
          teacherId: a.teacherId?._id || a.teacherId,
          subjectName: a.subjectId?.subjectName,
          teacherName: a.teacherId ? `${a.teacherId.firstName} ${a.teacherId.lastName}` : null
        };
      });
    }

    res.status(200).json({
      slots: routine.slots,
      isLocked: routine.isLocked,
      assignments: assignmentsMap
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Timetable assignments
const updateTimetable = async (req, res) => {
  try {
    const { gradeNumber, sectionName, assignments } = req.body;

    if (!gradeNumber || !sectionName || !assignments) {
      return res.status(400).json({ message: "Grade, section, and assignments are required" });
    }

    // Transform assignments object/map back to array for storage
    const assignmentsArray = Object.entries(assignments).map(([slotId, data]) => ({
      slotId,
      subjectId: data.subjectId || null,
      teacherId: data.teacherId || null
    })).filter(a => a.subjectId || a.teacherId); // Only store non-empty assignments

    const updatedTimetable = await Timetable.findOneAndUpdate(
      { schoolId: 1, gradeNumber, sectionName },
      { 
        $set: { 
          assignments: assignmentsArray,
          updatedAt: new Date() 
        } 
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Timetable updated successfully", timetable: updatedTimetable });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper: Get subjects and teachers for lookups
const getTimetableOptions = async (req, res) => {
  try {
    const { gradeNumber } = req.query;
    const schoolId = 1;

    // 1. Get Grade and its subjects
    const grade = await Grade.findOne({ schoolId, gradeNumber }).populate('subjects.subjectId');
    if (!grade) return res.status(404).json({ message: "Grade not found" });

    const subjects = grade.subjects.map(s => s.subjectId);

    // 2. Get Teachers (we might want to filter by subject later in frontend, but send all for now or optimize)
    const teachers = await Teacher.find({ schoolId })
        .select('firstName lastName primarySubject secondarySubject assignedGrades')
        .populate('primarySubject', 'subjectName')
        .populate('secondarySubject', 'subjectName');

    // 3. Get all timetables for this school to check for conflicts
    const allTimetables = await Timetable.find({ schoolId })
        .populate('assignments.teacherId', 'firstName lastName');

    const busyTeachers = {};
    allTimetables.forEach(tt => {
      // Skip the current grade/section if we're filtering by it (though usually we fetch options for a grade)
      // but busyTeachers should include everyone else
      tt.assignments.forEach(a => {
        if (a.teacherId) {
          const slotId = a.slotId;
          if (!busyTeachers[slotId]) busyTeachers[slotId] = [];
          busyTeachers[slotId].push({
            teacherId: a.teacherId._id,
            teacherName: `${a.teacherId.firstName} ${a.teacherId.lastName}`,
            gradeNumber: tt.gradeNumber,
            sectionName: tt.sectionName
          });
        }
      });
    });

    res.status(200).json({ subjects, teachers, busyTeachers });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getTimetable,
  updateTimetable,
  getTimetableOptions
};
