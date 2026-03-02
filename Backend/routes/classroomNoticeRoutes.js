const express = require("express");
const router = express.Router();
const {
  createNotice,
  getNoticesBySection,
  deleteNotice,
  togglePinNotice,
} = require("../controllers/classroomNoticeController");

router.post("/", createNotice);
router.get("/section/:sectionId", getNoticesBySection);
router.delete("/:id", deleteNotice);
router.patch("/:id/pin", togglePinNotice);

module.exports = router;
