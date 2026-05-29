import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Save,
  Clock,
  Calendar,
  ChevronDown,
  CheckCircle2,
  Info,
  Settings,
  X,
  ListOrdered,
  GripVertical
} from 'lucide-react';
import { toast } from '../../MainSystemComponents/Toast';
import ConfirmDialog from '../../MainSystemComponents/ConfirmDialog';
import examService from '../../Api/examService';
import gradeService from '../../Api/gradeService';
import schoolNotificationService from '../../Api/schoolNotificationService';
import CustomNepaliHolidayCalendar from '../../MainSystemComponents/CustomNepaliHolidayCalendar';
import PortalPopup from '../../MainSystemComponents/PortalPopup';
import { convertADtoBS } from "@adhikarisaroj795/nepali-calendar-react";

// Term ordinals used throughout - must match backend canonical names
const ORDINALS = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'];
// Mock data removed (SESSIONS, GRADES, GRADE_SUBJECT_MAP, DEFAULT_SUBJECTS)

const SchedulingView = () => {
  // --- Setup Modal State ---
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [yearSetup, setYearSetup] = useState({
    termsCount: 3,
    includeMidTerm: true,
    termDates: {} // Format: { "First Term": ["2026-04-01", "2026-04-02", ...] }
  });

  // --- Template States ---
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState(120);
  const [isTemplateSaved, setIsTemplateSaved] = useState(false);

  // --- Mapping States ---
  // --- Mapping States ---
  // const [mappingSession, setMappingSession] = useState(SESSIONS[0]); // REMOVED
  const [mappingTerm, setMappingTerm] = useState("First Term");
  const [mappingGrade, setMappingGrade] = useState("");

  // Calculate current BS year for dynamic filtering
  const todayStr = new Date().toISOString().split('T')[0];
  const currentBSYear = parseInt(convertADtoBS(todayStr).split('-')[0]);

  const [mappingYear, setMappingYear] = useState(currentBSYear);
  const [slots, setSlots] = useState([]);
  const [isMappingSaved, setIsMappingSaved] = useState(false);

  // New Data State
  const [allGrades, setAllGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCalendarId, setOpenCalendarId] = useState(null);

  // Drag Refs
  const dragItem = React.useRef(null);
  const dragOverItem = React.useRef(null);

  // Calendar Coordinates for Portal rendering
  const [calendarCoords, setCalendarCoords] = useState(null);

  const handleCalendarClick = (e, index) => {
    if (openCalendarId === index) {
      setOpenCalendarId(null);
      setCalendarCoords(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const calendarHeight = 350; // Expected calendar height
      const top = rect.top - calendarHeight - 8 + window.scrollY;

      setOpenCalendarId(index);
      setCalendarCoords({
        top,
        left: rect.right - 340 + window.scrollX
      });
    }
  };

  useEffect(() => {
    const handleScrollOrResize = () => {
      setOpenCalendarId(null);
      setCalendarCoords(null);
    };

    if (openCalendarId !== null) {
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
    }

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [openCalendarId]);

  // Derived Subjects
  const currentGradeData = allGrades.find(g => g.gradeNumber.toString() === mappingGrade);
  const mappingSubjects = currentGradeData?.subjects?.map(s => s.subjectId) || [];

  // Fetch Grades on Mount
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const data = await gradeService.getGrades();
        setAllGrades(data);
        if (data.length > 0) {
          setMappingGrade(data[0].gradeNumber.toString());
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch grades:", error);
        toast({ type: 'error', message: 'Failed to load grades' });
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  // Fetch Exam Config - Triggered by Academic Year change
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoading(true);
        const data = await examService.getExamData(mappingYear);

        // Always update examData, even if null
        setExamData(data);

        if (data && data.config) {
          setYearSetup(data.config);
          setStartTime(data.config.globalStartTime || "09:00");
          setDuration(data.config.globalDuration || 120);

          // Validate mappingTerm exists in new config
          const validTerms = [];
          for (let i = 0; i < data.config.termsCount; i++) {
            const ord = ORDINALS[i] || `${i + 1}th`;
            if (data.config.includeMidTerm) validTerms.push(`${ord} Mid Term`);
            validTerms.push(`${ord} Term`);
          }
          if (!validTerms.includes(mappingTerm)) {
            setMappingTerm(validTerms[0] || "First Term");
          }
        } else {
          // Reset to defaults if no config for this year
          const defaultSetup = {
            termsCount: 3,
            includeMidTerm: true,
            termDates: {}
          };
          setYearSetup(defaultSetup);
          setStartTime("09:00");
          setDuration(120);

          // Reset mappingTerm to default first option
          setMappingTerm("First Mid Term");
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch exam data", error);
        setLoading(false);
      }
    };

    fetchExamData();
  }, [mappingYear]);

  const [examData, setExamData] = useState(null);

  useEffect(() => {
    // 1. Initialize slots with subjects
    if (mappingSubjects.length > 0) {
      // Check if we have an existing schedule for this Grade + Term
      const existingSchedule = examData?.schedules?.find(
        s => s.gradeNumber.toString() === mappingGrade && s.term === mappingTerm
      );

      const initialSlots = mappingSubjects.map((subjectObj, index) => {
        const subjectId = subjectObj._id; // Store ID string only
        // Try to find saved entry for this subject
        const savedEntry = existingSchedule?.entries?.find(e => e.subjectId._id === subjectId || e.subjectId === subjectId);
        // Use saved date if available, otherwise fallback to universal term date sequence
        const universalDate = yearSetup.termDates?.[mappingTerm]?.[index] || '';

        return {
          slotOrder: index + 1,
          subjectId: subjectId, // Store ID
          date: savedEntry ? savedEntry.date.split('T')[0] : universalDate
        };
      });

      // Sort Loading Data: Dates first, chronological order
      const sortedInitial = initialSlots.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date);
      }).map((s, i) => ({ ...s, slotOrder: i + 1 }));

      setSlots(sortedInitial);
    } else {
      setSlots([]);
    }
    setIsMappingSaved(false);
  }, [mappingGrade, mappingTerm, allGrades, examData]);

  const handleTemplateSave = async () => {
    try {
      await examService.saveExamConfig({
        ...yearSetup,
        globalStartTime: startTime,
        globalDuration: duration,
        academicYear: mappingYear // Pass academic year
      });
      setIsTemplateSaved(true);
      // Refresh data to keep local state in sync
      const data = await examService.getExamData(mappingYear);
      setExamData(data);
      if (data && data.config) setYearSetup(data.config);

      toast({ type: 'success', message: 'Global exam template saved!' });
      setTimeout(() => setIsTemplateSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save template:", error);
      toast({ type: 'error', message: 'Failed to save configuration' });
    }
  };

  const handleMappingSave = async () => {
    try {
      setLoading(true);

      // 1. Update the universal term date mapping in global configuration
      const termDateSeq = slots.map(s => s.date);
      await examService.saveExamConfig({
        ...yearSetup,
        globalStartTime: startTime,
        globalDuration: duration,
        academicYear: mappingYear,
        termDates: {
          ...(yearSetup.termDates || {}),
          [mappingTerm]: termDateSeq
        }
      });

      // 2. Prepare the update batch for ALL grades
      for (const grade of allGrades) {
        const gradeNum = grade.gradeNumber.toString();
        let gradeEntries = [];

        if (gradeNum === mappingGrade) {
          // Use the UI slots for the active grade
          gradeEntries = slots.filter(s => s.subjectId && s.date).map(s => ({
            subjectId: s.subjectId,
            date: s.date
          }));
        } else {
          const existing = examData?.schedules?.find(
            s => s.gradeNumber.toString() === gradeNum && s.term === mappingTerm
          );

          if (existing && existing.entries) {
            gradeEntries = existing.entries.map((oldEntry, idx) => ({
              subjectId: oldEntry.subjectId._id || oldEntry.subjectId,
              date: termDateSeq[idx] || (idx > 0 && termDateSeq[idx - 1] ? getNextWorkingDate(termDateSeq[idx - 1]) : '')
            })).filter(e => e.date);
          } else {
            continue;
          }
        }

        if (gradeEntries.length > 0) {
          await examService.saveExamSchedule({
            gradeNumber: gradeNum,
            term: mappingTerm,
            entries: gradeEntries,
            academicYear: mappingYear
          });
        }
      }

      // 3. Refresh local data
      const finalData = await examService.getExamData(mappingYear);
      setExamData(finalData);
      if (finalData && finalData.config) setYearSetup(finalData.config);

      // 4. Notification
      const routine_table = {
        term: mappingTerm,
        year: mappingYear.toString(),
        grades: allGrades.map(g => {
          const schedule = finalData?.schedules?.find(
            s => s.gradeNumber.toString() === g.gradeNumber.toString() && s.term === mappingTerm
          );
          return {
            grade: `Grade ${g.gradeNumber}`,
            schedule: schedule?.entries?.map((e, idx) => ({
              date: e.date.split('T')[0],
              day: new Date(e.date).toLocaleDateString('en-US', { weekday: 'long' }),
              subject: e.subjectId?.subjectName || 'N/A',
              time: `${startTime} – ${parseInt(startTime) + Math.floor(duration / 60)}:00 PM`
            })) || []
          };
        }).filter(g => g.schedule.length > 0)
      };

      const userDataStr = localStorage.getItem('user');
      const userData = userDataStr ? JSON.parse(userDataStr) : {};

      // Create notifications for Students and Teachers specifically (Excluding Admin)
      const commonNotificationData = {
        title: `Exam Routine Published – ${mappingTerm} ${mappingYear}`,
        message: `The exam routine for ${mappingTerm} (${mappingYear}) has been published. You can now view your specific subject dates and times on the Academic Calendar.`,
        sender: userData.fullName || "School Administration"
      };

      await Promise.all([
        schoolNotificationService.createNotification({ ...commonNotificationData, receiver: 'student' }),
        schoolNotificationService.createNotification({ ...commonNotificationData, receiver: 'teacher' })
      ]);

      setIsMappingSaved(true);
      toast({ type: 'success', message: `Schedule published for ${mappingYear}!` });
      setTimeout(() => setIsMappingSaved(false), 3000);
      setLoading(false);

    } catch (error) {
      console.error("Failed to publish schedule:", error);
      toast({ type: 'error', message: 'Failed to publish schedule' });
      setLoading(false);
    }
  };


  const isSaturday = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    return d.getDay() === 6;
  };

  const getNextWorkingDate = (dateString) => {
    let d = new Date(dateString);
    d.setDate(d.getDate() + 1);
    // If Saturday, skip to Sunday
    if (d.getDay() === 6) {
      d.setDate(d.getDate() + 1);
    }
    return d.toISOString().split('T')[0];
  };

  const updateSlot = (index, field, value) => {
    let newSlots = [...slots];

    // Validation for Saturday
    if (field === 'date' && isSaturday(value)) {
      toast({ type: 'error', message: 'Saturday exams are not allowed!' });
      return;
    }

    // Validation for Term Range Collisions
    if (field === 'date' && value) {
      // 1. Calculate the hypothetical new sequence for this term starting from 'index'
      let hypotheticalSequence = [value];
      let currentD = value;
      for (let i = index + 1; i < newSlots.length; i++) {
        const nextDate = getNextWorkingDate(currentD);
        hypotheticalSequence.push(nextDate);
        currentD = nextDate;
      }

      // 2. Check each hypothetical date against existing term ranges
      for (const [termName, termDates] of Object.entries(yearSetup.termDates || {})) {
        if (termName === mappingTerm || !termDates || termDates.length === 0) continue;

        // Determine range for the other term
        const sorted = [...termDates].filter(d => d).sort((a, b) => new Date(a) - new Date(b));
        if (sorted.length === 0) continue;

        const rangeStart = new Date(sorted[0]);
        const rangeEnd = new Date(sorted[sorted.length - 1]);

        for (const checkDateStr of hypotheticalSequence) {
          const checkDate = new Date(checkDateStr);
          if (checkDate >= rangeStart && checkDate <= rangeEnd) {
            toast({
              type: 'error',
              message: `Schedule Collision! Date ${checkDateStr} falls within the ${termName} range (${sorted[0]} to ${sorted[sorted.length - 1]}).`
            });
            return;
          }
        }
      }
    }

    newSlots[index] = { ...newSlots[index], [field]: value };

    // Cascade Logic: If date changes, find work-days for subsequent slots
    if (field === 'date' && value) {
      let currentD = value;
      for (let i = index + 1; i < newSlots.length; i++) {
        const nextDate = getNextWorkingDate(currentD);
        newSlots[i].date = nextDate;
        currentD = nextDate;
      }

      // Re-calculate Day Sequence
      newSlots = newSlots.map((s, i) => ({ ...s, slotOrder: i + 1 }));

      // Update the universal term date sequence in state
      setYearSetup(prev => ({
        ...prev,
        termDates: {
          ...(prev.termDates || {}),
          [mappingTerm]: newSlots.map(s => s.date)
        }
      }));
    }

    setSlots(newSlots);
  };

  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const handleSort = () => {
    // 1. Duplicate items
    let _slots = [...slots];

    // 2. Extract fixed dates (to keep them anchored to the sequence)
    const fixedDates = _slots.map(s => s.date);

    // 3. Remove and insert dragged item
    const draggedItemContent = _slots.splice(dragItem.current, 1)[0];
    _slots.splice(dragOverItem.current, 0, draggedItemContent);

    // 4. Re-assign the fixed dates back to the new positions
    _slots = _slots.map((slot, index) => ({
      ...slot,
      date: fixedDates[index],
      slotOrder: index + 1
    }));

    // 5. Reset refs
    dragItem.current = null;
    dragOverItem.current = null;

    // 6. Update state
    setSlots(_slots);
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">

      {/* Global Template Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 lg:p-10 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Settings size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight capitalize">Exam Routine Management</h3>
                <p className="text-[10px] font-bold text-slate-400 capitalize tracking-widest mt-1">Configure annual structure & timing logic</p>
              </div>
            </div>
            <div className="px-5 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-[10px] font-black text-emerald-600 capitalize tracking-widest border border-emerald-100 dark:border-emerald-800">
              Admin Control Only
            </div>
          </div>
        </div>

        <div className="p-8 lg:p-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
            {/* Year Selection Dropdown */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 capitalize tracking-widest ml-1">Academic Year</label>
              <div className="relative group">
                <select
                  value={mappingYear}
                  onChange={(e) => setMappingYear(Number(e.target.value))}
                  className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold dark:text-white focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer"
                >
                  {[currentBSYear, currentBSYear + 1].map(y => (
                    <option key={y} value={y}>{y} BS</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
              </div>
            </div>

            {/* Setup Exam Button */}
            <div className="space-y-3">
              <button
                onClick={() => setIsSetupModalOpen(true)}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[20px] font-black text-xs capitalize tracking-widest transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
              >
                <Settings size={18} /> Setup Exam
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 capitalize tracking-widest ml-1">Exam Start Time</label>
              <div className="relative">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold dark:text-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 capitalize tracking-widest ml-1">Duration (Minutes)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                placeholder="e.g. 120"
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold dark:text-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            </div>
          </div>

          <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-emerald-500 font-black text-[10px] capitalize tracking-widest">
                Template Active: {yearSetup.termsCount} Terms Plan ({mappingYear} BS)
              </div>

            </div>

            <button
              onClick={handleTemplateSave}
              className={`flex items-center gap-3 px-12 py-4 rounded-[20px] font-black text-xs capitalize tracking-[0.15em] transition-all hover:scale-105 active:scale-95 shadow-xl ${isTemplateSaved ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white shadow-emerald-500/20'
                }`}
            >
              {isTemplateSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
              {isTemplateSaved ? 'Template Saved' : 'Save Exam Setup'}
            </button>
          </div>
        </div>
      </div>

      {/* Term Mapping Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 lg:p-10 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                <ListOrdered size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight capitalize">Term Schedule Mapping</h3>
                <p className="text-[10px] font-bold text-slate-400 capitalize tracking-widest mt-1">Assign subjects to dates for specific terms</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <select
                  value={mappingYear}
                  onChange={(e) => setMappingYear(Number(e.target.value))}
                  className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold text-slate-700 dark:text-white capitalize outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                >
                  {[currentBSYear, currentBSYear + 1].map(y => (
                    <option key={y} value={y} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{y} BS</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
              </div>

              <div className="relative group">
                <select
                  value={mappingTerm}
                  onChange={(e) => setMappingTerm(e.target.value)}
                  className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold text-slate-700 dark:text-white capitalize outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                >
                  {/* Dynamic Terms based on Setup */}
                  {(() => {
                    const options = [];
                    for (let i = 0; i < yearSetup.termsCount; i++) {
                      const ord = ORDINALS[i] || `${i + 1}th`;
                      if (yearSetup.includeMidTerm) {
                        const midName = `${ord} Mid Term`;
                        options.push(<option key={midName} value={midName} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{midName}</option>);
                      }
                      const termName = `${ord} Term`;
                      options.push(<option key={termName} value={termName} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{termName}</option>);
                    }
                    return options;
                  })()}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
              </div>

              <div className="relative group">
                <select
                  value={mappingGrade}
                  onChange={(e) => setMappingGrade(e.target.value)}
                  className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold text-slate-700 dark:text-white capitalize outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                >
                  {loading ? <option className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Loading...</option> : allGrades.map(g => (
                    <option key={g._id} value={g.gradeNumber} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {g.gradeName ? g.gradeName : `GRADE ${g.gradeNumber}`}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-0">
          <table className="w-full text-left border-collapse">
            <colgroup>
              <col className="w-[180px]" />
              <col />
              <col className="w-[220px]" />
            </colgroup>
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-50 dark:border-slate-800">
                <th className="pl-10 pr-6 py-6 text-[10px] font-black text-slate-400 capitalize tracking-widest">Sequence</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 capitalize tracking-widest text-center">Academic Subject</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 capitalize tracking-widest">Exam Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {slots.map((slot, index) => (
                <tr
                  key={slot.subjectId || index}
                  className="group hover:bg-emerald-50/10 dark:hover:bg-emerald-900/5 transition-colors cursor-move"
                  draggable
                  onDragStart={(e) => (dragItem.current = index)}
                  onDragEnter={(e) => (dragOverItem.current = index)}
                  onDragEnd={handleSort}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <td className="pl-6 pr-4 py-6">
                    <div className="flex items-center gap-3">
                      <div className="cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-emerald-500 transition-colors">
                        <GripVertical size={16} />
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white capitalize tracking-tighter">
                        {getOrdinal(slot.slotOrder)} Day
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="relative group/sel max-w-[280px] mx-auto">
                      {/* Read-only subject display */}
                      <div className="flex items-center h-full px-5 py-3 w-full text-xs font-bold dark:text-white bg-slate-50 dark:bg-slate-800 rounded-xl border border-transparent">
                        {mappingSubjects.find(s => s._id === slot.subjectId)?.subjectName?.toUpperCase() || "SELECT SUBJECT"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="relative w-full">
                      <div
                        onClick={(e) => handleCalendarClick(e, index)}
                        className="bg-slate-50 dark:bg-slate-800 border border-transparent focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3 w-full text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer flex items-center justify-between whitespace-nowrap"
                      >
                        <span>{slot.date || "Select Date"}</span>
                        <Calendar size={14} className="text-emerald-500 flex-shrink-0 ml-3" />
                      </div>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-10 bg-slate-50/30 dark:bg-slate-900/30 border-t border-slate-50 dark:border-slate-800 flex flex-col md:flex-row items-center justify-end gap-8">

            <button
              onClick={handleMappingSave}
              disabled={loading || slots.length === 0 || !slots.some(s => s.date !== '')}
              className={`flex items-center gap-3 px-14 py-5 rounded-[24px] font-black text-xs capitalize tracking-[0.2em] shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale ${isMappingSaved ? 'bg-slate-900 text-white shadow-slate-900/20' : 'bg-emerald-500 text-white shadow-emerald-500/20'
                }`}
            >
              {isMappingSaved ? <CheckCircle2 size={20} /> : <Calendar size={20} />}
              {isMappingSaved ? 'Schedule Published' : 'Publish Term Schedule'}
            </button>
          </div>
        </div>
      </div>

      {/* Setup Exam Modal */}
      <PortalPopup isOpen={isSetupModalOpen} onClose={() => setIsSetupModalOpen(false)}>
        <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[48px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Settings size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight capitalize leading-none">Year Setup</h3>
                <p className="text-[10px] font-bold text-slate-400 capitalize tracking-widest mt-1.5">Configure Academic Cycles</p>
              </div>
            </div>
            <button
              onClick={() => setIsSetupModalOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-10 space-y-8">
            {/* Terms Count */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 capitalize tracking-widest ml-1">How many term exams in a calendar year?</label>
              <div className="relative group">
                <select
                  value={yearSetup.termsCount}
                  onChange={(e) => setYearSetup({ ...yearSetup, termsCount: Number(e.target.value) })}
                  className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold dark:text-white focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer"
                >
                  {[1, 2, 3, 4].map(n => <option key={n} value={n} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{n} terms</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500" />
              </div>
            </div>

            {/* Mid-Term Toggle */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 capitalize tracking-widest ml-1">Include Mid-Term Exam?</label>
              <div className="relative group">
                <select
                  value={yearSetup.includeMidTerm ? "yes" : "no"}
                  onChange={(e) => setYearSetup({ ...yearSetup, includeMidTerm: e.target.value === "yes" })}
                  className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold dark:text-white focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer"
                >
                  <option value="yes" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Yes</option>
                  <option value="no" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">No</option>
                </select>
                <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500" />
              </div>
              {yearSetup.includeMidTerm && (
                <p className="text-[10px] font-bold text-emerald-600 capitalize tracking-wider ml-1 animate-in fade-in slide-in-from-top-1">
                  Mid-Term exam configuration will be created in the year plan.
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
              <button
                onClick={() => setIsSetupModalOpen(false)}
                className="px-8 py-4 rounded-2xl text-[10px] font-black text-slate-400 capitalize tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsConfirmOpen(true)}
                className="flex items-center gap-3 px-10 py-4 bg-emerald-600 text-white rounded-[20px] font-black text-xs capitalize tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
              >
                Save Year Setup
              </button>
            </div>
          </div>
        </div>
      </PortalPopup>

      {/* Confirm Save Year Setup */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={async () => {
          setIsConfirmOpen(false);
          await handleTemplateSave();
          setIsSetupModalOpen(false);
        }}
        title="Save Year Setup?"
        message={`This will update the academic calendar to ${yearSetup.termsCount} term${yearSetup.termsCount > 1 ? 's' : ''}${yearSetup.includeMidTerm ? ' with mid-term exams' : ''}. All existing term statuses will be re-synced.`}
      />

      {/* Portal Calendar overlay */}
      {openCalendarId !== null && calendarCoords && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => { setOpenCalendarId(null); setCalendarCoords(null); }} />
          <div
            className="absolute z-[9999] w-[340px] shadow-2xl animate-in zoom-in-95 duration-100"
            style={{
              top: `${calendarCoords.top}px`,
              left: `${calendarCoords.left}px`,
            }}
          >
            <CustomNepaliHolidayCalendar
              selectedDate={slots[openCalendarId]?.date ? new Date(slots[openCalendarId].date) : new Date()}
              onChange={(date) => {
                const formatted = date.toISOString().split('T')[0];
                updateSlot(openCalendarId, 'date', formatted);
                setOpenCalendarId(null);
                setCalendarCoords(null);
              }}
              disablePastDates={true}
            />
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default SchedulingView;