const mongoose = require("mongoose");
const mongoURI = "mongodb://localhost:27017/school";

const Student = require("../models/studentModel");
const User = require("../models/UserModal");

const schoolId = 5;

const seedOneStudent = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("DB Connected");

    const grade = {
      num: 8,
      id: "69dfd52cfd27587ba4d98a01",
    };

    const fullName = "testing one";
    const nameParts = fullName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || ".";
    const email = "testing.g8.0@student.com";

    await Student.deleteOne({ email });
    await User.deleteOne({ email });

    const student = new Student({
      schoolId,
      firstName,
      lastName,
      email,
      phone: "9801234567",
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

    await student.save();

    const user = new User({
      schoolId,
      email,
      password: "password123",
      role: "student",
      studentId: student._id,
    });

    await user.save();

    console.log(`✅ Seeded one Grade ${grade.num} student: ${fullName}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
};

seedOneStudent();