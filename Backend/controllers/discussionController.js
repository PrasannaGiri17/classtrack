const Discussion = require('../models/Discussion');
const Comment = require('../models/Comment');

// Create Discussion
exports.createDiscussion = async (req, res) => {
  try {
    const { gradeId, subjectId, title, body, imageUrls } = req.body;
    
    // Auth info from protect middleware
    const schoolId = req.user.schoolId || req.schoolId;
    let finalGradeId = gradeId;

    if (!finalGradeId && req.user.role === 'student' && req.user.studentId) {
      const Student = require('../models/studentModel');
      const student = await Student.findById(req.user.studentId);
      finalGradeId = student?.classId;
    }

    if (!finalGradeId) {
      return res.status(400).json({ message: "gradeId is required" });
    }

    const authorRole = req.user.role; 
    const authorRoleModel = authorRole === 'student' ? 'Student' : 'Teacher';
    const authorId = req.user.studentId || req.user.teacherId || req.user._id || req.user.id;
    
    let authorName = "Unknown User";
    let authorAvatar = req.user.profilePhoto || req.user.avatar;

    if (authorRole === 'student' && req.user.studentId) {
      const Student = require('../models/studentModel');
      const student = await Student.findById(req.user.studentId);
      if (student) {
        authorName = `${student.firstName} ${student.lastName}`.trim();
        authorAvatar = student.profilePhoto || authorAvatar;
      }
    } else if (authorRole === 'teacher' && req.user.teacherId) {
      const Teacher = require('../models/teacherModel');
      const teacher = await Teacher.findById(req.user.teacherId);
      if (teacher) {
        authorName = `${teacher.firstName} ${teacher.lastName}`.trim();
        authorAvatar = teacher.profilePhoto || authorAvatar;
      }
    }

    const newDiscussion = new Discussion({
      schoolId,
      gradeId: finalGradeId,
      subjectId,
      title,
      body,
      imageUrls: imageUrls || [],
      authorId,
      authorRoleModel,
      authorName,
      authorRole,
      authorAvatar,
      commentCount: 0
    });

    const savedPost = await newDiscussion.save();
    res.status(201).json(savedPost);
  } catch (err) {
    console.error("CREATE_DISCUSSION_ERROR:", err);
    res.status(400).json({ message: err.message || "Failed to create discussion" });
  }
};

