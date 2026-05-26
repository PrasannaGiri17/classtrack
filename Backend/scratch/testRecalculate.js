const mongoose = require('mongoose');
const Student = require('../models/studentModel');
const Result = require('../models/Result');
const { recalculateSingleStudentFlag, recalculateSchoolFlags } = require('../services/flagService');

async function test() {
  try {
    await mongoose.connect('mongodb://localhost:27017/school');
    console.log('✅ Connected to database');

    const schoolId = 2;
    const academicYear = 2083;

    // Find a student who has at least one result
    const resultDoc = await Result.findOne({ schoolId, academicYear }).lean();
    if (!resultDoc) {
      console.log('❌ No results found for schoolId 2 and year 2083');
      process.exit(1);
    }

    const student = await Student.findById(resultDoc.studentId).lean();
    if (!student) {
      console.log(`❌ Student not found for result studentId: ${resultDoc.studentId}`);
      process.exit(1);
    }
    console.log(`🔍 Found active student with results: ${student.firstName} ${student.lastName} (${student._id})`);

    // Test recalculating single student flag
    console.log('🧪 Testing recalculateSingleStudentFlag...');
    const resultSingle = await recalculateSingleStudentFlag(student, schoolId, academicYear);
    console.log('🎉 Single student result:', resultSingle);

    // Fetch the updated student to see the updated flag
    const updatedStudent = await Student.findById(student._id).lean();
    console.log('🎉 Updated student flag field:', updatedStudent.flag);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during verification:', error);
    process.exit(1);
  }
}

test();
