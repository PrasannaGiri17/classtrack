const express = require("express");
const schoolController = require("../controllers/schoolController");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Multer Config for KYC Upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/kyc');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Get All Schools
router.get("/", schoolController.getAllSchools);

// Get Specific School
router.get("/:id", schoolController.getSchoolById);

// Add School (with KYC upload)
router.post("/add", upload.single('kycDocument'), schoolController.addSchool);

// Update School (with KYC upload)
router.put("/update/:id", upload.single('kycDocument'), schoolController.updateSchool);

// Delete School
router.delete("/delete/:id", schoolController.deleteSchool);

module.exports = router;
