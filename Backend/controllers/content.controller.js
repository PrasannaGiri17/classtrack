const Content = require('../models/content.model');
const mongoose = require('mongoose');

// Create a new learning resource
exports.createResource = async (req, res) => {
  try {
    const { name, type, url, fileUrl, teacherId, subject, grade, section, size, fileName } = req.body;

    // Validate required fields - name is now optional as we fallback to fileName/url
    if (!type || !teacherId) {
      return res.status(400).json({ message: "Type and teacherId are required." });
    }

    if (type === 'link' && !url) {
      return res.status(400).json({ message: "URL is required for link type resources." });
    }

    const newResource = new Content({
      schoolId: req.schoolId,
      name: name || fileName || url || "Untitled Resource",
      type,
      url: type === 'link' ? url : undefined,
      fileUrl,
      fileName,
      teacherId,
      subject,
      grade,
      section,
      size: size || "-",
      folderId: req.body.folderId || null
    });

    const savedResource = await newResource.save();
    res.status(201).json(savedResource);
  } catch (error) {
    res.status(500).json({ message: "Error creating resource", error: error.message });
  }
};

// Get all resources for a specific teacher
exports.getAllResources = async (req, res) => {
  try {
    const { teacherId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ message: "Invalid teacher ID." });
    }

    const { folderId } = req.query;
    
    const query = { schoolId: req.schoolId, teacherId, isArchived: false };
    if (folderId === 'root' || !folderId) {
      query.folderId = null;
    } else {
      query.folderId = folderId;
    }

    const resources = await Content.find(query).sort({ sharedOn: -1 });
    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ message: "Error fetching resources", error: error.message });
  }
};

// Get a single resource by ID
exports.getResourceById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid resource ID." });
    }

    const resource = await Content.findOne({ _id: id, schoolId: req.schoolId });
    if (!resource) {
      return res.status(404).json({ message: "Resource not found." });
    }

    res.status(200).json(resource);
  } catch (error) {
    res.status(500).json({ message: "Error fetching resource", error: error.message });
  }
};

// Update a resource
exports.updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid resource ID." });
    }

    const updatedResource = await Content.findOneAndUpdate({ _id: id, schoolId: req.schoolId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedResource) {
      return res.status(404).json({ message: "Resource not found." });
    }

    res.status(200).json(updatedResource);
  } catch (error) {
    res.status(500).json({ message: "Error updating resource", error: error.message });
  }
};

// Soft delete (archive) a resource
exports.archiveResource = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid resource ID." });
    }

    const resource = await Content.findOneAndUpdate({ _id: id, schoolId: req.schoolId },
      { isArchived: true },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({ message: "Resource not found." });
    }

    res.status(200).json({ message: "Resource archived successfully", resource });
  } catch (error) {
    res.status(500).json({ message: "Error archiving resource", error: error.message });
  }
};

// Hard delete a resource
exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid resource ID." });
    }

    const resource = await Content.findOneAndDelete({ _id: id, schoolId: req.schoolId });
    if (!resource) {
      return res.status(404).json({ message: "Resource not found." });
    }

    res.status(200).json({ message: "Resource deleted permanently" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting resource", error: error.message });
  }
};

// Get resources by type (filtered by teacher)
exports.getResourcesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { teacherId } = req.query; // Assuming teacherId is passed in query for filtering

    const query = { schoolId: req.schoolId, type, isArchived: false };
    if (teacherId) query.teacherId = teacherId;

    const resources = await Content.find(query);
    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ message: "Error fetching resources by type", error: error.message });
  }
};

// Get resources by subject (filtered by teacher)
exports.getResourcesBySubject = async (req, res) => {
  try {
    const { subject } = req.params;
    const { teacherId } = req.query;

    const query = { schoolId: req.schoolId, subject, isArchived: false };
    if (teacherId) query.teacherId = teacherId;

    const resources = await Content.find(query);
    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ message: "Error fetching resources by subject", error: error.message });
  }
};

// Get resources for a specific student (based on grade/section)
exports.getStudentResources = async (req, res) => {
  try {
    const { grade, section } = req.params;
    const { folderId } = req.query;
    
    const gradeStr = String(grade).trim();
    const sectionStr = String(section).trim();

    const query = {
      schoolId: Number(req.schoolId),
      $or: [
        { grade: gradeStr },
        { grade: `Grade ${gradeStr}` },
        { grade: { $regex: new RegExp(`^(\\s*Grade\\s+|G)?${gradeStr}\\s*$`, 'i') } }
      ],
      $and: [{
        $or: [
          { section: 'ALL' },
          { section: sectionStr },
          { section: { $regex: new RegExp(`^${sectionStr}$`, 'i') } }
        ]
      }],
      isArchived: false
    };

    // Support folder navigation for students
    if (folderId === 'root' || !folderId) {
      query.folderId = null;
    } else {
      query.folderId = folderId;
    }

    const resources = await Content.find(query).populate('teacherId', 'firstName lastName').sort({ sharedOn: -1 });
    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ message: "Error fetching student resources", error: error.message });
  }
};
