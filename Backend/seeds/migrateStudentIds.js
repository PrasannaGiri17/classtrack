const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env

const Student = require('../models/studentModel');

const MONGODB_URI = process.env.MONGO_URI;

async function migrateStudentIds() {
  if (!MONGODB_URI) {
    console.error("Error: MONGO_URI is not defined in the environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const students = await Student.find({});
    console.log(`Fetched ${students.length} students for migration.`);

    // Track assigned IDs during this session to guarantee uniqueness
    const assignedIds = new Set();
    const currentYear = new Date().getFullYear();
    const yearLastTwoDigits = currentYear.toString().slice(-2);

    for (const student of students) {
      const oldId = student.studentId;
      
      let isUnique = false;
      let newId;

      while (!isUnique) {
        // Generate random 4 digits followed by year suffix (e.g., 482626)
        const randomFourDigits = Math.floor(1000 + Math.random() * 9000);
        newId = `${randomFourDigits}${yearLastTwoDigits}`;

        // Check our set of freshly assigned IDs
        if (!assignedIds.has(newId)) {
          // Check DB just to be absolutely sure no other existing records hold this ID yet
          const existing = await Student.findOne({ studentId: newId });
          if (!existing) {
            isUnique = true;
          }
        }
      }

      // Assign the new valid unique ID
      student.studentId = newId;
      assignedIds.add(newId);

      // Save the updated student
      await student.save();
      
      // Log the change
      console.log(`${oldId} -> ${newId} (${student.firstName} ${student.lastName})`);
    }

    console.log("Migration completed successfully. All students reassigned to the new ID format.");
  } catch (error) {
    console.error("Migration failed due to an error:", error);
  } finally {
    try {
      await mongoose.disconnect();
      console.log("Disconnected cleanly from MongoDB.");
    } catch (disconnectError) {
      console.error("Failed to disconnect cleanly:", disconnectError);
    }
  }
}

migrateStudentIds();
