const express = require("express");
const gradeController = require("../controllers/gradeController");

const router = express.Router();

// Get all grades
router.get("/", gradeController.getGrades);

// Update section count for a single grade
router.post("/update-sections", gradeController.updateGradeSections);

// Sync all sections
router.post("/sync-sections", gradeController.syncSections);

// Subject Management
router.post("/add-subject", gradeController.addSubjectToGrade);
router.post("/remove-subject", gradeController.removeSubjectFromGrade);
router.post("/add-subject-global", gradeController.addSubjectToAllGrades);
router.post("/remove-subject-global", gradeController.removeSubjectFromAllGrades);
router.post("/update-section-name", gradeController.updateSectionName);
router.post("/assign-class-teacher", gradeController.assignClassTeacher);
router.post("/assign-monitor", gradeController.assignClassMonitor);
router.post("/update-fee", gradeController.updateGradeFee);
router.get("/teacher/:teacherId", gradeController.getSectionByTeacher);

module.exports = router;
