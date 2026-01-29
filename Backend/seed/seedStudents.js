const mongoose = require("mongoose");
const Student = require("../models/studentModel");

const mongoURI =
  "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";

function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || "";
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : ""; // keeps "Sainz Jr"
  return { firstName, lastName };
}

async function run() {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");

    // ✅ Your real Grade IDs (you are using Grade as classId)
    const class1Id = new mongoose.Types.ObjectId("6976037edaf87c6831932739"); // Grade 1
    const class2Id = new mongoose.Types.ObjectId("69760388daf87c683193275d"); // Grade 2
    const class3Id = new mongoose.Types.ObjectId("697603badaf87c683193282e"); // Grade 3

    // Optional: clear old students
    await Student.deleteMany({});

    const f1FullNames = [
      "Pierre Gasly",
      "Franco Colapinto",
      "Fernando Alonso",
      "Lance Stroll",
      "Alexander Albon",
      "Carlos Sainz Jr",
      "Gabriel Bortoleto",
      "Nico Hulkenberg",
      "Sergio Perez",
      "Valtteri Bottas",
      "Charles Leclerc",
      "Lewis Hamilton",
      "Esteban Ocon",
      "Oliver Bearman",
      "Lando Norris",
      "Oscar Piastri",
      "Kimi Antonelli",
      "George Russell",
      "Liam Lawson",
      "Arvid Lindblad",
      "Max Verstappen",
      "Isack Hadjar",
    ];

    const addresses = ["Birkutitaul", "Kharibot", "Banasthali", "Kalimati", "Lazimpat"];

    const students = f1FullNames.map((fullName) => {
      const { firstName, lastName } = splitName(fullName);

      const studentClass = Math.floor(Math.random() * 3) + 1; // 1..3
      const classId = studentClass === 1 ? class1Id : studentClass === 2 ? class2Id : class3Id;

      // IMPORTANT: do NOT set email at all (avoid email:null duplicate issue)
      return {
        schoolId: 1,
        firstName,
        lastName,

        // email: (omit)
        phone: null,
        profilePhoto: null,

        birthdate: new Date(
          2017 + Math.floor(Math.random() * 4),
          Math.floor(Math.random() * 12),
          1 + Math.floor(Math.random() * 28)
        ),
        gender: ["male", "female"][Math.floor(Math.random() * 2)],

        parentName: `${fullName} Parent`,
        parentPhone: `98${Math.floor(50000000 + Math.random() * 50000000)}`,
        Address: addresses[Math.floor(Math.random() * addresses.length)],

        studentClass,
        flag: ["green", "yellow", "red"][Math.floor(Math.random() * 3)],

        classId,
        sectionId: null,
        rollNumber: 1 + Math.floor(Math.random() * 45),
        status: "active",
      };
    });

    const inserted = await Student.insertMany(students);
    console.log(`✅ Inserted students: ${inserted.length}`); // insertMany inserts multiple docs [web:3][web:4]

    await mongoose.disconnect();
    console.log("🎉 Done");
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

run();
