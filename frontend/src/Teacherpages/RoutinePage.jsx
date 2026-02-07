import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  CalendarDays,
  Calendar,
  Pencil,
  Check,
  X,
  Loader2,
  BookOpen
} from 'lucide-react';
import { toast } from '../MainSystemComponents/Toast';

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

const RoutineCard = ({ period, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempLesson, setTempLesson] = useState(period.lesson || "Normal Class");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);

  const handleStartEdit = () => {
    if (!period.hasClass) return;
    setIsEditing(true);
    setTempLesson(period.lesson || "Normal Class");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempLesson(period.lesson || "Normal Class");
  };

  const handleSave = async () => {
    const trimmedValue = tempLesson.trim();
    if (trimmedValue === period.lesson) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(period.periodId, trimmedValue || "Normal Class");
      setIsEditing(false);
    } catch (error) {
      setTempLesson(period.lesson || "Normal Class");
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  return (
    <div className="group relative flex flex-col md:flex-row items-center gap-6 p-8 bg-slate-50/30 dark:bg-slate-800/20 border border-slate-100/50 dark:border-slate-800/50 hover:border-emerald-500/30 hover:bg-white dark:hover:bg-slate-800 rounded-[32px] transition-all duration-300 shadow-sm overflow-hidden">

      {/* 1. Time Column (Left) */}
      <div className="w-full md:w-44 shrink-0 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
          <Clock size={16} className="text-emerald-500" />
        </div>
        <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
          {period.time}
        </span>
      </div>

      {/* 2. Subject Column (Middle) */}
      <div className="shrink-0 w-full md:w-56 flex items-center justify-center md:justify-start">
        {period.hasClass ? (
          <div className="flex items-center gap-2.5 px-4 py-2 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/50">
            <BookOpen size={12} className="text-emerald-500" />
            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{period.subject}</span>
          </div>
        ) : (
          <div className="h-px w-10 bg-slate-200 dark:bg-slate-700 hidden md:block" />
        )}
      </div>

      {/* 3. Lesson/Topic Block */}
      <div className="flex-1 w-full text-center md:text-left py-2 relative">
        {isEditing ? (
          <div className="flex flex-col items-center md:items-start animate-in fade-in zoom-in-95 duration-200">
            <div className="relative w-full max-w-md flex items-center group/editbox">
              <input
                ref={inputRef}
                type="text"
                value={tempLesson}
                onChange={(e) => setTempLesson(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                className="w-full px-6 py-3 bg-white dark:bg-slate-900 border-2 border-emerald-500/50 focus:border-emerald-500 rounded-2xl text-xl font-black text-center md:text-left uppercase outline-none shadow-2xl dark:text-white transition-all pr-24"
              />
              <div className="absolute right-2 flex items-center gap-1.5">
                {isSaving ? (
                  <Loader2 className="text-emerald-500 animate-spin mr-2" size={20} />
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="w-9 h-9 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center active:scale-90"
                    >
                      <Check size={18} strokeWidth={3} />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="w-9 h-9 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center active:scale-90"
                    >
                      <X size={18} strokeWidth={3} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center md:items-start group/lesson">
            <div className="flex items-center gap-2 group/btn cursor-pointer" onClick={handleStartEdit}>
              <h4 className={`text-xl font-black uppercase tracking-tight leading-none ${period.hasClass ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-600'}`}>
                {period.hasClass ? (period.lesson || "Normal Class") : "No Class"}
              </h4>
              {period.hasClass && (
                <div className="p-1.5 text-slate-300 group-hover/btn:text-emerald-500 opacity-0 group-hover/lesson:opacity-100 transition-all rounded-lg">
                  <Pencil size={14} />
                </div>
              )}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
              {period.hasClass ? `${period.grade} • ${period.section}` : "Free period"}
            </p>
          </div>
        )}
      </div>

      {/* 4. Status Pill */}
      <div className="shrink-0 mt-4 md:mt-0">
        <span className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm transition-colors ${period.hasClass
          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
          : 'bg-slate-500/5 text-slate-400 border-slate-200/50 dark:border-slate-800'
          }`}>
          {period.hasClass ? 'CLASS' : 'NO CLASS'}
        </span>
      </div>

      {period.hasClass && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />
      )}
    </div>
  );
};

const RoutinePage = () => {
  const [selectedDay, setSelectedDay] = useState("");
  const [routineData, setRoutineData] = useState(INITIAL_ROUTINE_DATA);

  useEffect(() => {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    if (dayName === "Saturday") {
      setSelectedDay("Sunday");
    } else {
      setSelectedDay(dayName);
    }
  }, []);

  const handleUpdateLesson = async (periodId, newLesson) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setRoutineData(prev => {
        const newData = { ...prev };
        const dayEntries = newData[selectedDay].map(p =>
          p.periodId === periodId ? { ...p, lesson: newLesson } : p
        );
        newData[selectedDay] = dayEntries;
        return newData;
      });
      toast({ type: 'success', message: 'Academic sequence updated.', duration: 3000 });
    } catch (error) {
      toast({ type: 'error', message: 'Failed to synchronize change.', duration: 4000 });
      throw error;
    }
  };

  const activeRoutine = routineData[selectedDay] || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <CalendarDays className="text-emerald-500 w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">My Routine</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Personal Academic Sequence</p>
          </div>
        </div>
      </div>

      {/* FULL WIDTH Day Selector Bar */}
      <div className="w-full bg-white dark:bg-slate-900 p-1.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1.5 w-full min-w-max">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-1 px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${selectedDay === day
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 active:scale-95'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-8 lg:p-12">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 pb-8 border-b border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {selectedDay}'s Matrix
            </h3>
          </div>

          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Primary: Mathematics</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-l border-slate-100 dark:border-slate-800 pl-6">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Sub: English</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {activeRoutine.length > 0 ? (
            activeRoutine.map((period) => (
              <RoutineCard
                key={period.periodId}
                period={period}
                onUpdate={handleUpdateLesson}
              />
            ))
          ) : (
            <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 rounded-[32px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                <Calendar size={40} className="text-slate-200 dark:text-slate-700" />
              </div>
              <div className="max-w-xs">
                <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Sessions Found</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 leading-relaxed">No teaching periods registered for this calendar day.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Ledger */}
        <div className="mt-12 pt-8 border-t border-slate-50 dark:border-slate-800 flex flex-wrap items-center justify-center gap-10 opacity-60">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Class</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Free / Break Block</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutinePage;