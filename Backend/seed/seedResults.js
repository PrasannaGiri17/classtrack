const mongoose = require("mongoose");
const Result = require("../models/Result"); // <-- change if your filename/path is different

const mongoURI =
  "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";

// ✅ Grade IDs (from your earlier Grade screenshot)
const grade1Id = new mongoose.Types.ObjectId("6976037edaf87c6831932739"); // Grade 1
const grade2Id = new mongoose.Types.ObjectId("69760388daf87c683193275d"); // Grade 2
const grade3Id = new mongoose.Types.ObjectId("697603badaf87c683193282e"); // Grade 3

// ✅ Student _ids (from your Student screenshot / Compass)
// I can clearly read these two from your screenshot:
const studentIds = [
  new mongoose.Types.ObjectId("6978a599a9a364c1041ec977"), // Pierre Gasly
  new mongoose.Types.ObjectId("6978a599a9a364c1041ec979"), // Fernando Alonso
  // add the rest from Compass here...
];

// ✅ Subject _ids (from your pasted Subjects collection list)
const SUBJECTS_FOR_RESULT = [
  new mongoose.Types.ObjectId("69772b43e3a5b52a3eb77afe"), // Computer
  new mongoose.Types.ObjectId("69772b47e3a5b52a3eb77b6b"), // Math
  new mongoose.Types.ObjectId("69772b55e3a5b52a3eb77be2"), // Social Studies
  new mongoose.Types.ObjectId("69772c80e3a5b52a3eb77f47"), // Moral Values
  new mongoose.Types.ObjectId("697731a0e3a5b52a3eb78b03"), // General Knowledge
];

// If you also have Science/English/Nepali in subjects collection, add them here too.

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildMarks(term) {
  const isMid = term === "MID-TERM 1";

  return SUBJECTS_FOR_RESULT.map((subjectId) => ({
    subjectId,
    theoryMarks: isMid ? rand(10, 40) : rand(30, 85),
    practicalMarks: rand(0, 20),
  }));
}

async function run() {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");

    // optional cleanup: only delete these terms
    await Result.deleteMany({ term: { $in: ["MID-TERM 1", "TERM 1"] } });

    const terms = ["MID-TERM 1", "TERM 1"];

    for (const studentId of studentIds) {
      for (const term of terms) {
        await Result.create({
          studentId,
          gradeId: grade3Id,     // <--- UPDATED: Using Grade 3 ID for Pierre Gasly & friends
          sectionName: "A",      
          term,                 
          marks: buildMarks(term),
          summary: {},          
        });
      }
    }

    console.log(`✅ Seeded results for ${studentIds.length} students (MID-TERM 1 + TERM 1)`);
    await mongoose.disconnect();
    console.log("Done");
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

run();
