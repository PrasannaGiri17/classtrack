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
    const student = await Student.findOne({ schoolId: req.schoolId,  studentId }).populate("classId");
    if (!student) return res.status(404).json({ message: "Student not found" });

    // 2. Fetch School (global config)
    const school = await School.findOne({ schoolId: req.schoolId });
    if (!school) return res.status(404).json({ message: "School configuration not found" });

    // 3. Fetch Grade (for base monthly fee)
    let grade;
    if (student.classId) {
        grade = await Grade.findById(student.classId);
    } else if (student.studentClass) {
        grade = await Grade.findOne({ schoolId: req.schoolId,  gradeNumber: student.studentClass });
    }

    if (!grade) return res.status(404).json({ message: "Matching Grade/Class not found for student" });

    const baseFee = grade.monthlyFee || 0;
    const admissionFee = school.admissionFee || 0;

    const generatedFees = [];

    for (let i = 0; i < 12; i++) {
        // Build fee record
        const feeData = {
          student: student._id,
          schoolId: req.schoolId,
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
    if (academicYear && academicYear !== 'all') {
      query.academicYear = academicYear;
    }

    const fees = await StudentFee.find(query)
      .populate("grade", "gradeName gradeNumber monthlyFee")
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
    console.log("Admin Fee Status Query:", { status, academicYear, gradeId, search });
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 1. Build Student Query - isolated by tenant
    const studentQuery = { schoolId: req.schoolId };
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

    console.log(`Found ${students.length} students out of ${totalStudents} total matching query.`);

    // 3. For each student, get their fee summary for the academic year
    const school = await School.findOne({ schoolId: req.schoolId });
    const ay = academicYear || school?.activeYear || "2081/82";
    
    const feeData = await Promise.all(students.map(async (student) => {
        // FETCH ALL FEES for the student to support multi-year/grade debt tracking
        const allFees = await StudentFee.find({ schoolId: req.schoolId, student: student._id })
            .populate("grade", "gradeName gradeNumber")
            .sort({ academicYear: -1, monthIndex: 1 });
            
        // Separate current academic year fees for status display if academic year is selected
        const currentYearFees = allFees.filter(f => f.academicYear === ay);
        
        const totalDueGlobal = allFees.reduce((acc, f) => acc + (f.dueAmount || 0), 0);
        const totalPaidGlobal = allFees.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
        
        // Priority for primary status badge (based on current year if possible, otherwise global)
        const relevantFees = currentYearFees.length > 0 ? currentYearFees : allFees;
        const statusPriority = { OVERDUE: 0, UNPAID: 1, PARTIAL: 2, PAID: 3 };
        const relevantFee = relevantFees.length > 0
          ? [...relevantFees].sort((a, b) => (statusPriority[a.status] ?? 9) - (statusPriority[b.status] ?? 9))[0]
          : null;

        const currentMonthIndex = NEPALI_MONTHS.indexOf('Falgun');
        const unpaidCount = allFees.filter(r => r.status !== "PAID").length;

        return {
          _id: student._id,
          // Legacy Compatibility for Fee.jsx Admin Panel
          studentName: `${student.firstName} ${student.lastName}`,
          studentId: student.studentId,
          profilePhoto: student.profilePhoto,
          className: student.classId?.gradeName || (student.studentClass ? `Grade ${student.studentClass}` : "N/A"),
          unpaidMonths: allFees.filter(f => f.status !== "PAID" && f.academicYear === ay).length,
          totalDueAmount: totalDueGlobal, // Global Outstanding Rs.
          totalPaidAmount: totalPaidGlobal,
          feeStatus: allFees.length === 0 ? "NO_RECORD" : (totalDueGlobal > 0 ? "UNPAID" : "PAID"),
          
          // Modern Payload Structure
          student: {
            _id: student._id,
            firstName: student.firstName,
            lastName: student.lastName,
            studentId: student.studentId,
            profilePhoto: student.profilePhoto
          },
          grade: student.classId,
          monthName: relevantFee ? `${relevantFee.academicYear} - ${relevantFee.monthName}` : "—",
          academicYear: ay,
          totalAmount: totalDueGlobal + totalPaidGlobal,
          dueAmount: totalDueGlobal,
          paidAmount: totalPaidGlobal,
          status: relevantFee ? relevantFee.status : "NO_RECORD",
          unpaidCount: unpaidCount,
          totalMonths: allFees.length,
          recordId: relevantFee ? relevantFee._id : null
        };
    }));

    // Post-filter by status if needed (derived field, can't filter in DB query)
    let filteredFees = feeData;
    if (status && status.toUpperCase() !== "ALL") {
        filteredFees = feeData.filter(f => f.status === status.toUpperCase());
    }

    console.log(`getAllStudentsFeeStatus: Returning ${filteredFees.length} results after status filter: ${status}. Total matching students from DB: ${totalStudents}`);

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
        // If specific academicYear is requested, filter by it, otherwise get all historical records
        if (academicYear && academicYear !== 'all') {
            query.academicYear = academicYear;
        }

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
        const studentId = req.user.studentId;
        if (!studentId) {
            return res.status(400).json({ message: "User is not a student" });
        }

        const school = await School.findOne({ schoolId: req.schoolId });
        const ay = school?.activeYear || "2081/82"; // Use school's active year as default
        
        let fees = await StudentFee.find({ schoolId: req.schoolId, student: studentId })
            .populate("grade", "gradeName gradeNumber monthlyFee")
            .sort({ academicYear: -1, monthIndex: 1 });

        // AUTOMATIC GENERATION: If no fees found, generate them on the fly
        if (fees.length === 0) {
            console.log(`Auto-generating fees for student: ${studentId}`);
            
            // Re-use logic to find student and config
            const student = await Student.findById(studentId).populate("classId");
            const school = await School.findOne({ schoolId: req.schoolId });
            
            if (student && school) {
                let grade;
                if (student.classId) {
                    grade = await Grade.findById(student.classId);
                } else if (student.studentClass) {
                    grade = await Grade.findOne({ schoolId: req.schoolId,  gradeNumber: student.studentClass });
                }

                if (grade) {
                    const baseFee = grade.monthlyFee || 0;
                    const admissionFee = school.admissionFee || 0;

                    const generated = [];
                    for (let i = 0; i < 12; i++) {
                        const newFee = new StudentFee({
                            student: student._id,
                            schoolId: req.schoolId,
                            school: school._id,
                            grade: grade._id,
                            academicYear: ay,
                            monthIndex: i,
                            monthName: NEPALI_MONTHS[i],
                            baseFee: baseFee,
                            admissionFee: (i === 0) ? admissionFee : 0,
                            status: "UNPAID"
                        });
                        await newFee.save();
                        generated.push(newFee);
                    }
                    fees = generated;
                }
            }
        }
            
        return res.json(fees);
    } catch (err) {
        console.error("GET MY FEES ERROR:", err);
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

// Bulk generate fees for all students
exports.bulkGenerateFees = async (req, res) => {
    try {
        const { academicYear } = req.body;
        const school = await School.findOne({ schoolId: req.schoolId });
        const ay = academicYear || school?.activeYear || "2081/82";

        // 1. Fetch all active students
        const students = await Student.find({ schoolId: req.schoolId,  status: "active" }).populate("classId");
        
        // 2. Fetch Grades for configuration
        const grades = await Grade.find({ schoolId: req.schoolId });

        if (!school) return res.status(404).json({ message: "School configuration not found" });

        const results = {
            totalStudents: students.length,
            created: 0,
            updated: 0,
            failed: 0
        };

        // 3. Process each student
        for (const student of students) {
            // Find grade by classId or fallback to studentClass (gradeNumber)
            let studentGrade = null;
            if (student.classId) {
                studentGrade = grades.find(g => g._id.toString() === student.classId._id.toString());
            } 
            
            if (!studentGrade && student.studentClass) {
                studentGrade = grades.find(g => Number(g.gradeNumber) === Number(student.studentClass));
            }

            if (!studentGrade) {
                console.log(`Skipping student ${student.firstName} - No matching grade found`);
                results.failed++;
                continue;
            }

            const baseFee = studentGrade.monthlyFee || 0;
            const admissionFee = school.admissionFee || 0;

            for (let i = 0; i < 12; i++) {
                // Find existing record for this specific month/year
                const existingRec = await StudentFee.findOne({
                    student: student._id,
                    monthIndex: i,
                    academicYear: ay
                });
                
                if (existingRec) {
                    // Only update if UNPAID - we don't want to change the price of already paid months
                    if (existingRec.status === 'UNPAID' || existingRec.status === 'OVERDUE') {
                        existingRec.grade = studentGrade._id;
                        existingRec.baseFee = baseFee;
                        existingRec.admissionFee = (i === 0) ? admissionFee : 0;
                        // pre-save hook will recalculate totalAmount and dueAmount
                        await existingRec.save();
                        results.updated++;
                    }
                } else {
                    // Create new record
                    const newFee = new StudentFee({
                        schoolId: req.schoolId,
                        school: school._id,
                        student: student._id,
                        grade: studentGrade._id,
                        academicYear: ay,
                        monthIndex: i,
                        monthName: NEPALI_MONTHS[i],
                        baseFee: baseFee,
                        admissionFee: (i === 0) ? admissionFee : 0,
                        status: "UNPAID"
                    });
                    await newFee.save();
                    results.created++;
                }
            }
        }

        return res.json({
            message: `Bulk sync completed for ${ay}.`,
            results
        });

    } catch (err) {
        console.error("BULK GEN ERROR:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.syncSingleStudentLedger = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { academicYear } = req.body;
        
        const school = await School.findOne({ schoolId: req.schoolId });
        const ay = academicYear || school?.activeYear || "2081/82";

        const student = await Student.findById(studentId).populate("classId");
        if (!student) return res.status(404).json({ message: "Student not found" });

        const grades = await Grade.find({ schoolId: req.schoolId });

        let studentGrade = null;
        if (student.classId) {
            studentGrade = grades.find(g => g._id.toString() === student.classId._id.toString());
        } 
        if (!studentGrade && student.studentClass) {
            studentGrade = grades.find(g => Number(g.gradeNumber) === Number(student.studentClass));
        }

        if (!studentGrade) return res.status(400).json({ message: "No matching grade configuration for this student" });

        const baseFee = studentGrade.monthlyFee || 0;
        const admissionFee = school.admissionFee || 0;

        let updated = 0;
        for (let i = 0; i < 12; i++) {
            const fee = await StudentFee.findOne({
                student: student._id,
                monthIndex: i,
                academicYear: ay
            });

            if (fee && (fee.status === 'UNPAID' || fee.status === 'OVERDUE')) {
                fee.grade = studentGrade._id;
                fee.baseFee = baseFee;
                fee.admissionFee = (i === 0) ? admissionFee : 0;
                await fee.save();
                updated++;
            }
        }

        return res.json({ message: `Synced ${updated} months to Grade: ${studentGrade.gradeName}`, updatedCount: updated });
    } catch (err) {
        console.error("SYNC SINGLE STUDENT ERROR:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
