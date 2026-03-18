const mongoose = require("mongoose");

// =============================================
// SCHOOL MODEL
// =============================================
const schoolSchema = new mongoose.Schema({
  schoolId: { type: Number, required: true },
  _id: { type: mongoose.Schema.Types.Mixed }, // Support legacy Numeric ID (1) and new ObjectIds
  name: { type: String, required: true },
  address: String,
  email: String,
  logo: String,
  website: String,
  motto: String,
  establishedYear: String,
  affiliation: String,
  kycDocument: String,
  status: { type: String, default: 'Active' },
  coverImage: String,
  gradeSpan: {
    start: { type: Number, default: 1 },
    end: { type: Number, default: 10 }
  },
  operatingHours: {
    start: { type: String, default: "09:00" },
    end: { type: String, default: "16:00" }
  },
  maxSectionsPerGrade: { type: Number, default: 10 },
  phoneNumbers: [{
    phoneNumber: { type: String, required: true },
    type: { type: String, default: 'main' },  // Free-text label e.g. "Main Office"
    isPrimary: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 }
  }],
  socialLinks: [{
    platform: { type: String, enum: ['facebook', 'instagram', 'tiktok', 'twitter', 'youtube'], required: true },
    url: { type: String, required: true }
  }],
  admissionFee: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'schools' });

// =============================================
// GRADE MODEL (Grades 1-10)
// =============================================
const gradeSchema = new mongoose.Schema({
  schoolId: { type: Number, default: 1 },
  gradeNumber: { type: Number, required: true, min: 1, max: 13 },  // 1 to 13
  gradeName: String,  // "Grade 1", "Class I"
  sections: [{
    sectionName: { type: String, required: true },  // 'A', 'B', 'C' up to 10
    classRoomName: { type: String, default: "" }, // NEW: custom name like "Emerald Class"
    classTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null },
    classMonitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
    capacity: { type: Number, default: 40 },
    roomNumber: String,
    isActive: { type: Boolean, default: true }
  }],
  subjects: [{
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    isMandatory: { type: Boolean, default: true },  // true=core, false=additional
    periodsPerWeek: { type: Number, default: 5 },
    creditHours: Number
  }],
  displayOrder: Number,
  monthlyFee: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { collection: 'grades' });

// =============================================
// SUBJECT MODEL (Core + Additional)
// =============================================
const subjectSchema = new mongoose.Schema({
  schoolId: { type: Number, default: 1 },
  subjectCode: String,  // 'MATH', 'ENG', 'SCI'
  subjectName: { type: String, required: true },
  subjectType: { 
    type: String, 
    enum: ['core', 'elective', 'extra_curricular'], 
    default: 'core' 
  },
  description: String,
  isActive: { type: Boolean, default: true }
}, { collection: 'subjects' });

// Indexes for performance
gradeSchema.index({ schoolId: 1, gradeNumber: 1 }, { unique: true });
subjectSchema.index({ schoolId: 1, subjectCode: 1 }, { unique: true });

const School = mongoose.model('School', schoolSchema);
const Grade = mongoose.model('Grade', gradeSchema);
const Subject = mongoose.model('Subject', subjectSchema);

module.exports = { School, Grade, Subject };

