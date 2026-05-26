const mongoose = require("mongoose");
const Student = require("./studentModel");
const { Grade } = require("./School");

const schoolNotificationSchema = new mongoose.Schema({
  schoolId:      { type: Number, required: true, index: true },
  title:         { type: String, required: true },
  message:       { type: String, required: true },
  sender:        { type: String, required: true },
  receiver:      { type: String, enum: ['student', 'teacher', 'admin', 'all', 'student-targeted'], default: 'all' },
  receiverId:    { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
  readBy:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // ── Targeted delivery fields ───────────────────────────────────────────────
  targetGrade:   { type: String, default: null },   // e.g. "5"
  targetSection: { type: String, default: null },   // e.g. "A"  |  "ALL"
  payload:       { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

/**
 * Static helper – fan out one notification to every student
 * in the specified grade (and optionally section).
 *
 * @param {object} opts
 *   schoolId, title, message, sender, targetGrade, targetSection,
 *   payload (optional extra data)
 */
schoolNotificationSchema.statics.sendTargeted = async function (opts) {
  const {
    schoolId,
    title,
    message,
    sender,
    targetGrade,
    targetSection,
    payload = null,
  } = opts;

  // ── Parse grade number from strings like "Grade 5", "G5", "5" ──────────────
  let gradeNumber;
  if (targetGrade) {
    const m = String(targetGrade).match(/(\d+)/);
    gradeNumber = m ? parseInt(m[1], 10) : null;
  }

  if (!gradeNumber) {
    console.warn("[SchoolNotification.sendTargeted] Could not parse gradeNumber from:", targetGrade);
    return;
  }

  // ── Resolve which section _ids to target ───────────────────────────────────
  const grade = await Grade.findOne({ schoolId, gradeNumber }).lean();
  if (!grade) {
    console.warn("[SchoolNotification.sendTargeted] Grade not found:", gradeNumber, "school:", schoolId);
    return;
  }

  let targetSectionIds = [];
  const sectionUpper = targetSection ? String(targetSection).toUpperCase() : "ALL";

  if (sectionUpper === "ALL") {
    targetSectionIds = grade.sections.map((s) => s._id);
  } else {
    const matched = grade.sections.filter(
      (s) => s.sectionName.toUpperCase() === sectionUpper
    );
    targetSectionIds = matched.map((s) => s._id);
  }

  if (!targetSectionIds.length) {
    console.warn("[SchoolNotification.sendTargeted] No sections matched for:", targetSection);
    return;
  }

  // ── Fetch all students in those sections ──────────────────────────────────
  const students = await Student.find({
    schoolId,
    studentClass: gradeNumber,
    sectionId: { $in: targetSectionIds },
  }).select("_id").lean();

  if (!students.length) {
    console.warn("[SchoolNotification.sendTargeted] No students found for grade/section.");
    return;
  }

  // ── Bulk-insert one notification per student ───────────────────────────────
  const docs = students.map((stu) => ({
    schoolId,
    title,
    message,
    sender,
    receiver: "student-targeted",
    receiverId: stu._id,
    targetGrade: String(gradeNumber),
    targetSection: sectionUpper,
    payload,
    readBy: [],
  }));

  await this.insertMany(docs);
  console.log(`[SchoolNotification] Dispatched ${docs.length} targeted notification(s) → Grade ${gradeNumber}-${sectionUpper}`);
};

module.exports = mongoose.model("SchoolNotification", schoolNotificationSchema);
