const { Grade, School, Subject } = require("../models/School");

// ... (generateSections helper remains) ...

// Get all grades (populated with subjects)
const getGrades = async (req, res) => {
  try {
    const grades = await Grade.find({ schoolId: 1 })
      .sort({ gradeNumber: 1 })
      .populate('subjects.subjectId'); // Populate subject details
    res.status(200).json(grades);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ... (updateGradeSections remains) ...

// ... (syncSections remains) ...

// Add Subject to Grade
const addSubjectToGrade = async (req, res) => {
  try {
    const { gradeNumber, subjectName, type } = req.body; // type: 'core' or 'elective'
    
    // 1. Find or Create Subject
    let subject = await Subject.findOne({ schoolId: 1, subjectName: new RegExp(`^${subjectName}$`, 'i') });
    if (!subject) {
      subject = new Subject({
        schoolId: 1,
        subjectName,
        subjectType: type || 'core',
        subjectCode: subjectName.substring(0, 3).toUpperCase() // Simple code gen
      });
      await subject.save();
    }

    // 2. Add to Grade
    const grade = await Grade.findOne({ schoolId: 1, gradeNumber });
    if (!grade) {
        return res.status(404).json({ message: "Grade not found. Please setup grade first." });
    }

    // Check availability
    const exists = grade.subjects.some(s => s.subjectId.equals(subject._id));
    if (exists) {
        return res.status(400).json({ message: "Subject already added to this grade" });
    }

    grade.subjects.push({
        subjectId: subject._id,
        isMandatory: type === 'core',
        periodsPerWeek: 5
    });
    
    await grade.save();
    // Re-fetch to return populated data
    const updatedGrade = await Grade.findById(grade._id).populate('subjects.subjectId');
    
    res.status(200).json(updatedGrade);

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove Subject from Grade
const removeSubjectFromGrade = async (req, res) => {
  try {
    const { gradeNumber, subjectName } = req.body;

    // Find Subject ID first
    const subject = await Subject.findOne({ schoolId: 1, subjectName: new RegExp(`^${subjectName}$`, 'i') });
    if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
    }

    const grade = await Grade.findOne({ schoolId: 1, gradeNumber });
    if (!grade) return res.status(404).json({ message: "Grade not found" });

    grade.subjects = grade.subjects.filter(s => !s.subjectId.equals(subject._id));
    await grade.save();

    const updatedGrade = await Grade.findById(grade._id).populate('subjects.subjectId');
    res.status(200).json(updatedGrade);

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Update or Create a Grade (Update sections count)
const updateGradeSections = async (req, res) => {
  try {
    const { gradeNumber, sectionCount } = req.body;
    
    // Check if grade exists
    let grade = await Grade.findOne({ schoolId: 1, gradeNumber });
    
    if (grade) {
      // Update existing grade
      // We need to adjust sections array
      const currentSections = grade.sections || [];
      const newCount = parseInt(sectionCount);

      if (newCount > currentSections.length) {
        // Add new sections
        const addedCount = newCount - currentSections.length;
        const startCharCode = 65 + currentSections.length;
        for (let i = 0; i < addedCount; i++) {
          currentSections.push({
             sectionName: String.fromCharCode(startCharCode + i),
             capacity: 40,
             isActive: true
          });
        }
      } else if (newCount < currentSections.length) {
        // Remove sections from the end (or mark inactive? Deleting for now as per UI logic implies reset)
        // Usually safer to mark inactive, but for this "set count" logic, we slice.
        grade.sections = currentSections.slice(0, newCount);
      }
      
      // Save
      await grade.save();
      res.status(200).json(grade);
    } else {
      // Create new grade
      const newGrade = new Grade({
        schoolId: 1,
        gradeNumber,
        gradeName: `Grade ${gradeNumber}`,
        sections: generateSections(sectionCount),
        displayOrder: gradeNumber
      });
      await newGrade.save();
      res.status(201).json(newGrade);
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Sync all sections
const syncSections = async (req, res) => {
  try {
    const { sectionCount, gradeList } = req.body; // gradeList is expected to be ["1", "2", ... "10"]
    const count = parseInt(sectionCount);
    
    // Validation
    if (isNaN(count) || count < 1 || count > 10) {
      return res.status(400).json({ message: "Invalid section count (1-10)" });
    }

    if (!gradeList || !Array.isArray(gradeList) || gradeList.length === 0) {
        return res.status(400).json({ message: "No grades provided to sync" });
    }

    // Process each grade in the list
    const updates = gradeList.map(async (gradeNumStr) => {
        const gradeNumber = parseInt(gradeNumStr);
        if (isNaN(gradeNumber)) return null;

        // Determine sections for this count
        // For sync, we generally just "set" the sections. 
        // But to be nice, we could preserve sectionNames if strictly increasing?
        // Simpler: Just generate new set or append.
        // Let's stick to the "update or create" logic.
        
        // Find existing to see current sections
        let grade = await Grade.findOne({ schoolId: 1, gradeNumber });
        let newSections = [];
        
        if (grade) {
             newSections = [...grade.sections];
             if (count > newSections.length) {
                 const addedCount = count - newSections.length;
                 const startCharCode = 65 + newSections.length; // 65 = A
                 for (let i = 0; i < addedCount; i++) {
                   newSections.push({ 
                       sectionName: String.fromCharCode(startCharCode + i), 
                       capacity: 40, 
                       isActive: true 
                   });
                 }
             } else {
                 newSections = newSections.slice(0, count);
             }
        } else {
             // New Grade
             newSections = generateSections(count);
        }

        return Grade.findOneAndUpdate(
            { schoolId: 1, gradeNumber },
            { 
               $set: { 
                   schoolId: 1,
                   gradeNumber, 
                   gradeName: `Grade ${gradeNumber}`,
                   sections: newSections,
                   displayOrder: gradeNumber,
                   isActive: true
               }
            },
            { upsert: true, new: true }
        );
    });
    
    await Promise.all(updates);
    res.status(200).json({ message: `Sections synced successfully for ${gradeList.length} grades` });

  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add Subject to All Grades (Global Core)
const addSubjectToAllGrades = async (req, res) => {
  try {
    const { subjectName, type } = req.body; // type usually 'core'
    
    // 1. Find or Create Subject
    let subject = await Subject.findOne({ schoolId: 1, subjectName: new RegExp(`^${subjectName}$`, 'i') });
    if (!subject) {
      subject = new Subject({
        schoolId: 1,
        subjectName,
        subjectType: type || 'core',
        subjectCode: subjectName.substring(0, 3).toUpperCase()
      });
      await subject.save();
    }

    // 2. Add to ALL Grades
    const grades = await Grade.find({ schoolId: 1 });
    // Use Promise.all to update in parallel
    await Promise.all(grades.map(async (grade) => {
        const exists = grade.subjects.some(s => s.subjectId.equals(subject._id));
        if (!exists) {
            grade.subjects.push({
                subjectId: subject._id,
                isMandatory: true, // Always mandatory for global core
                periodsPerWeek: 5
            });
            await grade.save();
        }
    }));

    // Return something meaningful? Maybe just success.
    // Or return one grade to update UI? Frontend will likely optimistically update.
    res.status(200).json({ message: `Subject ${subjectName} added to ${grades.length} grades.` });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Remove Subject from All Grades
const removeSubjectFromAllGrades = async (req, res) => {
  try {
    const { subjectName } = req.body;

    const subject = await Subject.findOne({ schoolId: 1, subjectName: new RegExp(`^${subjectName}$`, 'i') });
    if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
    }

    // Update all grades
    await Grade.updateMany(
        { schoolId: 1 },
        { $pull: { subjects: { subjectId: subject._id } } }
    );

    res.status(200).json({ message: `Subject ${subjectName} removed from all grades.` });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getGrades,
  updateGradeSections,
  syncSections,
  addSubjectToGrade,
  removeSubjectFromGrade,
  addSubjectToAllGrades,
  removeSubjectFromAllGrades
};
