const Message = require('../models/Message');
const User = require('../models/UserModal');
const Teacher = require('../models/teacherModel');
const Student = require('../models/studentModel');
const { generateConversationId } = require('../utils/conversationId');

// --- Helper Functions ---

/**
 * Validates role-based messaging permissions between two users in the same school.
 */
const validateMessagingPermissions = async (sender, receiver) => {
    // 1. Same School Check
    if (sender.schoolId !== receiver.schoolId) {
        return { allowed: false, error: 'Cannot communicate across different schools.' };
    }

    // 2. Block Check
    if (receiver.isBlockedUsers.includes(sender._id)) {
        return { allowed: false, error: 'You are blocked by this user.' };
    }
    if (sender.isBlockedUsers.includes(receiver._id)) {
        return { allowed: false, error: 'You have blocked this user.' };
    }

    // 3. Role-based restrictions
    if (sender.role === 'admin') return { allowed: true }; // Admin can message anyone in their school

    if (sender.role === 'teacher') {
        if (receiver.role === 'admin' || receiver.role === 'teacher') return { allowed: true };
        
        if (receiver.role === 'student') {
            const teacherProfile = await Teacher.findById(sender.teacherId);
            const studentProfile = await Student.findById(receiver.studentId);
            if (!teacherProfile || !studentProfile) return { allowed: false, error: 'Profile not found.' };

            let isAssigned = teacherProfile.assignedSections.some(
                sectionId => sectionId.toString() === studentProfile.sectionId?.toString()
            );

            if (!isAssigned) {
                try {
                    const Timetable = require('../models/Timetable');
                    const { Grade } = require('../models/School');
                    const studentDoc = await Student.findById(studentProfile._id);
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
                            } catch(e) {}
                        }
                        if (gradeNumber && sectionName) {
                            const isRoutineTeacher = await Timetable.exists({
                                schoolId: sender.schoolId,
                                gradeNumber,
                                sectionName,
                                'assignments.teacherId': teacherProfile._id
                            });
                            if (isRoutineTeacher) isAssigned = true;
                        }
                    }
                } catch (e) {
                    console.error("Error validating messaging via routine:", e);
                }
            }

            return isAssigned 
                ? { allowed: true } 
                : { allowed: false, error: 'Teachers can only message students in their assigned sections or routines.' };
        }
    }

    if (sender.role === 'student') {
        if (receiver.role === 'admin') return { allowed: true };

        const studentProfile = await Student.findById(sender.studentId);
        if (!studentProfile) return { allowed: false, error: 'Student profile not found.' };

        if (receiver.role === 'student') {
            const otherStudentProfile = await Student.findById(receiver.studentId);
            if (!otherStudentProfile) return { allowed: false, error: 'Other student profile not found.' };

            return studentProfile.sectionId?.toString() === otherStudentProfile.sectionId?.toString()
                ? { allowed: true }
                : { allowed: false, error: 'Students can only message others in the same section.' };
        }

        if (receiver.role === 'teacher') {
            const teacherProfile = await Teacher.findById(receiver.teacherId);
            if (!teacherProfile) return { allowed: false, error: 'Teacher profile not found.' };

            let isAssigned = teacherProfile.assignedSections.some(
                sectionId => sectionId.toString() === studentProfile.sectionId?.toString()
            );

            if (!isAssigned) {
                try {
                    const Timetable = require('../models/Timetable');
                    const { Grade } = require('../models/School');
                    const studentDoc = await Student.findById(studentProfile._id);
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
                            } catch(e) {}
                        }
                        if (gradeNumber && sectionName) {
                            const isRoutineTeacher = await Timetable.exists({
                                schoolId: sender.schoolId,
                                gradeNumber,
                                sectionName,
                                'assignments.teacherId': teacherProfile._id
                            });
                            if (isRoutineTeacher) isAssigned = true;
                        }
                    }
                } catch (e) {
                    console.error("Error validating messaging via routine:", e);
                }
            }

            return isAssigned 
                ? { allowed: true } 
                : { allowed: false, error: 'Students can only message teachers assigned to their section or routines.' };
        }
    }

    return { allowed: false, error: 'Unauthorized role transition.' };
};

// --- Controllers ---

/**
 * @desc Send a direct message
 * @route POST /api/messages/send
 */
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, text, images, replyToId } = req.body;
        const senderId = req.user.id; // User ID from decoded token

        if (!receiverId || (!text && (!images || images.length === 0))) {
            return res.status(400).json({ message: 'ReceiverId and content are required.' });
        }

        const [sender, receiver] = await Promise.all([
            User.findById(senderId).lean(),
            User.findById(receiverId).lean()
        ]);

        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found.' });
        }

        // Permission Validation
        const permission = await validateMessagingPermissions(sender, receiver);
        if (!permission.allowed) {
            return res.status(403).json({ message: permission.error });
        }

        const conversationId = generateConversationId(senderId, receiverId);

        const newMessage = new Message({
            schoolId: sender.schoolId,
            senderId,
            receiverId,
            conversationId,
            text,
            images,
            replyToId
        });

        await newMessage.save();

        // Socket logic usually goes here (io.to(receiverId).emit('new_message', ...))
        // For now, returning the message.
        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({ message: 'Server error sending message.' });
    }
};

