import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, List, Calendar as CalendarIcon } from 'lucide-react';

const info = {
  november: {
    importantDays: [
      { day: 5, label: "Sports Day", type: "event", description: "Sport activity" },
      { day: 12, label: "Holiday", type: "holiday", description: "Public holiday" },
      { day: 23, label: "Parents Meeting", type: "event", description: "Parent meeting very important" },
      { day: 30, label: "Project Submission", type: "event", description: "Submit science project" }
    ],
    exam: { start: 18, end: 25, label: "Mid-Term Exam" }
  },
  december: {
    importantDays: [
      { day: 1, label: "Annual Day", type: "event", description: "School annual day" },
      { day: 25, label: "Christmas", type: "holiday", description: "Merry Christmas" },
      { day: 31, label: "New Year Eve", type: "event", description: "Happy new year" }
    ],
    exam: { start: 10, end: 20, label: "Final Exam" }
  }
};

const GMainC = () => {
  // Always default to grid view as the toggle UI is removed
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1)); 

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" }).toLowerCase();
  const activeMonthData = info[monthName];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Calendar Logic
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getEventsForDay = (day) => {
    const events = [];
    if (activeMonthData?.importantDays) {
      const match = activeMonthData.importantDays.find(d => d.day === day);
      if (match) events.push(match);
    }
    if (activeMonthData?.exam) {
      if (day >= activeMonthData.exam.start && day <= activeMonthData.exam.end) {
        events.push({ day, label: activeMonthData.exam.label, type: 'exam', description: 'Examination' });
      }
    }
    return events;
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
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 hover:text-emerald-500"><ChevronLeft size={18} /></button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 hover:text-emerald-500"><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* Content Area - Defaulted to Grid */}
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
              const isToday = day === today.getDate() && 
                              month === today.getMonth() && 
                              year === today.getFullYear();
              
              const dayEvents = getEventsForDay(day);
              const hasExam = dayEvents.some(e => e.type === 'exam');
              const hasHoliday = dayEvents.some(e => e.type === 'holiday');
              const hasEvent = dayEvents.some(e => e.type === 'event');
              
              return (
                <div key={day} className="flex flex-col items-center justify-center py-2 group cursor-pointer relative">
                  <div className={`
                    w-10 h-10 flex items-center justify-center rounded-2xl text-sm font-bold transition-all
                    ${isToday ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100 dark:shadow-none scale-110 z-10' : ''}
                    ${!isToday && hasExam ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : ''}
                    ${!isToday && hasHoliday ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : ''}
                    ${!isToday && !hasExam && !hasHoliday ? 'text-slate-600 dark:text-slate-300 group-hover:bg-slate-50 dark:group-hover:bg-slate-800' : ''}
                  `}>
                    {day}
                  </div>
                  
                  {/* Event Dots */}
                  <div className="flex gap-1 mt-1 h-1">
                    {hasExam && <div className="w-1 h-1 bg-blue-500 rounded-full"></div>}
                    {hasHoliday && <div className="w-1 h-1 bg-red-500 rounded-full"></div>}
                    {hasEvent && <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>}
                  </div>
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
          <div className="w-2.5 h-2.5 border border-emerald-500 rounded-full"></div>
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