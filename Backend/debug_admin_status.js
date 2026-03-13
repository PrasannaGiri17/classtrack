const mongoose = require('mongoose');
const Student = require('./models/studentModel');
const StudentFee = require('./models/StudentFee');
const { Grade, School } = require('./models/School');

async function test() {
    try {
        const mongoURI = "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";
        await mongoose.connect(mongoURI);
        
        const studentQuery = {};
        const students = await Student.find(studentQuery)
            .populate("classId", "gradeName gradeNumber monthlyFee")
            .sort({ firstName: 1, lastName: 1 })
            .limit(10);
            
        console.log('Students Found:', students.length);
        console.log('Total Students in DB:', await Student.countDocuments({}));

        const ay = "2081/82";
        const feeData = await Promise.all(students.map(async (student) => {
            const fees = await StudentFee.find({ student: student._id, academicYear: ay })
                .sort({ monthIndex: 1 });
            return {
                name: student.firstName,
                feesCount: fees.length
            };
        }));

        console.log('Fee Data Results:', feeData);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
