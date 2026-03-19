// controllers/statsController.js
const { School } = require("../models/School");
const Student = require("../models/studentModel");
const Teacher = require("../models/teacherModel");

const getOverviewStats = async (req, res) => {
  try {
    const schoolCount = await School.countDocuments({ schoolId: req.schoolId });
    const studentCount = await Student.countDocuments({ schoolId: req.schoolId });
    const teacherCount = await Teacher.countDocuments({ schoolId: req.schoolId });

    res.status(200).json({
      totalSchools: schoolCount,
      totalStudents: studentCount,
      totalTeachers: teacherCount,
      // You can add more metrics here like "Active Schools", "Recent Enrollments", etc.
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getOverviewStats,
};
