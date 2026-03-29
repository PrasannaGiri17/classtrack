const mongoose = require('mongoose');

async function debug() {
    await mongoose.connect('mongodb+srv://schooladmin:school123@cluster0.ns8mpgy.mongodb.net/school?retryWrites=true&w=majority&appName=Cluster0');
    
    const User = require('./models/UserModal');
    const Student = require('./models/studentModel');
    const Teacher = require('./models/teacherModel');
    const Section = require('./models/Section');
    const Class = require('./models/Class');
    const Timetable = require('./models/Timetable');

    // DEBUG STUDENT
    const userStudent = await User.findById('69bebcd2f90e172ec1ff26f5');
    console.log("---- STUDENT ----");
    if (userStudent && userStudent.studentId) {
        const student = await Student.findById(userStudent.studentId).populate('sectionId');
        let gNum = student.studentClass?.toString();
        if (!gNum && student.classId) {
            const cl = await Class.findById(student.classId);
            if (cl) gNum = cl.className;
        }
        const sName = student.sectionId ? student.sectionId.sectionName : null;
        console.log("Student Name:", student.firstName);
        console.log("Evaluated gradeNumber for Student:", gNum);
        console.log("Evaluated sectionName for Student:", sName);
        
        if (gNum && sName) {
            const ts = await Timetable.find({ schoolId: userStudent.schoolId, gradeNumber: gNum, sectionName: sName });
            console.log(`Found ${ts.length} timetables for Student!`);
        }
    } else {
        console.log("Student User not found or no studentId tied.");
    }

    // DEBUG TEACHER
    const userTeacher = await User.findById('69bebb91078b5114853b429b');
    console.log("---- TEACHER ----");
    if (userTeacher && userTeacher.teacherId) {
        console.log("Teacher User mapped to teacherId:", userTeacher.teacherId);
        const ts = await Timetable.find({ 
            schoolId: userTeacher.schoolId, 
            'assignments.teacherId': userTeacher.teacherId 
        });
        console.log(`Found ${ts.length} timetables where this Teacher is assigned!`);
        
        const sectionMap = new Map();
        ts.forEach(t => sectionMap.set(`${t.gradeNumber}-${t.sectionName}`, { gNum: t.gradeNumber, sName: t.sectionName }));
        console.log("Teacher is mapped to grades/sections:", Array.from(sectionMap.values()));
        
        for (const { gNum, sName } of sectionMap.values()) {
            const sections = await Section.find({ schoolId: userTeacher.schoolId, sectionName: sName }).populate('classId');
            console.log(`For sName=${sName}, found ${sections.length} sections in DB.`);
            sections.forEach(sec => {
                const matchClass = sec.classId && (sec.classId.className === gNum || sec.classId.gradeNumber === gNum);
                console.log(`  -> sec._id=${sec._id}, class match? ${matchClass}`);
            });
        }
    } else {
        console.log("Teacher User not found or no teacherId.");
    }
    
    process.exit(0);
}

debug();
