// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");

// All admin profile routes should be protected
router.use(protect);

router.get("/", adminController.getAllAdmins);
router.post("/", adminController.addAdmin);
router.get("/:id", adminController.getAdminById);
router.put("/:id", adminController.updateAdmin);
router.delete("/:id", adminController.deleteAdmin);

module.exports = router;

