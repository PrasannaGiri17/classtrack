const Timetable = require("../models/Timetable");
const Teacher = require("../models/teacherModel");

/**
 * Recalculates and updates the 'assignedClasses' field for a teacher
 * based on all their assignments in the Timetable collection.
 * 
 * @param {string} teacherId - The ID of the teacher to sync
 */
const syncTeacherAssignedClasses = async (teacherId) => {
  if (!teacherId) return;

  try {
    // 1. Find all timetables where this teacher is assigned at least once
    const timetables = await Timetable.find({
      "assignments.teacherId": teacherId
    });

    // 2. Extract unique "Grade Number-Section Name" strings
    const classSet = new Set();
    timetables.forEach(tt => {
      classSet.add(`Grade ${tt.gradeNumber}-${tt.sectionName}`);
    });

    // 3. Convert to a sorted comma-separated string
    const assignedClassesStr = Array.from(classSet).sort().join(", ");

    // 4. Update the teacher record
    await Teacher.findByIdAndUpdate(teacherId, {
      $set: { assignedClasses: assignedClassesStr || null }
    });

    console.log(`Synced assignedClasses for teacher ${teacherId}: ${assignedClassesStr}`);
  } catch (error) {
    console.error(`Error syncing assignedClasses for teacher ${teacherId}:`, error);
  }
};

module.exports = { syncTeacherAssignedClasses };
