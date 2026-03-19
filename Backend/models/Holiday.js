const mongoose = require('mongoose');

const HolidaySchema = new mongoose.Schema({
  schoolId: { type: Number, required: true, index: true },
  gregorian_date: {
    type: String, // Stored as "YYYY-MM-DD" based on extractHolidays.js
    required: true
  },
  nepali_date: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  titles: [String],
  created_at: {
    type: Date,
    default: Date.now
  }
}, { collection: 'holiday' }); // Match the collection name used in extractHolidays.js

module.exports = mongoose.model('Holiday', HolidaySchema);
