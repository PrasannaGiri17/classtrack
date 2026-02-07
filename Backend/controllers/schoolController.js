const { School } = require("../models/School");

const getSchool = async (req, res) => {
  try {
    // School ID is always 1 for this singleton setup
    const school = await School.findOne({ _id: 1 });
    if (!school) {
      return res.status(404).json({ message: "School info not found. Please initialize." });
    }
    res.status(200).json(school);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addSchool = async (req, res) => {
  try {
    const existing = await School.findOne({ _id: 1 });
    if (existing) {
      return res.status(400).json({ message: "School info already exists. Use update instead." });
    }

    const {
      name,
      address,
      email,
      logo,
      website,
      gradeSpan,
      maxSectionsPerGrade,
      phoneNumbers,
      socialLinks,
      admissionFee,
    } = req.body;

    const newSchool = new School({
      _id: 1, // Enforce singleton ID at controller level too
      name,
      address,
      email,
      logo,
      website,
      gradeSpan,
      maxSectionsPerGrade,
      phoneNumbers,
      socialLinks,
      admissionFee,
    });

    await newSchool.save();
    res.status(201).json({ message: "School created successfully", school: newSchool });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateSchool = async (req, res) => {
  try {
    const school = await School.findById(1);
    if (!school) {
      return res.status(404).json({ message: "School not found. Create it first." });
    }

    // Use findByIdAndUpdate or standard update
    // Using simple update with req.body
    const updatedSchool = await School.findByIdAndUpdate(
        1,
        { $set: req.body },
        { new: true, runValidators: true }
    );

    res.status(200).json({ message: "School updated successfully", school: updatedSchool });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getSchool,
  addSchool,
  updateSchool,
};
