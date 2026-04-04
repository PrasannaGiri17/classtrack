const Event = require('../models/Event');
const Holiday = require('../models/Holiday');
const Exam = require('../models/Exam');
const Student = require('../models/studentModel');
const School = require('../models/School'); // Assuming School model exists, though we default to 1

// @desc    Create a new calendar event
// @route   POST /api/calendar/events
// @access  Private (Admin)
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      type,
      description,
      startDate,
      endDate,
      audience,
      color
    } = req.body;

    // Basic validation
    if (!title || !type || !startDate || !endDate || !audience) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Role-based audience restriction
    const role = req.user?.role;
    if (role !== 'admin' && audience !== 'Personal') {
      return res.status(403).json({ message: 'Only administrators can broadcast events to broad audiences' });
    }

    // Default color logic if not provided
    let eventColor = color;
    if (!eventColor) {
      switch (type) {
        case 'HOLIDAY': eventColor = 'red'; break;
        case 'EXAMS': 
        case 'CLASS TEST': eventColor = 'blue'; break;
        case 'HOMEWORK': eventColor = 'amber'; break;
        case 'EVENT': eventColor = 'green'; break;
        default: eventColor = 'blue';
      }
    }

    const event = new Event({
      schoolId: req.schoolId, // Dynamic from auth context
      title,
      type,
      description,
      startDate,
      endDate,
      audience,
      color: eventColor,
      createdBy: req.user ? req.user.id : null
    });

    const savedEvent = await event.save();

    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error creating event', error: error.message });
  }
};

