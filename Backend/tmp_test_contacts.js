const mongoose = require('mongoose');
const User = require('./models/UserModal');

async function test() {
    await mongoose.connect('mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0');
    
    // Find admin
    const admin = await User.findOne({ role: 'admin', schoolId: 2 });
    if (!admin) {
        console.log("No admin found for schoolId 2");
    } else {
        console.log("Admin schoolId:", admin.schoolId, "id:", admin._id);
        const filter = { schoolId: parseInt(admin.schoolId), _id: { $ne: admin._id }, role: { $in: ['teacher', 'student'] } };
        const contacts = await User.find(filter);
        console.log("Admin seeing contacts (length):", contacts.length);
        console.log("Admin seeing contacts:", contacts.map(c => ({ name: c.name, role: c.role })));
    }

    // Find a teacher in schoolId 2
    const teacher = await User.findOne({ role: 'teacher', schoolId: 2 });
    if (teacher) {
        console.log("Teacher classIds:", teacher.classIds);
        const tFilter = {
            schoolId: 2,
            _id: { $ne: teacher._id },
            $or: [
                { role: 'admin' },
                { role: 'teacher' },
                { role: 'student', classId: { $in: teacher.classIds || [] } }
            ]
        };
        const tContacts = await User.find(tFilter);
        console.log("Teacher contacts (length):", tContacts.length);
        console.log("Teacher contacts:", tContacts.map(c => ({ name: c.name, role: c.role, classId: c.classId })));
    }
    
    // Find a student in schoolId 2
    const student = await User.findOne({ role: 'student', schoolId: 2 });
    if (student) {
        console.log("Student classId:", student.classId);
        const sFilter = {
            schoolId: 2,
            _id: { $ne: student._id },
            $or: [
                { role: 'admin' },
                { role: 'teacher', classIds: student.classId },
                { role: 'student', classId: student.classId }
            ]
        };
        const sContacts = await User.find(sFilter);
        console.log("Student contacts (length):", sContacts.length);
        console.log("Student contacts:", sContacts.map(c => ({ name: c.name, role: c.role })));
    }

    process.exit(0);
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
