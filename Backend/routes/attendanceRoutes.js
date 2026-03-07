const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");

// Get monthly attendance
router.get("/", attendanceController.getAttendance);

// Save or Update monthly attendance
router.post("/save", attendanceController.saveAttendance);

// Get specific student attendance for a month
router.get("/student/:studentId/:year/:month", attendanceController.getStudentMonthlyAttendance);

// Get specific student attendance for a year summary
router.get("/student/:studentId/:year", attendanceController.getStudentYearlyAttendance);

module.exports = router;
