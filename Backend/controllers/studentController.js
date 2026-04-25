const Student = require("../models/studentModel");
const { Grade } = require("../models/School");
const User = require("../models/UserModal");
const Teacher = require("../models/teacherModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// temp password (8 chars)
const generateTempPassword = () => crypto.randomBytes(4).toString("hex");

const mongoose = require("mongoose");

const getAllStudents = async (req, res) => {
  try {
    const { studentClass, sectionId, classTeacherId } = req.query;
    const schoolId = req.schoolId;
    const filter = { schoolId };

    if (sectionId) {
      filter.sectionId = new mongoose.Types.ObjectId(sectionId);
    } else if (classTeacherId) {
      const grade = await Grade.findOne({ schoolId: req.schoolId, "sections.classTeacherId": classTeacherId });
      if (grade) {
        const section = grade.sections.find(s => s.classTeacherId?.toString() === classTeacherId);
        if (section) {
          filter.sectionId = section._id;
        } else {
          return res.status(200).json([]);
        }
      } else {
        return res.status(200).json([]);
      }
    } else if (studentClass) {
      filter.studentClass = Number(studentClass);
    }

    const students = await Student.find(filter);
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

    // 1. First, clear the section assignment for all students currently in this section
    // This ensures that students removed from the frontend view are correctly un-enrolled
    if (sectionId) {
      // Find all students currently in this section
      const previousStudents = await Student.find({ sectionId, schoolId: req.schoolId });
      const previousIds = previousStudents.map(s => s._id);

      // Clear their section info
      await Student.updateMany(
        { sectionId, schoolId: req.schoolId },
        { $set: { sectionId: null, studentClass: null, rollNumber: null } }
      );

      // Sync User models for previous students
      if (previousIds.length > 0) {
        await User.updateMany(
          { studentId: { $in: previousIds } },
          { $set: { classId: null } }
        );
      }
    }

    // 2. Now enroll the new set of students
    if (studentIds.length > 0) {
      await Student.updateMany(
        { _id: { $in: studentIds } },
        { $set: { sectionId: sectionId || null, studentClass: studentClass || null } }
      );

      // SYNC: Update User model's classId for all affected students
      await User.updateMany(
        { studentId: { $in: studentIds } },
        { $set: { classId: sectionId ? sectionId.toString() : null } }
      );
    }

    // 3. Re-calculate roll numbers for the section
    if (sectionId) {
      const studentsInSection = await Student.find({ sectionId, schoolId: req.schoolId })
        .sort({ firstName: 1, lastName: 1 });

      const bulkOps = studentsInSection.map((student, index) => ({
        updateOne: {
          filter: { _id: student._id },
          update: { $set: { rollNumber: index + 1 } }
        }
      }));

      if (bulkOps.length > 0) {
        await Student.bulkWrite(bulkOps);
      }
    }

    res.status(200).json({ message: "Enrollment updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addStudent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      fatherName,
      fatherPhone,
      motherName,
      motherPhone,
      email,
      phone,
      Address,

      // from frontend
      class: classFromClient,
      studentClass: studentClassFromClient,
      flag,
      birthdate,
      gender,

      classId,
      sectionId,
      rollNumber,
      profilePhoto,
    } = req.body;

    const schoolId = req.schoolId;

    // Validation
    const fieldErrors = {};
    if (!firstName?.trim()) fieldErrors.firstName = "First name is required";
    if (!lastName?.trim()) fieldErrors.lastName = "Last name is required";
    if (!fatherName?.trim() && !motherName?.trim())
      fieldErrors.guardian = "At least one of Father Name or Mother Name is required";
    if (!email?.trim()) fieldErrors.email = "Email is required (for student login)";

    if (Object.keys(fieldErrors).length) {
      return res.status(400).json({ message: "Validation failed", errors: fieldErrors });
    }

    // Duplicate check
    const existing = await Student.findOne({
      schoolId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      ...(fatherName ? { fatherName: fatherName.trim() } : {}),
    });

    if (existing) {
      return res.status(409).json({
        message: "Student already exists (same name + parent name + contact).",
      });
    }

    // Also prevent duplicate user email
    const existingUser = await User.findOne({ schoolId: req.schoolId,  email: email.trim() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists (user account)." });
    }

    // Convert class to Number (handle both names from frontend)
    const rawClass = classFromClient || studentClassFromClient;
    const parsedClass =
      rawClass !== undefined && rawClass !== ""
        ? Number(rawClass)
        : null;

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

      // NEW FIELDS
      studentClass: parsedClass,     // Number in DB
      flag: flag ?? "green",         // red/green/yellow

      classId: classId || null,
      sectionId: sectionId || null,
      rollNumber: rollNumber ?? null,
      profilePhoto: profilePhoto || null,
    });

    await student.save();

    // 2) Create User (login) linked to Student
    const tempPassword = generateTempPassword();

    const user = new User({
      schoolId: student.schoolId, // Required by User schema
      email: student.email,
      password: tempPassword, // will hash via userSchema.pre('save')
      role: "student",
      studentId: student._id,
      name: `${student.firstName} ${student.lastName}`,
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
      message:
        "Student added successfully. Login user created and temp password sent to email.",
      student,
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

const getStudentById = async (req, res) => {
  try {
    let student = await Student.findOne({ _id: req.params.id, schoolId: req.schoolId });
    
    // Fallback: If not found, check if the ID passed is actually a User ID
    if (!student) {
      const userDoc = await User.findOne({ _id: req.params.id, role: 'student', schoolId: req.schoolId });
      if (userDoc && userDoc.studentId) {
        student = await Student.findOne({ _id: userDoc.studentId, schoolId: req.schoolId });
      }
    }

    if (!student) return res.status(404).json({ message: "Student not found" });

    // Populate Grade and Section info to find the class teacher
    let populatedData = student.toObject();

    if (student.studentClass || student.classId) {
      // Find the grade that this student belongs to
      const gradeQuery = student.classId 
        ? { _id: student.classId, schoolId: req.schoolId } 
        : { schoolId: req.schoolId, gradeNumber: student.studentClass };
        
      const grade = await Grade.findOne(gradeQuery).populate("sections.classTeacherId");
      
      if (grade) {
        // Populate grade info (for frontend compatibility)
        populatedData.gradeId = {
          _id: grade._id,
          gradeName: grade.gradeName,
          gradeNumber: grade.gradeNumber,
          monthlyFee: grade.monthlyFee
        };

        // Find the specific section to get its teacher
        if (student.sectionId) {
          const section = grade.sections.id(student.sectionId);
          if (section) {
            populatedData.sectionId = {
              _id: section._id,
              sectionName: section.sectionName,
              classRoomName: section.classRoomName,
              classTeacherId: section.classTeacherId // This is now populated
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

    const student = await Student.findOne({ schoolId: req.schoolId,  firstName, lastName });
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

    // allow frontend key "class" to update DB field "studentClass"
    if ("class" in req.body) {
      req.body.studentClass =
        req.body.class !== undefined && req.body.class !== ""
          ? Number(req.body.class)
          : null;
      delete req.body.class;
    }

    const updateData = { ...req.body };
    if (updateData.profilePhoto !== undefined) {
      updateData.profilePhoto = req.body.profilePhoto;
    }

    const updatedStudent = await Student.findOneAndUpdate({ _id: req.params.id, schoolId: req.schoolId }, updateData, {
      new: true,
      runValidators: true,
    });

    // SYNC: Update User model if email changed
    if (req.body.email && req.body.email !== userexists.email) {
      await User.findOneAndUpdate(
        { studentId: updatedStudent._id },
        { $set: { email: req.body.email.trim() } }
      );
    }

    // SYNC: Update User model if sectionId changed
    if (req.body.sectionId !== undefined) {
      await User.findOneAndUpdate(
        { studentId: updatedStudent._id },
        { $set: { classId: updatedStudent.sectionId ? updatedStudent.sectionId.toString() : null } }
      );
    }

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

    await Student.findOneAndDelete({ _id: req.params.id, schoolId: req.schoolId });
    res.status(200).json({ message: "Student (and linked user) deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remove student from section (clear sectionId and studentClass)
const removeStudentFromSection = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: "studentId is required" });
    }

    const studentToUpdate = await Student.findOne({ _id: studentId, schoolId: req.schoolId });
    if (!studentToUpdate) {
      return res.status(404).json({ message: "Student not found" });
    }

    const sectionId = studentToUpdate.sectionId;

    await Student.findOneAndUpdate({ _id: studentId, schoolId: req.schoolId },
      { $set: { sectionId: null, studentClass: null, rollNumber: null } }
    );

    if (sectionId) {
      const studentsInSection = await Student.find({ sectionId, schoolId: req.schoolId })
        .sort({ firstName: 1, lastName: 1 });

      const bulkOps = studentsInSection.map((student, index) => ({
        updateOne: {
          filter: { _id: student._id },
          update: { $set: { rollNumber: index + 1 } }
        }
      }));

      if (bulkOps.length > 0) {
        await Student.bulkWrite(bulkOps);
      }
    }

    // SYNC: Update User model
    await User.findOneAndUpdate(
      { studentId: studentId },
      { $set: { classId: null } }
    );

    res.status(200).json({ message: "Student removed from section successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const togglePin = async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.id, schoolId: req.schoolId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.isPinned = !student.isPinned;
    await student.save();

    res.status(200).json({ message: "Pin status toggled", isPinned: student.isPinned });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllStudents,
  addStudent,
  getStudentById,
  getStudentByName,
  updateStudent,
  deleteStudent,
  updateSectionEnrollment,
  removeStudentFromSection,
  togglePin
};
