import React, { useState, useEffect } from 'react';
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
import axios from 'axios';
import { toast } from '../../MainSystemComponents/Toast';
import ConfirmDialog from '../../MainSystemComponents/ConfirmDialog';

// Term ordinals used throughout - must match backend canonical names
const ORDINALS = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'];
// Mock data removed (SESSIONS, GRADES, GRADE_SUBJECT_MAP, DEFAULT_SUBJECTS)

const SchedulingView = () => {
  // --- Setup Modal State ---
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [yearSetup, setYearSetup] = useState({
    termsCount: 3,
    includeMidTerm: true
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
  const [slots, setSlots] = useState([]);
  const [isMappingSaved, setIsMappingSaved] = useState(false);

  // New Data State
  const [allGrades, setAllGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Drag Refs
  const dragItem = React.useRef(null);
  const dragOverItem = React.useRef(null);

  // Derived Subjects
  const currentGradeData = allGrades.find(g => g.gradeNumber.toString() === mappingGrade);
  const mappingSubjects = currentGradeData?.subjects?.map(s => s.subjectId) || [];

  // Fetch Grades on Mount
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await axios.get('http://localhost:7000/api/grades');
        setAllGrades(response.data);
        if (response.data.length > 0) {
          setMappingGrade(response.data[0].gradeNumber.toString());
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch grades:", error);
        toast({ type: 'error', message: 'Failed to load grades' });
        setLoading(false);
      }
    };

    // Fetch Exam Config
    const fetchExamData = async () => {
      try {
        const response = await axios.get('http://localhost:7000/api/exams');
        const data = response.data;
        if (data && data.config) {
          setYearSetup(data.config);
          setStartTime(data.config.globalStartTime || "09:00");
          setDuration(data.config.globalDuration || 120);
        }
        // Store full exam data to access schedules later
        setExamData(data);
      } catch (error) {
        console.error("Failed to fetch exam data", error);
        // Don't show toast here as it might be empty initially
      }
    };

    fetchGrades();
    fetchExamData();
  }, []);

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

        return {
          slotOrder: index + 1,
          subjectId: subjectId, // Store ID
          date: savedEntry ? savedEntry.date.split('T')[0] : ''
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
  }, [mappingGrade, mappingTerm, allGrades, examData]); // Re-run when mappingTerm changes too

  const handleTemplateSave = async () => {
    try {
      await axios.post('http://localhost:7000/api/exams/config', {
        ...yearSetup,
        globalStartTime: startTime,
        globalDuration: duration
      });
      setIsTemplateSaved(true);
      // Reset mapping term to first valid term from new setup
      const firstTerm = yearSetup.includeMidTerm ? `${ORDINALS[0]} Mid Term` : `${ORDINALS[0]} Term`;
      setMappingTerm(firstTerm);
      toast({ type: 'success', message: 'Global exam template saved!' });
      setTimeout(() => setIsTemplateSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save template:", error);
      toast({ type: 'error', message: 'Failed to save configuration' });
    }
  };

  const handleMappingSave = async () => {
    const selectedIds = slots.map(s => s.subjectId).filter(id => id !== '');
    const hasDuplicates = new Set(selectedIds).size !== selectedIds.length;

    if (hasDuplicates) {
      toast({ type: 'warning', message: 'Duplicate subjects detected!' });
      return;
    }

    try {
      // Construct entries
      const entries = slots.filter(s => s.subjectId && s.date).map(s => ({
        subjectId: s.subjectId,
        date: s.date
      }));

      await axios.post('http://localhost:7000/api/exams/schedule', {
        gradeNumber: mappingGrade,
        term: mappingTerm,
        entries
      });

      setIsMappingSaved(true);
      toast({ type: 'success', message: 'Term schedule published!' });
      setTimeout(() => setIsMappingSaved(false), 3000);

      // Refresh data to keep local state in sync
      const response = await axios.get('http://localhost:7000/api/exams');
      setExamData(response.data);

    } catch (error) {
      console.error("Failed to publish schedule:", error);
      toast({ type: 'error', message: 'Failed to publish schedule' });
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
      toast({ type: 'error', message: 'Statistics: Saturday exams are not allowed!' });
      return;
    }

    newSlots[index] = { ...newSlots[index], [field]: value };

    // Auto-sort and Cascade if date changes
    if (field === 'date') {
      const modifiedSubjectId = newSlots[index].subjectId;

      // 1. Sort
      newSlots.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date);
      });

      // 2. Find new index of modified item
      const newIndex = newSlots.findIndex(s => s.subjectId === modifiedSubjectId);

      // 3. Cascade dates from there onwards
      for (let i = newIndex; i < newSlots.length - 1; i++) {
        if (newSlots[i].date) { // Only cascade if current has date
          newSlots[i + 1].date = getNextWorkingDate(newSlots[i].date);
        }
      }

      // Re-calculate Day Sequence
      newSlots = newSlots.map((s, i) => ({ ...s, slotOrder: i + 1 }));
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
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Exam Routine Template (Global)</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure annual structure & timing logic</p>
              </div>
            </div>
            <div className="px-5 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">
              Admin Control Only
            </div>
          </div>
        </div>

        <div className="p-8 lg:p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            {/* Setup Exam Button replaced Grade Selection */}
            <div className="space-y-3">
              <button
                onClick={() => setIsSetupModalOpen(true)}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[20px] font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
              >
                <Settings size={18} /> Setup Exam
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Exam Start Time</label>
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration (Minutes)</label>
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
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                Template Active: {yearSetup.termsCount} Terms Plan
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                Global structure applied to all grade levels
              </p>
            </div>

            <button
              onClick={handleTemplateSave}
              className={`flex items-center gap-3 px-12 py-4 rounded-[20px] font-black text-xs uppercase tracking-[0.15em] transition-all hover:scale-105 active:scale-95 shadow-xl ${isTemplateSaved ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white shadow-emerald-500/20'
                }`}
            >
              {isTemplateSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
              {isTemplateSaved ? 'Template Saved' : 'Save Global Template'}
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
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Term Schedule Mapping</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Assign subjects to dates for specific terms</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Session Dropdown REMOVED */}

              <div className="relative group">
                <select
                  value={mappingTerm}
                  onChange={(e) => setMappingTerm(e.target.value)}
                  className="appearance-none bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-[10px] font-black text-slate-500 uppercase outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                >
                  {/* Dynamic Terms based on Setup */}
                  {(() => {
                    const options = [];
                    for (let i = 0; i < yearSetup.termsCount; i++) {
                      const ord = ORDINALS[i] || `${i + 1}th`;
                      if (yearSetup.includeMidTerm) {
                        const midName = `${ord} Mid Term`;
                        options.push(<option key={midName} value={midName}>{midName.toUpperCase()}</option>);
                      }
                      const termName = `${ord} Term`;
                      options.push(<option key={termName} value={termName}>{termName.toUpperCase()}</option>);
                    }
                    return options;
                  })()}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500" />
              </div>

              <div className="relative group">
                <select
                  value={mappingGrade}
                  onChange={(e) => setMappingGrade(e.target.value)}
                  className="appearance-none bg-emerald-600 text-white rounded-xl pl-4 pr-10 py-2.5 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer"
                >
                  {loading ? <option>Loading...</option> : allGrades.map(g => (
                    <option key={g._id} value={g.gradeNumber}>
                      {g.gradeName ? g.gradeName.toUpperCase() : `GRADE ${g.gradeNumber}`}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-50 dark:border-slate-800">
                <th className="pl-10 pr-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sequence</th>
                <th className="px-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Subject</th>
                <th className="px-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Exam Date</th>
                <th className="px-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                <th className="pr-10 pl-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
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
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                        {getOrdinal(slot.slotOrder)} Day
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <div className="relative group/sel min-w-[200px]">
                      {/* Read-only subject display */}
                      <div className="flex items-center h-full px-5 py-3 text-xs font-bold dark:text-white bg-slate-50 dark:bg-slate-800 rounded-xl border border-transparent">
                        {mappingSubjects.find(s => s._id === slot.subjectId)?.subjectName?.toUpperCase() || "SELECT SUBJECT"}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <input
                      type="date"
                      value={slot.date}
                      onChange={(e) => updateSlot(index, 'date', e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800 border border-transparent focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-5 py-3 text-xs font-bold dark:text-white outline-none cursor-pointer"
                      min={new Date().toISOString().split('T')[0]} // Disable past dates
                    />
                  </td>
                  <td className="px-4 py-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Clock size={14} className="text-emerald-500" />
                      {startTime}
                    </div>
                  </td>
                  <td className="pr-10 pl-4 py-6 text-center">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      DRAFT
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-10 bg-slate-50/30 dark:bg-slate-900/30 border-t border-slate-50 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-start gap-4 p-5 bg-white dark:bg-slate-800 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-sm max-w-xl">
              <Info className="text-emerald-500 shrink-0 mt-0.5" size={18} />
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-wider">
                Note: Changing mapping dates only affects this specific term. The global routine structure (DNA) remains locked to institutional standards.
              </p>
            </div>

            <button
              onClick={handleMappingSave}
              disabled={slots.some(s => s.subjectId === '' || s.date === '')}
              className={`flex items-center gap-3 px-14 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale ${isMappingSaved ? 'bg-slate-900 text-white shadow-slate-900/20' : 'bg-emerald-500 text-white shadow-emerald-500/20'
                }`}
            >
              {isMappingSaved ? <CheckCircle2 size={20} /> : <Calendar size={20} />}
              {isMappingSaved ? 'Schedule Published' : 'Publish Term Schedule'}
            </button>
          </div>
        </div>
      </div>

      {/* Setup Exam Modal */}
      {isSetupModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsSetupModalOpen(false)} />

          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[48px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Settings size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">Year Setup</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Configure Academic Cycles</p>
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">How many term exams in a calendar year?</label>
                <div className="relative group">
                  <select
                    value={yearSetup.termsCount}
                    onChange={(e) => setYearSetup({ ...yearSetup, termsCount: Number(e.target.value) })}
                    className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold dark:text-white focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer"
                  >
                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} terms</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500" />
                </div>
              </div>

              {/* Mid-Term Toggle */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Include Mid-Term Exam?</label>
                <div className="relative group">
                  <select
                    value={yearSetup.includeMidTerm ? "yes" : "no"}
                    onChange={(e) => setYearSetup({ ...yearSetup, includeMidTerm: e.target.value === "yes" })}
                    className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold dark:text-white focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500" />
                </div>
                {yearSetup.includeMidTerm && (
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider ml-1 animate-in fade-in slide-in-from-top-1">
                    Mid-Term exam configuration will be created in the year plan.
                  </p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                <button
                  onClick={() => setIsSetupModalOpen(false)}
                  className="px-8 py-4 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsConfirmOpen(true)}
                  className="flex items-center gap-3 px-10 py-4 bg-emerald-600 text-white rounded-[20px] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Save Year Setup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default SchedulingView;