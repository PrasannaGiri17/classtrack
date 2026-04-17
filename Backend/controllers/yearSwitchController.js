const mongoose = require("mongoose");
const Student = require("../models/studentModel");
const { School, Grade } = require("../models/School");
const ClassroomNotice = require("../models/ClassroomNotice"); // NEW: For notice clearing
const Discussion = require("../models/Discussion");
const Comment = require("../models/Comment");
const User = require("../models/UserModal");
const bcrypt = require("bcryptjs");

/**
 * YEAR SWITCH LOGIC
 * Transitions the school to the next academic year.
 * Promotes students, graduates final year students, and updates school settings.
 */
exports.executeYearSwitch = async (req, res) => {
  try {
    const { verification_code, school_id } = req.body;
    const adminId = req.user.adminId; // From protect middleware

    if (!verification_code || !school_id) {
      return res.status(400).json({ success: false, message: "Verification code and School ID required" });
    }

    // 1. Verify OTP
    const adminUser = await User.findOne({ adminId });
    if (!adminUser || !adminUser.resetPasswordOtp || !adminUser.resetPasswordOtpExpires) {
      throw new Error("No verification request found for this admin.");
    }

    if (Date.now() > adminUser.resetPasswordOtpExpires) {
      throw new Error("Verification code has expired.");
    }

    const isMatch = await bcrypt.compare(verification_code, adminUser.resetPasswordOtp);
    if (!isMatch) {
      throw new Error("Invalid verification code.");
    }

    // 2. Fetch School Configuration
    const school = await School.findOne({ schoolId: school_id });
    if (!school) {
      throw new Error("School not found.");
    }

    const currentYear = school.activeYear || "2082 B.S.";
    const [yearNum, suffix] = currentYear.split(" ");
    const nextYearNum = parseInt(yearNum) + 1;
    const nextYear = `${nextYearNum} ${suffix}`;
    const maxGrade = school.gradeSpan?.end || 10;

    // 3. Process Students Promotion/Graduation
    const activeStudents = await Student.find({ 
      schoolId: school_id, 
      status: "active" 
    });

    let promotedCount = 0;
    let graduatedCount = 0;

    // Cache grades to avoid repeated queries
    const schoolGrades = await Grade.find({ schoolId: school_id });
    const gradeMap = schoolGrades.reduce((acc, g) => {
      acc[g.gradeNumber] = g;
      return acc;
    }, {});

    for (const student of activeStudents) {
      const currentClass = student.studentClass;

      if (currentClass < maxGrade) {
        // Promote
        const targetClassNum = currentClass + 1;
        const targetGrade = gradeMap[targetClassNum];

        if (targetGrade) {
          student.studentClass = targetClassNum;
          student.classId = targetGrade._id;

          // Note: sectionId is reset globally later to empty all classrooms
          promotedCount++;
        }
      } else {
        // Graduate
        student.status = "graduated";
        student.graduationYear = currentYear;
        graduatedCount++;
      }

      await student.save();
    }

    // =============================================
    // CLASSROOM RESET LOGIC
    // =============================================
    
    // 1. Detach ALL students from sections (Clears all classroom rosters)
    // This allows admin to manually assign promoted students to their new sections
    await Student.updateMany(
      { schoolId: school_id }, 
      { $set: { sectionId: null } }
    );

    // 2. Clear All Classroom Notices
    // Wiping the board for the new academic session
    await ClassroomNotice.deleteMany({ schoolId: school_id });

    // 3. Clear All Community Discussions & Comments
    // Starting fresh for the new year
    await Discussion.deleteMany({ schoolId: school_id });
    await Comment.deleteMany({ schoolId: school_id });

    // 4. Clear Student Monitors (classMonitorId) from Grade sections
    // Keep classTeacherId, roomNumber, etc. as requested.
    await Grade.updateMany(
      { schoolId: school_id },
      { $set: { "sections.$[].classMonitorId": null } }
    );

    // 4. Update School Configuration
    school.activeYear = nextYear;
    await school.save();

    // 5. Generate Fees for the New Year
    // This ensures students have their ledger ready for the new grade and new year
    const [updatedSchool, allGrades] = await Promise.all([
      School.findOne({ schoolId: school_id }),
      Grade.find({ schoolId: school_id })
    ]);

    const NEPALI_MONTHS = [
      "Baishakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
      "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
    ];

    const feeResults = { created: 0, failed: 0 };

    for (const student of activeStudents) {
      let studentGrade = allGrades.find(g => g.gradeNumber === student.studentClass);
      
      if (!studentGrade) {
        feeResults.failed++;
        continue;
      }

      const baseFee = studentGrade.monthlyFee || 0;
      const admissionFee = updatedSchool.admissionFee || 0;

      for (let i = 0; i < 12; i++) {
        const feeData = {
          schoolId: school_id,
          school: updatedSchool._id,
          student: student._id,
          grade: studentGrade._id,
          academicYear: nextYear,
          monthIndex: i,
          monthName: NEPALI_MONTHS[i],
          baseFee: baseFee,
          admissionFee: (i === 0) ? admissionFee : 0,
          status: "UNPAID"
        };

        try {
          // Use findOneAndUpdate with upsert: false to avoid duplicates if something went wrong
          // or just create new if we are sure it's a new year.
          // Given the unique index, a simple new StudentFee().save() is fine if we catch the error.
          const newFee = new (require("../models/StudentFee"))(feeData);
          await newFee.save();
          feeResults.created++;
        } catch (err) {
          // If it already exists for some reason, just skip
          if (err.code !== 11000) console.error(`Error generating fee for ${student.firstName}:`, err);
        }
      }
    }

    // 6. Clear OTP after successful use
    adminUser.resetPasswordOtp = null;
    adminUser.resetPasswordOtpExpires = null;
    await adminUser.save();

    return res.json({
      success: true,
      promoted_count: promotedCount,
      graduated_count: graduatedCount,
      new_active_year: nextYear,
      archived_year: currentYear,
      classrooms_reset: true,
      fees_generated: feeResults.created
    });

  } catch (error) {
    console.error("YEAR SWITCH ERROR:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to execute year switch transition." 
    });
  }
};
