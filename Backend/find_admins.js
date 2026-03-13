const mongoose = require('mongoose');
const User = require('./models/UserModal');
const mongoURI = "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";

async function findAdmins() {
    try {
        await mongoose.connect(mongoURI);
        const admins = await User.find({ role: 'admin' });
        console.log(`Found ${admins.length} admins:`);
        admins.forEach(a => console.log(`- ${a.email}`));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findAdmins();
