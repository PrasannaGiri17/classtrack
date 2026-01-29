import React, { useState, useEffect } from 'react';
import { Plus, ChevronDown, Trash } from 'lucide-react';
import DetailedCalendar from '../AdminComponents/Calendar/DetailedCalendar';
import AddEventModal from '../AdminComponents/Calendar/AddEventModal';
import ConfirmDialog from '../MainSystemComponents/ConfirmDialog';
import { toast } from '../MainSystemComponents/Toast';
import axios from 'axios';

const CalendarPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEventsOpen, setIsEventsOpen] = useState(true);

  // State for Calendar Data
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  // Fetch events when current month changes or generally on mount
  const fetchEvents = async () => {
    setLoading(true);
    try {
      // We will fetch a wide range to cover upcoming events and current view
      // E.g., start of current month - 1 month, to start of current month + 6 months
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 6, 0);

      const from = start.toISOString().split('T')[0];
      const to = end.toISOString().split('T')[0];

      const response = await axios.get(`http://localhost:7000/api/calendar/events`, {
        params: {
          school_id: 1,
          from,
          to
        }
      });
      setEvents(response.data);
    } catch (error) {
      console.error("Failed to fetch events", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  // Handle Delete Click
  const handleDeleteClick = (e, eventId) => {
    e.stopPropagation();
    setEventToDelete(eventId);
    setDeleteModalOpen(true);
  };

  // Confirm Delete
  const confirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      await axios.delete(`http://localhost:7000/api/calendar/events/${eventToDelete}`);
      toast({ type: 'success', message: 'Event deleted successfully' });
      fetchEvents(); // Refresh list
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({ type: 'error', message: 'Failed to delete event' });
    } finally {
      setDeleteModalOpen(false);
      setEventToDelete(null);
    }
  };

  // Derived state: Upcoming events (Future events only, sorted)
  const upcomingEvents = events
    .filter(event => {
      // Filter events that end after today (or start after today)
      const eventEnd = new Date(event.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventEnd >= today;
    })
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 6); // Top 6 upcoming

  const formatDateRange = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const options = { month: 'short', day: 'numeric' };

    if (s.toDateString() === e.toDateString()) {
      return s.toLocaleDateString('en-US', options);
    }
    // "Dec 10 - 20" or "Dec 30 - Jan 2"
    if (s.getMonth() === e.getMonth()) {
      return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${e.getDate()}`;
    }
    return `${s.toLocaleDateString('en-US', options)} - ${e.toLocaleDateString('en-US', options)}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Academic Calendar</h1>
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2">Manage schedules, holidays, and campus events</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={20} />
          Add Event
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {/* Main Calendar View */}
        <div className="w-full bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-500">
          <DetailedCalendar
            currentDate={currentDate}
            onMonthChange={setCurrentDate}
            events={events}
          />
        </div>

        {/* Collapsible Upcoming Events Section */}
        <div className="w-full">
          <button
            onClick={() => setIsEventsOpen(!isEventsOpen)}
            className="w-full flex items-center justify-between p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] shadow-sm hover:border-emerald-500/20 transition-all group"
          >
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Upcoming Events ({upcomingEvents.length})</h3>
              {loading && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
            </div>
            <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-all ${isEventsOpen ? 'rotate-180' : ''}`}>
              <ChevronDown size={20} />
            </div>
          </button>

          {isEventsOpen && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 fade-in duration-300">
              {upcomingEvents.length === 0 ? (
                <div className="col-span-2 text-center p-8 text-slate-400 font-bold uppercase tracking-widest text-xs">
                  No upcoming events found
                </div>
              ) : upcomingEvents.map((event) => {
                const isBlue = event.type === 'EXAMS' || event.type === 'blue' || event.color === 'blue';
                const isRed = event.type === 'HOLIDAY' || event.type === 'red' || event.color === 'red';
                const isGreen = !isBlue && !isRed;
                // Simple color logic

                return (
                  <div
                    key={event._id || event.id}
                    className={`p-8 rounded-[32px] border bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md ${isBlue ? 'border-blue-100 dark:border-blue-900/30' :
                      isRed ? 'border-red-100 dark:border-red-900/30' :
                        'border-emerald-100 dark:border-emerald-900/30'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <span className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-xl shadow-sm ${isBlue ? 'bg-blue-500 text-white' :
                        isRed ? 'bg-red-500 text-white' :
                          'bg-emerald-500 text-white'
                        }`}>
                        {event.type}
                      </span>
                      <span className={`text-sm font-black ${isBlue ? 'text-blue-600' :
                        isRed ? 'text-red-600' :
                          'text-emerald-600'
                        }`}>
                        {formatDateRange(event.startDate, event.endDate)}
                      </span>
                    </div>
                    <h4 className={`text-xl font-black mb-2 ${isBlue ? 'text-blue-900 dark:text-blue-200' :
                        isRed ? 'text-red-900 dark:text-red-200' :
                          'text-emerald-900 dark:text-emerald-200'
                      }`}>
                      {event.title}
                    </h4>

                    <div className="flex items-center justify-between mt-2">
                      <p className={`text-xs font-bold uppercase tracking-widest ${isBlue ? 'text-blue-500/70' :
                          isRed ? 'text-red-500/70' :
                            'text-emerald-500/70'
                        }`}>
                        {event.description}
                      </p>

                      <button
                        onClick={(e) => handleDeleteClick(e, event._id)}
                        className="p-2 -mr-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEventAdded={fetchEvents}
      />

      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Event?"
        message="Are you sure you want to delete this event? This action cannot be undone."
      />
    </div>
  );
};

export default CalendarPage;