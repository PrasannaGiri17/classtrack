const mongoose = require('mongoose');
const User = require('./models/UserModal');
const Teacher = require('./models/teacherModel');
const Student = require('./models/studentModel');
const Admin = require('./models/AdminModel');

async function test() {
    await mongoose.connect('mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0');
    try {
        const id = '69784ae83c186fef3cb42168'; 
        const role = 'teacher'; 
        const sId = 1; 
        
        const filter = { 
            schoolId: sId, 
            _id: { $ne: id }, 
            $or: [ 
                { role: 'admin' }, 
                { role: 'teacher' }, 
                { role: 'student', classId: { $in: [] } } 
            ] 
        }; 
        
        const users = await User.find(filter)
            .select('name role email isBlockedUsers teacherId studentId adminId')
            .populate('teacherId', 'firstName lastName profilePhoto')
            .populate('studentId', 'firstName lastName profilePhoto')
            .populate('adminId', 'firstName lastName profilePhoto')
            .lean(); 
            
        console.log('Total found:', users.length); 
        
        const formattedUsers = users.map(u => { 
            let displayName = u.name; 
            if (!displayName) { 
                if (u.role === 'admin' && u.adminId && u.adminId.firstName) displayName = u.adminId.firstName + ' ' + u.adminId.lastName; 
                else if (u.role === 'teacher' && u.teacherId && u.teacherId.firstName) displayName = u.teacherId.firstName + ' ' + u.teacherId.lastName; 
                else if (u.role === 'student' && u.studentId && u.studentId.firstName) displayName = u.studentId.firstName + ' ' + u.studentId.lastName; 
                else displayName = u.email; 
            } 
            return { _id: u._id, role: u.role, name: displayName, adminId: !!u.adminId, teacherId: !!u.teacherId, studentId: !!u.studentId }; 
        }); 
        
        console.log('Formatted preview:', formattedUsers.slice(0,3)); 
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

test();
