// controllers/teacherController.js
const Teacher = require("../models/teacherModel");
const User = require("../models/UserModal");
const { Grade, Subject } = require("../models/School");
const Timetable = require("../models/Timetable");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// temp password (8 chars)
const generateTempPassword = () => crypto.randomBytes(4).toString("hex");

// Helper to resolve Subject names and Grade numbers to ObjectIds
const resolveTeacherRelations = async (schoolId, data) => {
  const { primarySubject, secondarySubject, assignedGrades } = data;
  let primarySubId = undefined;
  let secondarySubId = undefined;
  let resolvedGradeIds = undefined;

  if (primarySubject !== undefined) {
    if (primarySubject) {
      const sub = await Subject.findOne({ schoolId, subjectName: new RegExp(`^${primarySubject}$`, "i") });
      primarySubId = sub ? sub._id : null;
    } else {
      primarySubId = null;
    }
  }

  if (secondarySubject !== undefined) {
    if (secondarySubject) {
      const sub = await Subject.findOne({ schoolId, subjectName: new RegExp(`^${secondarySubject}$`, "i") });
      secondarySubId = sub ? sub._id : null;
    } else {
      secondarySubId = null;
    }
  }

  if (assignedGrades !== undefined) {
    resolvedGradeIds = [];
    if (Array.isArray(assignedGrades) && assignedGrades.length > 0) {
      for (const gNum of assignedGrades) {
        const grade = await Grade.findOne({ schoolId, gradeNumber: Number(gNum) });
        if (grade) resolvedGradeIds.push(grade._id);
      }
    }
  }

  return { primarySubId, secondarySubId, resolvedGradeIds };
};

// Helper: compute assigned classes from timetable and persist to teacher
const syncAssignedClasses = async (schoolId, teacherId) => {
  try {
    // Find all timetable entries where this teacher is assigned to at least one slot
    const entries = await Timetable.find({ schoolId, "assignments.teacherId": teacherId });
    const uniqueClasses = new Set();
    entries.forEach(entry => {
      const hasTeacher = entry.assignments.some(
        a => a.teacherId && a.teacherId.toString() === teacherId.toString()
      );
      if (hasTeacher) {
        uniqueClasses.add(`Grade ${entry.gradeNumber}-${entry.sectionName}`);
      }
    });
    const classList = Array.from(uniqueClasses).sort();
    // Save back to teacher document
    await Teacher.findOneAndUpdate({ _id: teacherId, schoolId }, { assignedClasses: classList });
    return classList;
  } catch (err) {
    console.error("Sync error:", err);
    return [];
  }
};

