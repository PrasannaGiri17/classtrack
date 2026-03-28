import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  CalendarDays,
  Calendar,
  BookOpen,
  Loader2,
  Coffee,
  User2,
  GraduationCap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import studentService from "../Api/studentService";
import timetableService from "../Api/timetableService";
import routineService from "../Api/routineService";
import { toast } from '../MainSystemComponents/Toast';
import { IoFootballOutline } from "react-icons/io5";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const capitalize = (str) => {
  if (!str) return "";
  return str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

/* ─────────────────────────────────────────────
   1. CLASS CARD
───────────────────────────────────────────── */
const ClassCard = ({ slot, assignment }) => {
  const subjectName = capitalize(assignment?.subjectName || '');
  const teacherName = assignment?.teacherName || null;
  const topic = assignment?.topic || "Normal Class";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative group overflow-hidden rounded-[24px] border border-slate-700/50 bg-gradient-to-br from-[#0f1c2e] to-[#0a1628] hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.08)] transition-all duration-300"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="relative flex items-center px-8 py-5 min-h-[80px]">

        {/* Time block — Fixed width left */}
        <div className="flex items-center gap-4 min-w-[180px] shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Clock size={16} className="text-emerald-400" />
          </div>
          <span className="text-sm font-black text-slate-300 tabular-nums uppercase tracking-widest">{slot.timeRange}</span>
        </div>

        {/* Subject & Topic — Centered globally in the card */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
           <div className="flex items-center gap-3">
              <BookOpen size={16} className="text-indigo-400 opacity-50" />
              <h4 className="text-xl font-black text-white tracking-tight uppercase">
                {subjectName || 'Normal Class'}
              </h4>
           </div>
           {topic && topic !== "Normal Class" && (
             <span className="px-3 py-1 bg-slate-800/80 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20">
               {topic}
             </span>
           )}
        </div>

        {/* Teacher Name — Fixed width right */}
        <div className="ml-auto min-w-[200px] flex justify-end items-center">
          {teacherName ? (
            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] hover:text-white transition-colors cursor-default">
              {teacherName}
            </span>
          ) : (
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic">Faculty unassigned</span>
          )}
        </div>

      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   2. BREAK CARD
───────────────────────────────────────────── */
const BreakCard = ({ slot }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative group overflow-hidden rounded-[24px] border border-slate-700/50 bg-gradient-to-br from-[#0f1c2e] to-[#0a1628] hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.08)] transition-all duration-300"
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="relative flex items-center px-6 py-5 min-h-[72px]">

        {/* Time block — left */}
        <div className="flex items-center gap-3 min-w-[160px] shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Clock size={15} className="text-emerald-400" />
          </div>
          <span className="text-sm font-bold text-slate-300 tabular-nums">{slot.timeRange}</span>
        </div>

        {/* Label — absolute center of the full card */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Coffee size={16} className="text-emerald-400" />
          </div>
          <div>
            <h4 className="text-base font-black text-white tracking-wide whitespace-nowrap">
              {capitalize(slot.label) || 'Break'}
            </h4>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   3. SPORTS CARD
───────────────────────────────────────────── */
const SportsCard = ({ slot }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative group overflow-hidden rounded-[24px] border border-slate-700/50 bg-gradient-to-br from-[#0f1c2e] to-[#0a1628] hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.08)] transition-all duration-300"
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="relative flex items-center px-6 py-5 min-h-[72px]">

        {/* Time block — left */}
        <div className="flex items-center gap-3 min-w-[160px] shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Clock size={15} className="text-emerald-400" />
          </div>
          <span className="text-sm font-bold text-slate-300 tabular-nums">{slot.timeRange}</span>
        </div>

        {/* Label — absolute center of the full card */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <IoFootballOutline size={20} className="text-emerald-400" />
          </div>
          <div>
            <h4 className="text-base font-black text-white tracking-wide whitespace-nowrap">
              {capitalize(slot.label) || 'Sports'}
            </h4>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   CARD ROUTER — picks the right card type
───────────────────────────────────────────── */
const RoutineCard = ({ slot, assignment }) => {
  if (slot.type === 'sport') return <SportsCard slot={slot} />;
  if (slot.type === 'break') return <BreakCard slot={slot} />;
  return <ClassCard slot={slot} assignment={assignment} />;
};

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
const SRoutinePage = () => {
  const [selectedDay, setSelectedDay] = useState("");
  const [timetable, setTimetable] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState(null);
  const [operatingHours, setOperatingHours] = useState("09:00");

  const studentId = localStorage.getItem("studentId");

  useEffect(() => {
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    setSelectedDay(dayName === "Saturday" ? "Sunday" : dayName);
  }, []);

  useEffect(() => {
    const getBaseInfo = async () => {
      if (!studentId) return;
      try {
        const profile = await studentService.getStudentById(studentId);
        setStudentInfo(profile);
        
        if (profile.schoolId) {
          const matrix = await routineService.getRoutineMatrix(profile.schoolId);
          setOperatingHours(matrix.operatingHours?.start || "09:00");
        }
      } catch (err) {
        console.error("Error base info:", err);
      }
    };
    getBaseInfo();
  }, [studentId]);

  const fetchTimetable = useCallback(async () => {
    if (!studentInfo || !selectedDay) return;
    setIsLoading(true);
    try {
      const gNum = studentInfo.gradeId?.gradeNumber || studentInfo.studentClass;
      const sName = studentInfo.sectionId?.sectionName || studentInfo.sectionId;

      const data = await timetableService.getTimetable(gNum, sName, selectedDay.toUpperCase(), studentInfo.schoolId);

      let [h, m] = operatingHours.split(':').map(Number);
      let currentMins = h * 60 + m;

      const slotsWithTime = data.slots.map(slot => {
        const start = currentMins;
        const end = currentMins + (slot.durationMinutes || 45);
        currentMins = end;

        const formatTime = (totalMins) => {
          const hrs = Math.floor(totalMins / 60);
          const mins = totalMins % 60;
          return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        };

        return { ...slot, timeRange: `${formatTime(start)} - ${formatTime(end)}` };
      });

      setTimetable({ ...data, slots: slotsWithTime });
    } catch (err) {
      console.error("Failed fetch:", err);
      toast({ type: 'error', message: 'Synchronization failed.' });
    } finally {
      setIsLoading(false);
    }
  }, [studentInfo, selectedDay, operatingHours]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* Header */}
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

      {/* Day Selector */}
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

      {/* Main Content */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-6 lg:p-8">

        {/* Content Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-6 border-b border-slate-50 dark:border-slate-800">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {selectedDay}'s Routine
          </h3>

          {studentInfo && (
            <div className="flex items-center gap-6 mt-4 sm:mt-0">
              {studentInfo.gradeId?.gradeName && (
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 tracking-widest">
                  <GraduationCap size={12} className="text-emerald-500" />
                  <span>{studentInfo.gradeId.gradeName}</span>
                </div>
              )}
              {studentInfo.sectionId?.sectionName && (
                <div className={`flex items-center gap-2 text-[10px] font-black text-slate-400 tracking-widest ${studentInfo.gradeId?.gradeName ? 'pl-6 border-l border-slate-100 dark:border-slate-800' : ''}`}>
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>Section {studentInfo.sectionId.sectionName}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Slots */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-xs font-bold text-slate-400 tracking-tight">Synchronizing Matrix...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {timetable && timetable.slots.length > 0 ? (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {timetable.slots.map((slot) => (
                  <RoutineCard
                    key={slot.id}
                    slot={slot}
                    assignment={timetable.assignments[slot.id]}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-32 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-24 h-24 rounded-[32px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <Calendar size={40} className="text-slate-200 dark:text-slate-700" />
                </div>
                <div className="max-w-xs">
                  <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">No Sessions Found</h4>
                  <p className="text-xs font-bold text-slate-400 tracking-widest mt-2 leading-relaxed">No periods registered for this calendar day.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Footer Legend */}
        <div className="mt-10 pt-6 border-t border-slate-50 dark:border-slate-800 flex flex-wrap items-center justify-center gap-8 opacity-60">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black text-slate-400 tracking-widest">Active Class</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span className="text-[10px] font-black text-slate-400 tracking-widest">Break / Recess</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.5)]" />
            <span className="text-[10px] font-black text-slate-400 tracking-widest">Sports Period</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SRoutinePage;