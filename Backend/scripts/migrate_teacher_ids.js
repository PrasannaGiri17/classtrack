/**
 * Migration Script: Backfill teacherId for existing Teacher documents
 *
 * Run with:  node backend/scripts/migrate_teacher_ids.js
 *
 * - Only updates teachers where teacherId is missing or empty
 * - Format: T-xxxxYY  (xxxx = 4-digit random, YY = year last 2 digits)
 * - Safe to run multiple times (idempotent)
 */

"use strict";

const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

// ─── DB Connection ────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || process.env.DB_URL || "mongodb://localhost:27017/schoolapp";

// ─── ID Generator ─────────────────────────────────────────────────────────────
const generateTeacherId = () => {
  const year = String(new Date().getFullYear()).slice(-2);
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `T-${rand}${year}`;
};

// ─── Collision-safe generator ─────────────────────────────────────────────────
const generateUniqueTeacherId = async (Teacher, usedSet) => {
  let candidate;
  let attempts = 0;
  do {
    candidate = generateTeacherId();
    const existsInDb = await Teacher.findOne({ teacherId: candidate }).lean();
    if (!existsInDb && !usedSet.has(candidate)) break;
    attempts++;
  } while (attempts < 50);

  if (attempts >= 50) throw new Error("Too many collisions generating teacherId.");
  usedSet.add(candidate);
  return candidate;
};

// ─── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB:", MONGO_URI);

  const Teacher = require("../models/teacherModel");

  // Find teachers with no teacherId (or empty string)
  const teachersToMigrate = await Teacher.find({
    $or: [
      { teacherId: { $exists: false } },
      { teacherId: null },
      { teacherId: "" },
    ],
  }).lean();

  console.log(`🔍 Found ${teachersToMigrate.length} teacher(s) without teacherId`);

  if (teachersToMigrate.length === 0) {
    console.log("✨ All teachers already have a teacherId. Nothing to do.");
    await mongoose.disconnect();
    return;
  }

  const usedSet = new Set();
  let updated = 0;
  let failed = 0;

  for (const teacher of teachersToMigrate) {
    try {
      const newId = await generateUniqueTeacherId(Teacher, usedSet);
      await Teacher.updateOne(
        { _id: teacher._id },
        { $set: { teacherId: newId } }
      );
      console.log(`  ✅ ${teacher.firstName} ${teacher.lastName} → ${newId}`);
      updated++;
    } catch (err) {
      console.error(`  ❌ Failed for teacher ${teacher._id}:`, err.message);
      failed++;
    }
  }

  console.log(`\n📊 Migration complete: ${updated} updated, ${failed} failed`);
  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB");
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
