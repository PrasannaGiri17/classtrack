const mongoose = require("mongoose");
const mongoURI =
  "mongodb://localhost:27017/school";

const Teacher = require("../models/teacherModel");
const User = require("../models/UserModal");

const schoolId = 4;

// 18 Bayern Munich coaches / staff (current and past)
const teacherNames = [
  "Vincent Kompany",    // current head coach
  "Hansi Flick",        // past coach, treble winner
  "Niko Kovač",         // past coach
  "Jupp Heynckes",      // legend coach
  "Pep Guardiola",      // past coach
  "Carlo Ancelotti",    // past coach
  "Louis van Gaal",     // past coach
  "Hermann Gerland",    // long-time assistant
  "Dino Toppmöller",    // past assistant
  "Miroslav Klose",     // past assistant / legend
  "Thomas Müller",      // player-coach role / ambassador
  "Oliver Kahn",        // former CEO / legend
  "Lothar Matthäus",    // legend / ambassador
  "Franz Beckenbauer",  // legend / former president
  "Uli Hoeneß",         // former president
  "Mehmet Scholl",      // past TV analyst / former player
  "Stefan Effenberg",   // past player / pundit
  "Giovane Élber",      // past player / ambassador
];

// Grades for school 4
const grades = [
  { num: 8,  id: "69ddc48c481d4da240118476" },
  { num: 9,  id: "69ddc48c481d4da240118475" },
  { num: 10, id: "69ddc48c481d4da240118477" },
];

// ✅ Only 6 confirmed subjects from the UI (no GK)
const subjects = [
  { id: "69ddc852309fc7ed6e7c183e", code: "COM", name: "Computer" },
  { id: "69ddc84f309fc7ed6e7c17f3", code: "ENG", name: "English"  },
  { id: "69d2335b36b956e093412156", code: "MAT", name: "Math"     },
  { id: "69ddc85f309fc7ed6e7c18b6", code: "NEP", name: "Nepali"   },
  { id: "69ddc84a309fc7ed6e7c17b1", code: "SCI", name: "Science"  },
  { id: "69ddc866309fc7ed6e7c1913", code: "SOC", name: "Social"   },
];

/**
 * Assignment plan:
 * 18 teachers ÷ 3 grades = 6 teachers per grade
 * 6 teachers per grade × 6 subjects = 1 teacher per subject per grade ✅
 *
 * Grade 8  → teachers index 0–5
 * Grade 9  → teachers index 6–11
 * Grade 10 → teachers index 12–17
 */
const getAssignment = (index) => {
  const gradeIndex   = Math.floor(index / 6); // 0, 1, or 2
  const subjectIndex = index % 6;             // 0-5 → maps 1:1 to 6 subjects
  return {
    grade:   grades[gradeIndex],
    subject: subjects[subjectIndex],
  };
};

const seed = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("✅ DB Connected");

    for (let i = 0; i < teacherNames.length; i++) {
      const fullName   = teacherNames[i];
      const nameParts  = fullName.split(" ");
      const firstName  = nameParts[0];
      const lastName   = nameParts.slice(1).join(" ") || "Coach";
      const email      = `${firstName.toLowerCase().replace(/[^a-z]/g, "")}.${i}@faculty4.com`;

      const { grade, subject } = getAssignment(i);

      const teacher = new Teacher({
        schoolId,
        firstName,
        lastName,
        email,
        phone:          "982" + Math.floor(1000000 + Math.random() * 9000000),
        birthdate:      new Date("1975-01-01"),
        gender:         "male",
        qualification:  "UEFA Pro License",
        currentAddress: "Munich, Germany",
        assignedGrades: [grade.id],
        primarySubject:  subject.id,
      });

      await Teacher.deleteOne({ email });
      await User.deleteOne({ email });

      await teacher.save();

      const user = new User({
        schoolId,
        email,
        password:  "password123",
        role:      "teacher",
        teacherId: teacher._id,
      });
      await user.save();

      console.log(
        `✅ [${String(i + 1).padStart(2, "0")}/18] ${fullName.padEnd(22)} → Grade ${grade.num} | ${subject.code} (${subject.name})`
      );
    }

    console.log("\n🎉 18 Bayern teachers seeded for school 4!");
    console.log("──────────────────────────────────────────");
    console.log("   Grade 8  → Computer, English, Math, Nepali, Science, Social");
    console.log("   Grade 9  → Computer, English, Math, Nepali, Science, Social");
    console.log("   Grade 10 → Computer, English, Math, Nepali, Science, Social");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
};

seed();