const FeeRecord = require("../models/FeeRecord");
const Student = require("../models/studentModel");
const { School, Grade } = require("../models/School");
const mongoose = require("mongoose");

const NEPALI_MONTHS = [
  "Baishakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

// 1. Generate 12 months for a student
exports.generateFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear } = req.body;

    if (!academicYear) return res.status(400).json({ message: "Academic Year is required" });

    const student = await Student.findById(studentId).populate("classId");
    if (!student) return res.status(404).json({ message: "Student not found" });

    const school = await School.findOne({ _id: 1 });
    
    // Find grade by classId or studentClass
    let grade;
    if (student.classId) {
        grade = await Grade.findById(student.classId);
    } else if (student.studentClass) {
        grade = await Grade.findOne({ gradeNumber: student.studentClass });
    }

    if (!grade) return res.status(404).json({ message: "Grade/Class fee not configured for this student" });

    const monthlyAmount = grade.monthlyFee || 0;
    const createdRecords = [];

    for (let i = 0; i < 12; i++) {
        try {
            const record = new FeeRecord({
                student: student._id,
                school: school ? school._id : 1,
                academicYear,
                monthIndex: i,
                monthName: NEPALI_MONTHS[i],
                baseFee: monthlyAmount,
                totalAmount: monthlyAmount,
            });
            await record.save();
            createdRecords.push(record);
        } catch (err) {
            if (err.code !== 11000) throw err;
        }
    }

    res.status(201).json({ 
      message: `Generated ${createdRecords.length} records for ${academicYear}`,
      records: createdRecords 
    });
  } catch (err) {
    res.status(500).json({ message: "Error generating fees", error: err.message });
  }
};

// 1.1 Bulk generate fees for all active students
exports.bulkGenerateFees = async (req, res) => {
    try {
        const { academicYear } = req.body;
        const ay = academicYear || "2081/82";

        const students = await Student.find({ status: 'active' });
        const results = { total: students.length, created: 0, skipped: 0 };

        for (const student of students) {
            let grade;
            if (student.classId) {
                grade = await Grade.findById(student.classId);
            } else if (student.studentClass) {
                grade = await Grade.findOne({ gradeNumber: student.studentClass });
            }

            if (!grade) continue;

            for (let i = 0; i < 12; i++) {
                try {
                    const exists = await FeeRecord.findOne({ student: student._id, academicYear: ay, monthIndex: i });
                    if (!exists) {
                        await FeeRecord.create({
                            student: student._id,
                            school: 1, 
                            academicYear: ay,
                            monthIndex: i,
                            monthName: NEPALI_MONTHS[i],
                            baseFee: grade.monthlyFee || 0,
                            totalAmount: grade.monthlyFee || 0,
                        });
                        results.created++;
                    } else {
                        results.skipped++;
                    }
                } catch (e) {
                    // console.error(e);
                }
            }
        }

        res.json({ message: "Bulk generation complete", results });
    } catch (err) {
        res.status(500).json({ message: "Bulk generation failed", error: err.message });
    }
};

// 2. Get student fee records
exports.getStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    const records = await FeeRecord.find({ student: studentId })
      .populate("school", "name")
      .sort({ monthIndex: 1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Error fetching student fees" });
  }
};

// 3. Admin View: All students fee status
exports.getAdminStatus = async (req, res) => {
  try {
    console.log("FEE API: getAdminStatus called");
    const students = await Student.find()
      .populate("classId", "gradeName gradeNumber")
      .sort({ firstName: 1 });

    const statusReport = await Promise.all(students.map(async (stu) => {
      const records = await FeeRecord.find({ student: stu._id });
      const totalDue = records.reduce((sum, r) => sum + r.dueAmount, 0);
      const totalPaid = records.reduce((sum, r) => sum + r.paidAmount, 0);
      const currentMonthIndex = NEPALI_MONTHS.indexOf('Falgun');
      const unpaidMonths = records.filter(r => r.status !== "PAID" && r.monthIndex < currentMonthIndex).length;
      const totalUnpaidRaw = records.filter(r => r.status !== "PAID").length;

      return {
        _id: stu._id,
        studentName: `${stu.firstName} ${stu.lastName}`,
        studentId: stu.studentId,
        profilePhoto: stu.profilePhoto,
        className: stu.classId?.gradeName || (stu.studentClass ? `Grade ${stu.studentClass}` : "N/A"),
        unpaidMonths,
        totalDueAmount: totalDue,
        totalPaidAmount: totalPaid,
        feeStatus: totalUnpaidRaw > 0 ? "UNPAID" : "PAID"
      };
    }));

    res.json(statusReport);
  } catch (err) {
    res.status(500).json({ message: "Error fetching admin status", error: err.message });
  }
};

// 4. Pay Fee
exports.payFee = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { paidAmount, paymentMethod, receiptNumber } = req.body;

    const record = await FeeRecord.findById(recordId);
    if (!record) return res.status(404).json({ message: "Record not found" });

    record.paidAmount = paidAmount;
    record.paymentMethod = paymentMethod;
    record.receiptNumber = receiptNumber || `REC-${Date.now()}`;
    record.paymentDate = new Date();

    await record.save();
    res.json({ message: "Payment successful", record });
  } catch (err) {
    res.status(500).json({ message: "Payment failed", error: err.message });
  }
};

// 5. Get Fee Summary
exports.getFeeSummary = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { academicYear } = req.query;
        const ay = academicYear || "2081/82";

        const records = await FeeRecord.find({ student: studentId, academicYear: ay });
        
        const summary = {
            yearlyTotal: records.reduce((sum, r) => sum + r.totalAmount, 0),
            totalPaid: records.reduce((sum, r) => sum + r.paidAmount, 0),
            totalDue: records.reduce((sum, r) => sum + r.dueAmount, 0),
            unpaidCount: records.filter(r => r.status !== 'PAID').length
        };

        res.json(summary);
    } catch (err) {
        res.status(500).json({ message: "Error fetching summary" });
    }
};

// 6. Add Extra Fee
exports.addExtraFee = async (req, res) => {
    try {
        const { recordId } = req.params;
        const { title, amount } = req.body;

        const record = await FeeRecord.findById(recordId);
        if (!record) return res.status(404).json({ message: "Record not found" });

        record.extraFees.push({ title, amount: parseFloat(amount) });
        record.totalAmount += parseFloat(amount);
        
        await record.save();
        res.json({ message: "Extra fee added", record });
    } catch (err) {
        res.status(500).json({ message: "Failed to add extra fee" });
    }
};

// 7. Delete Extra Fee
exports.deleteExtraFee = async (req, res) => {
    try {
        const { recordId, itemId } = req.params;

        const record = await FeeRecord.findById(recordId);
        if (!record) return res.status(404).json({ message: "Record not found" });

        const itemIndex = record.extraFees.findIndex(f => f._id.toString() === itemId);
        if (itemIndex === -1) return res.status(404).json({ message: "Item not found" });

        const amountToDeduct = record.extraFees[itemIndex].amount;
        record.extraFees.splice(itemIndex, 1);
        record.totalAmount -= amountToDeduct;

        await record.save();
        res.json({ message: "Extra fee deleted", record });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete extra fee" });
    }
};

// 8. Get Logged In Student Fees
exports.getMyFees = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ message: "Only students can access this route" });
        }
        
        const records = await FeeRecord.find({ student: req.user.studentId })
                                       .sort({ monthIndex: 1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: "Error fetching your fees", error: err.message });
    }
};
