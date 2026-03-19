 const Event = require('../models/Event');
const Holiday = require('../models/Holiday');
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
      school_id: 1, // Default as requested
      title,
      type,
      description,
      startDate,
      endDate, // For single day, frontend should send same start/end
      audience,
      color: eventColor,
      createdBy: req.user ? req.user.id : (req.body.createdBy || null)
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
    const { from, to, school_id, createdBy } = req.query;

    const query = {
      school_id: school_id || 1
    };

    // Access Control: Students should see school events (no creator) OR their own events
    if (createdBy) {
      query.$or = [
        { createdBy: { $exists: false } },
        { createdBy: null },
        { createdBy: createdBy }
      ];
    }

    // Date range filter for Events
    if (from && to) {
      const dateQuery = {
        $or: [
          // Event starts within range
          { startDate: { $gte: new Date(from), $lte: new Date(to) } },
          // Event ends within range
          { endDate: { $gte: new Date(from), $lte: new Date(to) } },
          // Event spans the entire range (starts before and ends after)
          { 
            startDate: { $lte: new Date(from) },
            endDate: { $gte: new Date(to) }
          }
        ]
      };

      // Combine with existing query if createdBy was present
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          dateQuery
        ];
        delete query.$or;
      } else {
        query.$or = dateQuery.$or;
      }
    }

    // Fetch Events and Holidays concurrently
    const [events, dbHolidays] = await Promise.all([
      Event.find(query).sort({ startDate: 1 }),
      Holiday.find({ schoolId: req.schoolId }) // Fetch all holidays (usually < 100 per year, very efficient)
    ]);

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

    const allEvents = [...events, ...mappedHolidays].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

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

    // Optional: Check ownership or permissions here if needed
    
    await event.deleteOne();

    res.json({ message: 'Event removed' });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Server error deleting event" });
  }
};
