const ClassroomAttendance = require("../models/ClassroomAttendance");
const Student = require("../models/studentModel");
const { Grade } = require("../models/School");
const mongoose = require("mongoose");


// Get attendance records for a specific section (or entire school), year, and month
const getAttendance = async (req, res) => {
  try {
    const { sectionId, month, teacherId: queryTeacherId } = req.query;
    const year = Number(req.query.year);
    const schoolId = Number(req.schoolId);
    // Prefer teacherId from query, then from request (if teacher is logged in)
    // For teachers, req.user.teacherId contains the reference to the Teacher profile
    const teacherId = queryTeacherId || (req.user?.role === 'teacher' ? req.user.teacherId : null);

    if (!year || !month) {
      return res.status(400).json({ message: "year and month are required." });
    }

    let attendance;
    const populateOptions = [
      { path: "gradeId", select: "gradeNumber gradeName sections" },
      { path: "attendanceData.studentId", select: "firstName lastName studentId profilePhoto" }
    ];

    if (sectionId) {
      attendance = await ClassroomAttendance.findOne({ schoolId, sectionId, year, month }).populate(populateOptions);
    } else if (teacherId) {
      // Find teacher-specific registry for that year/month
      attendance = await ClassroomAttendance.findOne({ schoolId, teacherId, year, month }).populate(populateOptions);
    } else {
      // School-wide aggregation for Admin
      const records = await ClassroomAttendance.find({ schoolId, year, month }).populate(populateOptions);

      if (!records || records.length === 0) {
        return res.status(200).json({ attendanceData: [] });
      }

      const mergedData = records.reduce((acc, current) => acc.concat(current.attendanceData || []), []);
      return res.status(200).json({ attendanceData: mergedData });
    }

    if (!attendance) {
      return res.status(200).json({ attendanceData: [] });
    }

    // Process section name and ensure dailyStatus Maps are plain objects
    const result = attendance.toObject({ virtuals: true });
    
    if (result.gradeId && result.sectionId) {
       const section = result.gradeId.sections?.find(s => s._id.toString() === result.sectionId.toString());
       result.sectionName = section?.sectionName;
       result.gradeNumber = result.gradeId.gradeNumber;
    }

    // Ensure Map types are converted to plain objects for JSON serialization
    if (result.attendanceData) {
      result.attendanceData = result.attendanceData.map(item => {
        if (item.dailyStatus instanceof Map) {
          item.dailyStatus = Object.fromEntries(item.dailyStatus);
        }
        return item;
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Save or Update attendance for a specific day or entire month
const saveAttendance = async (req, res) => {
  try {
    const { gradeId, sectionId, teacherId, year, month, attendanceData } = req.body;

    if (!sectionId || !year || !month || !teacherId || !req.schoolId) {
      return res.status(400).json({ message: "Missing required fields or session school ID.", error: "Check if grade/section information is valid." });
    }

    // Use findOneAndUpdate with upsert to safely save the array and avoid Mongoose Document Array cast/replace errors
    const attendance = await ClassroomAttendance.findOneAndUpdate(
      { sectionId, year, month },
      {
        $set: {
          schoolId: Number(req.schoolId),
          gradeId,
          sectionId,
          teacherId,
          year,
          month,
          attendanceData
        }
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ message: "Attendance saved successfully", attendance });


  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Single student attendance record (e.g., for student profile summary)
const getStudentMonthlyAttendance = async (req, res) => {
    try {
        const { studentId, year, month } = req.params;
        const attendance = await ClassroomAttendance.findOne({ 
            year, 
            month, 
            "attendanceData.studentId": studentId 
        });

        if (!attendance) {
            return res.status(404).json({ message: "No attendance found for this student for the given month." });
        }

        const studentData = attendance.attendanceData.find(a => a.studentId.toString() === studentId);
        res.status(200).json(studentData);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

const getStudentYearlyAttendance = async (req, res) => {
    try {
        const { studentId, year } = req.params;
        const schoolId = Number(req.schoolId);
        const numericYear = Number(year);
        const records = await ClassroomAttendance.find({ 
            schoolId,
            year: numericYear, 
            "attendanceData.studentId": studentId 
        });

        if (!records || records.length === 0) {
            return res.status(200).json({ 
                present: 0, 
                absent: 0, 
                rate: 0, 
                totalDays: 0 
            });
        }

        let totalPresent = 0;
        let totalAbsent = 0;
        let totalLeave = 0;

        records.forEach(monthRecord => {
            const studentData = monthRecord.attendanceData.find(a => a.studentId.toString() === studentId);
            if (studentData && studentData.dailyStatus) {
                // convert Map to object if it's a Map
                const dailyStatus = studentData.dailyStatus instanceof Map ? studentData.dailyStatus : new Map(Object.entries(studentData.dailyStatus));
                dailyStatus.forEach(status => {
                    if (status === 'P') totalPresent++;        // Present only
                    else if (status === 'A') totalAbsent++;   // Absent
                    else if (status === 'L') totalLeave++;    // Leave (school day, not present)
                    // 'H' = Holiday → excluded from school day count
                });
            }
        });

        // Total school days = P + A + L (excludes holidays)
        const totalDays = totalPresent + totalAbsent + totalLeave;
        const rate = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;

        res.status(200).json({
            present: totalPresent,
            absent: totalAbsent,
            leave: totalLeave,
            totalDays,
            rate
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getAvailableYears = async (req, res) => {
  try {
    const schoolId = Number(req.schoolId);
    if (!schoolId) {
      return res.status(400).json({ message: "School ID is required from session." });
    }

    const years = await ClassroomAttendance.distinct("year", { schoolId });
    // Filter out null/undefined and sort descending
    const sortedYears = (years || [])
      .filter(y => y != null)
      .sort((a, b) => b - a);

    res.status(200).json(sortedYears);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAttendance,
  saveAttendance,
  getStudentMonthlyAttendance,
  getStudentYearlyAttendance,
  getAvailableYears
};
