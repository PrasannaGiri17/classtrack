const mongoose = require("mongoose");
const mongoURI = "mongodb://localhost:27017/school";

const Student = require("../models/studentModel");
const User = require("../models/UserModal");

const schoolId = 4;

const gradeMapping = [
  { num: 8, id: "69ddc48c481d4da240118476" },
  { num: 9, id: "69ddc48c481d4da240118475" },
  { num: 10, id: "69ddc48c481d4da240118477" },
];

// 30 Bayern Munich current and past players (10 per grade)
const studentsByGrade = {
  8: [
    "Manuel Neuer",
    "Joshua Kimmich",
    "Leon Goretzka",
    "Leroy Sané",
    "Serge Gnabry",
    "Thomas Müller",
    "Kingsley Coman",
    "Alphonso Davies",
    "Dayot Upamecano",
    "Mathys Tel",
  ],
  9: [
    "Harry Kane",
    "Jamal Musiala",
    "Min-jae Kim",
    "Raphael Guerreiro",
    "Konrad Laimer",
    "Sven Ulreich",
    "Eric Dier",
    "Bryan Zaragoza",
    "Sacha Boey",
    "Thomas Tuchel",
  ],
  10: [
    "Robert Lewandowski",
    "Franck Ribéry",
    "Arjen Robben",
    "Oliver Kahn",
    "Lothar Matthäus",
    "Gerd Müller",
    "Franz Beckenbauer",
    "Uli Hoeneß",
    "Karl-Heinz Rummenigge",
    "Sepp Maier",
  ],
};

const seed = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("DB Connected");

    let count = 0;

    for (const grade of gradeMapping) {
      const names = studentsByGrade[grade.num];

      for (let i = 0; i < names.length; i++) {
        const fullName = names[i];
        const nameParts = fullName.split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ") || ".";
        const email = `${firstName.toLowerCase().replace(/[^a-z]/g, "")}.g${grade.num}.${i}@student.com`;

        const student = new Student({
          schoolId,
          firstName,
          lastName,
          email,
          phone: "980" + Math.floor(1000000 + Math.random() * 9000000),
          birthdate: new Date("2008-01-01"),
          gender: "male",
          fatherName: "Parent Bayern",
          motherName: "Parent FC",
          fatherPhone: "9800000000",
          motherPhone: "9810000000",
          Address: "Munich, Germany",
          studentClass: grade.num,
          classId: grade.id,
          status: "active",
          flag: "green",
        });

        // Remove duplicates before inserting
        await Student.deleteOne({ email });
        await User.deleteOne({ email });

        await student.save();

        const user = new User({
          schoolId,
          email,
          password: "password123",
          role: "student",
          studentId: student._id,
        });
        await user.save();

        console.log(`✅ Grade ${grade.num} | Seeded: ${fullName}`);
        count++;
      }
    }

    console.log(`\n🎉 Done! ${count} Bayern students seeded across Grades 8, 9, and 10.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
};

seed();