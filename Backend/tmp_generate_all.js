const mongoose = require('mongoose');
const StudentFee = require('./models/StudentFee');
const Student = require('./models/studentModel');
const { School, Grade } = require('./models/School');

const NEPALI_MONTHS = [
  "Baishakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

async function generateAllFees() {
    try {
        await mongoose.connect('mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0');
        console.log("DB connected");

        const students = await Student.find({ status: 'active' });
        const [school, grades] = await Promise.all([
            School.findOne(),
            Grade.find({})
        ]);

        console.log(`Starting generation for ${students.length} students...`);

        let count = 0;
        for (const student of students) {
            let studentGrade = null;
            if (student.classId) {
                studentGrade = grades.find(g => g._id.toString() === student.classId.toString());
            } 
            
            if (!studentGrade && student.studentClass) {
                studentGrade = grades.find(g => g.gradeNumber === student.studentClass);
            }

            if (!studentGrade) {
                console.log(`Skipping student ${student.firstName} ${student.lastName} - No grade found`);
                continue;
            }

            for (let i = 0; i < 12; i++) {
                try {
                    const existing = await StudentFee.findOne({
                        student: student._id,
                        monthIndex: i,
                        academicYear: '2081/82'
                    });

                    if (!existing) {
                        const newFee = new StudentFee({
                            student: student._id,
                            school: school._id,
                            grade: studentGrade._id,
                            academicYear: '2081/82',
                            monthIndex: i,
                            monthName: NEPALI_MONTHS[i],
                            baseFee: studentGrade.monthlyFee || 0,
                            admissionFee: (i === 0) ? school.admissionFee : 0,
                            status: "UNPAID"
                        });
                        await newFee.save();
                        count++;
                    }
                } catch (err) {
                    console.error(`Error saving fee for student ${student.firstName}:`, err.message);
                }
            }
        }

        console.log(`Successfully generated ${count} NEW fee records.`);
        process.exit(0);
    } catch (err) {
        console.error("GENERATOR ERROR:", err);
        process.exit(1);
    }
}

generateAllFees();
