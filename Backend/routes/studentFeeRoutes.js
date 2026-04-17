const express = require("express");
const router = express.Router();
const studentFeeController = require("../controllers/studentFeeController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// PROTECT ALL ROUTES
router.use(protect);

// ---------------------------
// ADMIN ROUTES (Marking paid, adding extra, generating fees)
// ---------------------------

// Generate fees for a student
router.post(
  "/generate",
  restrictTo("admin"),
  studentFeeController.generateYearlyFees
);
router.post(
  "/admin/bulk-generate",
  restrictTo("admin"),
  studentFeeController.bulkGenerateFees
);

router.post(
    "/admin/sync/:studentId",
    restrictTo("admin"),
    studentFeeController.syncSingleStudentLedger
);

// All fees status (listing for admin)
router.get(
  "/admin/status",
  restrictTo("admin"),
  studentFeeController.getAllStudentsFeeStatus
);

// Get specific fee record details
router.get(
  "/detail/:id",
  restrictTo("admin", "student"),
  studentFeeController.getFeeById
);

// Mark as paid
router.patch(
  "/pay/:id",
  restrictTo("admin", "student"),
  studentFeeController.markAsPaid
);

// Update/Add extra fees
router.post(
  "/extra/:id",
  restrictTo("admin"),
  studentFeeController.addExtraFee
);

router.put(
  "/extra/:id/:itemId",
  restrictTo("admin"),
  studentFeeController.updateExtraFee
);

router.delete(
  "/extra/:id/:itemId",
  restrictTo("admin"),
  studentFeeController.deleteExtraFee
);

// ---------------------------
// STUDENT / COMMON ROUTES
// ---------------------------

// Logged in student's own fees
router.get(
  "/my-fees",
  restrictTo("student"),
  studentFeeController.getMyFees
);

// Get all fees for a student (admin needs studentId in params)
router.get(
  "/student/:studentId",
  restrictTo("admin", "student"),
  studentFeeController.getStudentFees
);

// Student fee summary
router.get(
  "/summary/:studentId",
  restrictTo("admin", "student"),
  studentFeeController.getStudentFeeSummary
);

module.exports = router;
