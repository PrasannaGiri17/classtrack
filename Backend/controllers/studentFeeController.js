const StudentFee = require("../models/StudentFee");
const Student = require("../models/studentModel");
const { School, Grade } = require("../models/School");
const mongoose = require("mongoose");

const NEPALI_MONTHS = [
  "Baishakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

// Generate 12 months for a student
exports.generateYearlyFees = async (req, res) => {
  try {
    const { studentId, academicYear } = req.body;

    if (!studentId || !academicYear) {
      return res.status(400).json({ message: "Student ID and Academic Year are required" });
    }

    // 1. Fetch Student
    const student = await Student.findOne({ studentId }).populate("classId");
    if (!student) return res.status(404).json({ message: "Student not found" });

    // 2. Fetch School (for admission fee)
    const school = await School.findById(student.schoolId || 1);
    if (!school) return res.status(404).json({ message: "School not found" });

    // 3. Fetch Grade (for base monthly fee)
    // In studentModel, classId refs Grade
    const grade = await Grade.findById(student.classId);
    if (!grade) return res.status(404).json({ message: "Grade/Class not found for student" });

    const baseFee = grade.monthlyFee || 0;
    const admissionFee = school.admissionFee || 0;

    const generatedFees = [];

    for (let i = 0; i < 12; i++) {
        // Build fee record
        const feeData = {
          student: student._id,
          school: school._id,
          grade: grade._id,
          academicYear,
          monthIndex: i,
          monthName: NEPALI_MONTHS[i],
          baseFee: baseFee,
          admissionFee: (i === 0) ? admissionFee : 0, // Add admission fee only to Baishakh
          status: "UNPAID"
        };

        try {
            const newFee = new StudentFee(feeData);
            await newFee.save();
            generatedFees.push(newFee);
        } catch (err) {
            // If duplicate (already exists), skip
            if (err.code === 11000) {
                console.log(`Fee already exists for ${student.firstName} - ${NEPALI_MONTHS[i]}`);
                continue;
            }
            throw err;
        }
    }

    return res.status(201).json({
      message: `Successfully generated ${generatedFees.length} fee records.`,
      count: generatedFees.length
    });

  } catch (err) {
    console.error("GENERATE FEES ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all fees for a student
exports.getStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear } = req.query;

    const query = { student: studentId };
    if (academicYear) query.academicYear = academicYear;

    const fees = await StudentFee.find(query)
      .sort({ academicYear: -1, monthIndex: 1 });

    return res.json(fees);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Get all students fee status (Admin view) - Showing all students
exports.getAllStudentsFeeStatus = async (req, res) => {
  try {
    const { status, academicYear, gradeId, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 1. Build Student Query - no schoolId filter since this is single-school
    const studentQuery = {};
    if (gradeId) studentQuery.classId = new mongoose.Types.ObjectId(gradeId);
    
    if (search) {
      studentQuery.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    // 2. Fetch Students (sorted by name)
    const [students, totalStudents] = await Promise.all([
      Student.find(studentQuery)
        .populate("classId", "gradeName gradeNumber monthlyFee")
        .sort({ firstName: 1, lastName: 1 })
        .skip(skip)
        .limit(limit),
      Student.countDocuments(studentQuery)
    ]);

    // 3. For each student, get their fee summary for the academic year
    const ay = academicYear || "2081/82";
    
    const feeData = await Promise.all(students.map(async (student) => {
        const fees = await StudentFee.find({ student: student._id, academicYear: ay })
            .sort({ monthIndex: 1 });
            
        const totalDue = fees.reduce((acc, f) => acc + (f.dueAmount || 0), 0);
        const totalPaid = fees.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
        const unpaidMonthsCount = fees.filter(f => f.status !== 'PAID').length;
        
        // Priority: OVERDUE > UNPAID > PARTIAL > PAID > NO_RECORD
        const statusPriority = { OVERDUE: 0, UNPAID: 1, PARTIAL: 2, PAID: 3 };
        const relevantFee = fees.length > 0
          ? fees.sort((a, b) => (statusPriority[a.status] ?? 9) - (statusPriority[b.status] ?? 9))[0]
          : null;

        return {
          _id: student._id,
          student: {
            _id: student._id,
            firstName: student.firstName,
            lastName: student.lastName,
            studentId: student.studentId,
            profilePhoto: student.profilePhoto
          },
          grade: student.classId,
          monthName: relevantFee ? relevantFee.monthName : "—",
          academicYear: ay,
          totalAmount: totalDue + totalPaid,
          dueAmount: totalDue,
          paidAmount: totalPaid,
          status: relevantFee ? relevantFee.status : "NO_RECORD",
          unpaidCount: unpaidMonthsCount,
          totalMonths: fees.length,
          recordId: relevantFee ? relevantFee._id : null
        };
    }));

    // Post-filter by status if needed (derived field, can't filter in DB query)
    let filteredFees = feeData;
    if (status) {
        filteredFees = feeData.filter(f => f.status === status.toUpperCase());
    }

    return res.json({
      fees: filteredFees,
      total: totalStudents,
      pages: Math.ceil(totalStudents / limit),
      currentPage: page
    });
  } catch (err) {
    console.error("getAllStudentsFeeStatus error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Mark a month as paid
exports.markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paidAmount, paymentMethod, remarks, paymentDate } = req.body;

    const fee = await StudentFee.findById(id);
    if (!fee) return res.status(404).json({ message: "Fee record not found" });

    fee.paidAmount = parseFloat(paidAmount) || fee.paidAmount;
    fee.paymentMethod = paymentMethod || fee.paymentMethod;
    fee.remarks = remarks || fee.remarks;
    fee.paymentDate = paymentDate || Date.now();
    
    // Receipt Number generation strategy
    if (!fee.receiptNumber) {
        fee.receiptNumber = `REC-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    }

    await fee.save();

    return res.json({ message: "Payment updated", fee });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Add/Update Extra Fee
exports.addExtraFee = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount } = req.body;

    const fee = await StudentFee.findById(id);
    if (!fee) return res.status(404).json({ message: "Fee record not found" });

    fee.extraFees.push({ title, amount: parseFloat(amount) });
    await fee.save();

    return res.json({ message: "Extra fee added", fee });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateExtraFee = async (req, res) => {
    try {
      const { id, itemId } = req.params;
      const { title, amount } = req.body;
  
      const fee = await StudentFee.findById(id);
      if (!fee) return res.status(404).json({ message: "Fee record not found" });
  
      const item = fee.extraFees.id(itemId);
      if (!item) return res.status(404).json({ message: "Extra fee item not found" });
  
      if (title) item.title = title;
      if (amount !== undefined) item.amount = parseFloat(amount);
  
      await fee.save();
      return res.json({ message: "Extra fee updated", fee });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
};

exports.deleteExtraFee = async (req, res) => {
    try {
      const { id, itemId } = req.params;
  
      const fee = await StudentFee.findById(id);
      if (!fee) return res.status(404).json({ message: "Fee record not found" });
  
      fee.extraFees.pull({ _id: itemId });
      await fee.save();
  
      return res.json({ message: "Extra fee deleted", fee });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
};

// Get summary
exports.getStudentFeeSummary = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { academicYear } = req.query;

        const query = { student: studentId };
        if (academicYear) query.academicYear = academicYear;

        const fees = await StudentFee.find(query);

        let totalPaid = 0;
        let totalDue = 0;
        let yearlyTotal = 0;
        let overdueMonths = [];

        fees.forEach(f => {
            totalPaid += f.paidAmount;
            totalDue += f.dueAmount;
            yearlyTotal += f.totalAmount;
            if (f.status === "OVERDUE" || (f.status === "UNPAID" && f.monthIndex < new Date().getMonth())) {
                // Simplified overdue logic: if unpaid and past month
                overdueMonths.push(f.monthName);
            }
        });

        return res.json({
            totalPaid,
            totalDue,
            yearlyTotal,
            overdueMonths
        });
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
};

// Logged in student view
exports.getMyFees = async (req, res) => {
    try {
        // req.user is attached by authMiddleware
        if (!req.user.studentId) {
            return res.status(400).json({ message: "User is not a student" });
        }

        const fees = await StudentFee.find({ student: req.user.studentId })
            .sort({ academicYear: -1, monthIndex: 1 });
            
        return res.json(fees);
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
};

exports.getFeeById = async (req, res) => {
    try {
        const fee = await StudentFee.findById(req.params.id)
            .populate("student", "firstName lastName studentId fatherName fatherPhone profilePhoto")
            .populate("grade", "gradeName gradeNumber monthlyFee");
            
        if (!fee) return res.status(404).json({ message: "Fee record not found" });
        return res.json(fee);
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
};
