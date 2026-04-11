/**
 * scripts/backfill_academic_year_v2.js
 * Force-sets academicYear: 2082 on ALL Result and Exam docs that are missing it.
 * Re-safe to run multiple times (only touches docs that still need it).
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const YEAR = 2082;

async function run() {
  await mongoose.connect('mongodb://localhost:27017/school');
  console.log('✅ Connected');

  const Result = require('../models/Result');
  const Exam   = require('../models/Exam');

  // Match docs missing the field, null, or 0
  const missingFilter = {
    $or: [
      { academicYear: { $exists: false } },
      { academicYear: null },
      { academicYear: 0 }
    ]
  };

  const r = await Result.updateMany(missingFilter, { $set: { academicYear: YEAR } });
  console.log(`📄 Result — matched: ${r.matchedCount}, updated: ${r.modifiedCount}`);

  const e = await Exam.updateMany(missingFilter, { $set: { academicYear: YEAR } });
  console.log(`📄 Exam   — matched: ${e.matchedCount}, updated: ${e.modifiedCount}`);

  // Verify
  const missing = await Result.countDocuments(missingFilter);
  console.log(`🔍 Results still missing academicYear after fix: ${missing}`);

  await mongoose.disconnect();
  console.log('✅ Done');
}

run().catch(err => { console.error('❌', err); process.exit(1); });
