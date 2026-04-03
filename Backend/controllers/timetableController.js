const { Grade, Subject, School } = require("../models/School");
const Teacher = require("../models/teacherModel");
const Timetable = require("../models/Timetable");
const Routine = require("../models/Routine");
const { syncTeacherAssignedClasses } = require("../utils/teacherSync");

// Get Timetable for a specific grade and section
const getTimetable = async (req, res) => {
  try {
    const { gradeNumber, sectionName, weekday, gradeId, sectionId } = req.query;
    const activeSchoolId = req.schoolId; // From protect middleware

    const finalGradeNumber = gradeNumber || gradeId;
    const finalSectionName = sectionName || sectionId;

    if (!finalGradeNumber || !finalSectionName || !weekday) {
      return res.status(400).json({ message: "Grade, section, and weekday are required" });
    }

    const routine = await Routine.findOne({ schoolId: activeSchoolId, gradeNumber: finalGradeNumber });
    if (!routine) {
      return res.status(404).json({ message: `Routine for Grade ${finalGradeNumber} not found` });
    }

    const timetable = await Timetable.findOne({ schoolId: activeSchoolId, gradeNumber: finalGradeNumber, sectionName: finalSectionName, weekday })
      .populate("assignments.subjectId", "subjectName")
      .populate("assignments.teacherId", "firstName lastName");

    const assignmentsMap = {};
    if (timetable && timetable.assignments) {
      timetable.assignments.forEach(a => {
        assignmentsMap[a.slotId] = {
          subjectId: a.subjectId?._id || a.subjectId,
          teacherId: a.teacherId?._id || a.teacherId,
          subjectName: a.subjectId?.subjectName,
          teacherName: a.teacherId ? `${a.teacherId.firstName} ${a.teacherId.lastName}` : null,
          topic: a.topic || "Normal Class"
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

const updateTimetable = async (req, res) => {
  try {
    const { gradeNumber, sectionName, weekday, assignments } = req.body;
    const activeSchoolId = req.schoolId; // From protect middleware

    if (!gradeNumber || !sectionName || !weekday || !assignments) {
      return res.status(400).json({ message: "Grade, section, weekday, and assignments are required" });
    }

    const validWeekdays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    if (!validWeekdays.includes(weekday.toUpperCase())) {
      return res.status(400).json({ message: "Invalid weekday. Must be SUNDAY-FRIDAY" });
    }

    const school = await School.findById(activeSchoolId);
    const routine = await Routine.findOne({ schoolId: activeSchoolId, gradeNumber: gradeNumber.toString() });
    
    if (!routine || !school) {
        return res.status(400).json({ message: "Routine framework or school settings missing" });
    }

    const schoolStart = school.operatingHours?.start || "09:00";
    let [h, m] = schoolStart.split(':').map(Number);
    let currentMins = h * 60 + m;
    
    const currentWindows = routine.slots.map(slot => {
        const start = currentMins;
        const end = currentMins + slot.durationMinutes;
        currentMins = end;
        return { id: slot.id, start, end, label: slot.label };
    });

    const otherTimetables = await Timetable.find({ 
        schoolId: activeSchoolId, 
        weekday: weekday.toUpperCase(),
        $or: [
            { gradeNumber: { $ne: gradeNumber.toString() } },
            { sectionName: { $ne: sectionName } }
        ]
    }).populate('assignments.teacherId', 'firstName lastName');

    const otherRoutines = await Routine.find({ schoolId: activeSchoolId });
    const routineMap = {};
    otherRoutines.forEach(r => routineMap[r.gradeNumber] = r);

    for (const [slotId, data] of Object.entries(assignments)) {
        if (!data || !data.teacherId) continue;
        
        const myWindow = currentWindows.find(w => w.id === slotId);
        if (!myWindow) continue;

        for (const tt of otherTimetables) {
            const ttRoutine = routineMap[tt.gradeNumber];
            if (!ttRoutine) continue;

            let [ttH, ttM] = schoolStart.split(':').map(Number);
            let ttCurrent = ttH * 60 + ttM;
            const ttWindows = {};
            ttRoutine.slots.forEach(s => {
                ttWindows[s.id] = { start: ttCurrent, end: ttCurrent + s.durationMinutes };
                ttCurrent += s.durationMinutes;
            });

            for (const a of tt.assignments) {
                if (a.teacherId && a.teacherId._id.toString() === data.teacherId.toString()) {
                    const otherWin = ttWindows[a.slotId];
                    if (otherWin) {
                        if (myWindow.start < otherWin.end && myWindow.end > otherWin.start) {
                            return res.status(409).json({ 
                                message: `Teacher Conflict: This teacher is already assigned to Grade ${tt.gradeNumber} Section ${tt.sectionName} during part of this time window (${myWindow.label}).` 
                            });
                        }
                    }
                }
            }
        }
    }

    const assignmentsArray = Object.entries(assignments)
      .map(([slotId, data]) => {
        if (!data) return null;
        
        const subjectId = (data.subjectId && data.subjectId !== '') ? data.subjectId : null;
        const teacherId = (data.teacherId && data.teacherId !== '') ? data.teacherId : null;
        
        return {
          slotId,
          subjectId,
          teacherId
        };
      })
      .filter(a => a && (a.subjectId || a.teacherId));

    const normalizedGradeNumber = gradeNumber.toString();

    // Get old teachers before update to sync them as well (in case they are removed)
    const existingTT = await Timetable.findOne({ 
      schoolId: activeSchoolId, 
      gradeNumber: normalizedGradeNumber, 
      sectionName, 
      weekday: weekday.toUpperCase() 
    });
    const oldTeacherIds = existingTT ? existingTT.assignments.map(a => a.teacherId?.toString()).filter(id => id) : [];

    const updatedTimetable = await Timetable.findOneAndUpdate(
      { schoolId: activeSchoolId, gradeNumber: normalizedGradeNumber, sectionName, weekday: weekday.toUpperCase() },
      { 
        $set: { 
          assignments: assignmentsArray,
          updatedAt: new Date() 
        } 
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Sync all teachers involved (both new and potentially removed)
    const newTeacherIds = assignmentsArray.map(a => a.teacherId?.toString()).filter(id => id);
    const teachersToSync = [...new Set([...oldTeacherIds, ...newTeacherIds])];
    
    // We don't want to wait for syncing (can be background), but we want it to happen
    Promise.all(teachersToSync.map(id => syncTeacherAssignedClasses(id))).catch(err => {
      console.error("Error in batch syncTeacherAssignedClasses:", err);
    });

    res.status(200).json({ message: "Timetable updated successfully", timetable: updatedTimetable });

  } catch (error) {
    console.error("UPDATE TIMETABLE ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTimetableOptions = async (req, res) => {
    try {
      const { gradeNumber, weekday, sectionName } = req.query;
      const activeSchoolId = req.schoolId; // From protect middleware
  
      const grade = await Grade.findOne({ schoolId: activeSchoolId, gradeNumber }).populate('subjects.subjectId');
      if (!grade) return res.status(404).json({ message: "Grade not found" });
  
      const subjects = grade.subjects.map(s => s.subjectId);
  
      const teachers = await Teacher.find({ schoolId: activeSchoolId })
          .select('firstName lastName primarySubject secondarySubject assignedGrades assignedClasses')
          .populate('primarySubject', 'subjectName')
          .populate('secondarySubject', 'subjectName')
          .populate('assignedGrades', 'gradeNumber');
  
      const school = await School.findById(activeSchoolId);
      const myRoutine = await Routine.findOne({ schoolId: activeSchoolId, gradeNumber: gradeNumber.toString() });
      
      if (!school || !myRoutine) {
          return res.status(200).json({ subjects, teachers, busyTeachers: {} });
      }

      const schoolStart = school.operatingHours?.start || "09:00";
      
      let [h, m] = schoolStart.split(':').map(Number);
      let currentMins = h * 60 + m;
      const myWindows = myRoutine.slots.map(slot => {
          const win = { id: slot.id, start: currentMins, end: currentMins + slot.durationMinutes };
          currentMins += slot.durationMinutes;
          return win;
      });

      const allTimetables = await Timetable.find({ 
          schoolId: activeSchoolId, 
          weekday: (weekday || 'SUNDAY').toUpperCase(),
          $or: [
              { gradeNumber: { $ne: gradeNumber.toString() } },
              { sectionName: { $ne: sectionName } }
          ]
      }).populate('assignments.teacherId', 'firstName lastName');

      const otherRoutines = await Routine.find({ schoolId: activeSchoolId });
      const routineMap = {};
      otherRoutines.forEach(r => routineMap[r.gradeNumber] = r);

      const busyTeachers = {};
      
      myWindows.forEach(myWin => {
          busyTeachers[myWin.id] = [];
          
          allTimetables.forEach(tt => {
              const ttRoutine = routineMap[tt.gradeNumber];
              if (!ttRoutine) return;

              let [ttH, ttM] = schoolStart.split(':').map(Number);
              let ttCurrent = ttH * 60 + ttM;
              const ttWindows = {};
              ttRoutine.slots.forEach(s => {
                  ttWindows[s.id] = { start: ttCurrent, end: ttCurrent + s.durationMinutes };
                  ttCurrent += s.durationMinutes;
              });

              tt.assignments.forEach(a => {
                  if (a.teacherId) {
                      const otherWin = ttWindows[a.slotId];
                      if (otherWin) {
                          if (myWin.start < otherWin.end && myWin.end > otherWin.start) {
                              busyTeachers[myWin.id].push({
                                  teacherId: a.teacherId._id,
                                  teacherName: `${a.teacherId.firstName} ${a.teacherId.lastName}`,
                                  gradeNumber: tt.gradeNumber,
                                  sectionName: tt.sectionName
                              });
                          }
                      }
                  }
              });
          });
      });
  
      res.status(200).json({ subjects, teachers, busyTeachers });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };

const getTeacherRoutine = async (req, res) => {
  try {
    const { teacherId } = req.params;
    if (!teacherId) return res.status(400).json({ message: "Teacher ID is required" });
    
    // Find teacher to get their schoolId
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    
    const activeSchoolId = teacher.schoolId || 1;

    const school = await School.findById(activeSchoolId);
    const timetables = await Timetable.find({ schoolId: activeSchoolId })
      .populate("assignments.subjectId", "subjectName");

    const routines = await Routine.find({ schoolId: activeSchoolId });
    const routineMap = {};
    routines.forEach(r => routineMap[r.gradeNumber] = r);

    const { start: schoolStartRaw = "09:00" } = school.operatingHours || {};
    
    const result = {
      "Sunday": [],
      "Monday": [],
      "Tuesday": [],
      "Wednesday": [],
      "Thursday": [],
      "Friday": []
    };

    timetables.forEach(tt => {
      const routine = routineMap[tt.gradeNumber];
      if (!routine) return;

      let [h, m] = schoolStartRaw.split(':').map(Number);
      let currentMins = h * 60 + m;
      const windows = {};
      routine.slots.forEach(slot => {
        const start = currentMins;
        const end = currentMins + slot.durationMinutes;
        
        const formatTime = (totalMins) => {
            const hrs = Math.floor(totalMins / 60);
            const mins = totalMins % 60;
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        };

        windows[slot.id] = {
           time: `${formatTime(start)} - ${formatTime(end)}`,
           start, 
           end 
        };
        currentMins = end;
      });

      tt.assignments.forEach(a => {
        if (a.teacherId && a.teacherId.toString() === teacherId) {
          const win = windows[a.slotId];
          const dayName = tt.weekday.charAt(0).toUpperCase() + tt.weekday.slice(1).toLowerCase();
          
          if (win && result[dayName]) {
             result[dayName].push({
               periodId: `${tt.weekday}-${tt.gradeNumber}-${tt.sectionName}-${a.slotId}`,
               time: win.time,
               subject: a.subjectId?.subjectName || "Unknown",
               lesson: a.topic || "Normal Class",
               grade: `Grade ${tt.gradeNumber}`,
               section: `Section ${tt.sectionName}`,
               hasClass: true,
               rawIds: {
                  gradeNumber: tt.gradeNumber,
                  sectionName: tt.sectionName,
                  weekday: tt.weekday,
                  slotId: a.slotId
               },
               startMins: win.start
             });
          }
        }
      });
    });

    Object.keys(result).forEach(day => {
      result[day].sort((a, b) => a.startMins - b.startMins);
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("GET TEACHER ROUTINE ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateTeacherTopic = async (req, res) => {
  try {
    const { gradeNumber, sectionName, weekday, slotId, topic } = req.body;
    const { teacherId } = req.params;

    console.log("UPDATE TOPIC DEBUG:", { gradeNumber, sectionName, weekday, slotId, teacherId, topic });

    if (!gradeNumber || !sectionName || !weekday || !slotId) {
      console.warn("DEBUG: MISSING PARAMS", { gradeNumber, sectionName, weekday, slotId });
      return res.status(400).json({ message: "Incomplete request parameters." });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    const activeSchoolId = teacher.schoolId || 1;

    const timetable = await Timetable.findOne({
      schoolId: activeSchoolId,
      gradeNumber: gradeNumber.toString(),
      sectionName,
      weekday: weekday.toUpperCase()
    });

    if (!timetable) {
      console.warn("DEBUG: TIMETABLE NOT FOUND", { gradeNumber, sectionName, weekday });
      return res.status(404).json({ message: "Timetable not found." });
    }

    console.log("DEBUG: TIMETABLE FOUND, ASSIGNMENTS COUNT:", timetable.assignments.length);

    const assignment = timetable.assignments.find(a => 
      a.slotId === slotId && a.teacherId && a.teacherId.toString() === teacherId
    );

    if (!assignment) {
      console.warn("DEBUG: ASSIGNMENT NOT FOUND FOR TEACHER", { slotId, teacherId });
      return res.status(403).json({ message: "You are not assigned to this class." });
    }

    assignment.topic = topic || "Normal Class";
    await timetable.save();
    console.log("DEBUG: TOPIC UPDATED SUCCESSFULLY");

    res.status(200).json({ message: "Topic updated successfully.", topic: assignment.topic });
  } catch (error) {
    console.error("UPDATE TOPIC ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Clear all teacher assignments for every timetable in the school
const clearAllTeachers = async (req, res) => {
  try {
    const activeSchoolId = req.schoolId; // From protect middleware
    if (!activeSchoolId) return res.status(400).json({ message: 'schoolId required from token' });

    // Find all timetables and null out every teacherId
    const result = await Timetable.updateMany(
      { schoolId: activeSchoolId },
      { $set: { 'assignments.$[].teacherId': null } }
    );

    res.status(200).json({
      message: `All teacher assignments cleared for school ${activeSchoolId}.`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('CLEAR ALL TEACHERS ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getSectionTeachersFromTimetable = async (req, res) => {
  try {
    const { gradeNumber, sectionName, gradeId, sectionId } = req.query;
    const activeSchoolId = req.schoolId;

    const finalGradeNumber = gradeNumber || gradeId;
    const finalSectionName = sectionName || sectionId;

    if (!finalGradeNumber || !finalSectionName) {
      return res.status(400).json({ message: "Grade and section are required" });
    }

    // Find all timetables for this section (across all weekdays)
    const timetables = await Timetable.find({
      schoolId: activeSchoolId,
      gradeNumber: finalGradeNumber,
      sectionName: finalSectionName
    }).populate({
      path: "assignments.teacherId",
      select: "firstName lastName email profilePhoto primarySubject",
      populate: {
        path: "primarySubject",
        select: "subjectName"
      }
    });

    // Extract unique teachers
    const uniqueTeachersMap = new Map();
    timetables.forEach(tt => {
      tt.assignments.forEach(a => {
        if (a.teacherId && !uniqueTeachersMap.has(a.teacherId._id.toString())) {
          uniqueTeachersMap.set(a.teacherId._id.toString(), a.teacherId);
        }
      });
    });

    const teachers = Array.from(uniqueTeachersMap.values());
    res.status(200).json(teachers);

  } catch (error) {
    console.error("GET SECTION TEACHERS ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getTimetable,
  updateTimetable,
  getTimetableOptions,
  getTeacherRoutine,
  updateTeacherTopic,
  clearAllTeachers,
  getSectionTeachersFromTimetable
};
