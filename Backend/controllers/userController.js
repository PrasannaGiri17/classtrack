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
                    const resolvedIds = profile.assignedSections ? profile.assignedSections.map(s => s.toString()) : [];
                    
                    // Also resolve strings like "Grade 5-A" from assignedClasses/classTeacher
                    const classStrings = [...(profile.assignedClasses || [])];
                    if (profile.classTeacher) classStrings.push(profile.classTeacher);

                    if (classStrings.length > 0) {
                        try {
                            const { Grade: GradeModal } = require('../models/School');
                            const allGrades = await GradeModal.find({ schoolId: sId }).lean();
                            
                            for (const str of classStrings) {
                                // Extract Number and Section Letter (e.g. "Grade 5-A" -> 5, A)
                                const match = str.match(/(\d+)\s*-\s*([A-Z])/i);
                                if (match) {
                                    const gNum = parseInt(match[1]);
                                    const sLetter = match[2].toUpperCase();
                                    
                                    const gradeDoc = allGrades.find(g => g.gradeNumber === gNum);
                                    if (gradeDoc && gradeDoc.sections) {
                                        const section = gradeDoc.sections.find(s => s.sectionName.toUpperCase() === sLetter);
                                        if (section && !resolvedIds.includes(section._id.toString())) {
                                            resolvedIds.push(section._id.toString());
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            console.error("Error resolving class strings for teacher sync:", e);
                        }
                    }
                    userDoc.classIds = resolvedIds;
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

        const { search, role: requestedRole } = req.query;
        let filter = {};

        if (role === 'admin') {
            filter = {
                schoolId: sId,
                _id: { $ne: id },
                role: { $in: ['teacher', 'student'] }
            };
        } else if (role === 'teacher') {
            // Always resolve fresh to handle un-assignment or re-assignment
            let teacherClassIds = [];
            
            try {
                const Timetable = require('../models/Timetable');
                const { Grade } = require('../models/School');
                const profile = await Teacher.findById(currentUser.teacherId).lean();
                
                if (profile) {
                    // 1. Direct assignedSections
                    if (profile.assignedSections) {
                        teacherClassIds.push(...profile.assignedSections.map(id => id.toString()));
                    }

                    // 2. Resolve from class strings (Grade 5-A etc)
                    const classStrings = [...(profile.assignedClasses || [])];
                    if (profile.classTeacher) classStrings.push(profile.classTeacher);
                    
                    if (classStrings.length > 0) {
                        const allGrades = await Grade.find({ schoolId: sId }).lean();
                        for (const str of classStrings) {
                            const match = str.match(/(\d+)\s*-\s*([A-Z])/i);
                            if (match) {
                                const gNum = parseInt(match[1]);
                                const sLetter = match[2].toUpperCase();
                                const gradeDoc = allGrades.find(g => g.gradeNumber === gNum);
                                if (gradeDoc && gradeDoc.sections) {
                                    const section = gradeDoc.sections.find(s => s.sectionName.toUpperCase() === sLetter);
                                    if (section && !teacherClassIds.includes(section._id.toString())) {
                                        teacherClassIds.push(section._id.toString());
                                    }
                                }
                            }
                        }
                    }
                }

                // 3. Add from Timetable
                if (currentUser.teacherId) {
                    const timetables = await Timetable.find({ schoolId: sId, 'assignments.teacherId': currentUser.teacherId });
                    const sectionMap = new Map();
                    timetables.forEach(t => sectionMap.set(`${t.gradeNumber}-${t.sectionName}`, { gNum: t.gradeNumber, sName: t.sectionName }));
                    
                    if (sectionMap.size > 0) {
                        const allGrades = await Grade.find({ schoolId: sId }).lean();
                        for (const { gNum, sName } of sectionMap.values()) {
                            for (const grade of allGrades) {
                                if (grade.gradeNumber.toString() === gNum.toString()) {
                                    const matchingSection = grade.sections.find(s => s.sectionName.toUpperCase() === sName.toUpperCase());
                                    if (matchingSection && !teacherClassIds.includes(matchingSection._id.toString())) {
                                        teacherClassIds.push(matchingSection._id.toString());
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching fresh sections for teacher search:", err);
                teacherClassIds = currentUser.classIds ? [...currentUser.classIds] : [];
            }

            if (requestedRole === 'student') {
                // Find all students in these classes first (more reliable than User.classId cache)
                const studentsInClasses = await Student.find({ schoolId: sId, sectionId: { $in: teacherClassIds } }).select('_id').lean();
                const studentProfileIds = studentsInClasses.map(s => s._id);

                filter = {
                    schoolId: sId,
                    _id: { $ne: id },
                    role: 'student',
                    studentId: { $in: studentProfileIds }
                };
            } else {
                // For general contacts, we still use the cache but supplement with studentId check if needed
                // Actually, let's keep it simple for now or use the same logic
                const studentsInClasses = await Student.find({ schoolId: sId, sectionId: { $in: teacherClassIds } }).select('_id').lean();
                const studentProfileIds = studentsInClasses.map(s => s._id);

                filter = {
                    schoolId: sId,
                    _id: { $ne: id },
                    $or: [
                        { role: 'admin' },
                        { role: 'teacher' },
                        { role: 'student', studentId: { $in: studentProfileIds } }
                    ]
                };
            }
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
            const searchRegex = { $regex: search, $options: 'i' };
            
            // SPECIAL: For teachers searching students, also search by Student model fields (ID, firstName, lastName)
            if (role === 'teacher' && requestedRole === 'student') {
                try {
                    // Extract the class filter we already built
                    const classFilter = filter.studentId; 
                    
                    const matchedStudents = await Student.find({
                        schoolId: sId,
                        ...(classFilter ? { _id: classFilter } : {}), // Respect the classroom restriction
                        $or: [
                            { firstName: searchRegex },
                            { lastName: searchRegex },
                            { studentId: searchRegex }
                        ]
                    }).select('_id').lean();

                    const matchedStudentIds = matchedStudents.map(s => s._id);
                    
                    // Update filter to ONLY these matched student profiles
                    filter.studentId = { $in: matchedStudentIds };
                    
                    // Also allow matching by email on User document if name search fails
                    filter.$or = [
                        { email: searchRegex },
                        { studentId: { $in: matchedStudentIds } }
                    ];
                } catch (err) {
                    console.error("Error in deep search for students:", err);
                }
            } else {
                // Default search on User document
                filter.$and = [
                    { ...filter },
                    {
                        $or: [
                            { name: searchRegex },
                            { email: searchRegex }
                        ]
                    }
                ];
                if (requestedRole) {
                    filter.$and.push({ role: requestedRole });
                }
                delete filter.name;
            }
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
