const mongoose = require("mongoose");
const mongoURI = "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";

// Models
const Student = require("../models/studentModel");
const User = require("../models/UserModal");

const schoolId = 3;

const studentNames = [
  "Robert Lewandowski", "Pedri", "Gavi", "Frenkie de Jong", "Ilkay Gündogan",
  "Raphinha", "Lamine Yamal", "João Félix", "João Cancelo", "Ronald Araújo",
  "Jules Koundé", "Andreas Christensen", "Marc-André ter Stegen", "Alejandro Balde", "Ferran Torres",
  "Ansu Fati", "Sergi Roberto", "Oriol Romeu", "Iñigo Martínez", "Vitor Roque",
  "Lionel Messi", "Luis Suárez", "Neymar", "Xavi Hernández", "Andrés Iniesta",
  "Sergio Busquets", "Gerard Piqué", "Carles Puyol", "Dani Alves", "Jordi Alba",
  "Samuel Eto'o", "Ronaldinho", "Rivaldo", "Patrick Kluivert", "Deco",
  "Victor Valdés", "Thierry Henry", "Zlatan Ibrahimović", "David Villa", "Alexis Sánchez",
  "Pedro Rodríguez", "Javier Mascherano", "Yaya Touré", "Seydou Keita", "Eric Abidal",
  "Rafael Márquez", "Giovanni van Bronckhorst", "Edgar Davids", "Frank de Boer", "Ronald Koeman",
  "Hristo Stoichkov", "Romário", "Michael Laudrup", "Pep Guardiola", "Luis Enrique",
  "Guillermo Amor", "Txiki Begiristain", "Andoni Zubizarreta", "Johan Cruyff", "Diego Maradona",
  "Ladislao Kubala", "César Rodríguez", "Luis Suárez Miramontes", "José Samitier", "Paulino Alcántara",
  "Ricardo Zamora", "Antoni Ramallets", "Estanislao Basora", "Eulogio Martínez", "Justo Tejada",
  "Carles Rexach", "Quini", "Bernd Schuster", "Gary Lineker", "Hansi Krankl",
  "Allan Simonsen", "Juan Manuel Asensi", "Migueli", "Josep Maria Fusté", "Alonso"
];

const gradeMapping = {
  high: [
    { num: 1, id: "69bb9e4f240908408563b316" },
    { num: 2, id: "69bb9e4f240908408563b312" },
    { num: 3, id: "69bb9e4f240908408563b317" }
  ],
  low: [
    { num: 4, id: "69bb9e4f240908408563b318" }
  ]
};

const seed = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("DB Connected");

    for (let i = 0; i < studentNames.length; i++) {
      const fullName = studentNames[i];
      const nameParts = fullName.split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || "II";
      const email = `${firstName.toLowerCase().replace(/[^a-z]/g, "")}.${i}@student3.com`;

      // Distribution: 85% in Grades 1-3
      const isLowProb = Math.random() < 0.15;
      const grade = isLowProb 
        ? gradeMapping.low[0] // 15% in Grade 4
        : gradeMapping.high[Math.floor(Math.random() * gradeMapping.high.length)]; // 85% in Grade 1, 2, 3

      const student = new Student({
        schoolId: 3,
        firstName,
        lastName,
        email,
        phone: "982" + Math.floor(1000000 + Math.random() * 9000000),
        birthdate: new Date("2016-01-01"),
        gender: "male",
        fatherName: "La Masia",
        motherName: "Barcelona",
        fatherPhone: "9820000000",
        motherPhone: "9821000000",
        Address: "Camp Nou",
        studentClass: grade.num,
        classId: grade.id,
        status: "active",
        flag: "green"
      });

      // Clean existing
      await Student.deleteOne({ email });
      await User.deleteOne({ email });

      await student.save();

      const user = new User({
        schoolId: 3,
        email,
        password: "password123",
        role: "student",
        studentId: student._id
      });
      await user.save();
      console.log(`Seeded student: ${fullName}`);
    }

    console.log("80 students seeded successfully for school 3");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
};

seed();
