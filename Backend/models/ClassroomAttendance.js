const mongoose = require("mongoose");

const ClassroomAttendanceSchema = new mongoose.Schema(
  {
    schoolId: { type: Number, required: true },
    gradeId: { type: mongoose.Schema.Types.ObjectId, ref: "Grade", required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Grade.sections", required: true }, // Referencing the section ID in the Grade model
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    
    year: { type: Number, required: true }, // e.g., 2081 (BS)
    month: { 
      type: String, 
      required: true,
      enum: ["Baisakh", "Jestha", "Ashad", "Shrawan", "Bhadra", "Ashwin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"]
    },
    
    // Day-by-day records for each student in the section for this specific month
    attendanceData: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
        // records is an object where key is the day (1-32) and value is the status
        // { "1": "P", "2": "A", "3": "P" ... }
        dailyStatus: {
          type: Map,
          of: String, // "P", "A", "L", "H"
          default: {}
        }
      }
    ]
  },
  { timestamps: true }
);

// Index for fast lookup
ClassroomAttendanceSchema.index({ sectionId: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("ClassroomAttendance", ClassroomAttendanceSchema);
