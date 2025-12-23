// routes/studentRoutes.js
const express = require("express");
const studentController = require("../controllers/studentController");

const router = express.Router();

router.get("/", studentController.getAllStudents);

// IMPORTANT: put specific route before "/:id"
router.get("/name/:name", studentController.getStudentByName);

router.get("/:id", studentController.getStudentById);

router.post("/add", studentController.addStudent);

router.put("/:id", studentController.updateStudent);

router.delete("/:id", studentController.deleteStudent);

module.exports = router;
