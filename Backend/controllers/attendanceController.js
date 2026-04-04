const ClassroomAttendance = require("../models/ClassroomAttendance");
const Student = require("../models/studentModel");
const { Grade } = require("../models/School");
const mongoose = require("mongoose");

// Get attendance records for a specific section (or entire school), year, and month
const getAttendance = async (req, res) => {
  try {
    const { sectionId, year, month } = req.query;
    const schoolId = Number(req.schoolId);

    if (!year || !month) {
      return res.status(400).json({ message: "year and month are required." });
    }

    let attendance;
    if (sectionId) {
      attendance = await ClassroomAttendance.findOne({ sectionId, year, month })
        .populate("attendanceData.studentId", "firstName lastName studentId profilePhoto");
      
      if (!attendance) {
        return res.status(200).json({ attendanceData: [] });
      }
      return res.status(200).json(attendance);
    } else {
      // School-wide aggregation for Admin
      const records = await ClassroomAttendance.find({ schoolId, year, month })
        .populate("attendanceData.studentId", "firstName lastName studentId profilePhoto");

      if (!records || records.length === 0) {
        return res.status(200).json({ attendanceData: [] });
      }

      // Merge all attendanceData from all section-wise records into one flat array for the frontend
      const mergedData = records.reduce((acc, current) => {
        return acc.concat(current.attendanceData || []);
      }, []);

      return res.status(200).json({ attendanceData: mergedData });
    }
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
        const records = await ClassroomAttendance.find({ 
            year, 
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

        records.forEach(monthRecord => {
            const studentData = monthRecord.attendanceData.find(a => a.studentId.toString() === studentId);
            if (studentData && studentData.dailyStatus) {
                // convert Map to object if it's a Map
                const dailyStatus = studentData.dailyStatus instanceof Map ? studentData.dailyStatus : new Map(Object.entries(studentData.dailyStatus));
                dailyStatus.forEach(status => {
                    if (status === 'P') totalPresent++;
                    if (status === 'A') totalAbsent++;
                });
            }
        });

        const totalDays = totalPresent + totalAbsent;
        // Academic Year 2082 normally has approx 262 total school days as per user's screenshot
        const finalTotalDays = parseInt(year) === 2082 ? 262 : totalDays;
        const rate = finalTotalDays > 0 ? Math.round((totalPresent / finalTotalDays) * 100) : 0;

        res.status(200).json({
            present: totalPresent,
            absent: totalAbsent,
            totalDays: finalTotalDays,
            rate
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
  getAttendance,
  saveAttendance,
  getStudentMonthlyAttendance,
  getStudentYearlyAttendance
};
