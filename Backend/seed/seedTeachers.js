// seed/seedTeachers.js - FULL CODE with Real Madrid players
const mongoose = require("mongoose");
const Teacher = require("../models/teacherModel");
const User = require("../models/UserModal");

const mongoURI = "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");

    // 🔥 GRADE 1,2,3 ObjectIds - REPLACE WITH YOUR ACTUAL IDs FROM DB!
    const grade1Id = new mongoose.Types.ObjectId("6976037edaf87c6831932739"); // Grade 1
    const grade2Id = new mongoose.Types.ObjectId("69760388daf87c683193275d"); // Grade 2  
    const grade3Id = new mongoose.Types.ObjectId("697603badaf87c683193282e"); // Grade 3

    // 📚 SUBJECT ObjectIds - REPLACE WITH YOUR ACTUAL IDs!
    const subjects = {
      "General Knowledge": new mongoose.Types.ObjectId("69772b47e3a5b52a3eb77b6b"),
      "Moral Values": new mongoose.Types.ObjectId("69772b13e3a5b52a3eb779f0"),
      "Science": new mongoose.Types.ObjectId("69772c47e3a5b52a3eb77c00"),
      "English": new mongoose.Types.ObjectId("69772d47e3a5b52a3eb77d00"),
      "Nepali": new mongoose.Types.ObjectId("69772e47e3a5b52a3eb77e00"),
      "Computer": new mongoose.Types.ObjectId("69772f47e3a5b52a3eb77f00"),
      "Math": new mongoose.Types.ObjectId("69773047e3a5b52a3eb78000"),
      "Social Studies": new mongoose.Types.ObjectId("69773147e3a5b52a3eb78100"),
    };

    const subjectNames = Object.keys(subjects);
    const grades = [grade1Id, grade2Id, grade3Id];

    // 🎲 Random grade combinations: [], [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]
    function getRandomGrades() {
      const combos = [[], [0], [1], [2], [0,1], [0,2], [1,2], [0,1,2]];
      const randomCombo = combos[Math.floor(Math.random() * combos.length)];
      return randomCombo.map(idx => grades[idx]);
    }

    // 🧹 Clear old data
    await Teacher.deleteMany({});
    await User.deleteMany({ role: "teacher" });

    const teachers = [];

    // ⚽️ REAL MADRID PLAYERS
    const realMadridPlayers = [
      "Vinicius", "Rodrygo", "Mbappe", "Bellingham", "Modric",
      "Valverde", "Camavinga", "Rüdiger", "Alaba", "Lunin"
    ];

    for (let i = 0; i < 10; i++) {
      const firstName = realMadridPlayers[i];
      const lastName = ["Junior", "Dias", "Silva", "Perez", "Fernandez"][Math.floor(Math.random() * 5)];
      
      // 📖 Random subjects
      const primaryIdx = Math.floor(Math.random() * subjectNames.length);
      const primarySubject = subjects[subjectNames[primaryIdx]];
      
      // 50% chance for secondary subject (different from primary)
      let secondarySubject = null;
      if (Math.random() > 0.5) {
        let secondaryIdx;
        do {
          secondaryIdx = Math.floor(Math.random() * subjectNames.length);
        } while (secondaryIdx === primaryIdx);
        secondarySubject = subjects[subjectNames[secondaryIdx]];
      }

      const teacher = {
        schoolId: 1,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@realmadrid-school.com`,
        phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
        birthdate: new Date(1990 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
        gender: "male",
        qualification: `Master in ${subjectNames[primaryIdx]}`,
        currentAddress: ["Madrid", "Valencia", "Barcelona", "Sevilla", "Bilbao"][Math.floor(Math.random() * 5)],
        assignedGrades: getRandomGrades(),
        assignedSections: [],
        primarySubject,
        secondarySubject,
      };

      teachers.push(teacher);
    }

    const insertedTeachers = await Teacher.insertMany(teachers);
    console.log("✅ 10 Real Madrid Teachers inserted:");

    insertedTeachers.forEach((t, i) => {
      const gradesText = t.assignedGrades.length === 0 ? "None" : 
                        t.assignedGrades.length === 1 ? `${t.assignedGrades.length} Grade` : 
                        `${t.assignedGrades.length} Grades`;
      
      const primaryName = subjectNames[Object.values(subjects).indexOf(t.primarySubject.toString())];
      const secondaryName = t.secondarySubject ? 
        subjectNames[Object.values(subjects).indexOf(t.secondarySubject.toString())] : 'None';
      
      console.log(`${i+1}. ${t.firstName} ${t.lastName}`);
      console.log(`   📧 ${t.email}`);
      console.log(`   📚 Grades: ${gradesText} | Primary: ${primaryName} | Secondary: ${secondaryName}`);
      console.log(`   📞 ${t.phone} | 🎂 ${t.birthdate.getFullYear()}`);
      console.log("");
    });

    // 👤 Create User accounts
    const userDocs = insertedTeachers.map(t => ({
      email: t.email,
      password: "Madrid@2026",   // hashed automatically
      role: "teacher",
      teacherId: t._id,
      mustChangePassword: true,
    }));

    await User.insertMany(userDocs);
    console.log("✅ 10 User accounts created");

    await mongoose.disconnect();
    console.log("🎉 Seeding complete! Check your MongoDB Atlas.");

  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

run();
