import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import calendarService from '../../Api/calendarService';

const GMainC = () => {
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Fetch for current month range (plus/minus 1 month for safety)
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month + 2, 0);
      const from = start.toISOString().split('T')[0];
      const to = end.toISOString().split('T')[0];
      
      const data = await calendarService.getEvents(from, to);
      setEvents(data || []);
    } catch (error) {
      console.error("Failed to fetch dashboard events", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Calendar Logic
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getEventsForDay = (day) => {
    const current = new Date(year, month, day);
    current.setHours(0, 0, 0, 0);

    return events.filter(e => {
      if (!e.startDate || !e.endDate) return false;
      const start = new Date(e.startDate);
      const end = new Date(e.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return current >= start && current <= end;
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-none">
            {currentDate.toLocaleString("default", { month: "long" })}
          </h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{year}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {loading && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2" />}
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 hover:text-emerald-500"><ChevronLeft size={18} /></button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 hover:text-emerald-500"><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="animate-in fade-in zoom-in-95 duration-300">
          {/* Weekdays */}
          <div className="grid grid-cols-7 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{day}</div>
            ))}
          </div>
          
          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-y-2">
            {blanks.map((b, index) => <div key={`b-${index}`} />)}
            {days.map(day => {
              const d = new Date(year, month, day);
              const isToday = day === today.getDate() && 
                               month === today.getMonth() && 
                               year === today.getFullYear();
              
              const dayEvents = getEventsForDay(day);
              const hasExam = dayEvents.some(e => e.type === 'EXAMS' || e.type === 'CLASS TEST');
              const hasHoliday = dayEvents.some(e => e.type === 'HOLIDAY');
              const hasEvent = dayEvents.some(e => e.type === 'EVENT' || e.type === 'OTHER');
              const isSaturday = d.getDay() === 6;
              
              return (
                <div key={day} className="flex flex-col items-center justify-center py-2 group cursor-pointer relative">
                  <div className={`
                    w-10 h-10 flex items-center justify-center rounded-2xl text-sm font-bold transition-all
                    ${isToday ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100 dark:shadow-none scale-110 z-10' : ''}
                    ${!isToday && hasExam ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : ''}
                    ${!isToday && hasHoliday ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : ''}
                    ${!isToday && isSaturday && !hasExam && !hasHoliday ? 'text-red-500 dark:text-red-400' : ''}
                    ${!isToday && !hasExam && !hasHoliday && !isSaturday ? 'text-slate-600 dark:text-slate-300 group-hover:bg-slate-50 dark:group-hover:bg-slate-800' : ''}
                  `}>
                    {day}
                  </div>
                  
                  {/* Event Dots */}
                  <div className="flex gap-1 mt-1 h-1">
                    {hasExam && <div className="w-1 h-1 bg-blue-500 rounded-full"></div>}
                    {hasHoliday && <div className="w-1 h-1 bg-red-500 rounded-full"></div>}
                    {hasEvent && <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>}
                  </div>

                  {/* Hover Popover */}
                  {dayEvents.length > 0 && (
                    <div className={`
                      absolute bottom-full mb-3 w-48 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 translate-y-1 group-hover:translate-y-0
                      ${d.getDay() === 0 ? 'left-0' : d.getDay() === 6 ? 'right-0' : 'left-1/2 -translate-x-1/2'}
                    `}>
                      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700">
                        {dayEvents.slice(0, 2).map((event, idx) => (
                          <div key={idx} className={`${idx > 0 ? 'mt-2 pt-2 border-t border-slate-50 dark:border-slate-700' : ''}`}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                event.type === 'HOLIDAY' ? 'bg-red-500' : 
                                (event.type === 'EXAMS' || event.type === 'CLASS TEST') ? 'bg-blue-500' : 'bg-emerald-500'
                              }`} />
                              <p className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">{event.type}</p>
                            </div>
                            <h5 className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">{event.title}</h5>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <p className="text-[8px] font-black text-emerald-500 uppercase mt-2 pt-2 border-t border-slate-50 dark:border-slate-700 tracking-widest">+ {dayEvents.length - 2} More</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Bottom Footer Section */}
      <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-50 dark:border-slate-800 flex items-center flex-wrap gap-x-4 gap-y-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 border border-emerald-500 rounded-full shadow-sm"></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Event</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Holiday</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Exam</span>
        </div>
      </div>
    </div>
  );
};

export default GMainC;