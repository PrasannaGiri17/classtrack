const express = require("express");
const router = express.Router();
const { getTimetable, updateTimetable, getTimetableOptions, getTeacherRoutine, updateTeacherTopic, clearAllTeachers, getSectionTeachersFromTimetable } = require("../controllers/timetableController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getTimetable);
router.get("/options", getTimetableOptions);
router.get("/teacher/:teacherId", getTeacherRoutine);
router.get("/section-teachers", getSectionTeachersFromTimetable);
router.post("/teacher/:teacherId/topic", updateTeacherTopic);
router.post("/update", updateTimetable);
router.delete("/clear-all-teachers", clearAllTeachers);

module.exports = router;
