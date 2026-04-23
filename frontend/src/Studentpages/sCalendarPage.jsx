import React, { useState, useEffect } from 'react';
import { Plus, ChevronDown, Trash } from 'lucide-react';
import DetailedCalendar from '../AdminComponents/Calendar/DetailedCalendar';
import AddEventModal from '../AdminComponents/Calendar/AddEventModal';
import ConfirmDialog from '../MainSystemComponents/ConfirmDialog';
import { toast } from '../MainSystemComponents/Toast';
import calendarService from '../Api/calendarService';
import NepaliCalendar, { convertADtoBS } from "@adhikarisaroj795/nepali-calendar-react";
import "@adhikarisaroj795/nepali-calendar-react/styles/nepalicalender.css";
import { motion, AnimatePresence } from 'framer-motion';

const SCalendarPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEventsOpen, setIsEventsOpen] = useState(true);
  const [calendarMode, setCalendarMode] = useState('AD'); // 'AD' or 'BS'

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
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 6, 0);

      const from = start.toISOString().split('T')[0];
      const to = end.toISOString().split('T')[0];

      // Backend now identifies schoolId and user from token
      const data = await calendarService.getEvents(from, to);
      setEvents(data);
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
      await calendarService.deleteEvent(eventToDelete);
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


  // Determine if we are viewing a past month
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPastMonth = currentDate.getFullYear() < today.getFullYear() || 
                    (currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() < today.getMonth());

  // Derived state: Events filtered by viewed month and future/past status
  const filteredEvents = events
    .filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);

      // Normalize to local date components for month comparison
      const startYear = eventStart.getFullYear();
      const startMonth = eventStart.getMonth();
      const viewYear = currentDate.getFullYear();
      const viewMonth = currentDate.getMonth();

      const isCorrectMonth = startYear === viewYear && startMonth === viewMonth;
      if (!isCorrectMonth) return false;

      // 2. If viewing current month, only show future/today events
      const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
      
      if (isCurrentMonth) {
        // Normalize today and eventEnd to midnight local for accurate "from today" check
        const eventEndLocal = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());
        const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        return eventEndLocal >= todayLocal;
      }

      return true;
    })
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  const listTitle = isPastMonth ? 'Past Events' : 'Upcoming Events';

  const formatDateRange = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const options = { month: 'short', day: 'numeric' };

    if (s.toDateString() === e.toDateString()) {
      return s.toLocaleDateString('en-US', options);
    }
    if (s.getMonth() === e.getMonth()) {
      return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${e.getDate()}`;
    }
    return `${s.toLocaleDateString('en-US', options)} - ${e.toLocaleDateString('en-US', options)}`;
  };

  const formatBSDateRange = (start, end) => {
    try {
      const bsStart = convertADtoBS(start.split('T')[0]);
      const bsEnd = convertADtoBS(end.split('T')[0]);
      if (bsStart === bsEnd) return bsStart;
      return `${bsStart} - ${bsEnd}`;
    } catch (e) {
      return formatDateRange(start, end);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Academic Calendar</h1>
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2">Manage schedules, holidays, and campus events</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 h-[52px] w-[160px]">
            {/* Animated Background Indicator */}
            <motion.div
              layoutId="calendarToggle"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              className="absolute bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20 z-0 h-[44px] w-[76px]"
              animate={{ x: calendarMode === 'AD' ? 0 : 76 }}
            />

            <button
              onClick={() => setCalendarMode('AD')}
              className={`relative z-10 flex-1 flex items-center justify-center py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${calendarMode === 'AD' ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-500'
                }`}
            >
              AD
            </button>
            <button
              onClick={() => setCalendarMode('BS')}
              className={`relative z-10 flex-1 flex items-center justify-center py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${calendarMode === 'BS' ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-500'
                }`}
            >
              BS
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-3 px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={20} />
            Add Personal Event
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Main Calendar View */}
        <div className="w-full bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-500 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={calendarMode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <DetailedCalendar
                currentDate={currentDate}
                onMonthChange={setCurrentDate}
                events={events}
                mode={calendarMode}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Collapsible Upcoming Events Section */}
        <div className="w-full">
          <button
            onClick={() => setIsEventsOpen(!isEventsOpen)}
            className="w-full flex items-center justify-between p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] shadow-sm hover:border-emerald-500/20 transition-all group"
          >
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{listTitle} ({filteredEvents.length})</h3>
              {loading && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
            </div>
            <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-all ${isEventsOpen ? 'rotate-180' : ''}`}>
              <ChevronDown size={20} />
            </div>
          </button>

          {isEventsOpen && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 fade-in duration-300">
              {filteredEvents.length === 0 ? (
                <div className="col-span-2 text-center p-8 text-slate-400 font-bold uppercase tracking-widest text-xs">
                  No {listTitle.toLowerCase()} found
                </div>
              ) : filteredEvents.map((event) => {
                const isBlue = event.type === 'EXAMS' || event.type === 'blue' || event.color === 'blue';
                const isRed = event.type === 'HOLIDAY' || event.type === 'red' || event.color === 'red';

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
                        {calendarMode === 'AD'
                          ? formatDateRange(event.startDate, event.endDate)
                          : formatBSDateRange(event.startDate, event.endDate)
                        }
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

                      {event.type !== 'HOLIDAY' && event.type !== 'EXAMS' && String(event.createdBy) === String(localStorage.getItem('studentId')) && (
                        <button
                          onClick={(e) => handleDeleteClick(e, event._id)}
                          className="p-2 -mr-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                        >
                          <Trash size={18} />
                        </button>
                      )}
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
        isStudentView={true}
        studentId={localStorage.getItem('studentId')}
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

export default SCalendarPage;