/**
 * @desc Get all messages in a conversation
 * @route GET /api/messages/:receiverId
 */
exports.getConversation = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const senderId = req.user.id;
        const conversationId = generateConversationId(senderId, receiverId);

        const messages = await Message.find({ 
            conversationId, 
            schoolId: req.schoolId,
            isDeleted: false 
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching conversation.' });
    }
};

/**
 * @desc Get list of all conversations for current user
 * @route GET /api/conversations
 */
exports.getConversationsList = async (req, res) => {
    try {
        const userId = req.user.id;
        const schoolId = req.schoolId;

        // Use aggregation to find the last message for each conversation
        const conversations = await Message.aggregate([
            { $match: { 
                $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
                schoolId: parseInt(schoolId),
                isDeleted: false
            } },
            { $sort: { createdAt: -1 } },
            { $group: {
                _id: '$conversationId',
                lastMessage: { $first: '$$ROOT' },
                unreadCount: { 
                    $sum: { $cond: [{ $and: [{ $eq: ['$receiverId', req.user._id] }, { $eq: ['$read', false] } ] }, 1, 0] } 
                }
            } },
            { $sort: { 'lastMessage.createdAt': -1 } }
        ]);

        // Populate user details for each conversation (sender or receiver depending on who is not 'me')
        const populatedConversations = await Promise.all(conversations.map(async (conv) => {
            const otherUserId = conv.lastMessage.senderId.toString() === userId.toString() 
                ? conv.lastMessage.receiverId 
                : conv.lastMessage.senderId;
            
            const otherUser = await User.findById(otherUserId)
                .select('name email role teacherId studentId adminId')
                .populate('teacherId', 'firstName lastName profilePhoto')
                .populate('studentId', 'firstName lastName profilePhoto')
                .populate('adminId', 'firstName lastName profilePhoto');

            let otherUserName = otherUser?.email || 'Unknown User';
            if (otherUser) {
                if (otherUser.role === 'admin' && otherUser.adminId) {
                    otherUserName = `${otherUser.adminId.firstName || ''} ${otherUser.adminId.lastName || ''}`.trim() || otherUserName;
                } else if (otherUser.role && otherUser[`${otherUser.role}Id`]) {
                    const profile = otherUser[`${otherUser.role}Id`];
                    otherUserName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || otherUserName;
                }
                
                // fallback to their stored name if available and the above failed
                if (otherUser.name && otherUserName === 'Unknown User') {
                    otherUserName = otherUser.name;
                }
            }

            return {
                ...conv,
                otherUser: {
                    _id: otherUser?._id,
                    role: otherUser?.role,
                    email: otherUser?.email,
                    name: otherUserName,
                    profilePhoto: otherUser?.[`${otherUser?.role}Id`]?.profilePhoto || null
                }
            };
        }));

        res.json(populatedConversations);
    } catch (error) {
        console.error('Error in getConversationsList:', error);
        res.status(500).json({ message: 'Server error fetching conversations.' });
    }
};

/**
 * @desc Mark a conversation as read
 * @route PUT /api/messages/read/:conversationId
 */
exports.markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user.id;

        await Message.updateMany(
            { conversationId, receiverId: userId, read: false },
            { $set: { read: true } }
        );

        res.json({ message: 'Conversation marked as read.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error marking read.' });
    }
};

/**
 * @desc Delete a message
 * @route DELETE /api/messages/:id
 */
exports.deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) return res.status(404).json({ message: 'Message not found.' });

        // Only sender can delete their own message
        if (message.senderId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'Unauthorized.' });
        }

        message.isDeleted = true;
        await message.save();

        res.json({ message: 'Message deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting message.' });
    }
};

/**
 * @desc Block a user
 * @route POST /api/block/:userId
 */
exports.blockUser = async (req, res) => {
    try {
        const targetId = req.params.userId;
        const me = await User.findById(req.user.id);

        if (!me.isBlockedUsers.includes(targetId)) {
            me.isBlockedUsers.push(targetId);
            await me.save();
        }

        res.json({ message: 'User blocked.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error blocking user.' });
    }
};

/**
 * @desc Unblock a user
 * @route POST /api/unblock/:userId
 */
exports.unblockUser = async (req, res) => {
    try {
        const targetId = req.params.userId;
        const me = await User.findById(req.user.id);

        me.isBlockedUsers = me.isBlockedUsers.filter(id => id.toString() !== targetId.toString());
        await me.save();

        res.json({ message: 'User unblocked.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error unblocking user.' });
    }
};