// Get Discussions (with filtering and search)
exports.getDiscussions = async (req, res) => {
  try {
    const schoolId = req.user.schoolId || req.schoolId;
    const { subjectId, search, gradeId } = req.query;

    let filter = { schoolId };

    // Filtering by grade (students usually see their own grade, teachers may see all or specified)
    if (gradeId) {
      filter.gradeId = gradeId;
    } else if (req.user.role === 'student' && req.user.gradeId) {
      filter.gradeId = req.user.gradeId;
    }

    if (subjectId && subjectId !== 'all') {
      filter.subjectId = subjectId;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const discussions = await Discussion.find(filter)
      .sort({ createdAt: -1 })
      .populate('authorId', 'firstName lastName profilePhoto');
    
    // Transform to maintain compatibility
    const results = await Promise.all(discussions.map(async d => {
        let doc = d.toObject();
        
        // 1. Resolve author details from populated object
        if (doc.authorId && typeof doc.authorId === 'object') {
            doc.authorName = `${doc.authorId.firstName} ${doc.authorId.lastName}`.trim();
            doc.authorAvatar = doc.authorId.profilePhoto;
            doc.authorId = doc.authorId._id;
        } 
        
        // 2. REPAIR LOGIC: If still missing name, try manual lookup (Legacy Data Fix)
        if (!doc.authorName || doc.authorName === 'Undefined Undefined' || doc.authorName.includes('undefined')) {
            try {
                const RoleModel = doc.authorRole === 'teacher' ? require('../models/teacherModel') : require('../models/studentModel');
                const profile = await RoleModel.findById(doc.authorId);
                if (profile) {
                    doc.authorName = `${profile.firstName} ${profile.lastName}`.trim();
                    doc.authorAvatar = profile.profilePhoto;
                    // Auto-repair the record in DB
                    await Discussion.findByIdAndUpdate(doc._id, { 
                        authorName: doc.authorName, 
                        authorAvatar: doc.authorAvatar,
                        authorRoleModel: doc.authorRole === 'teacher' ? 'Teacher' : 'Student'
                    });
                }
            } catch (err) { /* ignore repair fails */ }
        }

        // Final safety fallback
        if (!doc.authorName || doc.authorName === 'Undefined Undefined' || doc.authorName.includes('undefined')) {
            doc.authorName = (doc.authorRole === 'teacher' ? 'School Teacher' : 'School Student');
        }
        return doc;
    }));

    res.status(200).json(results);
  } catch (err) {
    console.error("GET_DISCUSSIONS_ERROR:", err);
    res.status(500).json({ message: "Failed to fetch discussions" });
  }
};

// Get Discussion By ID
exports.getDiscussionById = async (req, res) => {
  try {
    const schoolId = req.user.schoolId || req.schoolId;
    const post = await Discussion.findOne({ _id: req.params.id, schoolId })
      .populate('authorId', 'firstName lastName profilePhoto');

    if (!post) {
      return res.status(404).json({ message: "Discussion not found or access denied" });
    }

    let doc = post.toObject();
    if (doc.authorId && typeof doc.authorId === 'object') {
        doc.authorName = `${doc.authorId.firstName} ${doc.authorId.lastName}`.trim();
        doc.authorAvatar = doc.authorId.profilePhoto;
        doc.authorId = doc.authorId._id;
    }

    // Repair logic for Detail View
    if (!doc.authorName || doc.authorName === 'Undefined Undefined' || doc.authorName.includes('undefined')) {
        try {
            const RoleModel = doc.authorRole === 'teacher' ? require('../models/teacherModel') : require('../models/studentModel');
            const profile = await RoleModel.findById(doc.authorId);
            if (profile) {
                doc.authorName = `${profile.firstName} ${profile.lastName}`.trim();
                doc.authorAvatar = profile.profilePhoto;
            }
        } catch (err) {}
    }

    if (!doc.authorName || doc.authorName === 'Undefined Undefined' || doc.authorName.includes('undefined')) {
      doc.authorName = (doc.authorRole === 'teacher' ? 'School Teacher' : 'School Student');
    }

    res.status(200).json(doc);
  } catch (err) {
    console.error("GET_DISCUSSION_BY_ID_ERROR:", err);
    res.status(500).json({ message: "Error fetching discussion details" });
  }
};

// Delete Discussion
exports.deleteDiscussion = async (req, res) => {
  try {
    const schoolId = req.user.schoolId || req.schoolId;
    const authorId = req.user._id || req.user.id;

    // Must match both school and author (unless admin role added later)
    const post = await Discussion.findOneAndDelete({
      _id: req.params.id,
      schoolId,
      authorId
    });

    if (!post) {
      return res.status(403).json({ message: "You are not authorized to delete this post or it doesn't exist" });
    }

    // Also delete associated comments
    await Comment.deleteMany({ postId: req.params.id });

    res.status(200).json({ message: "Discussion deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete discussion" });
  }
};

exports.reportDiscussion = async (req, res) => {
  try {
    const schoolId = req.user.schoolId || req.schoolId;
    const { id } = req.params;

    // If a teacher reports, we treat it as an immediate delete/ban for quality control
    if (req.user.role === 'teacher') {
      const discussion = await Discussion.findOneAndDelete({ _id: id, schoolId });
      if (discussion) {
        // Also delete associated comments
        await Comment.deleteMany({ postId: id, schoolId });
        console.log(`[MODERATION] Post ${id} DELETED by teacher ${req.user.id} at school ${schoolId}`);
        return res.status(200).json({ message: "Discussion has been removed by teacher moderation" });
      }
    }

    // Default reporting (for students or non-matches)
    console.log(`[REPORT] Post ${id} reported by user ${req.user.id} at school ${schoolId}`);
    res.status(200).json({ message: "Post has been reported for review" });
  } catch (err) {
    console.error("REPORT_DISCUSSION_ERROR:", err);
    res.status(500).json({ message: "Failed to report post" });
  }
};

// COMMENT CONTROLLER LOGIC

// Add Comment
exports.addComment = async (req, res) => {
  try {
    const { body, imageUrls } = req.body;
    const schoolId = req.user.schoolId || req.schoolId;
    const authorRole = req.user.role;
    const authorRoleModel = authorRole === 'student' ? 'Student' : 'Teacher';
    const authorId = req.user.studentId || req.user.teacherId || req.user._id || req.user.id;

    let authorName = "Unknown User";
    let authorAvatar = req.user.profilePhoto || req.user.avatar;

    if (authorRole === 'student' && req.user.studentId) {
      const Student = require('../models/studentModel');
      const student = await Student.findById(req.user.studentId);
      if (student) {
        authorName = `${student.firstName} ${student.lastName}`.trim();
        authorAvatar = student.profilePhoto || authorAvatar;
      }
    } else if (authorRole === 'teacher' && req.user.teacherId) {
      const Teacher = require('../models/teacherModel');
      const teacher = await Teacher.findById(req.user.teacherId);
      if (teacher) {
        authorName = `${teacher.firstName} ${teacher.lastName}`.trim();
        authorAvatar = teacher.profilePhoto || authorAvatar;
      }
    }

    // Verify post exists in this school
    const discussion = await Discussion.findOne({ _id: req.params.id, schoolId });
    if (!discussion) return res.status(404).json({ message: "Discussion not found" });

    const newComment = new Comment({
      schoolId,
      postId: req.params.id,
      authorId,
      authorRoleModel,
      authorName,
      authorRole,
      authorAvatar,
      body,
      imageUrls: imageUrls || []
    });

    const savedComment = await newComment.save();

    // Increment commentCount in Discussion
    await Discussion.findByIdAndUpdate(req.params.id, { $inc: { commentCount: 1 } });

    res.status(201).json(savedComment);
  } catch (err) {
    console.error("ADD_COMMENT_ERROR:", err);
    res.status(400).json({ message: "Failed to add comment" });
  }
};

// Get Comments for Post
exports.getCommentsByPost = async (req, res) => {
  try {
    const schoolId = req.user.schoolId || req.schoolId;
    const comments = await Comment.find({ postId: req.params.id, schoolId })
      .sort({ createdAt: 1 })
      .populate('authorId', 'firstName lastName profilePhoto');

    const results = comments.map(c => {
        const doc = c.toObject();
        if (doc.authorId && typeof doc.authorId === 'object') {
            doc.authorName = `${doc.authorId.firstName} ${doc.authorId.lastName}`.trim();
            doc.authorAvatar = doc.authorId.profilePhoto;
            doc.authorId = doc.authorId._id;
        }

        // Final safety check
        if (!doc.authorName || doc.authorName === 'Undefined Undefined' || doc.authorName.includes('undefined')) {
            doc.authorName = (doc.authorRole === 'teacher' ? 'School Teacher' : 'School Student');
        }
        return doc;
    });

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: "Failed to load comments" });
  }
};
