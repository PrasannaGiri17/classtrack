const mongoose = require('mongoose');
const Student = require('./models/studentModel');

async function test() {
    try {
        const mongoURI = "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";
        await mongoose.connect(mongoURI);
        
        const students = await Student.find({}).limit(5);
        console.log(JSON.stringify(students, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

test();
