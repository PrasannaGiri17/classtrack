const express = require("express");
const router = express.Router();
const routineController = require("../controllers/routineController");
const { protect } = require("../middleware/authMiddleware");

// All routes are protected
router.use(protect);

// Get Matrix (Hours + Routines)
router.get("/", routineController.getRoutineMatrix);

// Update Hours
router.post("/hours", routineController.updateOperatingHours);

// Update Grade Routine (Param: grade number)
router.post("/:gradeNumber", routineController.updateGradeRoutine);

module.exports = router;
