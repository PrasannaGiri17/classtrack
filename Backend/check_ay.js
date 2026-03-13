const mongoose = require('mongoose');
const StudentFee = require('./models/StudentFee');

async function test() {
    try {
        const mongoURI = "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";
        await mongoose.connect(mongoURI);
        
        const fee = await StudentFee.findOne({});
        if (fee) {
            console.log('Sample Fee Academic Year:', fee.academicYear);
        } else {
            console.log('No fee records found at all.');
        }

        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}

test();
