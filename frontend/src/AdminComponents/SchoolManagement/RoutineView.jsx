import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Clock,
  Coffee,
  Trophy,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  History,
  ArrowRightIcon,
  X,
  Lock,
  Unlock,
  Copy,
  ChevronDown,
  Loader2,
  GripVertical
} from 'lucide-react';
import { Reorder } from 'framer-motion';
import ConfirmDialog from '../../MainSystemComponents/ConfirmDialog';
import PortalPopup from '../../MainSystemComponents/PortalPopup';
import { toast } from '../../MainSystemComponents/Toast';

const RoutineView = ({ schoolHours, onUpdateHours, classRoutines,
  onUpdateRoutines,
  onFinalize,
  onSaveGlobalTiming,
  isSavingHours,
  gradeList = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
  schoolName }) => {
  const [selectedGrade, setSelectedGrade] = useState(gradeList[0] || "1");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isTimingConfirmOpen, setIsTimingConfirmOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({ type: 'subject', label: '', durationMinutes: 45, breakType: 'Short' });

  // Sync selectedGrade when gradeList changes
  React.useEffect(() => {
    if (gradeList.length > 0 && !gradeList.includes(selectedGrade)) {
      setSelectedGrade(gradeList[0]);
    }
  }, [gradeList, selectedGrade]);

  const getMetrics = () => {
    const gradeData = classRoutines[selectedGrade];
    const slots = Array.isArray(gradeData) ? gradeData : (gradeData?.slots || []);

    const startMins = parseInt(schoolHours.start.split(":")[0]) * 60 + parseInt(schoolHours.start.split(":")[1]);
    const endMins = parseInt(schoolHours.end.split(":")[0]) * 60 + parseInt(schoolHours.end.split(":")[1]);
    const total = endMins - startMins;
    const used = slots.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    return { total, used, remaining: total - used, percent: Math.min(100, (used / total) * 100), isValid: total === used && used > 0 };
  };

  const isLocked = classRoutines[selectedGrade]?.isLocked || false;
  const toggleLock = () => {
    const gradeData = classRoutines[selectedGrade];
    const slots = Array.isArray(gradeData) ? gradeData : (gradeData?.slots || []);
    onUpdateRoutines(selectedGrade, slots, !isLocked);
    toast({ type: 'info', message: `Routine ${!isLocked ? 'Locked' : 'Unlocked'} locally. Click Finalize to save changes.`, duration: 2500 });
  };

  const handleConfirmFinalize = async () => {
    setIsConfirmOpen(false);
    await onFinalize(selectedGrade);
  };

  const handleConfirmTimingUpdate = async () => {
    setIsTimingConfirmOpen(false);
    await onSaveGlobalTiming();
  };

  const handleReorder = (newSlots) => {
    onUpdateRoutines(selectedGrade, newSlots, isLocked);
  };

  const handleReplicate = (sourceGrade) => {
    const sourceData = classRoutines[sourceGrade];
    if (sourceData && sourceData.slots) {
      onUpdateRoutines(selectedGrade, sourceData.slots, false); // Copy as unlocked
      setIsCopyModalOpen(false);
      toast({ type: 'success', message: `Framework copied from Grade ${sourceGrade}. Click Finalize to save.`, duration: 3000 });
    }
  };

  const handleRemoveSlot = (index) => {
    const gradeData = classRoutines[selectedGrade];
    const slots = Array.isArray(gradeData) ? gradeData : (gradeData?.slots || []);
    const s = [...slots];
    s.splice(index, 1);
    onUpdateRoutines(selectedGrade, s, isLocked);
  };

  const handleAddSlot = () => {
    const gradeData = classRoutines[selectedGrade];
    const slots = Array.isArray(gradeData) ? gradeData : (gradeData?.slots || []);

    const label = newSlot.type === 'subject'
      ? 'Normal Class'
      : newSlot.label || 'New Slot';
    const updated = [...slots, { ...newSlot, label, id: Date.now().toString() }];
    onUpdateRoutines(selectedGrade, updated, isLocked);
    setIsModalOpen(false);
  };

  const formatMinutesToTime = (totalMinutes) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${(h % 12 || 12).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  const getSlotStartTime = (index) => {
    let mins = parseInt(schoolHours.start.split(":")[0]) * 60 + parseInt(schoolHours.start.split(":")[1]);
    const gradeData = classRoutines[selectedGrade];
    const slots = Array.isArray(gradeData) ? gradeData : (gradeData?.slots || []);

    for (let i = 0; i < index; i++) {
      mins += (slots[i]?.durationMinutes || 0);
    }
    return mins;
  };

  const metrics = getMetrics();

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">Routine Structure</h2>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">{schoolName || "Academic Scheduling Context"}</p>
          </div>
          <p className="text-sm font-medium text-slate-500">Define structural framework without subject or teacher assignments</p>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleLock} className={`h-11 px-6 rounded-xl text-sm font-black tracking-widest shadow-lg transition-all flex items-center gap-2 active:scale-95 ${isLocked ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'}`}>
            {isLocked ? <><Lock size={18} /> Locked</> : <><Unlock size={18} /> Unlocked</>}
          </button>
          <button disabled={isLocked} onClick={() => setIsModalOpen(true)} className={`h-11 px-6 rounded-xl text-sm font-black tracking-wider shadow-lg transition-all flex items-center gap-2 ${isLocked ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10 active:scale-[0.98]'}`}>
            <Plus size={18} /> Add Period
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 tracking-wider">School Hours</p>
            <button
              disabled={isSavingHours}
              onClick={() => setIsTimingConfirmOpen(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${isSavingHours ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-500/20'}`}
            >
              {isSavingHours && <Loader2 size={12} className="animate-spin" />}
              {isSavingHours ? 'Syncing...' : 'Update School Timing'}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest">Start</label>
              <input type="time" disabled={isLocked} value={schoolHours.start} onChange={(e) => onUpdateHours({ ...schoolHours, start: e.target.value })} className={`w-full bg-slate-50 dark:bg-slate-800 border-none px-3 py-2 rounded-lg text-sm font-semibold outline-none dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`} />
            </div>
            <div className="w-4 h-px bg-slate-200 mt-5 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest">End</label>
              <input type="time" disabled={isLocked} value={schoolHours.end} onChange={(e) => onUpdateHours({ ...schoolHours, end: e.target.value })} className={`w-full bg-slate-50 dark:bg-slate-800 border-none px-3 py-2 rounded-lg text-sm font-semibold outline-none dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`} />
            </div>
          </div>
        </div>

        <div className="md:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 tracking-wider">Day Progress (G{selectedGrade})</p>
            {metrics.isValid ? <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1.5"><CheckCircle2 size={12} /> Frame Locked</span> : <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1.5"><AlertTriangle size={12} /> {metrics.remaining > 0 ? 'Gaps' : 'Overflow'}</span>}
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-700 ${metrics.isValid ? 'bg-emerald-500' : metrics.remaining < 0 ? 'bg-red-500' : 'bg-emerald-600'}`} style={{ width: `${metrics.percent}%` }} />
          </div>
          <div className="flex justify-between text-[12px] font-semibold text-slate-600 dark:text-slate-400">
            <span>{metrics.used} / {metrics.total} mins</span>
            <span className={metrics.isValid ? 'text-emerald-500 font-bold' : 'text-slate-400'}>{metrics.remaining === 0 ? 'Optimized' : `${Math.abs(metrics.remaining)}m ${metrics.remaining > 0 ? 'gap' : 'overflow'}`}</span>
          </div>
        </div>
      </div>

      <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto scrollbar-hide">
        {gradeList.map(grade => (
          <button key={grade} onClick={() => setSelectedGrade(grade)} className={`flex-1 min-w-[80px] py-2.5 text-[11px] font-bold tracking-wider rounded-xl transition-all ${selectedGrade === grade ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>Grade {grade}</button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px] tracking-widest"><History size={14} /> Routine</div>
          <button disabled={isLocked} onClick={() => setIsCopyModalOpen(true)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${isLocked ? 'opacity-20 cursor-not-allowed' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}>
            <Copy size={12} /> Copy from Grade
          </button>
        </div>
        
        <div className="space-y-3">
          {(() => {
            const gradeData = classRoutines[selectedGrade];
            const slots = Array.isArray(gradeData) ? gradeData : (gradeData?.slots || []);

            if (slots.length === 0) {
              return (
                <div className="py-20 flex flex-col items-center text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed dark:border-slate-800">
                  <Clock className="text-slate-200 mb-3" size={40} />
                  <p className="text-sm font-semibold text-slate-400 tracking-wider">Routine Empty</p>
                </div>
              );
            }

            return (
              <Reorder.Group axis="y" values={slots} onReorder={handleReorder} className="space-y-3">
                {slots.map((slot, idx) => {
                  const startVal = getSlotStartTime(idx);
                  const startTimeStr = formatMinutesToTime(startVal);
                  const endTimeStr = formatMinutesToTime(startVal + slot.durationMinutes);

                  return (
                    <Reorder.Item key={slot.id || idx} value={slot} drag={!isLocked} className="relative">
                      <div className={`group flex items-center gap-6 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm transition-all ${!isLocked ? 'hover:border-emerald-500/20 hover:shadow-lg active:scale-[0.99] cursor-grab active:cursor-grabbing' : ''}`}>
                        <div className="w-[180px] shrink-0 border-r dark:border-slate-800 pr-6">
                          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white leading-none">
                            {startTimeStr.split(' ')[0]} <span className="text-[10px] opacity-40">{startTimeStr.split(' ')[1]}</span>
                            <ArrowRightIcon size={12} className="text-slate-300 mx-1" />
                            {endTimeStr.split(' ')[0]} <span className="text-[10px] opacity-40">{endTimeStr.split(' ')[1]}</span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-1">{slot.durationMinutes} Min Block</p>
                        </div>

                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          {!isLocked && <div className="text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0"><GripVertical size={20} /></div>}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${slot.type === 'break' ? 'bg-amber-500/10 text-amber-500' : slot.type === 'sport' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-600/10 text-emerald-600'}`}>
                            {slot.type === 'break' ? <Coffee size={18} /> : slot.type === 'sport' ? <Trophy size={18} /> : <BookOpen size={18} />}
                          </div>
                          <div className="truncate">
                            <h4 className="text-[14px] font-bold text-slate-800 dark:text-slate-200 truncate tracking-tight">{slot.label || 'Normal Class'}</h4>
                           <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1 opacity-60">{slot.type}</p>
                          </div>
                        </div>

                        {!isLocked && (
                          <button onClick={() => handleRemoveSlot(idx)} className="h-9 w-9 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
            );
          })()}
        </div>
      </div>

      <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex gap-6">
          <LegendItem color="bg-emerald-600" label="Instruction" /><LegendItem color="bg-amber-500" label="Breaks" /><LegendItem color="bg-emerald-400" label="Sports" />
        </div>
        <button disabled={!metrics.isValid} onClick={() => setIsConfirmOpen(true)} className={`h-12 px-10 rounded-xl font-black text-xs tracking-widest shadow-lg transition-all ${metrics.isValid ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 shadow-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}>Finalize Routine</button>
      </div>

      <ConfirmDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirmFinalize} title="Finalize Routine Framework?" message={`Are you sure you want to finalize and save the structural framework for Grade ${selectedGrade}?`} />
      <ConfirmDialog isOpen={isTimingConfirmOpen} onClose={() => setIsTimingConfirmOpen(false)} onConfirm={handleConfirmTimingUpdate} title="Update Global School Hours?" message={`Are you sure you want to update the general school hours for all grades? Syncing globally.`} />

      {isCopyModalOpen && (
        <PortalPopup isOpen={isCopyModalOpen} onClose={() => setIsCopyModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] p-8 shadow-2xl border dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3"><div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white"><Copy size={16} /></div><h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Clone Framework</h3></div>
              <button onClick={() => setIsCopyModalOpen(false)} className="h-8 w-8 flex items-center justify-center text-slate-400 hover:bg-slate-50 rounded-lg"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
              {gradeList.filter(grade => grade !== selectedGrade && classRoutines[grade]?.isLocked).map(grade => (
                <button key={grade} onClick={() => handleReplicate(grade)} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 transition-all group">
                  <span className="text-[10px] font-black text-slate-400 group-hover:text-emerald-500 tracking-widest mb-1">Grade</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{grade}</span>
                </button>
              ))}
            </div>
          </div>
        </PortalPopup>
      )}

      {isModalOpen && (
        <PortalPopup isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[32px] p-8 shadow-2xl border dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4"><div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white"><Clock size={20} /></div><h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Add a Slot</h3></div>
              <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 flex items-center justify-center text-slate-400 hover:bg-slate-50 rounded-xl"><X size={20} /></button>
            </div>
            <div className="space-y-8">
              <div className="space-y-3"><label className="text-[11px] font-bold text-slate-400 tracking-wider ml-1">Slot Category</label><div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">{['Subject', 'Break', 'Sport'].map(t => <button key={t} onClick={() => setNewSlot({ ...newSlot, type: t.toLowerCase(), label: t === 'Sport' ? 'ECA' : '' })} className={`flex-1 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${newSlot.type === t.toLowerCase() ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>{t}</button>)}</div></div>
              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1"><label className="text-[11px] font-bold text-slate-400 tracking-wider">Duration (mins)</label><span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">{newSlot.durationMinutes}m Selected</span></div>
                <div className="flex items-center gap-4">
                  <input type="range" min="5" max="180" step="5" value={newSlot.durationMinutes} onChange={(e) => setNewSlot({ ...newSlot, durationMinutes: parseInt(e.target.value) })} className="flex-1 accent-emerald-600 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer" />
                  <input type="number" min="1" max="300" value={newSlot.durationMinutes} onChange={(e) => setNewSlot({ ...newSlot, durationMinutes: Math.max(1, parseInt(e.target.value) || 0) })} className="w-16 bg-slate-50 dark:bg-slate-800 border-none px-2 py-1.5 rounded-lg text-xs font-bold text-center dark:text-white outline-none" />
                </div>
              </div>
              {newSlot.type === 'break' && <select value={newSlot.breakType} onChange={(e) => setNewSlot({ ...newSlot, breakType: e.target.value, label: `${e.target.value} Break` })} className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-3 rounded-xl text-xs font-semibold dark:text-white"> {['Short', 'Long', 'Lunch', 'Snack'].map(v => <option key={v} value={v}>{v}</option>)} </select>}
              {newSlot.type === 'sport' && <input type="text" placeholder="Activity Label..." value={newSlot.label} onChange={(e) => setNewSlot({ ...newSlot, label: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-3 rounded-xl text-xs font-semibold dark:text-white" />}
              <button onClick={handleAddSlot} className="h-12 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm tracking-widest transition-all active:scale-[0.98]">Add Slot</button>
            </div>
          </div>
        </PortalPopup>
      )}
    </div>
  );
};

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-2"><div className={`w-2.5 h-2.5 ${color} rounded-full`} /><span className="text-[11px] font-bold text-slate-400 tracking-wider">{label}</span></div>
);

export default RoutineView;