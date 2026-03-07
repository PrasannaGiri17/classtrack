const ClassroomAttendance = require("../models/ClassroomAttendance");
const Student = require("../models/studentModel");
const { Grade } = require("../models/School");

// Get attendance records for a specific section, year, and month
const getAttendance = async (req, res) => {
  try {
    const { sectionId, year, month } = req.query;

    if (!sectionId || !year || !month) {
      return res.status(400).json({ message: "sectionId, year, and month are required." });
    }

    let attendance = await ClassroomAttendance.findOne({ sectionId, year, month }).populate("attendanceData.studentId", "firstName lastName studentId profilePhoto");

    if (!attendance) {
      // If no records exist yet, we might want to return an empty structure or handle it in the frontend
      return res.status(200).json({ attendanceData: [] });
    }

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Save or Update attendance for a specific day or entire month
const saveAttendance = async (req, res) => {
  try {
    const { schoolId, gradeId, sectionId, teacherId, year, month, attendanceData } = req.body;

    if (!sectionId || !year || !month || !teacherId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Find and update or create new
    let attendance = await ClassroomAttendance.findOne({ sectionId, year, month });

    if (attendance) {
      // Update existing record
      // We merge the incoming attendanceData with existing if necessary, or just replace
      // User might be saving just one day or whole month. Assuming whole screen state for now.
      attendance.attendanceData = attendanceData;
      await attendance.save();
    } else {
      // Create new record
      attendance = new ClassroomAttendance({
        schoolId: schoolId || 1,
        gradeId,
        sectionId,
        teacherId,
        year,
        month,
        attendanceData
      });
      await attendance.save();
    }

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
        const rate = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;

        res.status(200).json({
            present: totalPresent,
            absent: totalAbsent,
            totalDays,
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
