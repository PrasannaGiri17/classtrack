// controllers/adminController.js
const Admin = require("../models/AdminModel");
const User = require("../models/UserModal");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// temp password (8 chars)
const generateTempPassword = () => crypto.randomBytes(4).toString("hex");

const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addAdmin = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      qualification,
      currentAddress,
      birthdate,
      profilePhoto
    } = req.body;

    const schoolId = req.body.schoolId || 1;

    // Validation
    const fieldErrors = {};
    if (!firstName?.trim()) fieldErrors.firstName = "First name is required";
    if (!lastName?.trim()) fieldErrors.lastName = "Last name is required";
    if (!email?.trim()) fieldErrors.email = "Email is required";
    if (!gender?.trim()) fieldErrors.gender = "Gender is required";

    if (Object.keys(fieldErrors).length) {
      return res.status(400).json({ message: "Validation failed", errors: fieldErrors });
    }

    // Prevent duplicate email
    const existingAdmin = await Admin.findOne({ email: email.trim() });
    if (existingAdmin) {
      return res.status(409).json({ message: "Email already exists in Admin profile." });
    }

    const existingUser = await User.findOne({ email: email.trim() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists in User accounts." });
    }

    // 1) Create Admin Profile
    const admin = new Admin({
      schoolId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone ? String(phone).trim() : null,
      gender: gender.trim(),
      birthdate: birthdate || null,
      qualification: qualification?.trim() || null,
      currentAddress: currentAddress?.trim() || null,
      profilePhoto: profilePhoto || null,
    });

    await admin.save();

    // 2) Create linked User (login)
    const tempPassword = generateTempPassword();

    const user = new User({
      schoolId,
      email: admin.email,
      password: tempPassword,
      role: "admin",
      adminId: admin._id,
      mustChangePassword: true,
    });

    await user.save();

    // 3) Send email
    try {
      await sendEmail({
        to: admin.email,
        subject: "Admin account created (Temporary password)",
        text:
          `Login Email: ${admin.email}\n` +
          `Temporary Password: ${tempPassword}\n` +
          `Please login and change your password immediately.`,
      });
    } catch (emailErr) {
      console.error("Failed to send email:", emailErr.message);
    }

    return res.status(201).json({
      message: "Admin added successfully. Login user created.",
      admin,
      userId: user._id,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.status(200).json(admin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const updatedAdmin = await Admin.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedAdmin) return res.status(404).json({ message: "Admin not found" });
    res.status(200).json({ message: "Admin updated successfully", admin: updatedAdmin });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // delete linked user
    await User.findOneAndDelete({ adminId: admin._id });

    await Admin.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Admin and linked user deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllAdmins,
  addAdmin,
  getAdminById,
  updateAdmin,
  deleteAdmin,
};
