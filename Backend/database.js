const mongoose = require('mongoose');

const mongoURI = "mongodb://localhost:27017/school";
const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      maxPoolSize: 3,          // stay under M0's hard limit of 5
      minPoolSize: 1,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 10000,
      maxIdleTimeMS: 30000,    // release idle connections quickly
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => console.log('Mongoose connected to DB'));
mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));
mongoose.connection.on('disconnected', () => console.log('Mongoose disconnected from DB'));

module.exports = connectDB;