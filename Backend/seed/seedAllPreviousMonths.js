// require("dotenv").config();
// const mongoose = require("mongoose");
// const ClassroomAttendance = require("../models/ClassroomAttendance");

// const MONTHS = [
//   "Baisakh", "Jestha", "Ashad", "Shrawan", "Bhadra",
//   "Ashwin", "Kartik", "Mangsir", "Poush", "Magh",
//   "Falgun", "Chaitra"
// ];

// // Weighted random status generator
// function getRandomStatus() {
//   // P (Present): 70%, A (Absent): 15%, L (Late): 10%, null: 5%
//   const weighted = ["P","P","P","P","P","P","P","A","A","L"];
//   return weighted[Math.floor(Math.random() * weighted.length)];
// }

// async function seedAllPreviousMonths() {
//   try {
//     const mongoUri = process.env.MONGO_URI || "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";
//     console.log("Connecting to Mongo...");
//     await mongoose.connect(mongoUri);
//     console.log("✅ Connected to Database");

//     // 1️⃣ Find ALL Falgun records (for all sections that have attendance)
//     const falgunRecords = await ClassroomAttendance.find({ month: "Falgun" });

//     if (!falgunRecords || falgunRecords.length === 0) {
//       console.log("❌ No Falgun records found to use as templates.");
//       return;
//     }

//     console.log(`Found ${falgunRecords.length} section(s) with Falgun data. Starting seeding...`);

//     const falgunIndex = MONTHS.indexOf("Falgun");
//     const previousMonths = MONTHS.slice(0, falgunIndex); // All months before Falgun

//     for (const month of previousMonths) {
//       console.log(`\n📅 Seeding month: ${month}...`);
      
//       for (const falgunRecord of falgunRecords) {
//         // 2️⃣ Check if already exists for this section and month
//         const exists = await ClassroomAttendance.findOne({
//           sectionId: falgunRecord.sectionId,
//           year: falgunRecord.year,
//           month: month
//         });

//         if (exists) {
//           console.log(`  ⚠️ ${month} already exists for section ${falgunRecord.sectionId}. Skipping...`);
//           continue;
//         }

//         // 3️⃣ Generate attendance for each student
//         const newAttendanceData = falgunRecord.attendanceData.map(student => {
//           const dailyStatus = {};
//           // Generate 30 days of data
//           for (let day = 1; day <= 30; day++) {
//             dailyStatus[day.toString()] = getRandomStatus();
//           }

//           return {
//             studentId: student.studentId,
//             dailyStatus: dailyStatus
//           };
//         });

//         // 4️⃣ Create new record
//         const newRecord = new ClassroomAttendance({
//           schoolId: falgunRecord.schoolId,
//           gradeId: falgunRecord.gradeId,
//           sectionId: falgunRecord.sectionId,
//           teacherId: falgunRecord.teacherId,
//           year: falgunRecord.year,
//           month: month,
//           attendanceData: newAttendanceData
//         });

//         await newRecord.save();
//         console.log(`  ✅ ${month} attendance seeded for section ${falgunRecord.sectionId}`);
//       }
//     }

//     console.log("\n🎉 All previous months successfully seeded!");
//     process.exit(0);
//   } catch (error) {
//     console.error("❌ Seeding Error:", error);
//     process.exit(1);
//   }
// }

// seedAllPreviousMonths();