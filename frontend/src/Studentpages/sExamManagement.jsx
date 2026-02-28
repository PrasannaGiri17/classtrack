import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  ChevronDown,
  GraduationCap,
  Hash,
  Calendar,
  BookOpen,
  Award,
  Check,
  Lock,
  AlertCircle,
  TrendingUp,
  Target,
  Download
} from 'lucide-react';
import { toast } from '../MainSystemComponents/Toast';

// --- Mock Data ---
const SUBJECTS_LIST = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'English Literature',
  'Computer Science',
  'Social Studies',
  'Physical Education',
  'Accountancy'
];

const MOCK_MARKS = {
  'First Mid Term': SUBJECTS_LIST.map(s => ({ subject: s, theory: 55, practical: 20, grade: 'B+' })),
  'First Term': SUBJECTS_LIST.map(s => ({ subject: s, theory: 68, practical: 22, grade: 'A' })),
  'Second Mid Term': [],
  'Second Term': [],
  'Third Mid Term': [],
  'Third Term': [],
  'Fourth Term': [],
};

const AVAILABLE_TERMS = ['First Mid Term', 'First Term'];

const SExamManagement = () => {
  const [selectedTerm, setSelectedTerm] = useState('First Term');
  const [isLoading, setIsLoading] = useState(false);

  // Simulate loading when term changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [selectedTerm]);

  const handleGenerateReport = () => {
    toast({
      type: 'info',
      message: `Compiling detailed ${selectedTerm} report for Cristiano Ronaldo...`
    });

    // Fake processing delay
    setTimeout(() => {
      toast({
        type: 'success',
        message: 'Examination Report successfully exported to PDF.'
      });
    }, 2000);
  };

  const currentMarks = MOCK_MARKS[selectedTerm];
  const isAvailable = AVAILABLE_TERMS.includes(selectedTerm);

  // Performance calculation mocks
  const overallGpa = selectedTerm === 'First Term' ? "3.85" : "3.42";
  const overallGrade = selectedTerm === 'First Term' ? "A" : "B+";

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">

      {/* Page Header */}
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-xl shadow-emerald-500/5 transition-transform hover:scale-105">
          <FileText className="text-emerald-500 w-7 h-7" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">Exam Details</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mt-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Performance Assessment Hub
          </p>
        </div>
      </div>

      {/* 1. Student Info Card */}
      <div className="bg-white dark:bg-slate-900/40 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 transition-all hover:bg-white dark:hover:bg-slate-900">
        <div className="flex items-center gap-8">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-[28px] bg-gradient-to-tr from-emerald-600 to-teal-400 p-1 shadow-2xl shadow-emerald-500/20">
              <div className="w-full h-full rounded-[24px] overflow-hidden border-4 border-white dark:border-slate-900">
                <img
                  src="https://picsum.photos/seed/cristiano/200/200"
                  alt="Student"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white w-7 h-7 rounded-xl flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg">
              <CheckIcon className="w-3.5 h-3.5" strokeWidth={4} />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Cristiano Ronaldo</h2>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <GraduationCap size={14} className="text-emerald-500" />
                GRADE 10 - SECTION A
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Hash size={14} className="text-emerald-500" />
                ROLL NO: 07
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Calendar size={14} className="text-emerald-500" />
                AY: 2024-25
              </div>
            </div>
          </div>
        </div>

        {/* Status Pill */}
        <div className="hidden lg:flex items-center gap-3 px-6 py-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-500/10">
          <Award size={18} className="text-emerald-500" />
          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Academic Excellence</span>
        </div>
      </div>

      {/* 2. Term Selector & Generate Button Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-3 w-full max-w-xl relative group">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Select Examination Term</label>
          <div className="relative">
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="appearance-none w-full bg-white dark:bg-[#0b1220] border border-slate-200 dark:border-slate-800 focus:border-emerald-500/30 rounded-[20px] pl-6 pr-14 py-4 text-[11px] font-black text-slate-800 dark:text-slate-100 outline-none transition-all cursor-pointer shadow-sm group-hover:shadow-lg uppercase tracking-widest"
            >
              <option value="First Mid Term">First Mid Term</option>
              <option value="First Term">First Term</option>
              <option value="Second Mid Term">Second Mid Term</option>
              <option value="Second Term">Second Term</option>
              <option value="Third Mid Term">Third Mid Term</option>
              <option value="Third Term">Third Term</option>
              <option value="Fourth Term">Fourth Term</option>
            </select>
            <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
          </div>
        </div>

        <button
          onClick={handleGenerateReport}
          className="flex items-center gap-3 px-10 py-4 bg-emerald-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95 group shrink-0"
        >
          <Download size={18} />
          Generate Report
        </button>
      </div>

      {/* 3. Performance Matrix */}
      <div className={`bg-white dark:bg-slate-900/40 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all ${isLoading ? 'opacity-50 blur-sm pointer-events-none' : 'opacity-100 blur-0'}`}>
        {isAvailable ? (
          <>
            <div className="w-full overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="pl-12 pr-6 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] w-[40%]">Subject Name</th>
                    <th className="px-6 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Theory</th>
                    <th className="px-6 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Practical</th>
                    <th className="pr-12 pl-6 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Final Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {currentMarks.map((row, idx) => (
                    <tr
                      key={row.subject}
                      className={`group transition-all hover:bg-slate-50/80 dark:hover:bg-emerald-900/5 ${idx % 2 === 1 ? 'bg-slate-50/30 dark:bg-slate-800/10' : ''}`}
                    >
                      <td className="pl-12 pr-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-colors group-hover:bg-emerald-500 group-hover:text-white shrink-0">
                            <BookOpen size={16} />
                          </div>
                          <span className="text-base font-black text-slate-700 dark:text-slate-200 tracking-tight uppercase">{row.subject}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <span className="text-base font-black text-slate-900 dark:text-white tabular-nums">{row.theory}</span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <span className="text-base font-black text-slate-900 dark:text-white tabular-nums">{row.practical}</span>
                      </td>
                      <td className="pr-12 pl-6 py-6 text-right">
                        <span className={`inline-block px-5 py-2 rounded-xl text-xs font-black tracking-widest ${row.grade === 'A+' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                          row.grade === 'A' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            row.grade === 'B+' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              row.grade === 'PENDING' ? 'bg-slate-100 text-slate-400' :
                                'bg-slate-100 text-slate-700'
                          }`}>
                          {row.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Overall Summary Row */}
            <div className="px-12 py-12 bg-slate-50/50 dark:bg-emerald-500/[0.02] border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="flex flex-wrap items-center gap-12">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] leading-none">Term Final Grade</p>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl font-black text-emerald-500 tracking-tighter tabular-nums leading-none">{overallGrade}</div>
                    <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest h-fit">
                      Excellence
                    </div>
                  </div>
                </div>

                <div className="hidden md:block w-px h-14 bg-slate-200 dark:bg-slate-800/80" />

                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] leading-none">Cumulative GPA</p>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">{overallGpa}</div>
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 border border-indigo-500/10">
                      <TrendingUp size={20} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Class Ranking</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Top 5% Performers</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-emerald-500 border border-slate-800 shadow-xl shadow-slate-900/20">
                  <Target size={28} />
                </div>
              </div>
            </div>

            {/* Footer Ledger */}
            <div className="p-8 border-t border-slate-50 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/50 flex flex-wrap items-center justify-center gap-10">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Excellence</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proficient</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Developing</span>
              </div>
            </div>
          </>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-500 px-10">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800/50 rounded-[32px] flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 shadow-inner">
              <Lock size={40} className="text-slate-300 dark:text-slate-600" />
            </div>
            <div className="max-w-md">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Results Not Available</h3>
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-3 leading-relaxed">
                Academic records for <span className="text-emerald-500">{selectedTerm}</span> have not been finalized or published by the examination board yet.
              </p>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-500/10">
              <AlertCircle size={16} className="text-amber-500" />
              <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest italic">Pending Publication</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Internal Check Icon since lucide Check is used
const CheckIcon = ({ className, size, strokeWidth }) => (
  <svg
    className={className}
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth || 2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default SExamManagement;