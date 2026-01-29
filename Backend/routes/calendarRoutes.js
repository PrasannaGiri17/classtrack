const express = require('express');
const router = express.Router();
const { createEvent, getEvents, deleteEvent } = require('../controllers/calendarController');

// POST /api/calendar/events - Create a new event
router.post('/events', createEvent);

// GET /api/calendar/events - Get events (with optional filters)
router.get('/events', getEvents);

// DELETE /api/calendar/events/:id - Delete an event
router.delete('/events/:id', deleteEvent);

module.exports = router;
