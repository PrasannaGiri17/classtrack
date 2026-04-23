const mongoose = require('mongoose');
const User = require('./models/UserModal');
const Teacher = require('./models/teacherModel');
const Student = require('./models/studentModel');
const { Grade } = require('./models/School');

const URI = 'mongodb://localhost:27017/school';

async function syncAllUserCache() {
    try {
        await mongoose.connect(URI);
        console.log("Connected to database for global sync...");

        const users = await User.find({});
        console.log(`Processing ${users.length} users...`);

        const allGrades = await Grade.find({}).lean();
        
        let updatedCount = 0;

        for (const user of users) {
            let changed = false;

            if (user.role === 'student' && user.studentId) {
                const profile = await Student.findById(user.studentId);
                if (profile) {
                    const expectedName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.name;
                    const expectedClassId = profile.sectionId ? profile.sectionId.toString() : null;

                    if (user.name !== expectedName) {
                        user.name = expectedName;
                        changed = true;
                    }
                    if (user.classId !== expectedClassId) {
                        user.classId = expectedClassId;
                        changed = true;
                    }
                }
            } else if (user.role === 'teacher' && user.teacherId) {
                const profile = await Teacher.findById(user.teacherId);
                if (profile) {
                    const expectedName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.name;
                    
                    // Resolve IDs from assignedSections and assignedClasses
                    const resolvedIds = profile.assignedSections ? profile.assignedSections.map(s => s.toString()) : [];
                    const classStrings = [...(profile.assignedClasses || [])];
                    if (profile.classTeacher) classStrings.push(profile.classTeacher);

                    for (const str of classStrings) {
                        const match = str.match(/(\d+)\s*-\s*([A-Z])/i);
                        if (match) {
                            const gNum = parseInt(match[1]);
                            const sLetter = match[2].toUpperCase();
                            const gradeDoc = allGrades.find(g => g.gradeNumber === gNum && g.schoolId === profile.schoolId);
                            if (gradeDoc && gradeDoc.sections) {
                                const section = gradeDoc.sections.find(s => s.sectionName.toUpperCase() === sLetter);
                                if (section && !resolvedIds.includes(section._id.toString())) {
                                    resolvedIds.push(section._id.toString());
                                }
                            }
                        }
                    }

                    if (user.name !== expectedName) {
                        user.name = expectedName;
                        changed = true;
                    }
                    
                    // Check if classIds arrays are equal
                    const currentIds = (user.classIds || []).sort();
                    const nextIds = resolvedIds.sort();
                    if (JSON.stringify(currentIds) !== JSON.stringify(nextIds)) {
                        user.classIds = resolvedIds;
                        changed = true;
                    }
                }
            }

            if (changed) {
                await user.save();
                updatedCount++;
            }
        }

        console.log(`SUCCESS: Synced ${updatedCount} user records.`);
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

syncAllUserCache();
