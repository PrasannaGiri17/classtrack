const mongoose = require("mongoose");
const mongoURI = "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";

// Models
const Routine = require("../models/Routine");

const schools = [2, 3];
const grades = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const standardSlots = [
  { id: "slot1", type: "subject", label: "Normal Class 1", durationMinutes: 45 },
  { id: "slot2", type: "subject", label: "Normal Class 2", durationMinutes: 45 },
  { id: "slot3", type: "break", label: "Short Break", durationMinutes: 15, breakType: "Short" },
  { id: "slot4", type: "subject", label: "Normal Class 3", durationMinutes: 45 },
  { id: "slot5", type: "break", label: "Lunch Break", durationMinutes: 45, breakType: "Lunch" },
  { id: "slot6", type: "subject", label: "Normal Class 4", durationMinutes: 45 },
  { id: "slot7", type: "subject", label: "Normal Class 5", durationMinutes: 45 },
  { id: "slot8", type: "sport", label: "ECA", durationMinutes: 45 },
  { id: "slot9", type: "subject", label: "Normal Class 6", durationMinutes: 45 }
];

const seedRoutines = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("DB Connected");

    for (const schoolId of schools) {
      for (const gradeNumber of grades) {
        const existing = await Routine.findOne({ schoolId, gradeNumber });
        if (!existing) {
          const routine = new Routine({
            schoolId,
            gradeNumber,
            slots: standardSlots,
            isLocked: false,
            updatedAt: new Date()
          });
          await routine.save();
          console.log(`Created routine for School ${schoolId} Grade ${gradeNumber}`);
        } else {
          console.log(`Routine already exists for School ${schoolId} Grade ${gradeNumber}`);
        }
      }
    }

    console.log("Routines seeded successfully");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
};

seedRoutines();
