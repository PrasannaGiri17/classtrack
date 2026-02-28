import React, { useState } from 'react';
import {
  BookOpenCheck,
  Calendar,
  Clock,
  Save,
  GraduationCap,
  PencilLine,
  Home,
  Loader2
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from '../MainSystemComponents/Toast';


const DiaryCard = ({ entry, onSave }) => {
  const [activity, setActivity] = useState(entry.activity);
  const [homework, setHomework] = useState(entry.homework);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(entry.periodId, activity, homework);
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
            <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">Class {entry.className}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{entry.subject}</p>
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
          <textarea
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder="What was taught today? e.g. Introduction to Sine Rule"
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:text-white resize-none h-24 placeholder:text-slate-300 shadow-inner"
          />
        </div>

        {/* Homework Field */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 ml-1">
            <Home size={14} className="text-emerald-500" />
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Homework Assignment</label>
          </div>
          <textarea
            value={homework}
            onChange={(e) => setHomework(e.target.value)}
            placeholder="Assignments for tomorrow... e.g. Solve Ex 4.2 (Q1-Q10)"
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:text-white resize-none h-24 placeholder:text-slate-300 shadow-inner"
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[20px] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50"
      >
        {isSaving ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            <span>Synchronizing...</span>
          </>
        ) : (
          <>
            <Save size={18} />
            <span>Save Diary Entry</span>
          </>
        )}
      </button>
    </div>
  );
};

const DiaryPage = () => {
  const INITIAL_CLASSES = [
    { periodId: 'p1', className: '10A', subject: 'Mathematics', timeSlot: '09:00 - 09:45', activity: '', homework: '' },
    { periodId: 'p2', className: '9B', subject: 'Calculus', timeSlot: '10:00 - 10:45', activity: '', homework: '' },
    { periodId: 'p3', className: '12C', subject: 'Advanced Algebra', timeSlot: '11:00 - 11:45', activity: '', homework: '' },
    { periodId: 'p4', className: '8A', subject: 'Geometry', timeSlot: '13:00 - 13:45', activity: '', homework: '' },
    { periodId: 'p5', className: '11B', subject: 'Statistics', timeSlot: '14:00 - 14:45', activity: '', homework: '' },
    { periodId: 'p6', className: '10C', subject: 'Trigonometry', timeSlot: '15:00 - 15:45', activity: '', homework: '' },
  ];

  const [diaryEntries, setDiaryEntries] = useState(INITIAL_CLASSES);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleSaveEntry = async (id, activity, homework) => {
    // Simulated API Call
    await new Promise(resolve => setTimeout(resolve, 800));
    setDiaryEntries(prev => prev.map(e => e.periodId === id ? { ...e, activity, homework } : e));
    toast({
      type: 'success',
      message: `Class records updated for ${selectedDate.toLocaleDateString()}.`,
      duration: 3000
    });
  };

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

      {/* Grid of Classes - Updated to 2 columns on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {diaryEntries.map((entry) => (
          <DiaryCard
            key={entry.periodId}
            entry={entry}
            onSave={handleSaveEntry}
          />
        ))}
      </div>
    </div>
  );
};

export default DiaryPage;