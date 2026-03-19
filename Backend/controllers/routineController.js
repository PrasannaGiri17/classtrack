const Routine = require("../models/Routine");
const { School } = require("../models/School");

// Get Routine Matrix (All Grade Routines + Operating Hours)
const getRoutineMatrix = async (req, res) => {
  try {
    const schoolId = req.query.schoolId || req.headers['x-school-id'];
    if (!schoolId) {
      return res.status(400).json({ message: "schoolId required" });
    }

    // 1. Get School Hours
    const school = await School.findOne({ schoolId: req.schoolId,  _id: schoolId });
    const operatingHours = school?.operatingHours || { start: "09:00", end: "16:00" };

    // 2. Get All Grade Routines
    const routines = await Routine.find({ schoolId });
    
    // Transform into map { "1": { slots: [], isLocked: false } } 
    const routineMap = {};
    routines.forEach(r => {
        routineMap[r.gradeNumber] = { 
            slots: r.slots, 
            isLocked: r.isLocked || false 
        };
    });

    res.status(200).json({ operatingHours, classRoutines: routineMap });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Operating Hours
const updateOperatingHours = async (req, res) => {
    try {
        const { start, end, schoolId } = req.body;
        if (!schoolId) return res.status(400).json({ message: "schoolId required" });
        if (!start || !end) {
            return res.status(400).json({ message: "Start and End times are required" });
        }

        const updatedSchool = await School.findOneAndUpdate(
            { _id: schoolId },
            { $set: { operatingHours: { start, end } } },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: "Operating hours updated", operatingHours: updatedSchool.operatingHours });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update Routine for a specific grade
const updateGradeRoutine = async (req, res) => {
    try {
        const { gradeNumber } = req.params;
        const { slots, isLocked, schoolId } = req.body;

        if (!schoolId) return res.status(400).json({ message: "schoolId required" });

        if (!slots || !Array.isArray(slots)) {
            return res.status(400).json({ message: "Invalid slots data" });
        }

        const updatedRoutine = await Routine.findOneAndUpdate(
            { schoolId, gradeNumber },
            { 
                $set: { 
                    slots, 
                    isLocked: isLocked === undefined ? false : isLocked, 
                    updatedAt: new Date() 
                } 
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: `Routine for Grade ${gradeNumber} saved`, routine: updatedRoutine });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getRoutineMatrix,
    updateOperatingHours,
    updateGradeRoutine
};
