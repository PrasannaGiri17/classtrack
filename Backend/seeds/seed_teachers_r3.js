const mongoose = require("mongoose");
const mongoURI = "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";

// Models
const Teacher = require("../models/teacherModel");
const User = require("../models/UserModal");

const schoolId = 3;

const teacherNames = [
  "Hansi Flick", "Xavi", "Ronald Koeman", "Quique Setién", "Ernesto Valverde",
  "Luis Enrique", "Gerardo Martino", "Tito Vilanova", "Pep Guardiola", "Frank Rijkaard",
  "Radomir Antić", "Lorenzo Serra Ferrer", "Louis van Gaal", "Carles Rexach", "Llorenç Serra Ferrer",
  "Bobby Robson", "Johan Cruyff", "Terry Venables", "César Luis Menotti", "Udo Lattek",
  "Rinus Michels", "Vic Buckingham", "Helenio Herrera", "Enrique Fernández", "Jack Greenwell"
];

const subjectIds = [
  "69bebf8f1dc07b8fee147fd1", // Computer
  "69be96004c8b4a0a9ba49984", // English
  "69be958e4c8b4a0a9ba498e4", // Math
  "69bebf961dc07b8fee14802e", // Nepali
  "69be95f54c8b4a0a9ba49948", // Science
  "69bebf8a1dc07b8fee147f7e"  // Social
];

const gradeIds = {
  high: ["69bb9e4f240908408563b316", "69bb9e4f240908408563b312"], // 1, 2
  low: ["69bb9e4f240908408563b317", "69bb9e4f240908408563b318"] // 3, 4
};

const seed = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("DB Connected");

    for (let i = 0; i < teacherNames.length; i++) {
      const fullName = teacherNames[i];
      const nameParts = fullName.split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || "Coach";
      const email = `${firstName.toLowerCase().replace(/[^a-z]/g, "")}.${i}@faculty3.com`;

      // Distribution: 70% in Grade 1/2
      const isHighProb = Math.random() < 0.7;
      const assignedGrades = isHighProb 
        ? [gradeIds.high[Math.floor(Math.random() * gradeIds.high.length)]]
        : [gradeIds.low[Math.floor(Math.random() * gradeIds.low.length)]];

      // Random primary subject
      const primarySubject = subjectIds[Math.floor(Math.random() * subjectIds.length)];

      const teacher = new Teacher({
        schoolId: 3,
        firstName,
        lastName,
        email,
        phone: "982" + Math.floor(1000000 + Math.random() * 9000000),
        birthdate: new Date("1980-01-01"),
        gender: "male",
        qualification: "UEFA Pro License",
        currentAddress: "Barcelona",
        assignedGrades,
        primarySubject
      });

      // Clean existing
      await Teacher.deleteOne({ email });
      await User.deleteOne({ email });

      await teacher.save();

      const user = new User({
        schoolId: 3,
        email,
        password: "password123",
        role: "teacher",
        teacherId: teacher._id
      });
      await user.save();
      console.log(`Seeded teacher: ${fullName}`);
    }

    console.log("25 teachers seeded successfully for school 3");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
};

seed();