const getAllTeachers = async (req, res) => {
  try {
    const schoolId = req.schoolId || (req.query.schoolId ? Number(req.query.schoolId) : 1);
    const filter = { schoolId };

    const teachers = await Teacher.find(filter)
      .populate("assignedGrades", "gradeNumber")
      .populate("primarySubject", "subjectName")
      .populate("secondarySubject", "subjectName");

    // Sync assignedClasses for each teacher from timetable
    await Promise.all(teachers.map(t => syncAssignedClasses(schoolId, t._id)));

    // Re-fetch with updated assignedClasses
    const updatedTeachers = await Teacher.find(filter)
      .populate("assignedGrades", "gradeNumber")
      .populate("primarySubject", "subjectName")
      .populate("secondarySubject", "subjectName");

    res.status(200).json(updatedTeachers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addTeacher = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      qualification,
      currentAddress,
      primarySubject,
      secondarySubject,
      assignedGrades,
      assignedSections,
      birthdate,
    } = req.body;

    const schoolId = req.body.schoolId ? Number(req.body.schoolId) : 1;

    // Validation
    const fieldErrors = {};
    if (!firstName?.trim()) fieldErrors.firstName = "First name is required";
    if (!lastName?.trim()) fieldErrors.lastName = "Last name is required";
    if (!email?.trim()) fieldErrors.email = "Email is required (for teacher login)";
    if (!gender?.trim()) fieldErrors.gender = "Gender is required";

    if (Object.keys(fieldErrors).length) {
      return res.status(400).json({ message: "Validation failed", errors: fieldErrors });
    }

    // Prevent duplicate teacher email (teacher collection)
    const existingTeacher = await Teacher.findOne({ schoolId, email: email.trim() });
    if (existingTeacher) {
      return res.status(409).json({ message: "Email already exists (teacher)." });
    }

    // Prevent duplicate user email (auth collection)
    const existingUser = await User.findOne({ schoolId, email: email.trim() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists (user account)." });
    }

    const { primarySubId, secondarySubId, resolvedGradeIds } = await resolveTeacherRelations(schoolId, {
      primarySubject,
      secondarySubject,
      assignedGrades,
    });

    const teacher = new Teacher({
      schoolId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone ? String(phone).trim() : null,
      gender: gender.trim(),
      birthdate: birthdate || null,
      qualification: qualification?.trim() || null,
      currentAddress: currentAddress?.trim() || null,
      profilePhoto: req.body.profilePhoto || null,
      primarySubject: primarySubId,
      secondarySubject: secondarySubId,
      assignedGrades: resolvedGradeIds,
      assignedSections: Array.isArray(assignedSections) ? assignedSections : [],
      classTeacher: req.body.classTeacher || null,
      assignedClasses: req.body.assignedClasses || null,
    });

    await teacher.save();

    const tempPassword = generateTempPassword();

    const user = new User({
      schoolId: teacher.schoolId,
      email: teacher.email,
      password: tempPassword,
      role: "teacher",
      teacherId: teacher._id,
      mustChangePassword: true,
    });

    await user.save();

    try {
      await sendEmail({
        to: teacher.email,
        subject: "Teacher account created (Temporary password)",
        text:
          `Teacher Code: ${teacher.teacherCode}\n` +
          `Login Email: ${teacher.email}\n` +
          `Temporary Password: ${tempPassword}\n` +
          `Please login and change your password immediately.`,
      });
    } catch (emailErr) {
      console.error("Failed to send email:", emailErr.message);
    }

    return res.status(201).json({
      message: "Teacher added successfully. Login user created and temp password sent to email.",
      teacher,
      userId: user._id,
    });
  } catch (error) {
    if (error?.code === 11000) {
      const key = Object.keys(error.keyValue || {})[0] || "field";
      return res.status(409).json({
        message: `${key} already exists`,
        duplicateKey: key,
        duplicateValue: error.keyValue?.[key],
      });
    }
    if (error?.name === "ValidationError") {
      const fieldErrors = {};
      for (const field in error.errors) {
        fieldErrors[field] = error.errors[field].message;
      }
      return res.status(400).json({ message: "Validation failed", errors: fieldErrors });
    }
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    // Sync assignedClasses from timetable first
    await syncAssignedClasses(teacher.schoolId, req.params.id);

    const populatedTeacher = await Teacher.findById(req.params.id)
      .populate("assignedGrades", "gradeNumber")
      .populate("primarySubject", "subjectName")
      .populate("secondarySubject", "subjectName");

    res.status(200).json(populatedTeacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getTeacherByName = async (req, res) => {
  try {
    const { schoolId } = req.query;
    const name = req.params.name;
    const parts = String(name).trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || ".";

    const filter = { firstName, lastName };
    if (schoolId) filter.schoolId = Number(schoolId);

    const teacher = await Teacher.findOne(filter);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    res.status(200).json(teacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const exists = await Teacher.findById(req.params.id);
    if (!exists) return res.status(404).json({ message: "Teacher not found" });

    const schoolId = exists.schoolId || 1;
    const updateData = { ...req.body };

    // ─── Immutable fields — never allow manual overwrite ───
    delete updateData.schoolId;
    delete updateData.teacherId;   // teacherId is auto-generated, not editable
    delete updateData.teacherCode; // legacy code also immutable

    const { primarySubId, secondarySubId, resolvedGradeIds } = await resolveTeacherRelations(schoolId, updateData);

    if (primarySubId !== undefined) updateData.primarySubject = primarySubId;
    if (secondarySubId !== undefined) updateData.secondarySubject = secondarySubId;
    if (resolvedGradeIds !== undefined) updateData.assignedGrades = resolvedGradeIds;
    if (req.body.profilePhoto !== undefined) updateData.profilePhoto = req.body.profilePhoto;

    const updatedTeacher = await Teacher.findOneAndUpdate({ _id: req.params.id, schoolId }, updateData, {
      new: true,
      runValidators: true,
    }).populate("assignedGrades", "gradeNumber")
      .populate("primarySubject", "subjectName")
      .populate("secondarySubject", "subjectName");

    res.status(200).json({ message: "Teacher record updated successfully.", teacher: updatedTeacher });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    // also delete linked user
    await User.findOneAndDelete({ teacherId: teacher._id });

    await Teacher.findOneAndDelete({ _id: req.params.id, schoolId: teacher.schoolId });
    res.status(200).json({ message: "Teacher (and linked user) deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllTeachers,
  addTeacher,
  getTeacherById,
  getTeacherByName,
  updateTeacher,
  deleteTeacher,
};
