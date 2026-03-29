const mongoose = require('mongoose');
require('dotenv').config();

// Models
const User = require('./models/UserModal');
const Teacher = require('./models/teacherModel');
const Student = require('./models/studentModel');
const Admin = require('./models/AdminModel');

const syncMessagingContext = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log(`Found ${users.length} users to sync.`);

        for (let user of users) {
            let updated = false;

            if (user.role === 'student' && user.studentId) {
                const profile = await Student.findById(user.studentId);
                if (profile) {
                    user.name = `${profile.firstName} ${profile.lastName}`;
                    user.classId = profile.sectionId?.toString();
                    if (!user.schoolId) user.schoolId = profile.schoolId;
                    updated = true;
                }
            } else if (user.role === 'teacher' && user.teacherId) {
                const profile = await Teacher.findById(user.teacherId);
                if (profile) {
                    user.name = `${profile.firstName} ${profile.lastName}`;
                    user.classIds = profile.assignedSections?.map(s => s.toString()) || [];
                    if (!user.schoolId) user.schoolId = profile.schoolId;
                    updated = true;
                }
            } else if (user.role === 'admin' && user.adminId) {
                const profile = await Admin.findById(user.adminId);
                if (profile) {
                    user.name = `${profile.firstName} ${profile.lastName}`;
                    if (!user.schoolId) user.schoolId = profile.schoolId;
                    updated = true;
                }
            }

            if (updated) {
                await user.save();
                console.log(`Synced user: ${user.email}`);
            }
        }

        console.log('Messaging context sync completed.');
        process.exit(0);
    } catch (error) {
        console.error('Error during sync:', error);
        process.exit(1);
    }
};

syncMessagingContext();
