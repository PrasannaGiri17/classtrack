const mongoose = require('mongoose');
const User = require('./models/UserModal');
const Teacher = require('./models/teacherModel');
const Student = require('./models/studentModel');
const Admin = require('./models/AdminModel');

const MONGO_URI = "mongodb://localhost:27017/school"; 

async function syncNames() {
  try {
    console.log("Connecting to Local MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to Local MongoDB");

    const users = await User.find({ 
      $or: [
        { name: { $exists: false } }, 
        { name: "" }, 
        { name: null }, 
        { name: "undefined undefined" },
        { name: "Unknown User" }
      ] 
    });
    console.log(`Found ${users.length} users needing name sync`);

    for (const user of users) {
      let profile;
      if (user.role === 'teacher' && user.teacherId) {
        profile = await Teacher.findById(user.teacherId);
      } else if (user.role === 'student' && user.studentId) {
        profile = await Student.findById(user.studentId);
      } else if (user.role === 'admin' && user.adminId) {
        profile = await Admin.findById(user.adminId);
      }

      if (profile) {
        const name = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Unknown';
        user.name = name;
        await user.save();
        console.log(`Synced name for ${user.email} (Role: ${user.role}): ${name}`);
      } else {
        console.log(`No profile found for ${user.email} (Role: ${user.role})`);
      }
    }

    console.log("Sync complete");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

syncNames();
