import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronLeft, Calendar, Settings2 } from 'lucide-react';

import ModuleCard from '../AdminComponents/Exam/ModuleCard';
import SchedulingView from '../AdminComponents/Exam/SchedulingView'
import ControlView from '../AdminComponents/Exam/ControlView';

// --- Constants & Dummy Data ---
const GRADES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const SECTIONS = ["A", "B", "C"];
const EXAM_NAMES = ["First Terminal", "Mid-Term", "Second Terminal", "Final Examination"];
const YEARS = ["2025", "2026"];

const INITIAL_PHASES = [
  { id: 'ph1', name: 'First Terminal', status: 'Closed' },
  { id: 'ph2', name: 'Mid-Term', status: 'Open' },
  { id: 'ph3', name: 'Second Terminal', status: 'Closed' },
  { id: 'ph4', name: 'Final Examination', status: 'Closed' },
];

const STUDENT_RESULTS = [
  { 
    id: 'r1', studentId: '2024001', name: 'Cristiano Ronaldo', phase: 'Mid-Term', grade: '10', section: 'A',
    marks: { 'MATH': 85, 'SCI': 90, 'ENG': 88, 'SOC': 92, 'NEP': 75, 'COM': 94, 'ACC': 80, 'OPM': 89 }, 
    total: 693, percentage: 86.6, gpa: '3.8', status: 'Passed' 
  },
  { 
    id: 'r2', studentId: '2024002', name: 'Luka Modric', phase: 'Mid-Term', grade: '10', section: 'A',
    marks: { 'MATH': 98, 'SCI': 82, 'ENG': 95, 'SOC': 88, 'NEP': 90, 'COM': 92, 'ACC': 84, 'OPM': 95 }, 
    total: 732, percentage: 91.5, gpa: '4.0', status: 'Passed' 
  },
  { 
    id: 'r3', studentId: '2024003', name: 'Vinicius Junior', phase: 'Mid-Term', grade: '10', section: 'A',
    marks: { 'MATH': 78, 'SCI': 82, 'ENG': 70, 'SOC': 80, 'NEP': 72, 'COM': 85, 'ACC': null, 'OPM': 74 }, 
    total: 541, percentage: 77.2, gpa: '3.2', status: 'Incomplete' 
  },
];

const ANALYTICS_GRADE_DATA = [
  { grade: 'G5', average: 72 }, { grade: 'G6', average: 85 }, { grade: 'G7', average: 68 },
  { grade: 'G8', average: 79 }, { grade: 'G9', average: 88 }, { grade: 'G10', average: 82 },
];

const ANALYTICS_SECTION_DATA = [
  { section: 'Sec A', average: 84 }, { section: 'Sec B', average: 79 }, { section: 'Sec C', average: 72 },
];

const ExamManagement = () => {
  const [activeView, setActiveView] = useState('menu');
  const [selectedYear, setSelectedYear] = useState('2025');
  
  const [phases, setPhases] = useState(INITIAL_PHASES);
  const [analyticsGrade, setAnalyticsGrade] = useState('10');
  const [analyticsSection, setAnalyticsSection] = useState('A');
  
  const [resYear, setResYear] = useState('2025');
  const [resPhase, setResPhase] = useState('Mid-Term');
  const [resGrade, setResGrade] = useState('10');
  const [resSection, setResSection] = useState('A');
  const [resultSearch, setResultSearch] = useState('');
  const [activeResultIndex, setActiveResultIndex] = useState(0);

  const filteredResults = useMemo(() => {
    return STUDENT_RESULTS.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(resultSearch.toLowerCase()) || 
                           r.studentId.includes(resultSearch);
      const matchesGrade = r.grade === resGrade;
      const matchesSection = !resSection || r.section === resSection;
      const matchesPhase = r.phase === resPhase;
      return matchesSearch && matchesGrade && matchesSection && matchesPhase;
    });
  }, [resultSearch, resGrade, resSection, resPhase]);

  useEffect(() => {
    setActiveResultIndex(0);
  }, [filteredResults.length]);

  const currentResult = filteredResults[activeResultIndex];

  const handleNext = () => {
    if (activeResultIndex < filteredResults.length - 1) {
      setActiveResultIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeResultIndex > 0) {
      setActiveResultIndex(prev => prev - 1);
    }
  };

  const togglePhase = (id) => {
    setPhases(prev => prev.map(p => {
      if (p.id === id) return { ...p, status: p.status === 'Open' ? 'Closed' : 'Open' };
      if (p.status === 'Open' && p.id !== id) return { ...p, status: 'Closed' };
      return p;
    }));
  };

  return (
    <div className="min-h-full animate-in fade-in duration-500 pb-20">
      {activeView === 'menu' ? (
        <div className="space-y-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">Exam Hub</h1>
              <p className="text-[12px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-3.5">Administrative Assessment Control Module</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <ModuleCard 
              icon={Calendar}
              color="bg-emerald-500"
              title="Exam Schedule"
              description="Create and manage exam schedules by class and section. Define dates, times, and subject mapping for upcoming academic assessments." 
              buttonLabel="MANAGE EXAM SCHEDULE"
              onClick={() => setActiveView('schedule')} 
            />
            <ModuleCard 
              icon={Settings2}
              color="bg-emerald-600"
              title="Examination Control"
              description="Oversee grading systems, manage marking portals for faculty, track academic outcomes, and verify official transcripts across all departments." 
              buttonLabel="MANAGE CONTROL MODULE"
              onClick={() => setActiveView('control-module')} 
            />
          </div>
        </div>
      ) : (
        <div className="max-w-full mx-auto animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <button onClick={() => setActiveView('menu')} className="flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-emerald-600 uppercase tracking-wider transition-colors group">
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to Hub
            </button>
            <div className="relative group">
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="appearance-none bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 font-black text-[11px] uppercase px-6 py-2.5 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30 outline-none pr-10 cursor-pointer shadow-sm hover:border-emerald-500 transition-all">
                {YEARS.map(y => <option key={y} value={y}>{y} Session</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
            </div>
          </div>

          {activeView === 'schedule' ? (
            <SchedulingView />
          ) : (
            <ControlView 
              phases={phases}
              togglePhase={togglePhase}
              analyticsGrade={analyticsGrade}
              setAnalyticsGrade={setAnalyticsGrade}
              analyticsSection={analyticsSection}
              setAnalyticsSection={setAnalyticsSection}
              analyticsGradeData={ANALYTICS_GRADE_DATA}
              analyticsSectionData={ANALYTICS_SECTION_DATA}
              resYear={resYear}
              setResYear={setResYear}
              resPhase={resPhase}
              setResPhase={setResPhase}
              resGrade={resGrade}
              setResGrade={setResGrade}
              resSection={resSection}
              setResSection={setResSection}
              resultSearch={resultSearch}
              setResultSearch={setResultSearch}
              activeResultIndex={activeResultIndex}
              handlePrev={handlePrev}
              handleNext={handleNext}
              filteredResults={filteredResults}
              currentResult={currentResult}
              grades={GRADES}
              sections={SECTIONS}
              years={YEARS}
              initialPhases={INITIAL_PHASES}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ExamManagement;