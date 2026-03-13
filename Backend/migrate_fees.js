const mongoose = require('mongoose');
const FeeRecord = require('./models/FeeRecord');

async function migrate() {
    try {
        const mongoURI = "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";
        await mongoose.connect(mongoURI);
        
        const records = await FeeRecord.find({ baseFee: { $exists: false } });
        console.log(`Found ${records.length} records to update`);
        
        for (const record of records) {
            record.baseFee = record.totalAmount;
            record.extraFees = [];
            record.admissionFee = 0;
            await record.save();
        }
        
        console.log(`Updated ${records.length} records`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();
