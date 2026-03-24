const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Holiday = require('../models/Holiday');

async function checkHolidays() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_management');
    console.log('Connected to DB');
    const holidays = await Holiday.find().limit(5);
    console.log('Sample Holidays:', JSON.stringify(holidays, null, 2));
    const count = await Holiday.countDocuments();
    console.log('Total Holidays:', count);
    const withSchoolId = await Holiday.countDocuments({ schoolId: { $exists: true } });
    console.log('Holidays with schoolId:', withSchoolId);
    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}

checkHolidays();
