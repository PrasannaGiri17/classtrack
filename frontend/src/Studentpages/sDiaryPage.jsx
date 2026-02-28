import React, { useState } from 'react';
import {
  BookOpenCheck,
  Calendar,
  Clock,
  User,
  PencilLine,
  Home,
  BookOpen
} from 'lucide-react';
import DatePicker from 'react-datepicker';

// --- Dummy Data ---
export const dummyDiaryEntries = [
  {
    periodId: 'p1',
    teacherName: 'Prof. Carlo Ancelotti',
    subject: 'Mathematics',
    timeSlot: '09:00 - 09:45',
    activity: 'Topic: Introduction to Sine Rule. Covered when to use it (SAS/SSA), derived the formula, and solved 2 examples step-by-step.',
    homework: 'Solve Exercise 4.2 (Q1–Q10). Show full working and revise today’s examples.'
  },
  {
    periodId: 'p2',
    teacherName: 'Zinedine Zidane',
    subject: 'Calculus',
    timeSlot: '10:00 - 10:45',
    activity: 'Limits and Continuity: Explored one-sided limits and the epsilon-delta definition. Practiced graph analysis for discontinuities.',
    homework: 'Complete Worksheet #5. Review Chapter 3 summary for a pop-quiz on Wednesday.'
  },
  {
    periodId: 'p3',
    teacherName: 'Raul Gonzalez',
    subject: 'Advanced Algebra',
    timeSlot: '11:00 - 11:45',
    activity: 'Quadratic Functions: Vertex form vs Standard form. Discussed transformations and real-world projectile motion applications.',
    homework: 'Graphing Assignment: Page 142, Problems 15-30 (Even numbers only).'
  },
  {
    periodId: 'p4',
    teacherName: 'Xabi Alonso',
    subject: 'Geometry',
    timeSlot: '13:00 - 13:45',
    activity: 'Triangle Congruence: Proving triangles congruent using SSS and SAS postulates. Worked on two-column proof structure.',
    homework: 'Workbook Section 5.1. Construct three congruent triangles using a compass and straightedge.'
  },
];

const SDiaryCard = ({ entry }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-8 space-y-6 group hover:border-emerald-500/20 transition-all duration-300">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-500 shadow-inner">
            <User size={24} />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">{entry.teacherName}</h4>
            <div className="flex items-center">
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/10">
                {entry.subject}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100/50 dark:border-slate-800">
          <Clock size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{entry.timeSlot}</span>
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
  const isToday = selectedDate.toDateString() === new Date().toDateString();

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
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Classroom progress & homework tracking</p>
          </div>
        </div>

        {/* Date Selector Box */}
        <div className="relative group cursor-pointer shrink-0">
          <div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px] shadow-sm hover:border-emerald-500/30 transition-all">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
              <Calendar size={20} />
            </div>
            <div className="flex flex-col justify-center -space-y-0.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-0.5">
                {isToday ? "Today's Session" : "Selected Session"}
              </p>
              <div className="flex items-center">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => date && setSelectedDate(date)}
                  dateFormat="MMMM d, yyyy"
                  className="bg-transparent border-none p-0 text-base font-black text-slate-900 dark:text-white leading-none tracking-tight outline-none cursor-pointer w-auto min-w-[140px]"
                  popperPlacement="bottom-end"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {dummyDiaryEntries.map((entry) => (
          <SDiaryCard
            key={entry.periodId}
            entry={entry}
          />
        ))}
      </div>

      {/* Empty State Illustration if no data */}
      {dummyDiaryEntries.length === 0 && (
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
    </div>
  );
};

export default SDiaryPage;