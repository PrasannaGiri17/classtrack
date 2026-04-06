require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const Result = require("../models/Result");

const schoolId = 2;
const gradeId = "69be848b240908408563da82"; // User provided ID
const sectionName = "A";
const terms = ["First Mid Term", "First Term", "Second Mid Term", "Second Term"];

async function removeResults() {
  try {
    const mongoUri = "mongodb://localhost:27017/school";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to Database");

    const deleteCount = await Result.deleteMany({
      schoolId,
      gradeId,
      sectionName,
      term: { $in: terms }
    });

    console.log(`\n🗑️ Successfully deleted ${deleteCount.deletedCount} results matching the criteria.`);
    
    // Also check for the ID ending in ...80 (which I found earlier) just in case
    const alternativeGradeId = "69be848b240908408563da80";
    if (gradeId !== alternativeGradeId) {
        const confirmDelete = await Result.deleteMany({
            schoolId,
            gradeId: alternativeGradeId,
            sectionName,
            term: { $in: terms }
        });
        if (confirmDelete.deletedCount > 0) {
            console.log(`🗑️ Also deleted ${confirmDelete.deletedCount} results for gradeId ${alternativeGradeId}.`);
        }
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error removing results:", error);
    process.exit(1);
  }
}

removeResults();
