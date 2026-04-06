const mongoose = require('mongoose');
require('dotenv').config({ path: 'e:/1. Fyp/SchoolManagmentApp/Backend/.env' });
const { School } = require('e:/1. Fyp/SchoolManagmentApp/Backend/models/School');
const Student = require('e:/1. Fyp/SchoolManagmentApp/Backend/models/studentModel');
const Teacher = require('e:/1. Fyp/SchoolManagmentApp/Backend/models/teacherModel');

async function check() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/classtrack';
  console.log('Connecting to:', uri);
  try {
    await mongoose.connect(uri);
    
    const totalSchools = await School.countDocuments({});
    const totalStudents = await Student.countDocuments({});
    const totalTeachers = await Teacher.countDocuments({});
    
    console.log('ACTUAL_COUNTS_RESULT', JSON.stringify({
      totalSchools,
      totalStudents,
      totalTeachers
    }));
  } catch (err) {
    console.error('Error connecting or querying:', err);
  } finally {
    process.exit(0);
  }
}

check();
