const express = require("express");
const gradeController = require("../controllers/gradeController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Apply protect middleware to all routes below
router.use(protect);

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
router.get("/section/:sectionId", gradeController.getSectionById);

module.exports = router;

