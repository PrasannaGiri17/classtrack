const mongoose = require("mongoose");
const connectDB = require("../database"); // Adjust path if necessary
const Student = require("../models/studentModel");

// Helper function to generate a 6-digit studentId
async function generateStudentId(model) {
  let isUnique = false;
  let newId;
  const currentYear = new Date().getFullYear();
  const yearLastTwoDigits = currentYear.toString().slice(-2);

  while (!isUnique) {
    const randomFourDigits = Math.floor(1000 + Math.random() * 9000);
    newId = `${yearLastTwoDigits}${randomFourDigits}`;

    // Check if it already exists
    const existingStudent = await model.findOne({ studentId: newId });
    if (!existingStudent) {
      isUnique = true;
    }
  }

  return newId;
}

const seedStudentIds = async () => {
  try {
    // Connect to DB
    await connectDB();
    console.log("Connected to DB, checking for students with missing studentId...");

    // Find all students where studentId is missing or null
    const studentsWithoutId = await Student.find({
      $or: [
        { studentId: { $exists: false } },
        { studentId: null },
        { studentId: "" }
      ]
    });

    console.log(`Found ${studentsWithoutId.length} students without a studentId.`);

    let updatedCount = 0;

    for (const student of studentsWithoutId) {
      // Generate new ID
      const newId = await generateStudentId(Student);
      
      // Update student
      student.studentId = newId;
      await student.save({ validateBeforeSave: false }); // skipping full validation in case other fields are missing
      
      console.log(`Updated student ${student.firstName} ${student.lastName} with ID: ${newId}`);
      updatedCount++;
    }

    console.log(`\nSeed Complete! Updated ${updatedCount} students.`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding student IDs:", error);
    process.exit(1);
  }
};

seedStudentIds();
