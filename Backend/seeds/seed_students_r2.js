const mongoose = require("mongoose");
const mongoURI = "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";

// Models
const Student = require("../models/studentModel");
const User = require("../models/UserModal");

const schoolId = 2;

const studentNames = [
  "Kylian Mbappé", "Jude Bellingham", "Vinícius Júnior", "Rodrygo", "Federico Valverde",
  "Eduardo Camavinga", "Aurélien Tchouaméni", "Luka Modrić", "Toni Kroos", "Dani Carvajal",
  "Ferland Mendy", "Antonio Rüdiger", "Éder Militão", "David Alaba", "Thibaut Courtois",
  "Andriy Lunin", "Lucas Vázquez", "Fran García", "Arda Güler", "Brahim Díaz",
  "Karim Benzema", "Cristiano Ronaldo", "Gareth Bale", "Sergio Ramos", "Marcelo",
  "Casemiro", "Isco", "Keylor Navas", "Pepe", "Ángel Di María",
  "Mesut Özil", "Xabi Alonso", "Kaká", "Iker Casillas", "Raúl",
  "Roberto Carlos", "Zinedine Zidane", "Ronaldo Nazário", "Luis Figo", "David Beckham",
  "Claude Makélélé", "Fernando Hierro", "Davor Šuker", "Clarence Seedorf", "Predrag Mijatović",
  "Iván Zamorano", "Fernando Redondo", "Michael Laudrup", "Emilio Butragueño", "Hugo Sánchez",
  "Manuel Sanchís", "Michel", "Bernd Schuster", "Jorge Valdano", "Uli Stielike",
  "Santillana", "Amancio Amaro", "Pirri", "Paco Gento", "Ferenc Puskás",
  "Alfredo Di Stéfano", "Raymond Kopa", "Francisco Gento", "José Santamaría", "Héctor Rial",
  "Miguel Muñoz", "Luis Molowny", "Enrique Mateos", "Marquitos", "Rafael Lesmes",
  "Juanito", "Ricardo Zamora", "Jacinto Quincoces", "Santiago Bernabéu", "Luis Regueiro",
  "Hilario Marrero", "José Samitier", "Manuel Olivares", "Gaspar Rubio", "Jaime Lazcano"
];

const gradeMapping = {
  high: [
    { num: 4, id: "69be848b240908408563da80" },
    { num: 5, id: "69be848b240908408563da83" }
  ],
  low: [
    { num: 1, id: "69be848c240908408563da85" },
    { num: 2, id: "69be848b240908408563da84" },
    { num: 3, id: "69be848b240908408563da82" }
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
      const lastName = nameParts.slice(1).join(" ") || ".";
      const email = `${firstName.toLowerCase().replace(/[^a-z]/g, "")}.${i}@student2.com`;

      // Distribution: 70% in Grade 4/5
      const isHighProb = Math.random() < 0.7;
      const grade = isHighProb 
        ? gradeMapping.high[Math.floor(Math.random() * gradeMapping.high.length)]
        : gradeMapping.low[Math.floor(Math.random() * gradeMapping.low.length)];

      const student = new Student({
        schoolId: 2,
        firstName,
        lastName,
        email,
        phone: "980" + Math.floor(1000000 + Math.random() * 9000000),
        birthdate: new Date("2015-01-01"),
        gender: "male",
        fatherName: "Parent X",
        motherName: "Parent Y",
        fatherPhone: "9800000000",
        motherPhone: "9810000000",
        Address: "Madrid",
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
        schoolId: 2,
        email,
        password: "password123",
        role: "student",
        studentId: student._id
      });
      await user.save();
      console.log(`Seeded student: ${fullName}`);
    }

    console.log("80 students seeded successfully");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
};

seed();
