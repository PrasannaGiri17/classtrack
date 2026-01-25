const Routine = require("../models/Routine");
const { School } = require("../models/School");

// Get Routine Matrix (All Grade Routines + Operating Hours)
const getRoutineMatrix = async (req, res) => {
  try {
    // 1. Get School Hours
    const school = await School.findOne({ _id: 1 });
    const operatingHours = school?.operatingHours || { start: "09:00", end: "16:00" };

    // 2. Get All Grade Routines
    const routines = await Routine.find({ schoolId: 1 });
    
    // Transform into map { "1": { slots: [], isLocked: false } } 
    // Frontend expects: classRoutines map.
    // OLD: routineMap[r.gradeNumber] = r.slots;
    // NEW: routineMap[r.gradeNumber] = { slots: r.slots, isLocked: r.isLocked };
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

// ... (updateOperatingHours remains) ...

// Update Routine for a specific grade
const updateGradeRoutine = async (req, res) => {
    try {
        const { gradeNumber } = req.params;
        const { slots, isLocked } = req.body;

        if (!slots || !Array.isArray(slots)) {
            return res.status(400).json({ message: "Invalid slots data" });
        }

        const updatedRoutine = await Routine.findOneAndUpdate(
            { schoolId: 1, gradeNumber },
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
