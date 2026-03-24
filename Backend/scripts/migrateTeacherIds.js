const mongoose = require('mongoose');
const Teacher = require('../models/teacherModel');

const generateTeacherId = () => {
  const year = String(new Date().getFullYear()).slice(-2);
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `T-${rand}${year}`;
};

const migrateTeacherIds = async () => {
  try {
    require('dotenv').config({ path: __dirname + '/../.env' });
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Starting TeacherCode migration... connected to DB");
    
    // First, literally rename the DB field from "teacherId" to "teacherCode", overwriting the legacy TCH- code
    console.log("Renaming teacherId to teacherCode across all documents...");
    const renameResult = await mongoose.connection.collection('teachers').updateMany(
      { teacherId: { $exists: true } },
      { $rename: { "teacherId": "teacherCode" } }
    );
    console.log(`Renamed field on ${renameResult.modifiedCount} documents.`);

    // Find teachers who don't have a teacherCode or have an empty string
    const teachersMissingCode = await Teacher.find({
      $or: [
        { teacherCode: { $exists: false } },
        { teacherCode: null },
        { teacherCode: "" },
        // Also catch legacy strings that don't match the new rule T-xxxxYY
        { teacherCode: { $not: /^T-\d{4}\d{2}$/ } }
      ]
    });

    console.log(`Found ${teachersMissingCode.length} teachers requiring migration to new teacherCode.`);

    let migratedCount = 0;

    for (const teacher of teachersMissingCode) {
      let candidate;
      let isUnique = false;
      let attempts = 0;

      // Generate a unique teacherCode
      while (!isUnique && attempts < 10) {
        candidate = generateTeacherId();
        const existing = await Teacher.findOne({ teacherCode: candidate }).lean();
        if (!existing) {
          isUnique = true;
        }
        attempts++;
      }

      if (isUnique) {
        teacher.teacherCode = candidate;
        // Turn off validation if necessary or let Mongoose validate normally
        await teacher.save({ validateBeforeSave: false }); // Skip other potentially failing validations if legacy docs are dirty
        console.log(`Migrated teacher ${teacher._id} -> ${candidate}`);
        migratedCount++;
      } else {
        console.error(`Failed to generate unique ID for teacher ${teacher._id} after 10 attempts.`);
      }
    }

    console.log(`Migration complete. Successfully migrated ${migratedCount} teachers.`);
  } catch (error) {
    console.error("Migration failed:", error);
  }
};

module.exports = migrateTeacherIds;

if (require.main === module) {
  migrateTeacherIds().then(() => {
    mongoose.disconnect();
    process.exit(0);
  });
}
