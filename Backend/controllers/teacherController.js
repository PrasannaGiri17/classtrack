// controllers/teacherController.js
const Teacher = require("../models/teacherModel");
const User = require("../models/UserModal");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// temp password (8 chars)
const generateTempPassword = () => crypto.randomBytes(4).toString("hex");

const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.status(200).json(teachers);
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
    } = req.body;

    const schoolId = 1;

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
    const existingTeacher = await Teacher.findOne({ email: email.trim() });
    if (existingTeacher) {
      return res.status(409).json({ message: "Email already exists (teacher)." });
    }

    // Prevent duplicate user email (auth collection)
    const existingUser = await User.findOne({ email: email.trim() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists (user account)." });
    }

    // 1) Create Teacher
    const teacher = new Teacher({
      schoolId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone ? String(phone).trim() : null,
      gender: gender.trim(), // must be "male" | "female" | "other"
      qualification: qualification?.trim() || null,
      currentAddress: currentAddress?.trim() || null,

      primarySubject: primarySubject || null,
      secondarySubject: secondarySubject || null,

      assignedGrades: Array.isArray(assignedGrades) ? assignedGrades : [],
      assignedSections: Array.isArray(assignedSections) ? assignedSections : [],
    });

    await teacher.save();

    // 2) Create linked User (login)
    const tempPassword = generateTempPassword();

    const user = new User({
      email: teacher.email,
      password: tempPassword, // hashed by pre-save hook in User model
      role: "teacher",
      teacherId: teacher._id,
      mustChangePassword: true,
    });

    await user.save();

    // 3) Send email with temp password
    await sendEmail({
      to: teacher.email,
      subject: "Teacher account created (Temporary password)",
      text:
        `Teacher Code: ${teacher.teacherCode}\n` +
        `Login Email: ${teacher.email}\n` +
        `Temporary Password: ${tempPassword}\n` +
        `Please login and change your password immediately.`,
    });

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
    res.status(200).json(teacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getTeacherByName = async (req, res) => {
  try {
    const name = req.params.name;
    const parts = String(name).trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || ".";

    const teacher = await Teacher.findOne({ firstName, lastName });
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

    // don't allow changing schoolId normally
    if ("schoolId" in req.body) delete req.body.schoolId;

    const updatedTeacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedTeacher);
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

    await Teacher.findByIdAndDelete(req.params.id);
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
