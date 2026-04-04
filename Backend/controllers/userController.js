const User = require('../models/UserModal');
const Teacher = require('../models/teacherModel');
const Student = require('../models/studentModel');
const Admin = require('../models/AdminModel');

/**
 * @desc Get list of contactable users for current user (multi-tenant)
 * @route GET /api/users
 */
exports.getContactableUsers = async (req, res) => {
    try {
        const id = req.user._id;
        const { role, schoolId } = req.user;
        const sId = parseInt(schoolId);

        // Always fetch fresh current user
        let currentUser = await User.findById(id).lean();

        // --- Lazy Sync: populate name/classId/classIds if missing ---
        const needsSync = !currentUser.name
            || (role === 'student' && !currentUser.classId)
            || (role === 'teacher' && (!currentUser.classIds || currentUser.classIds.length === 0));

        if (needsSync) {
            const userDoc = await User.findById(id);
            if (role === 'student' && userDoc.studentId) {
                const profile = await Student.findById(userDoc.studentId);
                if (profile) {
                    userDoc.name = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.name || 'Student';
                    userDoc.classId = profile.sectionId ? profile.sectionId.toString() : null;
                }
            } else if (role === 'teacher' && userDoc.teacherId) {
                const profile = await Teacher.findById(userDoc.teacherId);
                if (profile) {
                    userDoc.name = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.name || 'Teacher';
                    userDoc.classIds = profile.assignedSections ? profile.assignedSections.map(s => s.toString()) : [];
                }
            } else if (role === 'admin' && userDoc.adminId) {
                const profile = await Admin.findById(userDoc.adminId);
                if (profile) {
                    userDoc.name = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Admin';
                }
            }
            if (!userDoc.schoolId) userDoc.schoolId = sId;
            try { await userDoc.save(); } catch(e) { console.error("Auto sync save failed", e); }
            currentUser = userDoc.toObject();
        }

        const { search } = req.query;
        let filter = {};

        if (role === 'admin') {
            filter = {
                schoolId: sId,
                _id: { $ne: id },
                role: { $in: ['teacher', 'student'] }
            };
        } else if (role === 'teacher') {
            const teacherClassIds = currentUser.classIds ? [...currentUser.classIds] : [];
            
            // Look up routines where this teacher teaches to add those sections
            try {
                const Timetable = require('../models/Timetable');
                const { Grade } = require('../models/School');
                if (currentUser.teacherId) {
                    const timetables = await Timetable.find({ schoolId: sId, 'assignments.teacherId': currentUser.teacherId });
                    
                    const sectionMap = new Map();
                    timetables.forEach(t => sectionMap.set(`${t.gradeNumber}-${t.sectionName}`, { gNum: t.gradeNumber, sName: t.sectionName }));
                    
                    for (const { gNum, sName } of sectionMap.values()) {
                        // Find Grade that matches gNum, then find its embedded section matching sName
                        const grades = await Grade.find({ schoolId: sId });
                        for (const grade of grades) {
                            if (grade.gradeNumber.toString() === gNum.toString()) {
                                const matchingSection = grade.sections.find(s => s.sectionName === sName);
                                if (matchingSection && !teacherClassIds.includes(matchingSection._id.toString())) {
                                    teacherClassIds.push(matchingSection._id.toString());
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching routine for teacher:", err);
            }

            filter = {
                schoolId: sId,
                _id: { $ne: id },
                $or: [
                    { role: 'admin' },
                    { role: 'teacher' },
                    { role: 'student', classId: { $in: teacherClassIds } }
                ]
            };
        } else if (role === 'student') {
            const myClassId = currentUser.classId;
            const routineTeacherIds = [];
            
            // Look up routines for this student's section to add those teachers
            try {
                const Timetable = require('../models/Timetable');
                const { Grade } = require('../models/School');
                // No populate needed since section is an embedded doc in Grade
                const studentDoc = await Student.findById(currentUser.studentId);
                
                if (studentDoc) {
                    let gradeNumber = studentDoc.studentClass?.toString() || null;
                    let sectionName = null;

                    if (studentDoc.classId) {
                        try {
                            const gradeObj = await Grade.findById(studentDoc.classId);
                            if (gradeObj) {
                                if (!gradeNumber) gradeNumber = gradeObj.gradeNumber.toString();
                                if (studentDoc.sectionId) {
                                    const secObj = gradeObj.sections.id(studentDoc.sectionId);
                                    if (secObj) sectionName = secObj.sectionName;
                                }
                            }
                        } catch(e) { console.error("Grade fetch error:", e); }
                    }
                    
                    if (gradeNumber && sectionName) {
                        const timetables = await Timetable.find({ schoolId: sId, gradeNumber, sectionName });
                        timetables.forEach(t => {
                            (t.assignments || []).forEach(a => {
                                if (a.teacherId && !routineTeacherIds.includes(a.teacherId.toString())) {
                                    routineTeacherIds.push(a.teacherId.toString());
                                }
                            });
                        });
                    }
                }
            } catch (err) {
                console.error("Error fetching routine for student:", err);
            }

            filter = {
                schoolId: sId,
                _id: { $ne: id },
                $or: [
                    { role: 'admin' },
                    { role: 'teacher', classIds: myClassId },
                    { role: 'teacher', teacherId: { $in: routineTeacherIds } },
                    { role: 'student', classId: myClassId }
                ]
            };
        } else {
            return res.json([]);
        }

        if (search) {
            // Match search query at the beginning of the name or at the beginning of any word in the name
            filter.name = { $regex: `(^|\\s)${search}`, $options: 'i' };
        }

        const users = await User.find(filter)
            .select('name role email isBlockedUsers teacherId studentId adminId')
            .populate({
                path: 'teacherId',
                select: 'firstName lastName profilePhoto teacherCode primarySubject',
                populate: { path: 'primarySubject', select: 'subjectName' }
            })
            .populate('studentId', 'firstName lastName profilePhoto studentId studentClass')
            .populate('adminId', 'firstName lastName profilePhoto')
            .lean();

        const myBlockedIds = (currentUser.isBlockedUsers || []).map(b => b.toString());

        const formattedUsers = users.map(u => {
            let displayName = u.name;
            if (!displayName || displayName === 'undefined undefined' || displayName.trim() === '') {
                if (u.role === 'admin' && u.adminId) displayName = `${u.adminId.firstName || ''} ${u.adminId.lastName || ''}`.trim();
                else if (u.role === 'teacher' && u.teacherId) displayName = `${u.teacherId.firstName || ''} ${u.teacherId.lastName || ''}`.trim();
                else if (u.role === 'student' && u.studentId) displayName = `${u.studentId.firstName || ''} ${u.studentId.lastName || ''}`.trim();
                else displayName = u.email;
            }
            if (!displayName || displayName.trim() === '') displayName = 'Unknown User';

            let photo = null;
            if (u.role === 'admin' && u.adminId) photo = u.adminId.profilePhoto;
            else if (u.role === 'teacher' && u.teacherId) photo = u.teacherId.profilePhoto;
            else if (u.role === 'student' && u.studentId) photo = u.studentId.profilePhoto;

            let extraInfo = {};
            if (u.role === 'student' && u.studentId) {
                extraInfo = {
                    studentIdStr: u.studentId.studentId,
                    studentClass: u.studentId.studentClass
                };
            } else if (u.role === 'teacher' && u.teacherId) {
                extraInfo = {
                    teacherCode: u.teacherId.teacherCode,
                    facultySubject: u.teacherId.primarySubject?.subjectName || 'Faculty'
                };
            }

            return {
                _id: u._id,
                role: u.role,
                email: u.email,
                name: displayName,
                profilePhoto: photo || null,
                isBlockedByMe: myBlockedIds.includes(u._id.toString()),
                studentId: u.role === 'student' ? u.studentId?._id : null,
                teacherId: u.role === 'teacher' ? u.teacherId?._id : null,
                ...extraInfo
            };
        });

        res.json(formattedUsers);
    } catch (error) {
        console.error('[Messaging] Error in getContactableUsers:', error);
        res.status(500).json({ message: 'Server error fetching users.', error: error.message });
    }
};
