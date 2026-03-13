const mongoose = require('mongoose');
const Student = require('./models/studentModel');
const { Grade } = require('./models/School');

async function test() {
    try {
        const mongoURI = "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";
        await mongoose.connect(mongoURI);
        
        const students = await Student.find({});
        console.log('Total Students in DB:', students.length);
        if (students.length > 0) {
            console.log('Fields:', Object.keys(students[0].toObject()));
            console.log('Sample Status:', students[0].status);
            console.log('Sample ClassId:', students[0].classId);
        }

        const grades = await Grade.find({});
        console.log('Total Grades in DB:', grades.length);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