// @desc    Get all calendar events
// @route   GET /api/calendar/events
// @access  Private
exports.getEvents = async (req, res) => {
  try {
    const { from, to, createdBy } = req.query;
    const schoolId = req.schoolId;
    const role = req.user?.role;

    if (!schoolId) {
      return res.status(401).json({ message: 'School identification missing. Please relogin.' });
    }

    const query = {
      schoolId: schoolId
    };

    // Logic: Users see events targeted at them/whole school OR events they created
    const visibilityFilters = [
      { audience: 'Whole School' },
      { createdBy: null },
      { createdBy: { $exists: false } }
    ];

    if (role === 'student') visibilityFilters.push({ audience: 'Students' });
    if (role === 'teacher') visibilityFilters.push({ audience: 'Teachers' });
    
    // Always show personal events created by the requester
    const userId = req.user?._id || createdBy;
    if (userId) {
      visibilityFilters.push({ createdBy: userId });
    }

    query.$or = visibilityFilters;

    // Date range filter for Events
    if (from && to) {
      const dateQuery = {
        $or: [
          { startDate: { $gte: new Date(from), $lte: new Date(to) } },
          { endDate: { $gte: new Date(from), $lte: new Date(to) } },
          { 
            startDate: { $lte: new Date(from) },
            endDate: { $gte: new Date(to) }
          }
        ]
      };

      // Wrap the previous $or query with the dateQuery in an $and
      const existingOr = query.$or;
      delete query.$or;
      
      query.$and = [
        { $or: existingOr },
        { $or: dateQuery.$or }
      ];
    }

    // Fetch Events, Holidays and Exam Data concurrently
    const [events, dbHolidays, examData] = await Promise.all([
      Event.find(query).sort({ startDate: 1 }),
      Holiday.find({ 
        $or: [
          { schoolId: req.schoolId },
          { schoolId: { $exists: false } },
          { schoolId: null }
        ]
      }),
      Exam.findOne({ schoolId: req.schoolId }).populate('schedules.entries.subjectId')
    ]);

    // Map and filter Exams based on role
    let mappedExams = [];
    if (examData && examData.schedules) {
      if (role === 'student' && req.user.studentId) {
        // Find the student's grade
        const student = await Student.findById(req.user.studentId);
        const studentClass = student ? student.studentClass : null;

        if (studentClass !== null) {
          // Filter exams for this specific student's grade
          examData.schedules.forEach(schedule => {
            if (Number(schedule.gradeNumber) === Number(studentClass)) {
              schedule.entries.forEach(entry => {
                if (entry.date) {
                  const entryDate = new Date(entry.date);
                  // Apply date filter
                  if ((from && to) && (entryDate < new Date(from) || entryDate > new Date(to))) return;

                  mappedExams.push({
                    _id: `exam-${entry._id}`,
                    title: `Exam: ${entry.subjectId ? entry.subjectId.subjectName : 'Subject'}`,
                    type: 'EXAMS',
                    description: `${schedule.term} - Day ${entry.slotOrder || ''}`,
                    startDate: entryDate,
                    endDate: entryDate,
                    color: 'blue',
                    audience: 'Students'
                  });
                }
              });
            }
          });
        }
      } else if (role === 'admin' || role === 'teacher') {
        // Show "Exam Week" summary for each term
        // Group all entries by Term to find start and end dates
        const termSummary = {};
        examData.schedules.forEach(schedule => {
          if (!termSummary[schedule.term]) {
            termSummary[schedule.term] = { min: null, max: null };
          }
          schedule.entries.forEach(entry => {
            if (entry.date) {
              const d = new Date(entry.date);
              if (!termSummary[schedule.term].min || d < termSummary[schedule.term].min) termSummary[schedule.term].min = d;
              if (!termSummary[schedule.term].max || d > termSummary[schedule.term].max) termSummary[schedule.term].max = d;
            }
          });
        });

        Object.keys(termSummary).forEach(term => {
          const { min, max } = termSummary[term];
          if (min && max) {
            // Apply date filter
            if ((from && to) && (max < new Date(from) || min > new Date(to))) return;

            mappedExams.push({
              _id: `exam-week-${term.replace(/\s+/g, '-')}`,
              title: `Exam Week: ${term}`,
              type: 'EXAMS',
              description: `Final assessment period for all classes`,
              startDate: min,
              endDate: max,
              color: 'blue',
              audience: role === 'admin' ? 'Admins' : 'Teachers'
            });
          }
        });
      }
    }

    // Map and filter Holidays in memory for robustness
    const mappedHolidays = dbHolidays
      .filter(h => h.gregorian_date) // Only process if gregorian_date exists
      .map(h => {
        try {
          // Normalize "2025/4/14" or "2025-4-14" to "2025-04-14"
          const cleanDate = h.gregorian_date.toString().replace(/\//g, '-');
          const parts = cleanDate.split('-');
          if (parts.length !== 3) return null;
          
          const normalizedDate = parts[0] + '-' + parts[1].padStart(2, '0') + '-' + parts[2].padStart(2, '0');
          
          return {
            ...h.toObject(),
            normalizedDate
          };
        } catch (e) {
          return null;
        }
      })
      .filter(h => h !== null)
      .filter(h => {
        if (!from || !to) return true;
        return h.normalizedDate >= from && h.normalizedDate <= to;
      })
      .map(h => ({
        _id: h._id,
        id: h._id,
        title: h.title,
        type: 'HOLIDAY',
        description: h.titles ? h.titles.join(', ') : h.title,
        startDate: new Date(h.normalizedDate),
        endDate: new Date(h.normalizedDate),
        dateStr: h.normalizedDate, // Send normalized YYYY-MM-DD string
        nepali_date: h.nepali_date,
        color: 'red',
        audience: 'Whole School',
        isPublicHoliday: true
      }));

    const allEvents = [...events, ...mappedHolidays, ...mappedExams].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    res.json(allEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error fetching events', error: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/calendar/events/:id
// @access  Private (Admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Permission check: only admin can delete school-wide events
    // Others can only delete events they created themselves
    const isAdmin = req.user?.role === 'admin';
    const isCreator = event.createdBy && event.createdBy.toString() === req.user?._id.toString();

    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: 'You do not have permission to delete this event.' });
    }

    await event.deleteOne();

    res.json({ message: 'Event removed' });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Server error deleting event" });
  }
};
