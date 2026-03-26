const express = require("express");
const router = express.Router();
const {
  createNotice,
  getNoticesBySection,
  deleteNotice,
  togglePinNotice,
} = require("../controllers/classroomNoticeController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createNotice);
router.get("/section/:sectionId", protect, getNoticesBySection);
router.delete("/:id", protect, deleteNotice);
router.patch("/:id/pin", protect, togglePinNotice);

module.exports = router;
