require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const { Grade } = require("../models/School");
const Student = require("../models/studentModel");
const Result = require("../models/Result");

// Configurations
const schoolId = 2;
const gradeNumber = 4;
const sectionName = "B";
const terms = ["First Mid Term", "First Term", "Second Mid Term", "Second Term"];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMarks(subjectIds, studentType, totalSubjects) {
  switch (studentType) {
    case "failAll":
      // Fail all subjects: theory 0–19, practical 0–7
      return subjectIds.map(subId => ({
        subjectId: subId,
        theoryMarks: getRandomInt(0, 19),
        practicalMarks: getRandomInt(0, 7),
        remark: "Seeded/Updated"
      }));

    case "failHalf": {
      // Randomly pick half the subjects to fail
      const shuffled = [...subjectIds].sort(() => Math.random() - 0.5);
      const halfCount = Math.floor(totalSubjects / 2);
      const failSubjects = new Set(shuffled.slice(0, halfCount).map(id => id.toString()));

      return subjectIds.map(subId => {
        const shouldFail = failSubjects.has(subId.toString());
        return {
          subjectId: subId,
          theoryMarks: shouldFail ? getRandomInt(0, 19) : getRandomInt(40, 75),
          practicalMarks: shouldFail ? getRandomInt(0, 7) : getRandomInt(15, 25),
          remark: "Seeded/Updated"
        };
      });
    }

    case "normal":
    default:
      // Pass all subjects: theory 40–75, practical 15–25
      return subjectIds.map(subId => ({
        subjectId: subId,
        theoryMarks: getRandomInt(40, 75),
        practicalMarks: getRandomInt(15, 25),
        remark: "Seeded/Updated"
      }));
  }
}

async function seedResults() {
  try {
    const mongoUri = "mongodb://localhost:27017/school";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to Database");

    // 1. Find the Grade document
    const grade = await Grade.findOne({ schoolId, gradeNumber });
    if (!grade) {
      console.error(`❌ Grade ${gradeNumber} not found for School ${schoolId}`);
      process.exit(1);
    }
    const gradeId = grade._id;
    console.log(`📍 Found Grade ${gradeNumber} with ID: ${gradeId}`);

    // 2. Find the Section
    const section = grade.sections.find(s => s.sectionName === sectionName);
    if (!section) {
      console.error(`❌ Section ${sectionName} not found in Grade ${gradeNumber}`);
      process.exit(1);
    }
    const sectionId = section._id;

    // 3. Find all students in this Grade and Section
    const students = await Student.find({
      schoolId,
      classId: gradeId,
      sectionId: sectionId
    });

    if (students.length === 0) {
      console.warn(`⚠️ No students found in Grade ${gradeNumber} Section ${sectionName}`);
      process.exit(0);
    }
    console.log(`👥 Found ${students.length} students to seed results for.`);

    // 4. Get subject IDs for this grade
    const subjectIds = grade.subjects.map(s => s.subjectId);
    if (subjectIds.length === 0) {
      console.warn("⚠️ No subjects assigned to this grade document.");
      process.exit(0);
    }
    console.log(`📚 Found ${subjectIds.length} subjects for Grade ${gradeNumber}`);

    // ─────────────────────────────────────────────────────────────
    // 5. Assign student types
    //    - 1 student  → failAll
    //    - 3 students → failHalf
    //    - rest       → normal
    //
    //    Shuffle so the picks are random each run
    // ─────────────────────────────────────────────────────────────
    const shuffledStudents = [...students].sort(() => Math.random() - 0.5);

    const failAllStudents   = new Set([shuffledStudents[0]._id.toString()]);
    const failHalfStudents  = new Set(
      shuffledStudents.slice(1, 4).map(s => s._id.toString())
    );

    console.log(`\n🎯 Student Type Assignments:`);
    console.log(`   ❌ Fail ALL subjects (1):  ${shuffledStudents[0].firstName} ${shuffledStudents[0].lastName}`);
    console.log(`   ⚠️  Fail HALF subjects (3): ${shuffledStudents.slice(1, 4).map(s => `${s.firstName} ${s.lastName}`).join(", ")}`);
    console.log(`   ✅ Normal / passing (${students.length - 4}): remaining students\n`);

    // ─────────────────────────────────────────────────────────────
    // 6. Seed results
    // ─────────────────────────────────────────────────────────────
    let processedCount = 0;

    for (const student of students) {
      const sid = student._id.toString();

      let studentType;
      if (failAllStudents.has(sid))  studentType = "failAll";
      else if (failHalfStudents.has(sid)) studentType = "failHalf";
      else studentType = "normal";

      for (const term of terms) {
        const marks = generateMarks(subjectIds, studentType, subjectIds.length);

        const filter = {
          schoolId,
          studentId: student._id,
          gradeId,
          sectionName,
          term
        };

        let result = await Result.findOne(filter);

        if (result) {
          result.marks = marks;
          result.summary = {};
          await result.save();
        } else {
          result = new Result({ ...filter, marks, summary: {} });
          await result.save();
        }
      }

      processedCount++;
      console.log(`[${processedCount}/${students.length}] [${studentType.toUpperCase()}] Seeded: ${student.firstName} ${student.lastName}`);
    }

    console.log(`\n🎉 Seeding completed! Total students processed: ${processedCount}`);
    process.exit(0);

  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
}

seedResults();