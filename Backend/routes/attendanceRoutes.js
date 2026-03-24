const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const { protect } = require("../middleware/authMiddleware");

// Get monthly attendance
router.get("/", protect, attendanceController.getAttendance);

// Save or Update monthly attendance
router.post("/save", protect, attendanceController.saveAttendance);

// Get specific student attendance for a month
router.get("/student/:studentId/:year/:month", protect, attendanceController.getStudentMonthlyAttendance);

// Get specific student attendance for a year summary
router.get("/student/:studentId/:year", protect, attendanceController.getStudentYearlyAttendance);

module.exports = router;
