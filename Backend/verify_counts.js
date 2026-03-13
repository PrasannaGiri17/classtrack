const mongoose = require('mongoose');
const FeeRecord = require('./models/FeeRecord');
const Student = require('./models/studentModel');

async function check() {
    try {
        const mongoURI = "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";
        await mongoose.connect(mongoURI);
        
        const sCount = await Student.countDocuments({ status: 'active' });
        const fCount = await FeeRecord.countDocuments({});
        
        console.log('Active Students:', sCount);
        console.log('Total Fee Records:', fCount);
        
        const sample = await FeeRecord.findOne().populate('student');
        console.log('Sample Record Student Name:', sample ? `${sample.student?.firstName} ${sample.student?.lastName}` : 'NONE');

        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}

check();
