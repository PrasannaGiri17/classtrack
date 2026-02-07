import React, { useState, useMemo } from 'react';
import {
  FileText,
  ChevronDown,
  Search,
  Save,
  GraduationCap,
  BookOpen,
  Users,
  Lock
} from 'lucide-react';
import { toast } from '../MainSystemComponents/Toast';

const LOCKED_TERMS = ["Second Terminal", "Final Examination"];
const TEACHER_CLASSES = ["G9 - A", "G6 - A", "G6 - B", "G10 - C"];
const SUBJECTS = ["Mathematics", "Science", "Computer", "English", "Nepali"];
const EXAM_TERMS = ["First Terminal", "Mid-Term", "Second Terminal", "Final Examination"];

const generateStudents = (prefix, count) => {
  const names = [
    'Cristiano Ronaldo', 'Luka Modric', 'Vinicius Junior', 'Jude Bellingham', 'Federico Valverde',
    'Kylian Mbappe', 'Thibaut Courtois', 'Dani Carvajal', 'Antonio Rudiger', 'Eduardo Camavinga',
    'Rodrygo Goes', 'David Alaba', 'Eder Militao', 'Arda Guler', 'Brahim Diaz',
    'Ferland Mendy', 'Lucas Vazquez', 'Aurelien Tchouameni', 'Fran Garcia', 'Andriy Lunin',
    'Endrick Felipe', 'Nico Paz', 'Reinier Jesus', 'Alvaro Rodriguez', 'Mario Martin',
    'Rafael Obrador', 'Jacob Ramón', 'Fran Gonzalez', 'Jeremy de León', 'Gonzalo García'
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `s-${prefix}-${i}`,
    studentId: (2024001 + i).toString(),
    name: names[i % names.length],
    theory: '',
    practical: '',
    remark: ''
  }));
};

const MOCK_STUDENTS = {
  "G9 - A": generateStudents("G9A", 30),
  "G6 - A": generateStudents("G6A", 15),
  "G6 - B": generateStudents("G6B", 20),
  "G10 - C": generateStudents("G10C", 25),
};

