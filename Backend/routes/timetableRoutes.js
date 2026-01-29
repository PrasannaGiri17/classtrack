const express = require("express");
const router = express.Router();
const { getTimetable, updateTimetable, getTimetableOptions } = require("../controllers/timetableController");

router.get("/", getTimetable);
router.get("/options", getTimetableOptions);
router.post("/update", updateTimetable);

module.exports = router;
