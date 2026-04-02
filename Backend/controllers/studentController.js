const Student = require("../models/studentModel");
const { Grade } = require("../models/School");
const User = require("../models/UserModal");
const Teacher = require("../models/teacherModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const mongoose = require("mongoose");

const generateTempPassword = () => crypto.randomBytes(4).toString("hex");

const getAllStudents = async (req, res) => {
  try {
    const { studentClass, sectionId, classTeacherId } = req.query;
    const schoolId = req.schoolId;
    const filter = { schoolId };

    if (sectionId) {
      filter.sectionId = new mongoose.Types.ObjectId(sectionId);
    } else if (classTeacherId) {
      const grade = await Grade.findOne(
        { schoolId, "sections.classTeacherId": classTeacherId },
        { "sections.$": 1 } // ✅ only fetch matching section
      ).lean();
      if (grade?.sections?.[0]) {
        filter.sectionId = grade.sections[0]._id;
      } else {
        return res.status(200).json([]);
      }
    } else if (studentClass) {
      filter.studentClass = Number(studentClass);
    }

    // ✅ .lean() = 2x faster, .select() = less data
    const students = await Student.find(filter)
      .select('-__v')
      .lean();

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateSectionEnrollment = async (req, res) => {
  try {
    const { studentIds, sectionId, studentClass } = req.body;
    if (!Array.isArray(studentIds)) {
      return res.status(400).json({ message: "studentIds must be an array" });
    }
    await Student.updateMany(
      { _id: { $in: studentIds } },
      { $set: { sectionId: sectionId || null, studentClass: studentClass || null } }
    );
    res.status(200).json({ message: "Enrollment updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addStudent = async (req, res) => {
  try {
    const {
      firstName, lastName, fatherName, fatherPhone,
      motherName, motherPhone, email, phone, Address,
      class: classFromClient, studentClass: studentClassFromClient,
      flag, birthdate, gender, classId, sectionId, rollNumber, profilePhoto,
    } = req.body;

    const schoolId = req.schoolId;

    const fieldErrors = {};
    if (!firstName?.trim()) fieldErrors.firstName = "First name is required";
    if (!lastName?.trim()) fieldErrors.lastName = "Last name is required";
    if (!fatherName?.trim() && !motherName?.trim())
      fieldErrors.guardian = "At least one of Father Name or Mother Name is required";
    if (!email?.trim()) fieldErrors.email = "Email is required";

    if (Object.keys(fieldErrors).length) {
      return res.status(400).json({ message: "Validation failed", errors: fieldErrors });
    }

    // ✅ Run duplicate checks in parallel
    const [existing, existingUser] = await Promise.all([
      Student.findOne({
        schoolId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        ...(fatherName ? { fatherName: fatherName.trim() } : {}),
      }).lean(),
      User.findOne({ schoolId, email: email.trim() }).lean()
    ]);

    if (existing) {
      return res.status(409).json({ message: "Student already exists." });
    }
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists." });
    }

    const rawClass = classFromClient || studentClassFromClient;
    const parsedClass = rawClass !== undefined && rawClass !== "" ? Number(rawClass) : null;

    const student = new Student({
      schoolId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fatherName: fatherName?.trim() || null,
      fatherPhone: fatherPhone ? String(fatherPhone).trim() : null,
      motherName: motherName?.trim() || null,
      motherPhone: motherPhone ? String(motherPhone).trim() : null,
      email: email.trim(),
      phone: phone ? String(phone).trim() : null,
      Address: Address?.trim(),
      birthdate: birthdate || null,
      gender: gender || null,
      studentClass: parsedClass,
      flag: flag ?? "green",
      classId: classId || null,
      sectionId: sectionId || null,
      rollNumber: rollNumber ?? null,
      profilePhoto: profilePhoto || null,
    });

    await student.save();

    const tempPassword = generateTempPassword();
    const user = new User({
      schoolId: student.schoolId,
      email: student.email,
      password: tempPassword,
      role: "student",
      studentId: student._id,
      mustChangePassword: true,
    });

    await user.save();

    await sendEmail({
      to: student.email,
      subject: "Student account created (Temporary password)",
      text: `Student ID: ${student.studentId}\nLogin Email: ${student.email}\nTemporary Password: ${tempPassword}\nPlease login and change your password immediately.`,
    });

    return res.status(201).json({
      message: "Student added successfully.",
      student,
      userId: user._id,
    });
  } catch (error) {
    if (error?.code === 11000) {
      const key = Object.keys(error.keyValue || {})[0] || "field";
      return res.status(409).json({ message: `${key} already exists`, duplicateKey: key });
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
    const student = await Student.findOne({
      _id: req.params.id,
      schoolId: req.schoolId
    }).lean(); // ✅ lean() is faster

    if (!student) return res.status(404).json({ message: "Student not found" });

    let populatedData = { ...student };

    // ✅ Only query grade if needed
    if (student.studentClass || student.classId) {
      const gradeQuery = student.classId
        ? { _id: student.classId, schoolId: req.schoolId }
        : { schoolId: req.schoolId, gradeNumber: student.studentClass };

      const grade = await Grade.findOne(gradeQuery)
        .select('gradeName gradeNumber sections') // ✅ only fetch needed fields
        .lean();

      if (grade) {
        populatedData.gradeId = {
          _id: grade._id,
          gradeName: grade.gradeName,
          gradeNumber: grade.gradeNumber
        };

        if (student.sectionId) {
          const section = grade.sections?.find(
            s => s._id.toString() === student.sectionId.toString()
          );
          if (section) {
            populatedData.sectionId = {
              _id: section._id,
              sectionName: section.sectionName,
              classRoomName: section.classRoomName,
              classTeacherId: section.classTeacherId
            };
          }
        }
      }
    }

    res.status(200).json(populatedData);
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
    const student = await Student.findOne({ schoolId: req.schoolId, firstName, lastName }).lean();
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const userexists = await Student.findById(req.params.id).lean();
    if (!userexists) return res.status(404).json({ message: "Student not found" });

    if ("schoolId" in req.body) delete req.body.schoolId;
    if ("class" in req.body) {
      req.body.studentClass = req.body.class !== undefined && req.body.class !== ""
        ? Number(req.body.class) : null;
      delete req.body.class;
    }

    const updatedStudent = await Student.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.schoolId },
      { ...req.body },
      { new: true, runValidators: true }
    ).lean();

    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).lean();
    if (!student) return res.status(404).json({ message: "Student not found" });

    // ✅ Delete in parallel
    await Promise.all([
      User.findOneAndDelete({ studentId: student._id }),
      Student.findOneAndDelete({ _id: req.params.id, schoolId: req.schoolId })
    ]);

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeStudentFromSection = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: "studentId is required" });
    await Student.findOneAndUpdate(
      { _id: studentId, schoolId: req.schoolId },
      { $set: { sectionId: null, studentClass: null } }
    );
    res.status(200).json({ message: "Student removed from section successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllStudents, addStudent, getStudentById, getStudentByName,
  updateStudent, deleteStudent, updateSectionEnrollment, removeStudentFromSection
};