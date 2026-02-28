const express = require("express");
const router = express.Router();
const { getTimetable, updateTimetable, getTimetableOptions, getTeacherRoutine, updateTeacherTopic } = require("../controllers/timetableController");

router.get("/", getTimetable);
router.get("/options", getTimetableOptions);
router.get("/teacher/:teacherId", getTeacherRoutine);
router.post("/teacher/:teacherId/topic", updateTeacherTopic);
router.post("/update", updateTimetable);

module.exports = router;
