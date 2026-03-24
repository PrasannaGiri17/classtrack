import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  BookOpen,
  Coffee,
  Trophy,
  ChevronDown,
  Save,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  Loader2,
  Trash2
} from 'lucide-react';
import timetableService from '../Api/timetableService';
import gradeService from '../Api/gradeService';
import { toast } from '../MainSystemComponents/Toast';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../MainSystemComponents/ConfirmDialog';

const TimetablePage = () => {
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [availableSections, setAvailableSections] = useState([]);

  const [routineSlots, setRoutineSlots] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [busyTeachers, setBusyTeachers] = useState({});

  const [teachers, setTeachers] = useState([]);
  const [selectedWeekday, setSelectedWeekday] = useState('SUNDAY');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Get schoolId from context or localStorage (for admin flexibility)
  const { schoolId: authSchoolId } = useAuth();
  const schoolId = localStorage.getItem("adminSchoolId") || localStorage.getItem("schoolId") || authSchoolId;

  const weekdays = [
    { label: 'Sunday', value: 'SUNDAY' },
    { label: 'Monday', value: 'MONDAY' },
    { label: 'Tuesday', value: 'TUESDAY' },
    { label: 'Wednesday', value: 'WEDNESDAY' },
    { label: 'Thursday', value: 'THURSDAY' },
    { label: 'Friday', value: 'FRIDAY' }
  ];

  // Fetch initial data (Grades)
  useEffect(() => {
    const fetchGrades = async () => {
      if (!schoolId) return;
      try {
        const data = await gradeService.getGrades(schoolId);
        setGrades(data);
        if (data.length > 0 && !selectedGrade) {
          setSelectedGrade(data[0].gradeNumber.toString());
        }
      } catch (error) {
        console.error("Error fetching grades:", error);
        toast({ type: 'error', message: "Failed to load grades." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchGrades();
  }, [schoolId]);

  // Update available sections when grade changes
  useEffect(() => {
    if (!selectedGrade) return;

    const grade = grades.find(g => g.gradeNumber.toString() === selectedGrade);
    if (grade) {
      setAvailableSections(grade.sections || []);
      // If the current section is not in the new grade, select the first one
      const sectionExists = grade.sections?.some(s => s.sectionName === selectedSection);
      if (grade.sections?.length > 0 && (!selectedSection || !sectionExists)) {
        setSelectedSection(grade.sections[0].sectionName);
      }
    }
  }, [selectedGrade, grades]);

  // Update options (subjects, teachers, busy list) when selection changes
  useEffect(() => {
    if (!selectedGrade || !selectedSection || !selectedWeekday || !schoolId) return;

    const fetchOptions = async () => {
      try {
        const options = await timetableService.getTimetableOptions(selectedGrade, selectedSection, selectedWeekday, schoolId);
        setSubjects(options.subjects || []);
        setTeachers(options.teachers || []);
        setBusyTeachers(options.busyTeachers || {});
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };
    fetchOptions();
  }, [selectedGrade, selectedSection, selectedWeekday, schoolId]);

  // Fetch timetable when selection changes
  useEffect(() => {
    if (!selectedGrade || !selectedSection || !selectedWeekday || !schoolId) return;

    const fetchTimetable = async () => {
      setIsLoading(true);
      try {
        const data = await timetableService.getTimetable(selectedGrade, selectedSection, selectedWeekday, schoolId);
        setRoutineSlots(data.slots || []);
        setAssignments(data.assignments || {});
      } catch (error) {
        console.error("Error fetching timetable:", error);
        setRoutineSlots([]);
        setAssignments({});
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimetable();
  }, [selectedGrade, selectedSection, selectedWeekday, schoolId]);

  const handleAssignmentChange = (periodId, field, value) => {
    // Conflict Check for Teacher
    if (field === 'teacherId' && value) {
      const busyList = busyTeachers[periodId] || [];
      const conflict = busyList.find(b =>
        b.teacherId === value &&
        !(b.gradeNumber.toString() === selectedGrade && b.sectionName === selectedSection)
      );

      if (conflict) {
        toast({
          type: 'error',
          message: `Teacher ${conflict.teacherName} is already assigned to Grade ${conflict.gradeNumber} Section ${conflict.sectionName} at this time.`
        });
        return;
      }
    }

    setAssignments(prev => ({
      ...prev,
      [periodId]: {
        ...(prev[periodId] || { subjectId: '', teacherId: '' }),
        [field]: value,
        ...(field === 'subjectId' ? { teacherId: '' } : {})
      }
    }));
  };

  const getAvailableTeachers = (subjectId, slotLabel) => {
    if (!subjectId) return [];

    const label = (slotLabel || '').toLowerCase();
    if (label.includes('physical') || label.includes('sport')) {
      return [];
    }

    return teachers.filter(t => {
      // 1. Must teach the selected subject (primary or secondary)
      const primaryId = t.primarySubject?._id || t.primarySubject;
      const secondaryId = t.secondarySubject?._id || t.secondarySubject;
      const teachesSubject = primaryId === subjectId || secondaryId === subjectId;
      if (!teachesSubject) return false;

      // 2. Must be assigned to the currently selected grade.
      //    Primary check: assignedGrades is populated with { gradeNumber } objects.
      const gradeNum = Number(selectedGrade);
      if (Array.isArray(t.assignedGrades) && t.assignedGrades.length > 0) {
        return t.assignedGrades.some(g => Number(g.gradeNumber) === gradeNum);
      }

      // Fallback: assignedClasses strings like "Grade 1 - Section A"
      //  (populated via timetable sync for some teachers)
      const gradeKey = `Grade ${selectedGrade}`;
      return (
        Array.isArray(t.assignedClasses) &&
        t.assignedClasses.some(cls => cls.startsWith(gradeKey))
      );
    });
  };

  const handleSave = async () => {
    if (!schoolId) {
      toast({ type: 'error', message: "School ID not found." });
      return;
    }
    setIsSaving(true);
    try {
      await timetableService.updateTimetable(selectedGrade, selectedSection, selectedWeekday, assignments, schoolId);
      setIsSaved(true);
      toast({ type: 'success', message: `Timetable updated successfully!` });
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error("Error saving timetable:", error);
      const errorMessage = error.response?.data?.message || "Failed to save timetable.";
      toast({ type: 'error', message: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearAll = async () => {
    try {
      if (!schoolId) {
        toast({ type: 'error', message: "School ID not found." });
        return;
      }

      await timetableService.clearAllTeachers(schoolId);

      // Update local state: reset teacherId for the currently viewed timetable
      setAssignments(prev => {
        const next = {};
        Object.entries(prev).forEach(([periodId, val]) => {
          next[periodId] = { ...(val || {}), teacherId: '' };
        });
        return next;
      });

      setShowClearConfirm(false);
      toast({ type: 'success', message: 'All teacher assignments across all grades have been reset.' });
    } catch (error) {
      console.error("Error clearing teachers:", error);
      toast({ type: 'error', message: "Failed to reset school teachers." });
    }
  };

  const formatTime = (totalMinutes) => {
    let hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  let currentMinutes = 9 * 60;

  if (isLoading && grades.length === 0) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        {/* Header & Selectors */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center shadow-sm">
              <CalendarDays className="text-emerald-500 w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Assign Time Table</h1>
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mt-2">School ID: {schoolId}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 shadow-xl shadow-red-500/30 transition-all hover:scale-105 active:scale-95 h-full"
            >
              <Trash2 size={16} />
              Reset All
            </button>

            <div className="relative group">
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="appearance-none bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl pl-5 pr-12 py-4 text-xs font-black text-slate-600 dark:text-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm cursor-pointer"
              >
                <option value="" disabled>Select Grade</option>
                {grades.map(g => <option key={g.gradeNumber} value={g.gradeNumber}>Grade {g.gradeNumber}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
            </div>

            <div className="relative group">
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="appearance-none bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl pl-5 pr-12 py-4 text-xs font-black text-slate-600 dark:text-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm cursor-pointer"
              >
                <option value="" disabled>Select Section</option>
                {availableSections.map(s => <option key={s.sectionName} value={s.sectionName}>Section {s.sectionName}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-[32px] shadow-sm overflow-hidden">
          <div className="flex items-center gap-1">
            {weekdays.map((day) => {
              const isActive = selectedWeekday === day.value;
              return (
                <button
                  key={day.value}
                  onClick={() => setSelectedWeekday(day.value)}
                  className={`
                  relative flex-1 py-4 text-[11px] font-black tracking-tight transition-all duration-500 rounded-2xl
                  ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}
                `}
                >
                  <span className="relative z-10">{day.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-emerald-500 rounded-2xl shadow-xl shadow-emerald-500/20"
                      style={{ zIndex: 0 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-8 lg:p-10 space-y-6">
          <div className="flex items-center justify-end mb-5 border-b border-slate-50 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 tracking-tight text-right">
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
            {isLoading ? (
              <div className="py-20 flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <p className="text-xs font-bold text-slate-400 tracking-tight">Syncing with Server...</p>
              </div>
            ) : routineSlots.length === 0 ? (
              <div className="py-20 flex flex-col items-center text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-700">
                <AlertCircle className="text-slate-300 mb-4" size={48} />
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">No Routine Framework Found</h3>
                <p className="text-xs font-medium text-slate-500 mt-2">Please define the routine structure in the Routine View first for School {schoolId}.</p>
              </div>
            ) : (
              routineSlots.map((period, index) => {
                const isSubject = period.type === 'subject';
                const assignment = assignments[period.id] || { subjectId: '', teacherId: '' };

                const selectedSubject = subjects.find(s => s._id === assignment.subjectId);
                const subjectName = selectedSubject?.subjectName || '';
                const isPhysical = period.type === 'sport' ||
                  (period.label || '').toLowerCase().includes('physical') ||
                  (period.label || '').toLowerCase().includes('sport') ||
                  subjectName.toLowerCase().includes('physical') ||
                  subjectName.toLowerCase().includes('sport');

                const availableTeachers = getAvailableTeachers(assignment.subjectId, period.label);

                const startTime = formatTime(currentMinutes);
                const endTime = formatTime(currentMinutes + period.durationMinutes);
                currentMinutes += period.durationMinutes;

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
                    <div className="w-full lg:w-[180px] shrink-0 flex items-center">
                      <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-black text-[10px] tracking-tight whitespace-nowrap">
                        <Clock size={16} className="text-emerald-500 shrink-0" />
                        <span>{startTime} - {endTime}</span>
                      </div>
                    </div>

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
                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">{period.label}</h4>
                        <p className="text-[9px] font-bold text-slate-400 tracking-tight mt-0.5">
                          {period.type === 'subject' ? 'Academic Slot' : period.type === 'break' ? 'Recess' : 'Field Activity'}
                        </p>
                      </div>
                    </div>

                    {isSubject && !isPhysical ? (
                      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative group">
                          <select
                            value={assignment.subjectId}
                            onChange={(e) => handleAssignmentChange(period.id, 'subjectId', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer appearance-none"
                          >
                            <option value="">Select Subject</option>
                            {subjects.map(s => (
                              <option key={s._id} value={s._id}>{s.subjectName}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                        </div>

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
                              <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 w-full flex items-center justify-center lg:justify-start">
                        <div className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-700">
                          <p className="text-[10px] font-black text-slate-400 tracking-tight">
                            {isPhysical ? 'Sport Block' : `${period.breakType || 'Recess'} Block`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-slate-50 dark:border-slate-800">
            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={routineSlots.length === 0 || isSaving}
              className={`
              flex items-center gap-2 px-10 py-3.5 rounded-2xl font-black text-[11px] tracking-tight shadow-xl transition-all hover:scale-105 active:scale-95
              ${isSaved
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-slate-900/20'
                  : 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed'}
            `}
            >
              {isSaving ? <Loader2 size={20} className="animate-spin" /> : isSaved ? <CheckCircle2 size={20} /> : <Save size={20} />}
              {isSaving ? 'Saving...' : isSaved ? 'Timetable Saved' : 'Save Routine'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Clear All Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearAll}
        title="Mass Reset School Teachers?"
        message="This will remove ALL teacher assignments across every Grade, Section, and Weekday for this entire school. This action cannot be undone. Are you sure?"
      />
    </>
  );
};

export default TimetablePage;