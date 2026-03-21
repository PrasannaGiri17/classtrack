const mongoose = require("mongoose");
const mongoURI = "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";

// Models
const Teacher = require("../models/teacherModel");
const User = require("../models/UserModal");

const schoolId = 2;

const teacherNames = [
  "Xabi Alonso", "Álvaro Arbeloa", "Carlo Ancelotti", "Zinedine Zidane", "Santiago Solari",
  "Julen Lopetegui", "Rafael Benítez", "José Mourinho", "Manuel Pellegrini", "Juande Ramos",
  "Bernd Schuster", "Fabio Capello", "Juan Ramón López Caro", "Vanderlei Luxemburgo",
  "Mariano García Remón", "José Antonio Camacho", "Carlos Queiroz", "Vicente del Bosque",
  "John Toshack", "Guus Hiddink", "Jupp Heynckes", "Arsenio Iglesias", "Jorge Valdano",
  "Benito Floro", "Radomir Antić"
];

const subjectIds = [
  "69be96374c8b4a0a9ba49a49", // Computer
  "69beb9a189e85933d46e7910", // English
  "69be965a4c8b4a0a9ba49a77", // GK
  "69beb9a989e85933d46e7948", // Math
  "69be962c4c8b4a0a9ba499ff", // Nepali
  "69beb9b089e85933d46e7986", // Science
  "69be96324c8b4a0a9ba49a21"  // Social
];

const gradeIds = {
  high: ["69be848b240908408563da80", "69be848b240908408563da83"], // 4, 5
  low: [
    "69be848c240908408563da85", // 1
    "69be848b240908408563da84", // 2
    "69be848b240908408563da82", // 3
    "69be848b240908408563da81"  // 6
  ]
};

const seed = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("DB Connected");

    // 1. Add Ronaldo (The specific teacher requested)
    const ronaldoData = {
      _id: "69beb580d3655f6c65c91682",
      schoolId: 2,
      firstName: "Ronaldo",
      lastName: ".",
      email: "giri.prasanna280@gmail.com",
      phone: "9800000000",
      birthdate: new Date("1995-01-01"),
      gender: "male",
      qualification: "Master in English",
      currentAddress: "portugal",
      assignedGrades: ["69be848b240908408563da83", "69be848b240908408563da80"],
      primarySubject: "69be965a4c8b4a0a9ba49a77"
    };

    // Clean existing
    await Teacher.deleteOne({ email: ronaldoData.email });
    await User.deleteOne({ email: ronaldoData.email });

    const ronaldo = new Teacher(ronaldoData);
    await ronaldo.save();
    
    const ronaldoUser = new User({
      schoolId: 2,
      email: ronaldoData.email,
      password: "password123",
      role: "teacher",
      teacherId: ronaldo._id
    });
    await ronaldoUser.save();
    console.log("Ronaldo seeded");

    // 2. Add the 25 Coaches
    for (let i = 0; i < teacherNames.length; i++) {
      const fullName = teacherNames[i];
      const nameParts = fullName.split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || ".";
      const email = `${firstName.toLowerCase()}.${i}@school2.com`;

      // Distribution: 70% in Grade 4/5
      const isHighProb = Math.random() < 0.7;
      const assignedGrades = isHighProb 
        ? [gradeIds.high[Math.floor(Math.random() * gradeIds.high.length)]]
        : [gradeIds.low[Math.floor(Math.random() * gradeIds.low.length)]];

      // Random subjects
      const primarySubject = subjectIds[Math.floor(Math.random() * subjectIds.length)];

      const teacher = new Teacher({
        schoolId: 2,
        firstName,
        lastName,
        email,
        phone: "981" + Math.floor(1000000 + Math.random() * 9000000),
        birthdate: new Date("1995-01-01"),
        gender: "male",
        qualification: "Master in English",
        currentAddress: "portugal",
        assignedGrades,
        primarySubject
      });

      await Teacher.deleteOne({ email });
      await User.deleteOne({ email });

      await teacher.save();

      const user = new User({
        schoolId: 2,
        email,
        password: "password123",
        role: "teacher",
        teacherId: teacher._id
      });
      await user.save();
      console.log(`Seeded ${fullName}`);
    }

    console.log("All teachers seeded successfully");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
};

seed();
