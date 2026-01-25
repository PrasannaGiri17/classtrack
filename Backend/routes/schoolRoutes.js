const express = require("express");
const schoolController = require("../controllers/schoolController");

const router = express.Router();

// Get School Info
router.get("/", schoolController.getSchool);

// Add School Info (Initial)
router.post("/add", schoolController.addSchool);

// Update School Info
router.put("/update", schoolController.updateSchool);

module.exports = router;
