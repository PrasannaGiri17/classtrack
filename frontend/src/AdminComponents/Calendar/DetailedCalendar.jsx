import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { convertADtoBS, convertBStoAD, toNepaliNumber } from "@adhikarisaroj795/nepali-calendar-react";

const nepaliMonths = [
  'Baisakh', 'Jestha', 'Ashad', 'Shrawan', 'Bhadra', 'Ashoj',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

const DetailedCalendar = ({ currentDate, onMonthChange, events = [], mode = 'AD' }) => {
  // currentDate controls the view (Month/Year)
  const viewDate = currentDate || new Date();

  // BS Mode Calculations
  const adDateStr = viewDate.toISOString().split('T')[0];
  const currentBS = convertADtoBS(adDateStr);
  const [bsYear, bsMonth, bsDay] = currentBS.split('-').map(Number);

  const year = mode === 'AD' ? viewDate.getFullYear() : bsYear;
  const month = mode === 'AD' ? viewDate.getMonth() : bsMonth - 1; // 0-indexed
  const monthName = mode === 'AD' ? viewDate.toLocaleString('default', { month: 'long' }) : nepaliMonths[month];

  // Logic to find days in BS month and start day
  // Since we don't have a direct "daysInMonth" for BS, we can iterate
  const getBSMonthDetails = (y, m) => {
    // month is 0-indexed
    const firstDayBS = `${y}-${String(m + 1).padStart(2, '0')}-01`;
    const firstDayAD = new Date(convertBStoAD(firstDayBS));
    const startDay = firstDayAD.getDay();

    // Find days in month by checking when the month changes in BS
    let dayCount = 28;
    while (dayCount < 33) {
      const nextDateBS = `${y}-${String(m + 1).padStart(2, '0')}-${String(dayCount + 1).padStart(2, '0')}`;
      try {
        const nextDateAD = convertBStoAD(nextDateBS);
        if (!nextDateAD) break;
        dayCount++;
      } catch (e) {
        break;
      }
    }
    return { startDay, dayCount };
  };

  const { startDay, dayCount } = mode === 'AD'
    ? { startDay: new Date(year, month, 1).getDay(), dayCount: new Date(year, month + 1, 0).getDate() }
    : getBSMonthDetails(bsYear, month);

  const days = Array.from({ length: dayCount }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDay }, (_, i) => i);

  const prevMonth = () => {
    if (mode === 'AD') {
      onMonthChange(new Date(year, month - 1, 1));
    } else {
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? bsYear - 1 : bsYear;
      const ad = convertBStoAD(`${prevY}-${String(prevM + 1).padStart(2, '0')}-01`);
      onMonthChange(new Date(ad));
    }
  };

  const nextMonth = () => {
    if (mode === 'AD') {
      onMonthChange(new Date(year, month + 1, 1));
    } else {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? bsYear + 1 : bsYear;
      const ad = convertBStoAD(`${nextY}-${String(nextM + 1).padStart(2, '0')}-01`);
      onMonthChange(new Date(ad));
    }
  };

  // Helper to check if a date (day of current month) is within an event range
  const getEventsForDay = (day) => {
    let current;
    if (mode === 'AD') {
      current = new Date(year, month, day);
    } else {
      current = new Date(convertBStoAD(`${bsYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`));
    }
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
    if (mode === 'AD') {
      return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    } else {
      const todayBS = convertADtoBS(today.toISOString().split('T')[0]);
      const [ty, tm, td] = todayBS.split('-').map(Number);
      return day === td && month === tm - 1 && bsYear === ty;
    }
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
            <div key={d} className={`text-center text-[10px] font-black uppercase tracking-[0.2em] ${d === 'SAT' ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-6">
          {blanks.map((b, index) => <div key={`b-${index}`} />)}
          {days.map(day => {
            const activeEvents = getEventsForDay(day);

            const isToday = isTodayDate(day);
            const isExam = activeEvents.some(e => e.type === 'EXAMS' || e.type === 'CLASS TEST');
            const isHoliday = activeEvents.some(e => e.type === 'HOLIDAY');
            const isHomeWork = activeEvents.some(e => e.type === 'HOMEWORK');
            const isEvent = activeEvents.some(e => e.type === 'EVENT' || e.type === 'event');

            // Calculate if this date is a Saturday
            // (startDay + day - 1) % 7 will be 6 for Saturday
            const colIndex = (startDay + day - 1) % 7;
            const isSaturday = colIndex === 6;

            return (
              <div key={day} className="flex flex-col items-center justify-start h-20 group relative cursor-pointer">
                <div className={`
                  w-12 h-12 flex items-center justify-center rounded-2xl text-sm font-black transition-all
                  ${isToday ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 scale-110 z-10' : ''}
                  ${isExam && !isToday ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 ring-2 ring-blue-100 dark:ring-blue-900/30' : ''}
                  ${isHoliday && !isToday ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 ring-2 ring-red-100 dark:ring-red-900/30' : ''}
                  ${isHomeWork && !isToday ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 ring-2 ring-amber-100 dark:ring-amber-900/30' : ''}
                  ${isSaturday && !isToday && !isExam && !isHoliday && !isHomeWork ? 'text-red-600 dark:text-red-400 bg-red-50/30 dark:bg-red-900/10' : ''}
                  ${!isToday && !isExam && !isHoliday && !isHomeWork && !isSaturday ? 'text-slate-600 dark:text-slate-400 group-hover:bg-slate-50 dark:group-hover:bg-slate-800' : ''}
                `}>
                  {day}
                </div>

                {/* Visual Indicators underneath */}
                <div className="flex gap-1 mt-2.5 h-1.5 items-center justify-center">
                  {isToday && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                  {isExam && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-sm" />}
                  {isHoliday && <div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-sm" />}
                  {isHomeWork && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-sm" />}
                  {isEvent && <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-sm" />}
                </div>

                {/* Enhanced Detailed Popover on Hover */}
                {activeEvents.length > 0 && (
                  <div className={`
                    absolute bottom-full mb-4 w-64 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 translate-y-2 group-hover:translate-y-0 scale-95 group-hover:scale-100
                    ${colIndex === 0 ? 'left-[-20px] translate-x-0' :
                      colIndex === 6 ? 'right-[-20px] translate-x-0' :
                        'left-1/2 -translate-x-1/2'}
                  `}>
                    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-2xl p-4 overflow-hidden ring-1 ring-slate-900/5">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-1 text-[8px] font-black uppercase rounded-lg tracking-widest ${activeEvents[0].type === 'HOLIDAY' ? 'bg-red-500 text-white' :
                            activeEvents[0].type === 'EXAMS' || activeEvents[0].type === 'CLASS TEST' ? 'bg-blue-500 text-white' :
                              activeEvents[0].type === 'HOMEWORK' ? 'bg-amber-500 text-white' :
                                'bg-emerald-500 text-white'
                            }`}>
                            {activeEvents[0].type}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400">
                            {new Date(activeEvents[0].startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                            {activeEvents[0].title}
                          </h4>
                          {activeEvents[0].description && (
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                              {activeEvents[0].description}
                            </p>
                          )}
                        </div>

                        {activeEvents.length > 1 && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                              + {activeEvents.length - 1} More Events
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Triangle Pointer */}
                      <div className={`
                        absolute -bottom-2 w-4 h-4 bg-white/95 dark:bg-slate-900/95 border-b border-r border-slate-200/50 dark:border-slate-800/50 rotate-45
                        ${colIndex === 0 ? 'left-10' :
                          colIndex === 6 ? 'right-10' :
                            'left-1/2 -translate-x-1/2'}
                      `} />
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
          <div className="w-3 h-3 bg-amber-500 rounded-full shadow-lg group-hover:scale-125 transition-transform" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Homework</span>
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