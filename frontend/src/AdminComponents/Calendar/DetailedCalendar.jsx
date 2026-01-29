import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DetailedCalendar = ({ currentDate, onMonthChange, events = [] }) => {
  // currentDate controls the view (Month/Year)
  const viewDate = currentDate || new Date();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const prevMonth = () => onMonthChange(new Date(year, month - 1, 1));
  const nextMonth = () => onMonthChange(new Date(year, month + 1, 1));

  // Helper to check if a date (day of current month) is within an event range
  const getEventsForDay = (day) => {
    // Current day instance (midnight)
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

  const isTodayDate = (day) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 transition-colors">
      {/* Calendar Header Controls */}
      <div className="p-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{monthName}</h2>
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{year}</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800"><ChevronLeft size={24} /></button>
            <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800"><ChevronRight size={24} /></button>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="px-8 pb-10 flex-1">
        <div className="grid grid-cols-7 mb-8 border-b border-slate-50 dark:border-slate-800 pb-4">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
            <div key={d} className="text-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-6">
          {blanks.map((b, index) => <div key={`b-${index}`} />)}
          {days.map(day => {
            const activeEvents = getEventsForDay(day);

            const isToday = isTodayDate(day);
            const isExam = activeEvents.some(e => e.type === 'EXAMS');
            const isHoliday = activeEvents.some(e => e.type === 'HOLIDAY');
            const isEvent = activeEvents.some(e => e.type === 'EVENT' || e.type === 'event'); // Case sensitive check or normalized

            return (
              <div key={day} className="flex flex-col items-center justify-start h-20 group relative cursor-pointer">
                <div className={`
                  w-12 h-12 flex items-center justify-center rounded-2xl text-sm font-black transition-all
                  ${isToday ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 scale-110 z-10' : ''}
                  ${isExam && !isToday ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 ring-2 ring-blue-100 dark:ring-blue-900/30' : ''}
                  ${isHoliday && !isToday ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 ring-2 ring-red-100 dark:ring-red-900/30' : ''}
                  ${!isToday && !isExam && !isHoliday ? 'text-slate-600 dark:text-slate-400 group-hover:bg-slate-50 dark:group-hover:bg-slate-800' : ''}
                `}>
                  {day}
                </div>

                {/* Visual Indicators underneath */}
                <div className="flex gap-1 mt-2.5 h-1.5 items-center justify-center">
                  {isToday && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                  {isExam && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-sm" />}
                  {isHoliday && <div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-sm" />}
                  {isEvent && <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-sm" />}
                </div>

                {/* Event Tooltip (Simple) */}
                {activeEvents.length > 0 && (
                  <div className="absolute top-14 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <div className="bg-slate-900 text-white text-[8px] font-bold px-2 py-1 rounded-md shadow-lg truncate max-w-[100px]">
                      {activeEvents[0].title}
                      {activeEvents.length > 1 && ` +${activeEvents.length - 1}`}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend Footer */}
      <div className="p-8 border-t border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 flex flex-wrap items-center justify-start gap-8">
        <div className="flex items-center gap-3 group">
          <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg group-hover:scale-125 transition-transform" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today</span>
        </div>
        <div className="flex items-center gap-3 group">
          <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg group-hover:scale-125 transition-transform" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event</span>
        </div>
        <div className="flex items-center gap-3 group">
          <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg group-hover:scale-125 transition-transform" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Holiday</span>
        </div>
        <div className="flex items-center gap-3 group">
          <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg group-hover:scale-125 transition-transform" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exam</span>
        </div>
      </div>
    </div>
  );
};

export default DetailedCalendar;