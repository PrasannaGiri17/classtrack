const mongoose = require('mongoose');
const Student = require('./models/studentModel');
const StudentFee = require('./models/StudentFee');

async function test() {
    try {
        const mongoURI = "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";
        await mongoose.connect(mongoURI);
        console.log('Connected');

        const count = await Student.countDocuments({});
        console.log('Student Count:', count);

        const students = await Student.find({}).limit(10);
        console.log('Students:', students.map(s => `${s.firstName} ${s.lastName} (${s.studentId})`));

        const feeCount = await StudentFee.countDocuments({});
        console.log('Fee Count:', feeCount);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
