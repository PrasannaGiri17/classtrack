const ClassroomNotice = require("../models/ClassroomNotice");
const Student = require("../models/studentModel");
const { Grade } = require("../models/School");

const createNotice = async (req, res) => {
  try {
    const { text, authorId, authorName, authorType, sectionId } = req.body;

    // Optional: Validation of authorization
    // If student, check if sectionId matches their enrollment
    if (authorType === 'student') {
        const student = await Student.findOne({ _id: authorId, sectionId });
        if (!student) {
            return res.status(403).json({ message: "You are not authorized to post in this section." });
        }
    } else if (authorType === 'teacher') {
        // Find if this teacher is the class teacher of this section
        const grade = await Grade.findOne({ "sections._id": sectionId, "sections.classTeacherId": authorId });
        if (!grade) {
            return res.status(403).json({ message: "You are not authorized to post in this section." });
        }
    }

    const notice = new ClassroomNotice({
      text,
      authorId,
      authorName,
      authorType,
      sectionId,
    });

    await notice.save();
    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getNoticesBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const notices = await ClassroomNotice.find({ sectionId }).sort({ isPinned: -1, createdAt: -1 });
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userType } = req.body; // In a real app, this would come from auth middleware

    const notice = await ClassroomNotice.findById(id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    // Authorization: author or class teacher
    let authorized = notice.authorId.toString() === userId;
    
    if (!authorized && userType === 'teacher') {
        const grade = await Grade.findOne({ "sections._id": notice.sectionId, "sections.classTeacherId": userId });
        if (grade) authorized = true;
    }

    if (!authorized) {
      return res.status(403).json({ message: "Not authorized to delete this notice." });
    }

    await ClassroomNotice.findByIdAndDelete(id);
    res.status(200).json({ message: "Notice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const togglePinNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userType } = req.body;

    const notice = await ClassroomNotice.findById(id);
    if (!notice) return res.status(404).json({ message: "Notice not found" });

    // Authorization: same logic as delete
    let authorized = notice.authorId.toString() === userId;
    
    if (!authorized && userType === 'teacher') {
        const grade = await Grade.findOne({ "sections._id": notice.sectionId, "sections.classTeacherId": userId });
        if (grade) authorized = true;
    }

    if (!authorized) {
      return res.status(403).json({ message: "Not authorized to pin this notice." });
    }

    notice.isPinned = !notice.isPinned;
    await notice.save();
    res.status(200).json(notice);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createNotice,
  getNoticesBySection,
  deleteNotice,
  togglePinNotice,
};
