require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const { calculateAndSaveFlags } = require("../services/flagService");

const schoolId = 2;

async function run() {
  try {
    const mongoUri = "mongodb://localhost:27017/school";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to Database");

    console.log(`🚀 Starting flag calculation for school ${schoolId}...`);
    const summary = await calculateAndSaveFlags(schoolId);
    console.log("✅ Calculation completed:", summary);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

run();
