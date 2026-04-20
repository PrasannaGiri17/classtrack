require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const Result = require("../models/Result");
const Student = require("../models/studentModel");

const schoolId = 2;
const gradeId = "69be848b240908408563da83"; 
const sectionName = "A";

const subjects = [
  "69be96374c8b4a0a9ba49a49", // computer
  "69beb9a189e85933d46e7910", // english
  "69be965a4c8b4a0a9ba49a77", // gk
  "69beb9a989e85933d46e7948", // math
  "69be962c4c8b4a0a9ba499ff", // nepali
  "69beb9b089e85933d46e7986", // science
  "69be96324c8b4a0a9ba49a21"  // social
];

const terms = ["First Mid Term", "First Term"];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedResults() {
  try {
    const mongoUri = "mongodb://localhost:27017/school";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to Database (Local)");

    // 1. Resolve Grade details: find sectionId and dynamic subjects
    const { Grade } = require("../models/School");
    const grade = await Grade.findById(gradeId);
    if (!grade) {
       console.error(`❌ Grade document not found for ID: ${gradeId}`);
       process.exit(1);
    }
    const section = grade.sections.find(s => s.sectionName === sectionName);
    if (!section) {
       console.error(`❌ Section ${sectionName} not found in this grade.`);
       process.exit(1);
    }
    const sectionId = section._id;
    const gradeSubjects = grade.subjects.map(s => s.subjectId);

    console.log(`✅ Targeted Grade: ${grade.gradeName || grade.gradeNumber} (ID: ${gradeId})`);
    console.log(`📍 Targeted Section: A (ID: ${sectionId})`);

    // 2. Get ALL students for this grade and section
    const students = await Student.find({ schoolId, classId: gradeId, sectionId });
    if (students.length === 0) {
        console.log("No students found for this grade and section.");
        process.exit(0);
    }

    let count = 0;

    for (const student of students) {
      for (const term of terms) {
        
        const marks = gradeSubjects.map(subjectId => {
          return {
            subjectId: subjectId,
            theoryMarks: getRandomInt(40, 75),
            practicalMarks: getRandomInt(10, 25),
            remark: "Seeded"
          };
        });

        // Use upsert or find and update to trigger hooks
        let result = await Result.findOne({
            schoolId,
            studentId: student._id,
            gradeId,
            sectionName,
            term
        });

        if (result) {
            result.marks = marks;
            result.summary = {};
            await result.save();
        } else {
            await Result.create({
                schoolId,
                studentId: student._id,
                gradeId,
                sectionName,
                term,
                marks,
                summary: {}
            });
        }

        count++;
        console.log(`[${count}] Processed student ${student.firstName} - Term: ${term}`);
      }
    }

    console.log(`\n🎉 Seeding completed successfully. ${count} documents processed.`);
    process.exit(0);

  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
}

seedResults();
