const mongoose = require('mongoose');
const Student = require('./models/studentModel');
const StudentFee = require('./models/StudentFee');
const { Grade, School } = require('./models/School');

async function testController() {
    try {
        const mongoURI = "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";
        await mongoose.connect(mongoURI);
        
        const req = {
            query: {
                page: 1,
                limit: 10,
                academicYear: "2081/82",
                status: "ALL"
            }
        };

        const { status, academicYear, gradeId, search } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const studentQuery = {};
        const [students, totalStudents] = await Promise.all([
          Student.find(studentQuery)
            .populate("classId", "gradeName gradeNumber monthlyFee")
            .sort({ firstName: 1, lastName: 1 })
            .skip(skip)
            .limit(limit),
          Student.countDocuments(studentQuery)
        ]);

        console.log('Total Students Count in Controller Logic:', totalStudents);
        console.log('Students Array Length:', students.length);

        if (students.length > 0) {
            console.log('Sample Student name:', students[0].firstName);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testController();
