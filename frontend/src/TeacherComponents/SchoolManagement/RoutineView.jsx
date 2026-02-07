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
  ChevronDown
} from 'lucide-react';
import ConfirmDialog from '../../MainSystemComponents/ConfirmDialog';
import { toast } from '../../MainSystemComponents/Toast';

const RoutineView = ({ schoolHours, onUpdateHours, classRoutines, onUpdateRoutines, onFinalize, gradeList }) => {
  const [selectedGrade, setSelectedGrade] = useState(gradeList[0] || "1");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({ type: 'subject', label: '', durationMinutes: 45, breakType: 'Short' });

  const getMetrics = () => {
    const gradeData = classRoutines[selectedGrade];
    const isLocked = gradeData?.isLocked || false;
    const slots = Array.isArray(gradeData) ? gradeData : (gradeData?.slots || []);

    const startMins = parseInt(schoolHours.start.split(":")[0]) * 60 + parseInt(schoolHours.start.split(":")[1]);
    const endMins = parseInt(schoolHours.end.split(":")[0]) * 60 + parseInt(schoolHours.end.split(":")[1]);
    const total = endMins - startMins;
    const used = slots.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    return { total, used, remaining: total - used, percent: Math.min(100, (used / total) * 100), isValid: total === used && used > 0 };
  };

  const isLocked = classRoutines[selectedGrade]?.isLocked || false;
  const toggleLock = () => {
    onUpdateRoutines(selectedGrade, (classRoutines[selectedGrade]?.slots || []), !isLocked);
    toast({ type: 'info', message: `Routine ${!isLocked ? 'Locked' : 'Unlocked'} locally. Click Finalize to save changes.`, duration: 2500 });
  };

  const handleConfirmFinalize = async () => {
    setIsConfirmOpen(false);
    await onFinalize(selectedGrade);
  };

  const handleReplicate = (sourceGrade) => {
    const sourceData = classRoutines[sourceGrade];
    if (sourceData && sourceData.slots) {
      onUpdateRoutines(selectedGrade, sourceData.slots, false); // Copy as unlocked
      setIsCopyModalOpen(false);
      toast({ type: 'success', message: `Framework copied from Grade ${sourceGrade}. Click Finalize to save.`, duration: 3000 });
    }
  };

  const metrics = getMetrics();

  const handleAddSlot = () => {
    const gradeData = classRoutines[selectedGrade];
    const slots = Array.isArray(gradeData) ? gradeData : (gradeData?.slots || []);

    const label = newSlot.type === 'subject'
      ? `Instructional Period ${slots.filter(s => s.type === 'subject').length + 1}`
      : newSlot.label || 'New Slot';
    const updated = [...slots, { ...newSlot, label, id: Date.now().toString() }];
    onUpdateRoutines(selectedGrade, updated, isLocked);
    setIsModalOpen(false);
  };

  const calculateTime = (index, isEnd = false) => {
    let mins = parseInt(schoolHours.start.split(":")[0]) * 60 + parseInt(schoolHours.start.split(":")[1]);
    const gradeData = classRoutines[selectedGrade];
    const slots = Array.isArray(gradeData) ? gradeData : (gradeData?.slots || []);

    for (let i = 0; i < (isEnd ? index + 1 : index); i++) {
      mins += (slots[i]?.durationMinutes || 0);
    }
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${(h % 12 || 12).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">Routine Structure</h2>
          <p className="text-sm font-medium text-slate-500">Define structural framework without subject or teacher assignments</p>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleLock} className={`h-11 px-6 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg transition-all flex items-center gap-2 active:scale-95 ${isLocked ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'}`}>
            {isLocked ? (
              <>
                <Lock size={18} /> Locked
              </>
            ) : (
              <>
                <Unlock size={18} /> Unlocked
              </>
            )}
          </button>
          <button disabled={isLocked} onClick={() => setIsModalOpen(true)} className={`h-11 px-6 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg transition-all flex items-center gap-2 ${isLocked ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10 active:scale-[0.98]'}`}>
            <Plus size={18} /> Add Framework Slot
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Operating Span</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start</label>
              <input
                type="time"
                disabled={isLocked}
                value={schoolHours.start}
                onChange={(e) => onUpdateHours({ ...schoolHours, start: e.target.value })}
                className={`w-full bg-slate-50 dark:bg-slate-800 border-none px-3 py-2 rounded-lg text-sm font-semibold outline-none dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
            <div className="w-4 h-px bg-slate-200 mt-5 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End</label>
              <input
                type="time"
                disabled={isLocked}
                value={schoolHours.end}
                onChange={(e) => onUpdateHours({ ...schoolHours, end: e.target.value })}
                className={`w-full bg-slate-50 dark:bg-slate-800 border-none px-3 py-2 rounded-lg text-sm font-semibold outline-none dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Day Progress (G{selectedGrade})</p>
            {metrics.isValid ? <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1.5"><CheckCircle2 size={12} /> Frame Locked</span> : <span className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-1.5"><AlertTriangle size={12} /> {metrics.remaining > 0 ? 'Gaps' : 'Overflow'}</span>}
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
          <button key={grade} onClick={() => setSelectedGrade(grade)} className={`flex-1 min-w-[80px] py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all ${selectedGrade === grade ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>Grade {grade}</button>
        ))}
      </div>


      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-slate-400 uppercase font-bold text-[11px] tracking-widest"><History size={14} /> Sequence Framework</div>
          <button
            disabled={isLocked}
            onClick={() => setIsCopyModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isLocked ? 'opacity-20 cursor-not-allowed' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}
          >
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
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Framework Empty</p>
                </div>
              );
            }

            return slots.map((slot, index) => (
              <div key={slot.id} className="group flex items-center gap-6 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:border-emerald-500/20 transition-all">
                <div className="w-[180px] shrink-0 border-r dark:border-slate-800 pr-6">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white leading-none">
                    {calculateTime(index).split(' ')[0]} <span className="text-[10px] opacity-40">{calculateTime(index).split(' ')[1]}</span>
                    <ArrowRightIcon size={12} className="text-slate-300 mx-1" />
                    {calculateTime(index, true).split(' ')[0]} <span className="text-[10px] opacity-40">{calculateTime(index, true).split(' ')[1]}</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{slot.durationMinutes} Min Block</p>
                </div>
                <div className="flex-1 flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${slot.type === 'break' ? 'bg-amber-500/10 text-amber-500' : slot.type === 'sport' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-600/10 text-emerald-600'}`}>
                    {slot.type === 'break' ? <Coffee size={18} /> : slot.type === 'sport' ? <Trophy size={18} /> : <BookOpen size={18} />}
                  </div>
                  <div className="truncate">
                    <h4 className="text-[14px] font-bold text-slate-800 dark:text-slate-200 truncate uppercase tracking-tight leading-none mb-1">{slot.label}</h4>
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider leading-none">{slot.type === 'break' ? `${slot.breakType} Session` : slot.type === 'sport' ? 'Allocated Activity' : 'Instructional Block'}</p>
                  </div>
                </div>
                <button
                  disabled={isLocked}
                  onClick={() => onUpdateRoutines(selectedGrade, slots.filter(s => s.id !== slot.id), isLocked)}
                  className={`h-9 w-9 flex items-center justify-center text-slate-300 transition-all ${isLocked ? 'opacity-20 cursor-not-allowed' : 'hover:text-red-500'}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ));
          })()}
        </div>
      </div>

      <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex gap-6">
          <LegendItem color="bg-emerald-600" label="Instruction" /><LegendItem color="bg-amber-500" label="Breaks" /><LegendItem color="bg-emerald-400" label="Sports" />
        </div>
        <button
          disabled={!metrics.isValid}
          onClick={() => setIsConfirmOpen(true)}
          className={`h-12 px-10 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all ${metrics.isValid ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 shadow-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
        >
          Finalize Framework
        </button>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmFinalize}
        title="Finalize Routine Framework?"
        message={`Are you sure you want to finalize and save the structural framework for Grade ${selectedGrade}? This will overwrite previous settings for this grade.`}
      />

      {isCopyModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] p-8 shadow-2xl border dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3"><div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white"><Copy size={16} /></div><h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">Clone Framework</h3></div>
              <button onClick={() => setIsCopyModalOpen(false)} className="h-8 w-8 flex items-center justify-center text-slate-400 hover:bg-slate-50 rounded-lg"><X size={18} /></button>
            </div>
            <p className="text-xs font-medium text-slate-500 mb-6 leading-relaxed">Choose a grade to copy its <span className="text-emerald-600 font-bold uppercase tracking-wider">finalized framework</span> from.</p>
            <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
              {gradeList
                .filter(grade => grade !== selectedGrade && classRoutines[grade]?.isLocked)
                .map(grade => (
                  <button
                    key={grade}
                    onClick={() => handleReplicate(grade)}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-2 border-transparent hover:border-emerald-500/20 transition-all group"
                  >
                    <span className="text-[10px] font-black text-slate-400 group-hover:text-emerald-500 uppercase tracking-widest mb-1">Grade</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{grade}</span>
                  </button>
                ))}
              {gradeList.filter(grade => grade !== selectedGrade && classRoutines[grade]?.isLocked).length === 0 && (
                <div className="col-span-2 py-8 flex flex-col items-center text-center opacity-40 italic">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Finalized Frameworks Found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[32px] p-8 shadow-2xl border dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4"><div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white"><Clock size={20} /></div><h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Integrate Slot</h3></div>
              <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 flex items-center justify-center text-slate-400 hover:bg-slate-50 rounded-xl"><X size={20} /></button>
            </div>
            <div className="space-y-8">
              <div className="space-y-3"><label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Slot Category</label><div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">{['subject', 'break', 'sport'].map(t => <button key={t} onClick={() => setNewSlot({ ...newSlot, type: t, label: t === 'sport' ? 'Physical Activity' : '' })} className={`flex-1 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${newSlot.type === t ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>{t}</button>)}</div></div>
              <div className="space-y-3"><label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Duration ({newSlot.durationMinutes}m)</label><input type="range" min="5" max="180" step="5" value={newSlot.durationMinutes} onChange={(e) => setNewSlot({ ...newSlot, durationMinutes: parseInt(e.target.value) })} className="w-full accent-emerald-600 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer" /></div>
              {newSlot.type === 'break' && <select value={newSlot.breakType} onChange={(e) => setNewSlot({ ...newSlot, breakType: e.target.value, label: `${e.target.value} Break` })} className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-3 rounded-xl text-xs font-semibold dark:text-white"> {['Short', 'Long', 'Lunch', 'Snack'].map(v => <option key={v} value={v}>{v}</option>)} </select>}
              {newSlot.type === 'sport' && <input type="text" placeholder="Activity Label..." value={newSlot.label} onChange={(e) => setNewSlot({ ...newSlot, label: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-3 rounded-xl text-xs font-semibold dark:text-white" />}
              <button onClick={handleAddSlot} className="h-12 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-emerald-100 dark:shadow-none transition-all active:scale-[0.98]">Integrate Framework Slot</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-2"><div className={`w-2.5 h-2.5 ${color} rounded-full`} /><span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span></div>
);

export default RoutineView;