const { School } = require("../models/School");
const User = require("../models/UserModal");
const Admin = require("../models/AdminModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// temp password (8 chars)
const generateTempPassword = () => crypto.randomBytes(4).toString("hex");

const getAllSchools = async (req, res) => {
  try {
    const schools = await School.find();
    res.status(200).json(schools);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getSchoolById = async (req, res) => {
  try {
    const lookupId = !isNaN(req.params.id) ? Number(req.params.id) : req.params.id;
    const school = await School.findById(lookupId);
    if (!school) {
      return res.status(404).json({ message: "School not found." });
    }
    res.status(200).json(school);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addSchool = async (req, res) => {
  try {
    const {
      name, address, email, logo, website, motto, establishedYear,
      affiliation, kycDocument, status, coverImage,
      gradeSpan, maxSectionsPerGrade, phoneNumbers, socialLinks, admissionFee,
      adminName, adminEmail
    } = req.body;

    // 1) Validation for required fields
    if (!name || !adminEmail || !adminName) {
      return res.status(400).json({ message: "School name, Admin name, and Admin email are required." });
    }

    // 2) Auto-generate schoolId safely
    const schools = await School.find().sort({ schoolId: -1 }).limit(1);
    let nextSchoolId = 1;
    if (schools.length > 0 && typeof schools[0].schoolId === 'number') {
      nextSchoolId = schools[0].schoolId + 1;
    } else if (schools.length > 0) {
      // If the last school found doesn't have a numeric schoolId, count total schools as a fallback
      const count = await School.countDocuments();
      nextSchoolId = count + 1;
    }

    // 3) Check if Admin Email already exists in User or Admin models
    const existingUser = await User.findOne({ email: adminEmail });
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    
    if (existingUser || existingAdmin) {
      return res.status(400).json({ message: "Admin email already exists in the system." });
    }

    // 4) Create the School
    const newSchool = new School({
      _id: nextSchoolId, // Provide _id explicitly since schema uses Mixed and doesn't auto-generate
      schoolId: nextSchoolId,
      name, address, email: email || adminEmail, logo, website, motto, establishedYear,
      affiliation, kycDocument, status: status || 'Pending', coverImage,
      gradeSpan, maxSectionsPerGrade, phoneNumbers, socialLinks, admissionFee
    });

    await newSchool.save();

    // 5) Create Admin Profile and User Account
    // Split name into first and last
    const nameParts = adminName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : ".";

    const admin = new Admin({
      schoolId: nextSchoolId,
      firstName,
      lastName,
      email: adminEmail,
      gender: "other", // Required in model
    });
    await admin.save();

    const tempPassword = generateTempPassword();
    const user = new User({
      schoolId: nextSchoolId,
      email: adminEmail,
      password: tempPassword,
      role: "admin",
      adminId: admin._id,
      mustChangePassword: true,
    });
    await user.save();

    // 6) Send Email
    try {
      await sendEmail({
        to: adminEmail,
        subject: `Admin Account Created for ${name}`,
        text: 
          `Your school ${name} has been registered.\n\n` +
          `Admin Portal Access Details:\n` +
          `Login Email: ${adminEmail}\n` +
          `Temporary Password: ${tempPassword}\n\n` +
          `Please login and change your password immediately.`,
      });
    } catch (emailError) {
      console.error("Error sending admin creation email:", emailError);
    }

    res.status(201).json({ 
      message: "School created successfully and admin account setup.", 
      school: newSchool 
    });
  } catch (error) {
    console.error("Add School Error:", error);
    res.status(500).json({ message: "Server error during registration.", error: error.message });
  }
};

const updateSchool = async (req, res) => {
  try {
    const lookupId = !isNaN(req.params.id) ? Number(req.params.id) : req.params.id;
    const updatedSchool = await School.findByIdAndUpdate(
        lookupId,
        { $set: req.body },
        { new: true, runValidators: true }
    );

    if (!updatedSchool) {
      return res.status(404).json({ message: "School not found." });
    }

    res.status(200).json({ message: "School updated successfully", school: updatedSchool });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllSchools,
  getSchoolById,
  addSchool,
  updateSchool,
};
