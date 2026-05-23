import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  ChevronDown,
  Search,
  Save,
  GraduationCap,
  BookOpen,
  Users,
  Lock,
  Loader2
} from 'lucide-react';
import { toast } from '../MainSystemComponents/Toast';
import teacherService from '../Api/teacherService';
import timetableService from '../Api/timetableService';
import studentService from '../Api/studentService';
import gradeService from '../Api/gradeService';
import axios from 'axios';
import { convertADtoBS } from "@adhikarisaroj795/nepali-calendar-react";

// Parse "Grade 3-B" → { grade: "3", section: "B" }
const parseClassLabel = (label) => {
  // label format from backend: "Grade 3-B"
  const match = label.match(/Grade\s+(\d+)-([A-Za-z]+)/i);
  if (match) return { grade: match[1], section: match[2].toUpperCase() };
  // fallback for old format "G9 - A"
  const alt = label.match(/G(\d+)\s*-\s*([A-Za-z]+)/i);
  if (alt) return { grade: alt[1], section: alt[2].toUpperCase() };
  return null;
};

const ExamManagement = () => {
  const [loading, setLoading] = useState(true);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [teacherSubjects, setTeacherSubjects] = useState([]); // from teacher profile
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  // Automatically determine current academic year from system date
  const currentBSYear = useMemo(() => {
    const todayBS = convertADtoBS(new Date().toISOString().split('T')[0]);
    return Number(todayBS.split('-')[0]);
  }, []);

  const selectedYear = currentBSYear;

  const [examTerms, setExamTerms] = useState([]);      // from backend
  const [lockedTerms, setLockedTerms] = useState(new Set()); // terms where isOpen=false
  const [selectedTerm, setSelectedTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [markEntries, setMarkEntries] = useState([]);
  const [sectionMap, setSectionMap] = useState({});
  const [gradeMap, setGradeMap] = useState({});
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [fullSubjects, setFullSubjects] = useState([]); // Array of { id, name }
  const [isSaving, setIsSaving] = useState(false);

  const isTermLocked = lockedTerms.has(selectedTerm);
  const isReadOnly = isTermLocked;

  // 1. On mount — load teacher info + routine + grade sections map + exam config
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const teacherId = localStorage.getItem('teacherId');
        if (!teacherId || teacherId === 'undefined' || teacherId === 'null') {
          toast({ type: 'error', message: 'Teacher session not found. Please log in again.' });
          return;
        }

        // Fetch all grades to build sectionId lookup: "Grade 3-B" → ObjectId
        const gradesData = await gradeService.getGrades();
        const sMap = {};
        const gMap = {};
        if (Array.isArray(gradesData)) {
          gradesData.forEach(g => {
            if (Array.isArray(g.sections)) {
              g.sections.forEach(sec => {
                const key = `Grade ${g.gradeNumber}-${sec.sectionName}`;
                sMap[key] = sec._id;
                gMap[key] = g._id;
              });
            }
          });
        }
        setSectionMap(sMap);
        setGradeMap(gMap);

        // Fetch exam config for selected year to build terms list
        try {
          const examRes = await axios.get(`http://localhost:7000/api/exams?academicYear=${selectedYear}`);
          const examData = examRes.data;
          const { termsCount = 2, includeMidTerm = true } = examData?.config || {};

          // Build interleaved terms matching admin portal naming exactly
          const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'];
          const terms = [];
          for (let i = 0; i < termsCount; i++) {
            const ord = ordinals[i] || `${i + 1}th`;
            if (includeMidTerm) terms.push(`${ord} Mid Term`);
            terms.push(`${ord} Term`);
          }
          setExamTerms(terms);

          // Restore selected term from localStorage if valid
          const lastTerm = localStorage.getItem('lastSelectedTerm');
          if (lastTerm && terms.includes(lastTerm)) {
            setSelectedTerm(lastTerm);
          } else if (terms.length > 0) {
            setSelectedTerm(terms[0]);
          }

          // Build locked set — terms where isOpen = false
          const locked = new Set();
          if (Array.isArray(examData?.termStatuses)) {
            examData.termStatuses.forEach(ts => {
              if (!ts.isOpen) locked.add(ts.term);
            });
          }
          setLockedTerms(locked);
        } catch (examErr) {
          console.error('Failed to fetch exam config:', examErr);
          // fallback
          setExamTerms(['First Mid Term', 'First Term', 'Second Mid Term', 'Second Term']);
          setSelectedTerm('First Mid Term');
        }

        // Fetch teacher profile → get primarySubject & secondarySubject
        const teacher = await teacherService.getTeacherById(teacherId);
        const classes = teacher.assignedClasses || [];
        setTeacherClasses(classes);

        // Restore selected class from localStorage if valid
        const lastClass = localStorage.getItem('lastSelectedClass');
        if (lastClass && classes.includes(lastClass)) {
          setSelectedClass(lastClass);
        } else if (classes.length > 0) {
          setSelectedClass(classes[0]);
        }

        // Build subject list from teacher's assigned subjects
        const subjects = []; // Names for UI
        const fullSubs = []; // Objects for IDs
        const primaryObj = teacher.primarySubject;
        const secondaryObj = teacher.secondarySubject;

        if (primaryObj) {
          const name = typeof primaryObj === 'object' ? (primaryObj.subjectName || primaryObj.title) : primaryObj;
          const id = typeof primaryObj === 'object' ? primaryObj._id : null;
          subjects.push(name);
          fullSubs.push({ id, name });
        }
        if (secondaryObj) {
          const name = typeof secondaryObj === 'object' ? (secondaryObj.subjectName || secondaryObj.title) : secondaryObj;
          const id = typeof secondaryObj === 'object' ? secondaryObj._id : null;
          if (name && !subjects.includes(name)) {
            subjects.push(name);
            fullSubs.push({ id, name });
          }
        }
        setTeacherSubjects(subjects);
        setFullSubjects(fullSubs);

        // Restore selected subject from localStorage if valid
        const lastSubject = localStorage.getItem('lastSelectedSubject');
        if (lastSubject && subjects.includes(lastSubject)) {
          setSelectedSubject(lastSubject);
        } else if (subjects.length > 0) {
          setSelectedSubject(subjects[0]);
        }

      } catch (err) {
        console.error('Failed to load teacher data:', err);
        toast({ type: 'error', message: 'Failed to load teacher data.' });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [selectedYear]);

  // 2. Load students + existing results whenever filters change
  useEffect(() => {
    if (!selectedClass || !selectedTerm || !selectedSubject) return;
    const fetchStudentsAndMarks = async () => {
      try {
        setStudentsLoading(true);
        setMarkEntries([]);

        const sectionId = sectionMap[selectedClass];
        const gradeId = gradeMap[selectedClass];
        const { section } = parseClassLabel(selectedClass) || {};
        const subject = fullSubjects.find(s => s.name === selectedSubject);

        if (!sectionId || !gradeId || !subject) {
          setStudentsLoading(false);
          return;
        }

        // Fetch both students and their existing results for this term
        const [studentsData, resultsData] = await Promise.all([
          studentService.getStudentsBySection(null, sectionId),
          axios.get(`http://localhost:7000/api/results?gradeId=${gradeId}&sectionName=${section}&term=${selectedTerm}&academicYear=${selectedYear}`)
        ]);

        const students = (Array.isArray(studentsData) ? studentsData : []).map(s => {
          // Find if this student already has some marks in this term
          const studentResult = (Array.isArray(resultsData.data) ? resultsData.data : []).find(r =>
            (r.studentId?._id || r.studentId) === s._id
          );

          // Find specific subject marks from results
          const subjectMarks = studentResult?.marks?.find(m =>
            (m.subjectId?._id || m.subjectId) === subject.id
          );

          return {
            id: s._id,
            studentId: s.studentId || s._id,
            name: `${s.firstName || ''} ${s.lastName || ''}`.trim(),
            profilePhoto: s.profilePhoto || null,
            theory: subjectMarks?.theoryMarks || '',
            practical: subjectMarks?.practicalMarks || '',
            remark: subjectMarks?.remark || ''
          };
        });
        setMarkEntries(students);
      } catch (err) {
        console.error('Failed to fetch evaluation data:', err);
        toast({ type: 'error', message: 'Evaluation portal initialization failed.' });
      } finally {
        setStudentsLoading(false);
      }
    };
    fetchStudentsAndMarks();
  }, [selectedClass, selectedTerm, selectedSubject, sectionMap, gradeMap, fullSubjects, selectedYear]);

  // 3. Persist selections to localStorage
  useEffect(() => {
    if (selectedClass) localStorage.setItem('lastSelectedClass', selectedClass);
  }, [selectedClass]);

  useEffect(() => {
    if (selectedTerm) localStorage.setItem('lastSelectedTerm', selectedTerm);
  }, [selectedTerm]);

  useEffect(() => {
    if (selectedSubject) localStorage.setItem('lastSelectedSubject', selectedSubject);
  }, [selectedSubject]);

  const handleClassChange = (val) => {
    setSelectedClass(val);
    setSearchQuery('');
  };

  const filteredEntries = useMemo(() => {
    return markEntries.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(s.studentId).includes(searchQuery)
    );
  }, [markEntries, searchQuery]);

  const updateMark = (id, field, value) => {
    let finalValue = value;
    if (value !== '') {
      if (field === 'theory') {
        const num = Number(value);
        if (num > 75) finalValue = '75';
        else if (num < 0) finalValue = '0';
      } else if (field === 'practical') {
        const num = Number(value);
        if (num > 25) finalValue = '25';
        else if (num < 0) finalValue = '0';
      } else if (field === 'remark') {
        if (value.length > 50) finalValue = value.slice(0, 50);
      }
    }
    setMarkEntries(prev => prev.map(entry =>
      entry.id === id ? { ...entry, [field]: finalValue } : entry
    ));
  };

  const handleSaveMarks = async () => {
    if (isTermLocked) return;

    const gradeId = gradeMap[selectedClass];
    const { section } = parseClassLabel(selectedClass) || {};
    const subject = fullSubjects.find(s => s.name === selectedSubject);

    if (!gradeId || !section || !subject) {
      toast({ type: 'warning', message: 'Missing class or subject configuration' });
      return;
    }

    setIsSaving(true);
    try {
      // Build individual result requests for each student
      const saveRequests = markEntries.map(entry => {
        const payload = {
          studentId: entry.id,
          gradeId: gradeId,
          sectionName: section,
          term: selectedTerm,
          academicYear: selectedYear, // Pass academic year
          marks: [{
            subjectId: subject.id,
            theoryMarks: Number(entry.theory) || 0,
            practicalMarks: Number(entry.practical) || 0,
            remark: entry.remark || ""
          }]
        };
        return axios.post('http://localhost:7000/api/results', payload);
      });

      await Promise.all(saveRequests);

      toast({
        type: 'success',
        message: `Evaluation for G${gradeId.toString().slice(-4)} ${section} - ${selectedSubject} (${selectedYear}) published successfully.`,
        duration: 3000
      });
    } catch (err) {
      console.error('Save error:', err);
      toast({ type: 'error', message: 'Failed to publish marks. Please check your data.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 size={40} className="animate-spin text-emerald-500" />
          <p className="text-[10px] font-black uppercase tracking-widest">Loading Mark Entry Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10 transition-transform hover:rotate-6 duration-500">
            <FileText className="text-emerald-500 w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Mark Entry Portal</h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-2">Evaluation & Assessment Module ({selectedYear} Cycle)</p>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm transition-all">

        {/* Class Selector */}
        <div className="xl:col-span-3 relative group">
          <label className="absolute -top-2.5 left-5 bg-white dark:bg-slate-900 px-2 text-[9px] font-black text-emerald-600 tracking-widest z-10">Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl pl-5 pr-12 py-4 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer transition-all shadow-inner"
          >
            {teacherClasses.length === 0 ? (
              <option value="">No classes assigned</option>
            ) : (
              teacherClasses.map(c => <option key={c} value={c}>{c}</option>)
            )}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
        </div>

        {/* Term Selector */}
        <div className="xl:col-span-3 relative group">
          <label className="absolute -top-2.5 left-5 bg-white dark:bg-slate-900 px-2 text-[9px] font-black text-emerald-600 tracking-widest z-10">Examination Term</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl pl-5 pr-12 py-4 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer transition-all shadow-inner"
          >
            {examTerms.length === 0 ? (
              <option value="">Loading terms...</option>
            ) : (
              examTerms.map(t => (
                <option key={t} value={t}>
                  {t} {lockedTerms.has(t) ? ' 🔒' : ''}
                </option>
              ))
            )}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
        </div>

        {/* Subject — plain text if 1 subject, dropdown if 2 */}
        <div className="xl:col-span-2 relative group">
          <label className="absolute -top-2.5 left-5 bg-white dark:bg-slate-900 px-2 text-[9px] font-black text-emerald-600 tracking-widest z-10">Subject</label>
          {teacherSubjects.length <= 1 ? (
            <div className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl pl-5 pr-5 py-4 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-inner">
              {teacherSubjects[0] || '—'}
            </div>
          ) : (
            <>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl pl-5 pr-12 py-4 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer transition-all shadow-inner"
              >
                {teacherSubjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
            </>
          )}
        </div>

        {/* Search */}
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
                <p className="text-[9px] font-black text-slate-400 tracking-widest mb-0.5">Students</p>
                <p className="text-base font-black text-slate-900 dark:text-white leading-none">
                  {studentsLoading ? '...' : markEntries.length}
                </p>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <BookOpen size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 tracking-widest mb-0.5">Subject</p>
                <p className="text-base font-black text-slate-900 dark:text-white leading-none">{selectedSubject || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {isTermLocked ? (
          <div className="py-40 flex flex-col items-center justify-center text-center px-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-[32px] flex items-center justify-center mb-8 shadow-xl shadow-red-500/10">
              <Lock size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3">Portal Access Denied</h2>
            <p className="text-sm font-bold text-slate-400 tracking-widest max-w-md leading-relaxed">
              The marking portal for <span className="text-red-500">{selectedTerm}</span> has been locked by the administrator. Teacher entries are currently disabled.
            </p>
          </div>
        ) : studentsLoading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4 text-slate-400">
            <Loader2 size={36} className="animate-spin text-emerald-500" />
            <p className="text-[10px] font-black tracking-widest">Loading Students...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full min-w-[1000px] text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                    <th className="pl-10 pr-4 py-8 text-[10px] font-black text-slate-400 tracking-widest w-[160px]">Student Id</th>
                    <th className="px-4 py-8 text-[10px] font-black text-slate-400 tracking-widest">Student Identity</th>
                    <th className="px-4 py-8 text-[10px] font-black text-slate-400 tracking-widest text-center w-[160px]">Theory Marks</th>
                    <th className="px-4 py-8 text-[10px] font-black text-slate-400 tracking-widest text-center w-[160px]">Practical Marks</th>
                    <th className="pr-10 pl-4 py-8 text-[10px] font-black text-slate-400 tracking-widest">Teacher's Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {filteredEntries.map((student) => (
                    <tr key={student.id} className="group hover:bg-emerald-50/10 dark:hover:bg-emerald-900/5 transition-colors">
                      <td className="pl-10 pr-4 py-5">
                        <span className="text-xs font-black text-slate-400 tracking-tight">
                          {/* Show only Stu-XXXX (last segment after timestamps) */}
                          {(() => {
                            const raw = String(student.studentId);
                            const parts = raw.split('-');
                            // Format: Stu-{timestamp}-{4digit} → show Stu-{4digit}
                            return parts.length >= 3
                              ? `${parts[0]}-${parts[parts.length - 1]}`
                              : raw;
                          })()}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center font-black text-xs text-slate-400 group-hover:ring-2 group-hover:ring-emerald-500 transition-all shadow-inner shrink-0">
                            {student.profilePhoto ? (
                              <img
                                src={student.profilePhoto}
                                alt={student.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="group-hover:text-emerald-600 transition-colors">{student.name?.[0] || '?'}</span>
                            )}
                          </div>
                          <span className="text-sm font-black text-slate-700 dark:text-slate-200 tracking-tight">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <input
                          type="number"
                          placeholder="/75"
                          max="75"
                          value={student.theory}
                          onChange={(e) => updateMark(student.id, 'theory', e.target.value)}
                          disabled={isReadOnly}
                          className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/30 rounded-[18px] text-center text-sm font-black dark:text-white outline-none transition-all shadow-inner disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="px-4 py-5">
                        <input
                          type="number"
                          placeholder="/25"
                          max="25"
                          value={student.practical}
                          onChange={(e) => updateMark(student.id, 'practical', e.target.value)}
                          disabled={isReadOnly}
                          className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/30 rounded-[18px] text-center text-sm font-black dark:text-white outline-none transition-all shadow-inner disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="pr-10 pl-4 py-5">
                        <input
                          type="text"
                          placeholder="Brief Performance Note..."
                          value={student.remark}
                          onChange={(e) => updateMark(student.id, 'remark', e.target.value)}
                          disabled={isReadOnly}
                          className="w-full px-6 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/30 rounded-[18px] text-xs font-bold dark:text-white outline-none transition-all shadow-inner placeholder:text-slate-300 disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </td>
                    </tr>
                  ))}
                  {filteredEntries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-32 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-300 opacity-20">
                          <GraduationCap size={64} />
                          <p className="text-[10px] font-black tracking-[0.4em]">No student records found in this section</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!isReadOnly && (
              <div className="p-6 border-t border-slate-50 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/30 flex items-center justify-center">
                <button
                  onClick={handleSaveMarks}
                  disabled={isSaving || markEntries.length === 0}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[11px] tracking-[0.15em] shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 disabled:opacity-50 disabled:grayscale"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={15} />
                  )}
                  {isSaving ? 'Publishing...' : 'Publish Marks'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExamManagement;