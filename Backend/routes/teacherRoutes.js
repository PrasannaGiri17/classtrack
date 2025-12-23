// routes/teacherRoutes.js
const express = require("express");
const teacherController = require("../controllers/teacherController");

const router = express.Router();

router.get("/", teacherController.getAllTeachers);

// IMPORTANT: put specific route before "/:id"
router.get("/name/:name", teacherController.getTeacherByName);

router.get("/:id", teacherController.getTeacherById);

router.post("/add", teacherController.addTeacher);

router.put("/:id", teacherController.updateTeacher);

router.delete("/:id", teacherController.deleteTeacher);

module.exports = router;
