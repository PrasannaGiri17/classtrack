const mongoose = require('mongoose');
const User = require('./models/UserModal');
const mongoURI = "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";

async function checkUsers() {
    try {
        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB");
        const users = await User.find({}).select('email role').limit(20);
        console.log("Users and Roles:");
        users.forEach(u => console.log(`- ${u.email}: ${u.role}`));
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkUsers();
