// routes/teacherRoutes.js
const express = require("express");
const teacherController = require("../controllers/teacherController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, teacherController.getAllTeachers);

// IMPORTANT: put specific route before "/:id"
router.get("/name/:name", teacherController.getTeacherByName);

router.get("/:id", teacherController.getTeacherById);

router.post("/add", protect, teacherController.addTeacher);

router.put("/:id", protect, teacherController.updateTeacher);

router.delete("/:id", protect, teacherController.deleteTeacher);

// ─── One-time migration: backfill teacherId for existing teachers ─────────────
// POST /api/teachers/migrate-ids  (admin only, protected)
router.post("/migrate-ids", protect, async (req, res) => {
  try {
    const Teacher = require("../models/teacherModel");

    const generateTeacherId = () => {
      const year = String(new Date().getFullYear()).slice(-2);
      const rand = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
      return `T-${rand}${year}`;
    };

    const teachers = await Teacher.find({
      $or: [{ teacherId: { $exists: false } }, { teacherId: null }, { teacherId: "" }],
    }).lean();

    const usedSet = new Set();
    let updated = 0;

    for (const teacher of teachers) {
      let candidate, attempts = 0;
      do {
        candidate = generateTeacherId();
        const exists = await Teacher.findOne({ teacherId: candidate }).lean();
        if (!exists && !usedSet.has(candidate)) break;
        attempts++;
      } while (attempts < 20);

      usedSet.add(candidate);
      await Teacher.updateOne({ _id: teacher._id }, { $set: { teacherId: candidate } });
      updated++;
    }

    res.json({ message: `Migration complete. ${updated} teacher(s) updated.` });
  } catch (err) {
    res.status(500).json({ message: "Migration failed", error: err.message });
  }
});

module.exports = router;
