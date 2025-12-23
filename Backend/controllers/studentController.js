// controllers/studentController.js
const Student = require("../models/studentModel");
const User = require("../models/UserModal");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// temp password (8 chars)
const generateTempPassword = () => crypto.randomBytes(4).toString("hex");

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addStudent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      parentName,
      parentPhone,
      email,
      phone,
      Address,
      classId,
      sectionId,
      rollNumber,
    } = req.body;

    const schoolId = 1;

    // Validation
    const fieldErrors = {};
    if (!firstName?.trim()) fieldErrors.firstName = "First name is required";
    if (!lastName?.trim()) fieldErrors.lastName = "Last name is required";
    if (!parentName?.trim()) fieldErrors.parentName = "Parent name is required";
    if (!String(parentPhone || "").trim()) fieldErrors.parentPhone = "Parent contact is required";
    if (!email?.trim()) fieldErrors.email = "Email is required (for student login)";

    if (Object.keys(fieldErrors).length) {
      return res.status(400).json({ message: "Validation failed", errors: fieldErrors });
    }

    // Duplicate check (your rule)
    const existing = await Student.findOne({
      schoolId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      parentName: parentName.trim(),
      parentPhone: String(parentPhone).trim(),
    });

    if (existing) {
      return res.status(409).json({
        message: "Student already exists (same name + parent name + contact).",
      });
    }

    // Also prevent duplicate user email
    const existingUser = await User.findOne({ email: email.trim() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists (user account)." });
    }

    // 1) Create Student
    const student = new Student({
      schoolId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      parentName: parentName.trim(),
      parentPhone: String(parentPhone).trim(),
      email: email.trim(),
      phone: phone ? String(phone).trim() : null,
      Address: Address?.trim(),
      classId: classId || null,
      sectionId: sectionId || null,
      rollNumber: rollNumber ?? null,
    });

    await student.save();

    // 2) Create User (login) linked to Student
    const tempPassword = generateTempPassword();

    const user = new User({
      email: student.email,
      password: tempPassword, // will hash via userSchema.pre('save')
      role: "student",
      studentId: student._id,
      mustChangePassword: true,
    });

    await user.save();

    // 3) Send email with temp password
    await sendEmail({
      to: student.email,
      subject: "Student account created (Temporary password)",
      text:
        `Student ID: ${student.studentId}\n` +
        `Login Email: ${student.email}\n` +
        `Temporary Password: ${tempPassword}\n` +
        `Please login and change your password immediately.`,
    });

    return res.status(201).json({
      message: "Student added successfully. Login user created and temp password sent to email.",
      student,
      userId: user._id,
      // optional: remove tempPassword from response for security
      // tempPassword,
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

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getStudentByName = async (req, res) => {
  try {
    const name = req.params.name;
    const parts = String(name).trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || ".";

    const student = await Student.findOne({ firstName, lastName });
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.status(200).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const userexists = await Student.findById(req.params.id);
    if (!userexists) return res.status(404).json({ message: "Student not found" });

    // do not allow changing schoolId from normal update
    if ("schoolId" in req.body) delete req.body.schoolId;

    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // also delete linked user (optional but recommended)
    await User.findOneAndDelete({ studentId: student._id });

    await Student.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Student (and linked user) deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllStudents,
  addStudent,
  getStudentById,
  getStudentByName,
  updateStudent,
  deleteStudent,
};
