import React, { useState, useEffect } from 'react';
import {
  Clock,
  CalendarDays,
  Calendar
} from 'lucide-react';

// --- Mock Data ---
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const INITIAL_ROUTINE_DATA = {
  "Sunday": [
    { periodId: "s1", time: "09:00-09:45", subject: "Mathematics", lesson: "Calculus", grade: "Grade 12", section: "Section A", hasClass: true },
    { periodId: "s2", time: "09:45-10:30", subject: "Mathematics", lesson: "Algebra", grade: "Grade 9", section: "Section B", hasClass: true },
    { periodId: "s3", time: "10:30-10:45", subject: "Break", lesson: null, grade: "-", section: "-", hasClass: false },
    { periodId: "s4", time: "10:45-11:30", subject: "Advanced Physics", lesson: "Normal Class", grade: "Grade 12", section: "Section C", hasClass: true },
  ],
  "Monday": [
    { periodId: "m1", time: "09:00-09:45", subject: "Mathematics", lesson: "Normal Class", grade: "Grade 5", section: "Section A", hasClass: true },
    { periodId: "m2", time: "09:45-10:30", subject: "Break", lesson: null, grade: "-", section: "-", hasClass: false },
    { periodId: "m3", time: "10:30-11:15", subject: "English Literature", lesson: "Geometry", grade: "Grade 8", section: "Section B", hasClass: true },
    { periodId: "m4", time: "11:15-12:00", subject: "Free Block", lesson: null, grade: "-", section: "-", hasClass: false },
  ],
  "Tuesday": [
    { periodId: "t1", time: "09:00-09:45", subject: "Prep", lesson: null, grade: "-", section: "-", hasClass: false },
    { periodId: "t2", time: "09:45-10:30", subject: "Mathematics", lesson: "Calculus", grade: "Grade 12", section: "Section A", hasClass: true },
    { periodId: "t3", time: "10:30-11:15", subject: "Mathematics", lesson: "Algebra", grade: "Grade 9", section: "Section B", hasClass: true },
  ],
  "Wednesday": [
    { periodId: "w1", time: "09:00-09:45", subject: "Mathematics", lesson: "Mathematics", grade: "Grade 5", section: "Section B", hasClass: true },
    { periodId: "w2", time: "09:45-10:30", subject: "Statistics", lesson: "Statistics", grade: "Grade 11", section: "Section A", hasClass: true },
  ],
  "Thursday": [
    { periodId: "th1", time: "09:00-11:30", subject: "General", lesson: "Staff General Meeting", grade: "All Faculty", section: "Main Hall", hasClass: true },
  ],
  "Friday": [
    { periodId: "f1", time: "09:00-09:45", subject: "Free", lesson: null, grade: "-", section: "-", hasClass: false },
    { periodId: "f2", time: "09:45-10:30", subject: "Academic", lesson: "Weekly Assessment", grade: "Grade 10", section: "Section A", hasClass: true },
  ],
};

const RoutineCard = ({ period }) => {
  return (
    <div className={`group relative w-full flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:p-10 bg-slate-900/40 dark:bg-slate-900/60 border border-slate-800 rounded-[32px] md:rounded-full transition-all duration-500 hover:border-emerald-500/40 hover:bg-slate-900/80 shadow-2xl overflow-hidden ${!period.hasClass ? 'opacity-40' : ''}`}>

      {/* 1. Time Section */}
      <div className="flex items-center gap-6 shrink-0 w-full md:w-1/3">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 shadow-inner shrink-0 transition-colors group-hover:bg-slate-700">
          <Clock size={18} className="text-emerald-500" />
        </div>
        <span className="text-xl font-black text-white tracking-tighter tabular-nums whitespace-nowrap">
          {period.time}
        </span>
      </div>

      {/* 2. Lesson / Topic (MAIN CENTER) - Static Read-Only View */}
      <div className="flex-1 w-full text-center relative px-4">
        <div className="flex items-center justify-center gap-3">
          <h4 className={`text-3xl font-black uppercase tracking-tighter leading-none transition-all ${period.hasClass ? 'text-white' : 'text-slate-700'}`}>
            {period.hasClass ? (period.lesson || "Normal Class") : "No Class"}
          </h4>
        </div>
      </div>

      {/* 3. Subject Name (Right Side) */}
      <div className="shrink-0 w-full md:w-1/3 flex justify-center md:justify-end">
        {period.hasClass && (
          <div className="flex items-center gap-3 px-6 py-2.5 bg-emerald-500/5 dark:bg-emerald-950/20 rounded-full border border-emerald-500/10">
            <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em]">
              {period.subject}
            </span>
          </div>
        )}
      </div>

      {/* Background Decor */}
      {period.hasClass && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] pointer-events-none rounded-full" />
      )}
    </div>
  );
};

const SRoutinePage = () => {
  const [selectedDay, setSelectedDay] = useState("");
  const [routineData] = useState(INITIAL_ROUTINE_DATA);

  useEffect(() => {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    if (dayName === "Saturday") {
      setSelectedDay("Sunday");
    } else {
      setSelectedDay(dayName);
    }
  }, []);

  const activeRoutine = routineData[selectedDay] || [];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[28px] bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl">
            <CalendarDays className="text-emerald-500 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">Academic Routine</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-time Schedule Matrix
            </p>
          </div>
        </div>
      </div>

      {/* Day Selector */}
      <div className="bg-slate-900/40 p-1.5 rounded-full border border-slate-800 shadow-xl overflow-x-auto scrollbar-hide">
        <div className="grid grid-cols-6 gap-1 w-full min-w-[700px]">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`py-4 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 text-center ${selectedDay === day
                ? 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-105 z-10'
                : 'text-slate-500 hover:text-white hover:bg-slate-800'
                }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Routine Cards Container */}
      <div className="space-y-6">
        {activeRoutine.length > 0 ? (
          activeRoutine.map((period) => (
            <RoutineCard
              key={period.periodId}
              period={period}
            />
          ))
        ) : (
          <div className="py-40 flex flex-col items-center justify-center text-center space-y-8 bg-slate-900/20 rounded-[64px] border-4 border-dashed border-slate-800/50">
            <div className="w-24 h-24 rounded-[32px] bg-slate-900 flex items-center justify-center border border-slate-800 shadow-inner">
              <Calendar size={40} className="text-slate-700" />
            </div>
            <div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Schedule Clear</h4>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-3">No active academic blocks for this calendar day.</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-center gap-12 pt-10 opacity-50">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Class Session</span>
        </div>
      </div>

    </div>
  );
};

export default SRoutinePage;