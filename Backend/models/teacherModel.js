const mongoose = require("mongoose");

const TeacherSchema = new mongoose.Schema({
    TeacherId: { type: mongoose.Schema.Types.ObjectId, ref: "teacher", required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },

 
    firstName: String,
    lastName: String,
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    qualification: String,

    profile: {
        photo: { type: String, default: null },
        nationality: { type: String, default: null },
        bloodGroup: { type: String, default: null },
        emergencyContact: { type: String, default: null },
        additionalInfo: { type: String, default: null }
    },

    phone: String,
    address: String,

    // teacher assigned classes
    assignedGrades: [{ type: mongoose.Schema.Types.ObjectId, ref: "Grade" }],
    assignedSections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],

    // only one primary subject
    primarySubject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Teacher", TeacherSchema);
