const mongoose = require('mongoose');
const FeeRecord = require('./models/FeeRecord');

async function check() {
    try {
        const mongoURI = "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";
        await mongoose.connect(mongoURI);
        
        const record = await FeeRecord.findOne({});
        console.log('Sample Record:', record);

        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}

check();
