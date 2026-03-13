const express = require("express");
const router = express.Router();
const feeController = require("../controllers/feeController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// Debug: Unprotected routes
router.get("/admin-status", feeController.getAdminStatus);

// All other routes are protected
router.use(protect);

router.post("/generate/:studentId", feeController.generateFees);
router.post("/bulk-generate", feeController.bulkGenerateFees);
router.get("/student/:studentId", feeController.getStudentFees);
router.get("/summary/:studentId", feeController.getFeeSummary);
router.get("/my-fees", feeController.getMyFees);
router.post("/pay/:recordId", feeController.payFee);
router.post("/extra/:recordId", feeController.addExtraFee);
router.delete("/extra/:recordId/:itemId", feeController.deleteExtraFee);

module.exports = router;
