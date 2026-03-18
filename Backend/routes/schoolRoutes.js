const express = require("express");
const schoolController = require("../controllers/schoolController");

const router = express.Router();

// Get All Schools
router.get("/", schoolController.getAllSchools);

// Get Specific School
router.get("/:id", schoolController.getSchoolById);

// Add School
router.post("/add", schoolController.addSchool);

// Update School
router.put("/update/:id", schoolController.updateSchool);

module.exports = router;
