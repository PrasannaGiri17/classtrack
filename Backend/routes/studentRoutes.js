// routes/studentRoutes.js
const express = require("express");
const studentController = require("../controllers/studentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", studentController.getAllStudents);
router.get("/name/:name", studentController.getStudentByName);
router.get("/:id", studentController.getStudentById);
router.post("/add", studentController.addStudent);
router.put("/:id", studentController.updateStudent);
router.post("/bulk-enrollment", studentController.updateSectionEnrollment);
router.post("/remove-from-section", studentController.removeStudentFromSection);
router.delete("/:id", studentController.deleteStudent);

module.exports = router;

