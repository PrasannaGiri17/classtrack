require("dotenv").config();
const mongoose = require("mongoose");
const Diary = require("../models/diary");

const teacherIds = [
  "69784ae83c186fef3cb4215e",
  "69784ae83c186fef3cb4215d",
  "69784ae83c186fef3cb4215f",
  "69784ae83c186fef3cb42160",
  "69784ae83c186fef3cb42161",
  "69784ae83c186fef3cb42162"
];

const className = "Grade 1 Section A";
const subjects = [
  "English",
  "Mathematics",
  "Science",
  "Nepali",
  "Social Studies",
  "Computer Studies"
];

const periodSuffix = "1772254265595";

const dates = [
  { day: "WEDNESDAY", date: "2026-03-03T18:15:00.000Z" },
  { day: "THURSDAY", date: "2026-03-04T18:15:00.000Z" },
  { day: "FRIDAY", date: "2026-03-05T18:15:00.000Z" }
];

const activities = {
  "English": ["Reading aloud: The alphabet story", "Practiced spelling vowel sounds", "Poem recitation"],
  "Mathematics": ["Addition with numbers 1-20", "Counting back from 50", "Shapes and patterns worksheet"],
  "Science": ["Introduction to living things", "Parts of a plant discussion", "Five senses coloring activity"],
  "Nepali": ["Writing Ka, Kha, Ga", "Nepali nursery rhyme session", "Vocabulary about fruits"],
  "Social Studies": ["My family and home", "School rules discussion", "Helping others in class"],
  "Computer Studies": ["Identifying computer parts", "Drawing basics in Paint", "Typing first letter of names"]
};

const homework = {
  "English": ["Read Chapter 2", "Write 10 spelling words", "Complete worksheet page 5"],
  "Mathematics": ["Solve sums 1-5", "Count objects at home", "Practice writing numbers 20-30"],
  "Science": ["Draw a flower", "List 5 living things", "Color the Sense-Organs sheet"],
  "Nepali": ["Write Ka-Ga 5 times", "Memorize the first verse", "Draw a fruit and name it"],
  "Social Studies": ["Paste family photo", "List 3 rules", "Write one good deed"],
  "Computer Studies": ["Identify 3 parts", "Color the mouse", "Learn the power button position"]
};

async function seedDiary() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";
    console.log("Connecting to Mongo...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to Database");

    const documents = [];
    for (const dateObj of dates) {
      const dateIndex = dates.indexOf(dateObj);
      for (let i = 0; i < 6; i++) {
        const subject = subjects[i];
        const teacherId = teacherIds[i]; // Distribute 6 teachers across 6 subjects
        const periodId = `${dateObj.day}-${i + 1}-A-${periodSuffix}`;
        
        documents.push({
          teacherId: new mongoose.Types.ObjectId(teacherId),
          date: new Date(dateObj.date),
          periodId: periodId,
          activity: activities[subject][dateIndex],
          className: className,
          homework: homework[subject][dateIndex],
          subject: subject
        });
      }
    }

    console.log(`Seeding ${documents.length} records...`);
    
    for (const doc of documents) {
      await Diary.findOneAndUpdate(
        { teacherId: doc.teacherId, periodId: doc.periodId, date: doc.date },
        doc,
        { upsert: true, new: true }
      );
    }

    console.log("✅ Diary seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
}

seedDiary();
