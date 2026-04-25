const Event = require('../models/Event');
const Holiday = require('../models/Holiday');
const Exam = require('../models/Exam');
const Student = require('../models/studentModel');
const { Grade, Subject } = require('../models/School');
const Section = require('../models/Section');
const { School } = require('../models/School'); 

// @desc    Create a new calendar event
// @route   POST /api/calendar/events
// @access  Private (Admin, Teacher, Student)
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
    const isGlobalBroadcast = ['Whole School', 'Students', 'Teachers'].includes(audience);

    // Only administrators can broadcast to global audiences. 
    // Teachers are allowed to broadcast to specific classes/sections.
    if (role !== 'admin' && isGlobalBroadcast) {
      return res.status(403).json({ message: 'Only administrators can broadcast events to the whole school or broad groups' });
    }

    // Students are restricted to Personal events only
    if (role === 'student' && audience !== 'Personal') {
      return res.status(403).json({ message: 'Students can only create personal calendar events' });
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

    // Logic: Users see events targeted at them/whole school OR events they created
    const visibilityFilters = [
      { audience: 'Whole School' },
      { createdBy: null },
      { createdBy: { $exists: false } }
    ];

    if (role === 'student' && req.user.studentId) {
      visibilityFilters.push({ audience: 'Students' });
      // Fetch student details to get their Grade and Section
      const student = await Student.findById(req.user.studentId);
      if (student) {
        if (student.studentClass) {
          const gNum = student.studentClass;
          visibilityFilters.push({ audience: `Whole Grade ${gNum}` });
          visibilityFilters.push({ audience: `Grade ${gNum}` });
          visibilityFilters.push({ audience: `Class ${gNum}` });

          if (student.sectionId) {
            const section = await Section.findById(student.sectionId);
            if (section) {
              visibilityFilters.push({ audience: `Grade ${gNum}-${section.sectionName}` });
              visibilityFilters.push({ audience: `Class ${gNum}-${section.sectionName}` });
              visibilityFilters.push({ audience: `${gNum}-${section.sectionName}` });
            }
          }
        }
      }
    }

    if (role === 'teacher') visibilityFilters.push({ audience: 'Teachers' });

    // Always show personal events created by the requester
    const userId = req.user?._id || req.user?.id || createdBy;
    if (userId) {
      visibilityFilters.push({ createdBy: userId });
    }

    const query = {
      $and: [
        { 
          $or: [
            { schoolId: schoolId },
            { school_id: schoolId }
          ]
        },
        { $or: visibilityFilters }
      ]
    };

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

      query.$and.push({ $or: dateQuery.$or });
    }

    // Fetch Events, Holidays and All Exam Cycles concurrently
    const [events, dbHolidays, examDocs] = await Promise.all([
      Event.find(query).sort({ startDate: 1 }),
      Holiday.find({ 
        $or: [
          { schoolId: req.schoolId },
          { school_id: req.schoolId },
          { schoolId: { $exists: false } },
          { school_id: { $exists: false } },
          { schoolId: null },
          { school_id: null }
        ]
      }),
      Exam.find({ 
        $or: [
          { schoolId: req.schoolId },
          { school_id: req.schoolId }
        ]
      }).populate('schedules.entries.subjectId')
    ]);

    // Resolve student info once if needed
    // Resolve student info once if needed
    let studentClass = null;
    if (role === 'student') {
      const studentId = req.user.studentId || req.user._id;
      
      // Try finding student by primary ID sources
      let student = await Student.findById(studentId).populate('classId');
      if (!student) {
        student = await Student.findOne({ 
          $or: [{ _id: req.user._id }, { email: req.user.email }], 
          schoolId: req.schoolId 
        }).populate('classId');
      }
      
      if (student) {
        // Resolve class number from multiple potential sources
        const resolvedGradeNum = student.studentClass || 
                                student.classId?.gradeNumber || 
                                (student.classId && typeof student.classId === 'object' ? student.classId.gradeNumber : null);
        
        if (resolvedGradeNum !== null && resolvedGradeNum !== undefined) {
           studentClass = Number(resolvedGradeNum);
        } else if (student.sectionId) {
           // Fallback: Check if we can find the grade via their section
           const gradeViaSection = await Grade.findOne({ "sections._id": student.sectionId });
           if (gradeViaSection) studentClass = Number(gradeViaSection.gradeNumber);
        }
      }

      // Final fallback: check the user document itself for classId (sometimes used as grade name/number)
      if (studentClass === null && req.user.classId) {
        const val = Number(req.user.classId);
        if (!isNaN(val)) studentClass = val;
      }
    }

    // Map and filter Exams based on role
    let mappedExams = [];
    const fromStr = from ? from.split('T')[0] : null;
    const toStr = to ? to.split('T')[0] : null;

    for (const examData of examDocs) {
      if (examData && examData.schedules) {
        // 1. Map individual entries for specific grade (Students only)
        if (role === 'student' && studentClass !== null) {
          const targetGrade = studentClass;
          
          examData.schedules.forEach(schedule => {
            // Check if this schedule is for the student's grade
            const scheduleGrade = Number(schedule.gradeNumber);
            if (scheduleGrade === targetGrade) {
              schedule.entries.forEach(entry => {
                if (entry.date) {
                  const entryDateISO = new Date(entry.date).toISOString().split('T')[0];
                  
                  // Apply date range filter using strings for timezone robustness
                  if (fromStr && toStr && (entryDateISO < fromStr || entryDateISO > toStr)) return;

                  mappedExams.push({
                    _id: `exam-granular-${entry._id}-${examData._id}`,
                    title: `Exam: ${entry.subjectId?.subjectName || entry.subject || 'Subject Exam'}`,
                    type: 'EXAMS',
                    description: `${schedule.term} (${examData.academicYear}) - Day ${entry.slotOrder || ''}`,
                    startDate: entry.date,
                    endDate: entry.date,
                    color: 'blue',
                    audience: 'Students',
                    isExam: true
                  });
                }
              });
            }
          });
        }

        // 2. Map "Exam Week" summary (Visible to Everyone if published/available)
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

        // Show summary to students if published OR if we want them to see the upcoming block
        const publishedTerms = (examData.termStatuses || [])
          .filter(ts => ts.isPublished || ts.isOpen || role === 'admin' || role === 'teacher') 
          .map(ts => ts.term);

        Object.keys(termSummary).forEach(term => {
          const { min, max } = termSummary[term];
          if (min && max && (publishedTerms.includes(term) || role === 'admin' || role === 'teacher')) {
            // Apply date filter
            if (fromStr && toStr) {
               const minISO = min.toISOString().split('T')[0];
               const maxISO = max.toISOString().split('T')[0];
               if (maxISO < fromStr || minISO > toStr) return;
            }

            mappedExams.push({
              _id: `exam-week-${term.replace(/\s+/g, '-')}-${examData.academicYear}`,
              title: `Exam Week: ${term}`,
              type: 'EXAMS',
              description: `Assessment cycle for ${examData.academicYear}`,
              startDate: min,
              endDate: max,
              color: 'blue',
              audience: 'All'
            });
          }
        });
      }
    }

    // 3. Map and filter Holidays in memory for robustness and deduplication
    const holidayMap = new Map();
    
    dbHolidays.forEach(h => {
      const rawDate = h.gregorian_date || h.startDate;
      if (!rawDate) return;

      try {
        let dateKey = "";
        if (rawDate instanceof Date) {
          dateKey = rawDate.toISOString().split('T')[0];
        } else {
          // Clean string: Normalize "2025/4/14" or "2025-4-14" to "2025-04-14"
          const cleanDate = rawDate.toString().replace(/\//g, '-');
          const parts = cleanDate.split('-');
          if (parts.length === 3) {
            dateKey = parts[0] + '-' + parts[1].padStart(2, '0') + '-' + parts[2].padStart(2, '0');
          } else {
            dateKey = new Date(rawDate).toISOString().split('T')[0];
          }
        }

        // Apply date range filter early
        if (from && to && (dateKey < from || dateKey > to)) return;

        // Deduplication logic: prefer school-specific holidays over global ones
        const existing = holidayMap.get(dateKey);
        if (!existing || (h.schoolId && !existing.schoolId)) {
          holidayMap.set(dateKey, h);
        }
      } catch (e) {
        // Skip invalid dates
      }
    });

    const mappedHolidays = Array.from(holidayMap.values()).map(h => {
      const rawDate = h.gregorian_date || h.startDate;
      const cleanDate = rawDate.toString().replace(/\//g, '-');
      const parts = cleanDate.split('-');
      const finalDate = parts.length === 3 
        ? `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
        : rawDate;

      return {
        _id: `holiday-${h._id}`,
        id: h._id,
        title: h.title,
        type: 'HOLIDAY',
        description: h.titles ? h.titles.join(' / ') : h.title,
        startDate: new Date(finalDate),
        endDate: new Date(finalDate),
        color: 'red',
        audience: 'Whole School',
        isPublicHoliday: true
      };
    });

    const sortedEvents = [...events, ...mappedHolidays, ...mappedExams].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    res.json(sortedEvents);
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
