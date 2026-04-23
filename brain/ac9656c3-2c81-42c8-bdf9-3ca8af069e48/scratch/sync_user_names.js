const mongoose = require('mongoose');
const User = require('./Backend/models/UserModal');
const Teacher = require('./Backend/models/teacherModel');
const Student = require('./Backend/models/studentModel');
const Admin = require('./Backend/models/AdminModel');

const MONGO_URI = "mongodb://localhost:27017/school_management"; // Adjust if different

async function syncNames() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const users = await User.find({ $or: [{ name: { $exists: false } }, { name: "" }, { name: null }] });
    console.log(`Found ${users.length} users with missing names`);

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
        console.log(`Synced name for ${user.email}: ${name}`);
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
