//mongodb+srv://schooladmin:<school123>@cluster0.ns8mpgy.mongodb.net/?appName=Cluster0
//username: schooladmin
//password: school123
const mongoose = require('mongoose');
const mongoURI = "mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0";
const connectDB = async () => {
    try{
        await mongoose.connect(mongoURI);
        console.log("MongoDB connected successfully");
    }catch(err){
        console.error("MongoDB connection failed:", err.message);
        process.exit(1);
    }
}
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from DB');
});


module.exports = connectDB;