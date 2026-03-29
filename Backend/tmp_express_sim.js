const mongoose = require('mongoose');
const userController = require('./controllers/userController');
const User = require('./models/UserModal');

async function testFetch() {
    await mongoose.connect('mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0');
    
    // Simulate Teacher fetching contacts
    const teacherUser = await User.findOne({role: 'teacher'});
    if (!teacherUser) { console.log('TEACHER NOT FOUND'); return; }
    const req1 = {
        user: teacherUser,
        query: {}
    };
    
    let res1Data = [];
    const res1 = {
        json: (data) => {
            console.log('TEACHER SUCCESS JSON CALLED:', data.length, 'items');
            console.log('Teacher students items:', data.filter(d => d.role === 'student').length);
        },
        status: (code) => {
            console.log('STATUS CALLED:', code);
            return res1;
        }
    };
    
    await userController.getContactableUsers(req1, res1);

    // Simulate Student fetching contacts
    const studentUser = await User.findOne({role: 'student'});
    if (!studentUser) { console.log('STUDENT NOT FOUND'); return; }
    const req2 = {
        user: studentUser,
        query: {}
    };
    
    const res2 = {
        json: (data) => {
            console.log('STUDENT SUCCESS JSON CALLED:', data.length, 'items');
            console.log('Student teachers items:', data.filter(d => d.role === 'teacher').length);
            process.exit(0);
        },
        status: (code) => {
            console.log('STATUS CALLED:', code);
            return res2;
        }
    };

    await userController.getContactableUsers(req2, res2);
}

testFetch().catch(e => {
    console.log('TOP LEVEL ERROR', e);
    process.exit(1);
});
