const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },

    // basic info
    firstName: String,
    lastName: String,
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    dateOfBirth: Date,

    // profile section
    profile: {
        photo: { type: String, default: null }, 
        nationality: { type: String, default: null },
        bloodGroup: { type: String, default: null },
        emergencyContact: { type: String, default: null },
        additionalInfo: { type: String, default: null }
    },

    // enrollment data
    gradeId: { type: mongoose.Schema.Types.ObjectId, ref: "Grade", default: null },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Section", default: null },
    rollNumber: { type: Number, default: null },

    // parent info
    parentName: String,
    parentPhone: String,
    address: String,

    // attendance/flags 
    attendanceFlag: { type: Boolean, default: false },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Student", StudentSchema);
