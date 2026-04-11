/**
 * scripts/backfill_academic_year.js
 *
 * One-time migration: sets academicYear = 2082 on every Exam and Result
 * document that is currently missing it.
 *
 * Run once from the Backend directory:
 *   node scripts/backfill_academic_year.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const MIGRATION_YEAR = 2082; // current Nepali year for all existing legacy data

async function run() {
  await mongoose.connect('mongodb://localhost:27017/school');
  console.log('✅ Connected to MongoDB');

  // ── Exam collection ──────────────────────────────────────────────────────
  const Exam   = require('../models/Exam');
  const examResult = await Exam.updateMany(
    { academicYear: { $exists: false } },
    { $set: { academicYear: MIGRATION_YEAR } }
  );
  console.log(`📄 Exam   — matched: ${examResult.matchedCount}, updated: ${examResult.modifiedCount}`);

  // ── Result collection ─────────────────────────────────────────────────────
  const Result = require('../models/Result');
  const resResult = await Result.updateMany(
    { academicYear: { $exists: false } },
    { $set: { academicYear: MIGRATION_YEAR } }
  );
  console.log(`📄 Result — matched: ${resResult.matchedCount}, updated: ${resResult.modifiedCount}`);

  await mongoose.disconnect();
  console.log('✅ Migration complete. Disconnected.');
}

run().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
