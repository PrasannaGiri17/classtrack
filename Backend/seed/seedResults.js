require("dotenv").config();
const mongoose = require("mongoose");
const Result = require("../models/Result");

const schoolId = 2;
const gradeId = "69be848b240908408563da82";
const sectionName = "A";

const students = [
  "69bebccdf90e172ec1ff2664",
  "69bebccef90e172ec1ff268e",
  "69bebcd2f90e172ec1ff26e9",
  "69bebcd5f90e172ec1ff2736",
  "69bebcd8f90e172ec1ff2798",
  "69bebcd9f90e172ec1ff279f",
  "69bebcdaf90e172ec1ff27c9",
  "69bebcdef90e172ec1ff282b",
  "69bebcdff90e172ec1ff2847",
  "69bebce1f90e172ec1ff2878"
];

const subjects = [
  "69be96374c8b4a0a9ba49a49", // computer
  "69beb9a189e85933d46e7910", // english
  "69be965a4c8b4a0a9ba49a77", // gk
  "69beb9a989e85933d46e7948", // math
  "69be962c4c8b4a0a9ba499ff", // nepali
  "69beb9b089e85933d46e7986", // science
  "69be96324c8b4a0a9ba49a21"  // social
];

const terms = ["First Mid Term", "First Term", "Second Mid Term", "Second Term"];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedResults() {
  try {
    const mongoUri = "mongodb://localhost:27017/school";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to Database");

    let count = 0;

    // Check if results exist already (Optional improvement)
    // await Result.deleteMany({ gradeId, sectionName, term: { $in: terms } });

    for (const studentId of students) {
      for (const term of terms) {
        
        const marks = subjects.map(subjectId => {
          return {
            subjectId: subjectId,
            theoryMarks: getRandomInt(40, 80),
            practicalMarks: getRandomInt(0, 20),
            remark: "Seeded"
          };
        });

        // Use create() to trigger pre-save hooks
        await Result.create({
          schoolId,
          studentId,
          gradeId,
          sectionName,
          term,
          marks,
          summary: {} // Pass empty summary as hook will generate it
        });

        count++;
        console.log(`Created result ${count}/40 for Student ${studentId} - Term: ${term}`);
      }
    }

    console.log("\n🎉 Seeding completed successfully. 40 documents created.");
    process.exit(0);

  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
}

seedResults();
