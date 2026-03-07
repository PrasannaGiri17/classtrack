import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  BookOpenCheck,
  Calendar as CalendarIcon,
  Clock,
  User,
  PencilLine,
  Home,
  BookOpen,
  Calendar
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import diaryService from "../Api/diaryService";
import studentService from "../Api/studentService";
import gradeService from "../Api/gradeService";
import calendarService from "../Api/calendarService";
import Loading from "../MainSystemComponents/Loading";
import { toast } from '../MainSystemComponents/Toast';
import routineService from "../Api/routineService";
import CustomNepaliHolidayCalendar from '../MainSystemComponents/CustomNepaliHolidayCalendar';
import { motion, AnimatePresence } from 'framer-motion';
import { getHolidayOnDate } from '../Utils/nepaliDateHelpers';

const SDiaryCard = ({ entry, timeSlot }) => {
  // teacherId is populated with { firstName, lastName, profilePhoto }
  const teacher = entry.teacherId;
  const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown Teacher";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-8 space-y-6 group hover:border-emerald-500/20 transition-all duration-300">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {teacher?.profilePhoto ? (
            <img
              src={teacher.profilePhoto}
              alt={teacherName}
              className="w-12 h-12 rounded-2xl object-cover border border-slate-100 dark:border-slate-700"
            />
          ) : (
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-500 shadow-inner">
              <User size={24} />
            </div>
          )}
          <div className="space-y-1.5">
            <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">{teacherName}</h4>
            <div className="flex items-center">
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/10">
                {entry.subject}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100/50 dark:border-slate-800">
            <Clock size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              {timeSlot || "N/A"}
            </span>
          </div>
          <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mr-1">
            Period {entry.periodId.split('-')[1] || entry.periodId}
          </span>
        </div>
      </div>

      <div className="space-y-5">
        {/* Class Activity Field */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 ml-1">
            <PencilLine size={14} className="text-emerald-500" />
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class Activity</label>
          </div>
          <div className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium transition-all dark:text-white shadow-inner min-h-[80px]">
            {entry.activity || "No activity logged for this session."}
          </div>
        </div>

        {/* Homework Field */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 ml-1">
            <Home size={14} className="text-emerald-500" />
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Homework Assignment</label>
          </div>
          <div className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium transition-all dark:text-white shadow-inner min-h-[80px]">
            {entry.homework || "No homework assigned for this session."}
          </div>
        </div>
      </div>
    </div>
  );
};

const SDiaryPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [className, setClassName] = useState("");
  const [routineInfo, setRoutineInfo] = useState({ operatingHours: { start: "09:00" }, classRoutines: {} });
  const [gradeNum, setGradeNum] = useState("");
  const [holidays, setHolidays] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  const studentId = localStorage.getItem("studentId");
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  // 1. Fetch Student Class Name & Routine Settings & Holidays
  useEffect(() => {
    const getInitialData = async () => {
      if (!studentId) return;
      try {
        const [profile, routineMatrix, events] = await Promise.all([
          studentService.getStudentById(studentId),
          routineService.getRoutineMatrix(),
          calendarService.getEvents()
        ]);

        const gNum = String(profile.studentClass || profile.gradeId?.gradeNumber);
        setGradeNum(gNum);
        setRoutineInfo(routineMatrix);

        // Filter holidays
        const holidayMapped = (events || []).filter(e =>
          e && (e.type?.toUpperCase() === 'HOLIDAY' || e.isPublicHoliday)
        );
        setHolidays(holidayMapped);

        const sectionId = profile.sectionId?._id || profile.sectionId;
        if (sectionId) {
          const sectionRes = await gradeService.getSectionById(sectionId);
          const fullClass = `${sectionRes.gradeName} Section ${sectionRes.sectionName}`;
          setClassName(fullClass);
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
      }
    };
    getInitialData();
  }, [studentId]);

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

  // 2. Fetch Diary Entries
  const fetchDiary = useCallback(async () => {
    if (!className) return;
    setIsLoading(true);
    try {
      const data = await diaryService.getDiariesByClass(className, selectedDate);
      // Sort entries by period index
      const sortedData = [...data].sort((a, b) => {
        const aIdx = parseInt(a.periodId.split('-')[1]) || 0;
        const bIdx = parseInt(b.periodId.split('-')[1]) || 0;
        return aIdx - bIdx;
      });
      setDiaryEntries(sortedData);
    } catch (err) {
      console.error("Failed to fetch diary:", err);
      toast({ type: 'error', message: 'Failed to load diary entries.' });
    } finally {
      setIsLoading(false);
    }
  }, [className, selectedDate]);

  useEffect(() => {
    fetchDiary();
  }, [fetchDiary]);

  // Function to calculate the time range for a specific period
  const getTimeSlot = (periodId) => {
    if (!gradeNum || !routineInfo.classRoutines[gradeNum]) return null;

    const slots = routineInfo.classRoutines[gradeNum].slots;
    const startTime = routineInfo.operatingHours.start;
    const periodIdxStr = periodId.split('-')[1];
    if (!periodIdxStr) return null;
    const targetIdx = parseInt(periodIdxStr) - 1;

    let currentMinutes = 0;
    const [h, m] = startTime.split(':').map(Number);
    const baseMinutes = h * 60 + m;

    for (let i = 0; i <= targetIdx && i < slots.length; i++) {
      const duration = slots[i].durationMinutes || 45;
      if (i === targetIdx) {
        const start = baseMinutes + currentMinutes;
        const end = start + duration;

        const formatTime = (totalMin) => {
          const hours = Math.floor(totalMin / 60);
          const mins = totalMin % 60;
          return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        };

        return `${formatTime(start)} - ${formatTime(end)}`;
      }
      currentMinutes += duration;
    }
    return null;
  };

  const currentHoliday = useMemo(() => getHolidayOnDate(selectedDate, holidays), [selectedDate, holidays]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 px-4 sm:px-0">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-[28px] flex items-center justify-center shadow-lg shadow-emerald-500/10 transition-transform hover:rotate-12 duration-500">
            <BookOpenCheck className="text-emerald-500 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Class Diary</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
              {className ? `${className} • Classroom progress & homework` : "Classroom progress & homework tracking"}
            </p>
          </div>
        </div>

        {/* Date Selector Box - Premium Design */}
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

          {/* Premium Calendar Popup */}
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

      {/* Grid of Classes, Holiday View, or Loading State */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loading fullScreen={false} text="Syncing diary entries..." />
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
      ) : (
        <>
          {diaryEntries.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {diaryEntries.map((entry) => (
                <SDiaryCard
                  key={entry._id}
                  entry={entry}
                  timeSlot={getTimeSlot(entry.periodId)}
                />
              ))}
            </div>
          ) : (
            <div className="py-40 flex flex-col items-center justify-center text-center space-y-8 bg-slate-50 dark:bg-slate-900/20 rounded-[64px] border-4 border-dashed border-slate-100 dark:border-slate-800/50">
              <div className="w-24 h-24 rounded-[32px] bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-inner">
                <BookOpen size={40} className="text-slate-300" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Diary Entries</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-3">There are no teaching records available for this date.</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SDiaryPage;