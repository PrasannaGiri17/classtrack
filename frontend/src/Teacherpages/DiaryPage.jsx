import React, { useState, useEffect } from 'react';
import {
  BookOpenCheck,
  Calendar,
  Clock,
  Save,
  GraduationCap,
  PencilLine,
  Home,
  Loader2,
  Inbox
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from '../MainSystemComponents/Toast';
import diaryService from '../Api/diaryService';
import timetableService from '../Api/timetableService';
import teacherService from '../Api/teacherService';
import calendarService from '../Api/calendarService';
import CustomNepaliHolidayCalendar from '../MainSystemComponents/CustomNepaliHolidayCalendar';
import { motion, AnimatePresence } from 'framer-motion';
import { getHolidayOnDate } from '../Utils/nepaliDateHelpers';


const DiaryCard = ({ entry, onSave }) => {
  const [activity, setActivity] = useState(entry.activity || "");
  const [homework, setHomework] = useState(entry.homework || "");
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when entry changes
  useEffect(() => {
    setActivity(entry.activity || "");
    setHomework(entry.homework || "");
  }, [entry]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Pass the necessary fields for backend save
      await onSave(entry.periodId, entry.grade, entry.section, entry.subject, activity, homework);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-8 space-y-6 group hover:border-emerald-500/20 transition-all duration-300">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-500">
            <GraduationCap size={24} />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">{entry.grade} {entry.section}</h4>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-1.5">{entry.subject}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100/50 dark:border-slate-800">
          <Clock size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest">{entry.time}</span>
        </div>
      </div>

      <div className="space-y-5">
        {/* Class Activity Field */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 ml-1">
            <PencilLine size={14} className="text-emerald-500" />
            <label className="text-[10px] font-black text-slate-400 tracking-widest">Class Activity</label>
          </div>
          <textarea
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder="What was taught today?"
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:text-white resize-none h-24 placeholder:text-slate-300 shadow-inner"
          />
        </div>

        {/* Homework Field */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 ml-1">
            <Home size={14} className="text-emerald-500" />
            <label className="text-[10px] font-black text-slate-400 tracking-widest">Homework Assignment</label>
          </div>
          <textarea
            value={homework}
            onChange={(e) => setHomework(e.target.value)}
            placeholder="Assignments for tomorrow..."
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:text-white resize-none h-24 placeholder:text-slate-300 shadow-inner"
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[20px] font-black text-[11px] tracking-[0.2em] shadow-xl shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
      >
        {isSaving ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            <span>Synchronizing...</span>
          </>
        ) : (
          <>
            <Save size={18} />
            <span>Save Diary</span>
          </>
        )}
      </button>
    </div>
  );
};

const DiaryPage = () => {
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [teacherId, setTeacherId] = useState(null);
  const [fullRoutine, setFullRoutine] = useState({});
  const [holidays, setHolidays] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = React.useRef(null);

  useEffect(() => {
    const id = localStorage.getItem('teacherId');
    if (id && id !== 'undefined' && id !== 'null') {
      setTeacherId(id);
    } else {
      toast({ type: 'error', message: 'Teacher session not found. Please log in again.' });
    }
  }, []);

  const fetchFullRoutine = async () => {
    if (!teacherId) return;
    try {
      const routine = await timetableService.getTeacherRoutine(teacherId);
      setFullRoutine(routine || {});
    } catch (error) {
      console.error("Failed to fetch routine:", error);
    }
  };

  useEffect(() => {
    fetchFullRoutine();
  }, [teacherId]);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const events = await calendarService.getEvents();
        // Backend returns holidays as objects with type: 'Holiday' or isPublicHoliday: true
        const holidayMapped = (events || []).filter(e =>
          e && (e.type?.toUpperCase() === 'HOLIDAY' || e.isPublicHoliday)
        );
        setHolidays(holidayMapped);
      } catch (error) {
        console.error("Failed to fetch holidays:", error);
      }
    };
    fetchHolidays();
  }, []);

  // Handle click outside to close calendar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDiaryData = async () => {
    if (!teacherId || !fullRoutine) return;
    setLoading(true);
    try {
      // 1. Get routine for the selected day
      const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
      const classesForDay = fullRoutine[dayName] || [];

      // 2. Fetch saved diary entries for this date
      const savedDiaries = await diaryService.getDiariesForDate(teacherId, selectedDate);

      // 3. Merge routine with saved diary entries
      const merged = classesForDay.map(cls => {
        const saved = savedDiaries.find(d => d.periodId === cls.periodId);
        return {
          ...cls,
          activity: saved ? saved.activity : "",
          homework: saved ? saved.homework : ""
        };
      });

      setDiaryEntries(merged);
    } catch (error) {
      console.error("Failed to fetch diary records:", error);
      toast({ type: 'error', message: 'Failed to synchronize classroom records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacherId && Object.keys(fullRoutine).length > 0) {
      fetchDiaryData();
    }
  }, [teacherId, selectedDate, fullRoutine]);

  const handleSaveEntry = async (periodId, grade, section, subject, activity, homework) => {
    try {
      await diaryService.saveDiaryEntry({
        teacherId,
        periodId,
        date: selectedDate,
        className: `${grade} ${section}`,
        subject,
        activity,
        homework
      });

      // Update local state
      setDiaryEntries(prev => prev.map(e => e.periodId === periodId ? { ...e, activity, homework } : e));

      toast({
        type: 'success',
        message: `Records published successfully for ${selectedDate.toLocaleDateString()}.`,
        duration: 3000
      });
    } catch (error) {
      console.error("Failed to save entry:", error);
      toast({ type: 'error', message: 'Publication protocol failed.' });
    }
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const currentHoliday = React.useMemo(() => getHolidayOnDate(selectedDate, holidays), [selectedDate, holidays]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-[28px] flex items-center justify-center shadow-lg shadow-emerald-500/10 transition-transform hover:rotate-12 duration-500">
            <BookOpenCheck className="text-emerald-500 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Class Diary</h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-2">Classroom progress & homework tracking</p>
          </div>
        </div>

        {/* Date Selector Box - New Design with Custom Calendar */}
        <div className="relative shrink-0 w-fit" ref={calendarRef}>
          <div
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center gap-4 px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[24px] shadow-sm hover:border-emerald-500/30 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0 group-hover:scale-110 transition-transform">
              <Calendar size={20} />
            </div>
            <div className="flex flex-col justify-center -space-y-0.5 pr-2">
              <p className="text-[9px] font-black text-slate-400 tracking-[0.15em] leading-none mb-1 opacity-80">
                {isToday ? "Today's Session" : "Selected Session"}
              </p>
              <div className="flex items-center">
                <span className="text-sm font-black text-slate-900 dark:text-white leading-none tracking-tight">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* New Premium Calendar Popup */}
          <AnimatePresence>
            {showCalendar && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="absolute top-full right-0 mt-4 z-50 w-[360px] shadow-2xl origin-top-right scale-105"
              >
                <CustomNepaliHolidayCalendar
                  selectedDate={selectedDate}
                  onChange={(date) => {
                    setSelectedDate(date);
                    setShowCalendar(false);
                  }}
                  holidays={holidays}
                  showTodayButton={true}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Grid of Classes */}
      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4 text-slate-400">
          <Loader2 size={40} className="animate-spin text-emerald-500" />
          <p className="text-[10px] font-black tracking-widest">Synchronizing records...</p>
        </div>
      ) : currentHoliday ? (
        <div className="py-40 flex flex-col items-center justify-center text-center space-y-8 bg-red-50/50 dark:bg-red-900/10 rounded-[64px] border-2 border-red-100 dark:border-red-900/20 shadow-xl shadow-red-500/5 relative overflow-hidden group max-w-4xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
          <div className="w-28 h-28 bg-white dark:bg-slate-900 rounded-[36px] flex items-center justify-center text-red-500 shadow-2xl shadow-red-500/10 group-hover:rotate-12 transition-transform duration-700 relative z-10">
            <Calendar size={56} className="text-red-500" />
            <div className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex flex-col items-center">
              <span className="px-4 py-1.5 bg-red-500 text-white text-[10px] font-black tracking-[0.3em] rounded-full shadow-lg shadow-red-500/20 mb-6">
                Official Holiday
              </span>
              <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight px-10">
                {currentHoliday.holidayName || currentHoliday.title || "School Holiday"}
              </h3>
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 max-w-[400px] mx-auto leading-relaxed border-t border-red-100 dark:border-red-900/30 pt-6 mt-6">
              Classroom operations are currently suspended for this date. Go ahead and enjoy your break—we'll keep things ready for your return!
            </p>
          </div>
        </div>
      ) : diaryEntries.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {diaryEntries.map((entry) => (
            <DiaryCard
              key={entry.periodId}
              entry={entry}
              onSave={handleSaveEntry}
            />
          ))}
        </div>
      ) : (
        <div className="py-40 flex flex-col items-center justify-center text-center space-y-6 bg-slate-50 dark:bg-slate-900/50 rounded-[48px] border-2 border-dashed border-slate-100 dark:border-slate-800">
          <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-200 dark:text-slate-700 shadow-sm">
            <Inbox size={40} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">No classes scheduled</h3>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-2 max-w-[240px]">Relax! You have no periods assigned for this specific date.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiaryPage;