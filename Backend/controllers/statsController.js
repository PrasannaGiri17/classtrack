// controllers/statsController.js
const { School } = require("../models/School");
const Student = require("../models/studentModel");
const Teacher = require("../models/teacherModel");

const getOverviewStats = async (req, res) => {
  try {
    const filter = req.schoolId ? { schoolId: req.schoolId } : {};

    const schoolCount = await School.countDocuments({}); // Schools are global for SuperAdmin anyway
    const studentCount = await Student.countDocuments(filter);
    const teacherCount = await Teacher.countDocuments(filter);

    res.status(200).json({
      totalSchools: schoolCount,
      totalStudents: studentCount,
      totalTeachers: teacherCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getOverviewStats,
};