const ExamManagement = () => {
  const [selectedClass, setSelectedClass] = useState(TEACHER_CLASSES[0]);
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [selectedTerm, setSelectedTerm] = useState(EXAM_TERMS[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const [markEntries, setMarkEntries] = useState(MOCK_STUDENTS[TEACHER_CLASSES[0]] || []);
  const [isSaving, setIsSaving] = useState(false);

  const isTermLocked = LOCKED_TERMS.includes(selectedTerm);

  const handleClassChange = (val) => {
    setSelectedClass(val);
    setMarkEntries(MOCK_STUDENTS[val] || []);
  };

  const filteredEntries = useMemo(() => {
    return markEntries.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.includes(searchQuery)
    );
  }, [markEntries, searchQuery]);

  const updateMark = (id, field, value) => {
    setMarkEntries(prev => prev.map(entry =>
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const handleSaveMarks = async () => {
    if (isTermLocked) return;
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsSaving(false);
    toast({
      type: 'success',
      message: `Marks for ${selectedClass} - ${selectedSubject} synced successfully.`,
      duration: 3000
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10 transition-transform hover:rotate-6 duration-500">
            <FileText className="text-emerald-500 w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Mark Entry Portal</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Evaluation & Assessment Module</p>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm transition-all">
        <div className="xl:col-span-3 relative group">
          <label className="absolute -top-2.5 left-5 bg-white dark:bg-slate-900 px-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest z-10">Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl pl-5 pr-12 py-4 text-xs font-black text-slate-700 dark:text-slate-200 outline-none cursor-pointer transition-all shadow-inner"
          >
            {TEACHER_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
        </div>

        <div className="xl:col-span-3 relative group">
          <label className="absolute -top-2.5 left-5 bg-white dark:bg-slate-900 px-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest z-10">Examination Term</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl pl-5 pr-12 py-4 text-xs font-black text-slate-700 dark:text-slate-200 outline-none cursor-pointer transition-all shadow-inner"
          >
            {EXAM_TERMS.map(t => (
              <option key={t} value={t}>
                {t.toUpperCase()} {LOCKED_TERMS.includes(t) ? ' (LOCKED)' : ''}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
        </div>

        <div className="xl:col-span-2 relative group">
          <label className="absolute -top-2.5 left-5 bg-white dark:bg-slate-900 px-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest z-10">Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl pl-5 pr-12 py-4 text-xs font-black text-slate-700 dark:text-slate-200 outline-none cursor-pointer transition-all shadow-inner"
          >
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
        </div>

        <div className="xl:col-span-4 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search Students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl text-xs font-bold outline-none transition-all dark:text-slate-200 shadow-inner"
          />
        </div>
      </div>

      {/* Marks Table or Locked UI */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all flex flex-col">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/20 dark:bg-slate-900/40">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <Users size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Students</p>
                <p className="text-base font-black text-slate-900 dark:text-white leading-none">{markEntries.length}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <BookOpen size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Subject</p>
                <p className="text-base font-black text-slate-900 dark:text-white leading-none">{selectedSubject}</p>
              </div>
            </div>
          </div>
        </div>

        {isTermLocked ? (
          <div className="py-40 flex flex-col items-center justify-center text-center px-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-[32px] flex items-center justify-center mb-8 shadow-xl shadow-red-500/10">
              <Lock size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3">Portal Access Denied</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-md leading-relaxed">
              The marking portal for <span className="text-red-500">{selectedTerm}</span> has been locked by the administrator. Teacher entries are currently disabled.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full min-w-[1000px] text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                    <th className="pl-10 pr-4 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[160px]">Student ID</th>
                    <th className="px-4 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Identity</th>
                    <th className="px-4 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-[160px]">Theory Marks</th>
                    <th className="px-4 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-[160px]">Practical Marks</th>
                    <th className="pr-10 pl-4 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Teacher's Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {filteredEntries.map((student) => (
                    <tr key={student.id} className="group hover:bg-emerald-50/10 dark:hover:bg-emerald-900/5 transition-colors">
                      <td className="pl-10 pr-4 py-5">
                        <span className="text-xs font-black text-slate-400 tracking-tight">{student.studentId}</span>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner shrink-0">
                            {student.name[0]}
                          </div>
                          <span className="text-sm font-black text-slate-700 dark:text-slate-200 tracking-tight uppercase">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <input
                          type="number"
                          placeholder="Theory"
                          value={student.theory}
                          onChange={(e) => updateMark(student.id, 'theory', e.target.value)}
                          className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/30 rounded-[18px] text-center text-sm font-black dark:text-white outline-none transition-all shadow-inner"
                        />
                      </td>
                      <td className="px-4 py-5">
                        <input
                          type="number"
                          placeholder="Practical"
                          value={student.practical}
                          onChange={(e) => updateMark(student.id, 'practical', e.target.value)}
                          className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/30 rounded-[18px] text-center text-sm font-black dark:text-white outline-none transition-all shadow-inner"
                        />
                      </td>
                      <td className="pr-10 pl-4 py-5">
                        <input
                          type="text"
                          placeholder="Brief Performance Note..."
                          value={student.remark}
                          onChange={(e) => updateMark(student.id, 'remark', e.target.value)}
                          className="w-full px-6 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/30 rounded-[18px] text-xs font-bold dark:text-white outline-none transition-all shadow-inner placeholder:text-slate-300"
                        />
                      </td>
                    </tr>
                  ))}
                  {filteredEntries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-32 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-300 opacity-20">
                          <GraduationCap size={64} />
                          <p className="text-[10px] font-black uppercase tracking-[0.4em]">No student records found in this section</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Action Footer (Synchronize Button at bottom) */}
            <div className="p-10 border-t border-slate-50 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/30 flex items-center justify-center">
              <button
                onClick={handleSaveMarks}
                disabled={isSaving}
                className="px-16 py-6 bg-emerald-600 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50 disabled:grayscale"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={22} />
                )}
                {isSaving ? 'Synchronizing...' : 'Synchronize Marks'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExamManagement;