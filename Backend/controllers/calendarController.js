 const Event = require('../models/Event');
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
        case 'EXAMS': eventColor = 'blue'; break;
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
    const { from, to, school_id } = req.query;

    const query = {
      school_id: school_id || 1
    };

    // Date range filter
    if (from && to) {
      query.$or = [
        // Event starts within range
        { startDate: { $gte: new Date(from), $lte: new Date(to) } },
        // Event ends within range
        { endDate: { $gte: new Date(from), $lte: new Date(to) } },
        // Event spans the entire range (starts before and ends after)
        { 
          startDate: { $lte: new Date(from) },
          endDate: { $gte: new Date(to) }
        }
      ];
    }

    const events = await Event.find(query).sort({ startDate: 1 });

    res.json(events);
  } catch (error) {
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
