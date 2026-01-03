import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  BookOpen, 
  User, 
  Coffee, 
  Trophy, 
  ChevronDown, 
  Save, 
  AlertCircle,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';

// --- Dummy Data ---
const GRADES = ["5", "6", "7", "8", "9", "10"];
const SECTIONS = ["A", "B", "C"];

const SUBJECTS = [
  { id: 's1', name: 'Mathematics', grade: 'all' },
  { id: 's2', name: 'Science', grade: 'all' },
  { id: 's3', name: 'English', grade: 'all' },
  { id: 's4', name: 'Social Studies', grade: 'all' },
  { id: 's5', name: 'Nepali', grade: 'all' },
  { id: 's6', name: 'Computer Science', grade: '9,10' },
];

const TEACHERS = [
  { id: 't1', name: 'John Smith', subjects: ['s1', 's2'] },
  { id: 't2', name: 'Emma Johnson', subjects: ['s3', 's5'] },
  { id: 't3', name: 'Michael Brown', subjects: ['s4'] },
  { id: 't4', name: 'Sarah Davis', subjects: ['s1', 's6'] },
  { id: 't5', name: 'Robert Wilson', subjects: ['s2', 's6'] },
];

// Predefined structure from "Academic Timeline"
const DAILY_STRUCTURE = [
  { id: 'p1', type: 'subject', label: 'Period 1', startTime: '09:00', endTime: '09:45' },
  { id: 'p2', type: 'subject', label: 'Period 2', startTime: '09:45', endTime: '10:30' },
  { id: 'pb1', type: 'break', label: 'Short Break', startTime: '10:30', endTime: '10:45' },
  { id: 'p3', type: 'subject', label: 'Period 3', startTime: '10:45', endTime: '11:30' },
  { id: 'ps1', type: 'sport', label: 'Physical Activity', startTime: '11:30', endTime: '12:15' },
];

const TimetablePage = () => {
  const [selectedGrade, setSelectedGrade] = useState('5');
  const [selectedSection, setSelectedSection] = useState('A');
  const [assignments, setAssignments] = useState({});
  const [isSaved, setIsSaved] = useState(false);

  // Reset save state on change
  useEffect(() => {
    setIsSaved(false);
  }, [selectedGrade, selectedSection, assignments]);

  const handleAssignmentChange = (periodId, field, value) => {
    setAssignments(prev => ({
      ...prev,
      [periodId]: {
        ...(prev[periodId] || { subjectId: '', teacherId: '' }),
        [field]: value
      }
    }));
  };

  const getAvailableTeachers = (subjectId) => {
    if (!subjectId) return [];
    return TEACHERS.filter(t => t.subjects.includes(subjectId));
  };

  const handleSave = () => {
    // Logic to simulate saving to DB
    console.log('Saving Timetable:', {
      grade: selectedGrade,
      section: selectedSection,
      assignments
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header & Selectors */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center shadow-sm">
            <CalendarDays className="text-emerald-500 w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Time Assignment</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">Map Teachers & Subjects to the Matrix</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Grade Selector */}
          <div className="relative group">
            <select 
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="appearance-none bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl pl-5 pr-12 py-4 text-xs font-black text-slate-600 dark:text-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm cursor-pointer"
            >
              {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
          </div>

          {/* Section Selector */}
          <div className="relative group">
            <select 
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="appearance-none bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl pl-5 pr-12 py-4 text-xs font-black text-slate-600 dark:text-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm cursor-pointer"
            >
              {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
          </div>
        </div>
      </div>

      {/* Main Timeline Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-8 lg:p-10 space-y-6">
        <div className="flex items-center justify-between mb-8 border-b border-slate-50 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-[10px] font-black text-emerald-600 uppercase tracking-widest">
               Matrix Loaded: G{selectedGrade}-{selectedSection}
             </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Subject
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Break
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Sport
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {DAILY_STRUCTURE.map((period, index) => {
            const isSubject = period.type === 'subject';
            const assignment = assignments[period.id] || { subjectId: '', teacherId: '' };
            const availableTeachers = getAvailableTeachers(assignment.subjectId);

            return (
              <div 
                key={period.id} 
                className={`
                  flex flex-col lg:flex-row items-center gap-6 p-6 rounded-3xl border transition-all duration-300
                  ${isSubject 
                    ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 shadow-sm' 
                    : 'bg-slate-50/50 dark:bg-slate-800/20 border-transparent opacity-80'}
                `}
              >
                {/* Time Indicator - Updated for Single Line Layout */}
                <div className="w-full lg:w-[180px] shrink-0 flex items-center">
                  <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-semibold text-sm whitespace-nowrap">
                    <Clock size={16} className="text-slate-400 shrink-0" />
                    <span>{period.startTime} – {period.endTime}</span>
                  </div>
                </div>

                {/* Period Info */}
                <div className="w-full lg:w-[200px] flex items-center gap-4">
                  <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm
                    ${period.type === 'break' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20' : 
                      period.type === 'sport' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20' : 
                      'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20'}
                  `}>
                    {period.type === 'break' ? <Coffee size={20} /> : 
                     period.type === 'sport' ? <Trophy size={20} /> : 
                     <BookOpen size={20} />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{period.label}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {period.type === 'subject' ? 'Academic Slot' : period.type === 'break' ? 'Recess' : 'Field Activity'}
                    </p>
                  </div>
                </div>

                {/* Assignment Controls (Only for Subjects) */}
                {isSubject ? (
                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Subject Select */}
                    <div className="relative group">
                      <select 
                        value={assignment.subjectId}
                        onChange={(e) => handleAssignmentChange(period.id, 'subjectId', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer appearance-none"
                      >
                        <option value="">Select Subject</option>
                        {SUBJECTS.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                    </div>

                    {/* Teacher Select */}
                    <div className="relative group">
                      <select 
                        disabled={!assignment.subjectId}
                        value={assignment.teacherId}
                        onChange={(e) => handleAssignmentChange(period.id, 'teacherId', e.target.value)}
                        className={`
                          w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer appearance-none
                          ${!assignment.subjectId ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        <option value="">Assign Teacher</option>
                        {availableTeachers.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 w-full flex items-center justify-center lg:justify-start">
                    <div className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-700">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Read Only Block</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-4 p-5 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[28px] border border-emerald-100/50 dark:border-emerald-800/30">
            <AlertCircle className="text-emerald-500 shrink-0" size={20} />
            <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 leading-relaxed uppercase tracking-wider">
              Verification Notice: Teacher availability is automatically checked against overlapping schedules in the current grade matrix.
            </p>
          </div>

          <button 
            onClick={handleSave}
            disabled={Object.keys(assignments).length === 0}
            className={`
              flex items-center gap-3 px-14 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-105 active:scale-95
              ${isSaved 
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-slate-900/20' 
                : 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed'}
            `}
          >
            {isSaved ? <CheckCircle2 size={20} /> : <Save size={20} />}
            {isSaved ? 'Timetable Saved' : 'Publish Matrix'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimetablePage;