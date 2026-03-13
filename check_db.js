const mongoose = require('mongoose');
const Student = require('./Backend/models/studentModel');
const StudentFee = require('./Backend/models/StudentFee');

async function checkData() {
    try {
        const mongoURI = "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const studentCount = await Student.countDocuments({});
        console.log('Total Students:', studentCount);

        const feeCount = await StudentFee.countDocuments({});
        console.log('Total Fee Records:', feeCount);

        const students = await Student.find({}).limit(5);
        console.log('Sample Students:', JSON.stringify(students, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkData();
