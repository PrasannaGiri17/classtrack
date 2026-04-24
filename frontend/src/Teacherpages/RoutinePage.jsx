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
import timetableService from '../Api/timetableService';
import teacherService from '../Api/teacherService';

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const EMPTY_ROUTINE_DATA = {
  "Sunday": [],
  "Monday": [],
  "Tuesday": [],
  "Wednesday": [],
  "Thursday": [],
  "Friday": [],
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
    <div className="group relative grid grid-cols-1 md:grid-cols-5 items-center gap-6 p-8 bg-slate-50/30 dark:bg-slate-800/20 border border-slate-100/50 dark:border-slate-800/50 hover:border-emerald-500/30 hover:bg-white dark:hover:bg-slate-800 rounded-[32px] transition-all duration-300 shadow-sm overflow-hidden">

      {/* 1. Time Column (Left) */}
      <div className="col-span-1 w-full flex items-center justify-center md:justify-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm shrink-0">
          <Clock size={16} className="text-emerald-500" />
        </div>
        <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
          {period.time}
        </span>
      </div>

      {/* 2. Subject Column (Middle Left) */}
      <div className="col-span-1 w-full flex items-center justify-center">
        {period.hasClass ? (
          <div className="flex items-center gap-2.5 px-4 py-2 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/50">
            <BookOpen size={12} className="text-emerald-500" />
            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 tracking-widest">{period.subject}</span>
          </div>
        ) : (
          <div className="h-px w-10 bg-slate-200 dark:bg-slate-700 hidden md:block" />
        )}
      </div>

      {/* 3. Lesson/Topic Block (Middle) */}
      <div className="col-span-1 w-full flex justify-center py-2 relative">
        {isEditing ? (
          <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-200 w-full">
            <div className="relative w-full max-w-[200px] flex items-center group/editbox">
              <input
                ref={inputRef}
                type="text"
                value={tempLesson}
                onChange={(e) => setTempLesson(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSaving}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border-2 border-emerald-500/50 focus:border-emerald-500 rounded-xl text-lg font-black text-center outline-none shadow-xl dark:text-white transition-all pr-12"
              />
              <div className="absolute right-1 flex items-center gap-1">
                {isSaving ? (
                  <Loader2 className="text-emerald-500 animate-spin mr-1" size={16} />
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="w-7 h-7 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all flex items-center justify-center active:scale-90"
                    >
                      <Check size={14} strokeWidth={3} />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="w-7 h-7 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center active:scale-90"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center group/lesson">
            <div className="flex items-center gap-2 group/btn">
              <h4 className={`text-xl font-black tracking-tight leading-none text-center ${period.hasClass ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-600'}`}>
                {period.hasClass ? (period.lesson || "Normal Class") : "No Class"}
              </h4>
              {/* {period.hasClass && (
                <div className="p-1.5 text-slate-300 group-hover/btn:text-emerald-500 opacity-0 group-hover/lesson:opacity-100 transition-all rounded-lg">
                  <Pencil size={14} />
                </div>
              )} */}
            </div>
          </div>
        )}
      </div>

      {/* 4. Grade/Section Pill (Middle Right) */}
      <div className="col-span-1 w-full flex items-center justify-center">
        {period.hasClass && (
          <div className="flex items-center gap-2.5 px-4 py-2 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/50">
            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 tracking-widest">
              {period.grade} • {period.section}
            </span>
          </div>
        )}
      </div>

      {/* 5. Status Pill (Right) */}
      <div className="col-span-1 w-full flex items-center justify-center md:justify-end">
        <span className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] border shadow-sm transition-colors ${period.hasClass
          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
          : 'bg-slate-500/5 text-slate-400 border-slate-200/50 dark:border-slate-800'
          }`}>
          {period.hasClass ? 'Class' : 'No Class'}
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
  const [routineData, setRoutineData] = useState(EMPTY_ROUTINE_DATA);
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const teacherId = localStorage.getItem("teacherId");

  useEffect(() => {
    const fetchData = async () => {
      if (!teacherId) {
        setIsLoading(false);
        return;
      }
      try {
        const [info, routine] = await Promise.all([
          teacherService.getTeacherById(teacherId),
          timetableService.getTeacherRoutine(teacherId)
        ]);
        setTeacherInfo(info);
        setRoutineData(routine || EMPTY_ROUTINE_DATA);
      } catch (error) {
        console.error("Error fetching routine:", error);
        toast({ type: 'error', message: 'Failed to load personal routine.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [teacherId]);

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
    const period = activeRoutine.find(p => p.periodId === periodId);
    if (!period || !teacherId) return;

    try {
      await timetableService.updateTeacherTopic(teacherId, {
        topic: newLesson,
        ...period.rawIds
      });

      setRoutineData(prev => {
        const newData = { ...prev };
        const dayEntries = newData[selectedDay].map(p =>
          p.periodId === periodId ? { ...p, lesson: newLesson } : p
        );
        newData[selectedDay] = dayEntries;
        return newData;
      });
      toast({ type: 'success', message: 'Academic topic synchronized.', duration: 3000 });
    } catch (error) {
      console.error("Error updating topic:", error);
      const serverMsg = error.response?.data?.message || 'Failed to synchronize topic.';
      toast({ type: 'error', message: serverMsg, duration: 4500 });
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
            <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-2">Personal Academic Sequence</p>
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
              className={`flex-1 px-8 py-3.5 rounded-full text-[10px] font-black tracking-[0.2em] transition-all duration-300 ${selectedDay === day
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
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-6 border-b border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {selectedDay}'s Routine
            </h3>
          </div>

          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <div className="flex items-center gap-6">
              {teacherInfo?.primarySubject?.subjectName && (
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Primary: {teacherInfo.primarySubject.subjectName}</span>
                </div>
              )}
              {teacherInfo?.secondarySubject?.subjectName && (
                <div className={`flex items-center gap-2 text-[10px] font-black text-slate-400 tracking-widest pl-6 ${teacherInfo?.primarySubject?.subjectName ? 'border-l border-slate-100 dark:border-slate-800' : ''}`}>
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>Sub: {teacherInfo.secondarySubject.subjectName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-xs font-bold text-slate-400 tracking-tight">Synchronizing Matrix...</p>
          </div>
        ) : (
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
                  <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">No Sessions Found</h4>
                  <p className="text-xs font-bold text-slate-400 tracking-widest mt-2 leading-relaxed">No teaching periods registered for this calendar day.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Ledger */}
        <div className="mt-12 pt-8 border-t border-slate-50 dark:border-slate-800 flex flex-wrap items-center justify-center gap-10 opacity-60">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            <span className="text-[10px] font-black text-slate-400 tracking-widest">Active Class</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span className="text-[10px] font-black text-slate-400 tracking-widest">Free / Break Block</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutinePage;