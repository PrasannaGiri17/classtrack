
import React, { useState } from 'react';
// import { createPortal } from 'react-dom'; // Removed as unused
import { Plus, X, RefreshCw, ChevronDown, CheckCircle2, Layers, Info, Lock, Unlock } from 'lucide-react';
import { toast } from '../../MainSystemComponents/Toast';
import PortalPopup from '../../MainSystemComponents/PortalPopup';
import ConfirmDialog from '../../MainSystemComponents/ConfirmDialog';

const GradeView = ({ range, sectionMap, onUpdateRange, onUpdateSections, onSyncSections, gradeList }) => {
  const [isRangeModalOpen, setIsRangeModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(true); // Default to locked? Or unlocked? User didn't specify default. Let's start Unlocked usually, or Locked for safety? User said "when locked show red". Let's start Unlocked (Green).
  // Actually commonly read-only views start locked. But editing views start unlocked.
  // Let's initialize false (Unlocked).

  const [tempRange, setTempRange] = useState(range);
  const [syncCount, setSyncCount] = useState(1);

  // --- Per-Grade Edit State ---
  const [editingGrade, setEditingGrade] = useState(null);
  const [pendingCount, setPendingCount] = useState(1);

  // --- Generic Confirmation State ---
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const openConfirm = (config) => {
    setConfirmConfig(config);
    setIsConfirmOpen(true);
  };

  const getSectionLetters = (count) => {
    if (!count || count <= 0) return [];
    return Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i));
  };

  const renderSectionBadges = (count, isSmall = false) => {
    if (!count || count <= 0) return <span className="text-slate-400 font-bold">—</span>;

    const letters = getSectionLetters(count);
    const displayLimit = isSmall ? 5 : 10;
    const visibleLetters = letters.slice(0, displayLimit);
    const moreCount = count > displayLimit ? count - displayLimit : 0;

    return (
      <div className={`flex flex-wrap ${!isSmall ? 'justify-start' : 'justify-center'} gap-1 min-h-[20px]`}>
        {visibleLetters.map((letter) => (
          <span
            key={letter}
            className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-md text-[9px] font-black border border-emerald-100/50 dark:border-emerald-900/30 uppercase tracking-tighter shadow-sm animate-in zoom-in-50 duration-200"
          >
            {letter}
          </span>
        ))}
        {moreCount > 0 && (
          <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-md text-[9px] font-black border border-slate-100 dark:border-slate-700 shadow-sm uppercase tracking-tighter">
            +{moreCount}
          </span>
        )}
      </div>
    );
  };

  // --- Actions ---
  const handleSyncSections = (count) => {
    try {
      const validatedCount = Math.max(1, Math.min(10, count));

      if (onSyncSections) {
        onSyncSections(validatedCount);
      } else {
        // Fallback to loop if bulk sync is not provided (though updated SchoolManagement will provide it)
        gradeList.forEach(grade => {
          onUpdateSections(grade, validatedCount);
        });
      }

      setIsSyncModalOpen(false);
      setIsConfirmOpen(false);
      toast({ type: 'success', message: `Sections synced successfully across ${gradeList.length} grades.`, duration: 3000 });
    } catch (e) {
      toast({ type: 'error', message: 'Sync failed. Please try again.', duration: 4000 });
    }
  };

  const handleSaveRange = (from, to) => {
    try {
      onUpdateRange(from, to);
      setIsRangeModalOpen(false);
      setIsConfirmOpen(false);
      toast({ type: 'success', message: `Academic range saved.`, duration: 3000 });
    } catch (e) {
      toast({ type: 'error', message: 'Save failed. Please try again.', duration: 4000 });
    }
  };

  const handleUpdateGradeSections = () => {
    if (!editingGrade) return;
    try {
      onUpdateSections(editingGrade, pendingCount);
      toast({
        type: 'success',
        message: `Sections updated: Grade ${editingGrade} → ${pendingCount}`,
        duration: 4000
      });
      setEditingGrade(null);
      setIsConfirmOpen(false);
    } catch (e) {
      toast({ type: 'error', message: 'Update failed. Please try again.', duration: 4000 });
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">Grades & Sections</h2>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-2 mt-2 inline-flex">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Span:</span>
            <span className="text-xs font-bold text-emerald-600">Grade {range.from} — {range.to}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Lock Toggle */}
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={`h-11 px-6 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 ${isLocked
              ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
              }`}
          >
            {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
            {isLocked ? "Locked" : "Unlocked"}
          </button>

          <button
            onClick={() => !isLocked && setIsSyncModalOpen(true)}
            disabled={isLocked}
            className={`h-11 px-5 border rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 group ${isLocked
              ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300 text-slate-600 dark:text-slate-300"
              }`}
          >
            <RefreshCw size={16} className={!isLocked ? "group-hover:rotate-180 transition-transform duration-500" : ""} />
            Sync Sections
          </button>

          <button
            onClick={() => !isLocked && setIsRangeModalOpen(true)}
            disabled={isLocked}
            className={`h-11 px-6 rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2 ${isLocked
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white"
              }`}
          >
            <Plus size={18} /> Define Academic Range
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {gradeList.map((grade) => (
          <div
            key={grade}
            onClick={() => {
              if (isLocked) return;
              setEditingGrade(grade);
              setPendingCount(sectionMap[grade] || 1);
            }}
            className={`bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm transition-all text-center relative ${isLocked
              ? "opacity-60 cursor-not-allowed"
              : "group hover:border-emerald-500/30 hover:scale-[1.02] cursor-pointer"
              }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg mb-5 mx-auto transition-transform ${isLocked ? "bg-slate-400" : "bg-emerald-600 group-hover:scale-110"}`}>
              {grade}
            </div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight mb-3 leading-none">Grade {grade}</h4>
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">Sections</p>
              <div className="mt-1">
                {renderSectionBadges(sectionMap[grade], true)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 1. PER-GRADE SECTION MODAL */}
      <PortalPopup isOpen={editingGrade !== null} onClose={() => setEditingGrade(null)}>
        <div className="relative bg-white dark:bg-slate-900 w-[95vw] max-w-3xl rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col pointer-events-auto">
          <div className="px-10 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-600/20">
                <Layers size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-none tracking-tight">Grade {editingGrade} Sections</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Section Configuration</p>
              </div>
            </div>
            <button onClick={() => setEditingGrade(null)} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition-all"><X size={24} /></button>
          </div>

          <div className="p-8 space-y-8 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Sections (1-10)</label>
                  <div className="relative group">
                    <select
                      value={pendingCount}
                      onChange={(e) => setPendingCount(parseInt(e.target.value))}
                      className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-black dark:text-white focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer shadow-inner dark:[color-scheme:dark]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{n} {n === 1 ? 'Section' : 'Sections'}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500" />
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 flex items-start gap-3">
                  <Info size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[9px] font-bold text-emerald-800 dark:text-emerald-400 leading-relaxed uppercase tracking-wider">
                    Selecting a new section count will re-index student rosters for this grade level.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Live Preview</label>
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-inner flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-lg font-black text-white shadow-lg">
                      {editingGrade}
                    </div>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Assigned</p>
                      <p className="text-base font-black text-slate-900 dark:text-white leading-none">{pendingCount} Labels</p>
                    </div>
                  </div>
                  <div className="w-full pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                    {renderSectionBadges(pendingCount)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-10 py-6 bg-slate-50/50 dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              onClick={() => setEditingGrade(null)}
              className="px-6 py-3 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Discard
            </button>
            <button
              onClick={() => openConfirm({
                title: 'Confirm Section Update',
                message: `Change Grade ${editingGrade} sections to ${pendingCount}?`,
                onConfirm: handleUpdateGradeSections
              })}
              className="flex items-center gap-2 px-10 py-3 bg-emerald-600 text-white rounded-[18px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
            >
              <CheckCircle2 size={16} /> Update Sections
            </button>
          </div>
        </div>
      </PortalPopup>

      {/* 2. SYNC SECTIONS MODAL */}
      <PortalPopup isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)}>
        <div className="bg-white dark:bg-slate-900 w-[95vw] max-w-xl rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col pointer-events-auto">
          <div className="px-8 py-5 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <RefreshCw size={22} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Sync Sections</h3>
            </div>
            <button onClick={() => setIsSyncModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition-all"><X size={24} /></button>
          </div>

          <div className="p-6 space-y-6">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-4 mb-4">
                <Info size={18} className="text-emerald-500 mt-1 shrink-0" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                  Bulk synchronization will override the section count for <span className="text-emerald-600 font-black">all active grades</span> in your system simultaneously. This is useful for school-wide re-organizations.
                </p>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Universal Section Count (1-10)</label>
                <div className="relative group">
                  <select
                    value={syncCount}
                    onChange={(e) => setSyncCount(parseInt(e.target.value))}
                    className="appearance-none w-full bg-white dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-base font-black dark:text-white focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer shadow-inner dark:[color-scheme:dark]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{n} Sections</option>)}
                  </select>
                  <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => setIsSyncModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl font-black text-[10px] text-slate-500 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => openConfirm({
                  title: 'Confirm Sync',
                  message: `Sync sections for all grades to ${syncCount} now?`,
                  onConfirm: () => handleSyncSections(syncCount)
                })}
                className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
              >
                Start Sync
              </button>
            </div>
          </div>
        </div>
      </PortalPopup>

      {/* 3. DEFINE RANGE MODAL */}
      <PortalPopup isOpen={isRangeModalOpen} onClose={() => setIsRangeModalOpen(false)}>
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[48px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 pointer-events-auto">
          <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Define Academic Range</h3>
            <button onClick={() => setIsRangeModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 transition-all"><X size={20} /></button>
          </div>
          <div className="p-10 space-y-10">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Grade</label>
                <div className="relative group">
                  <select
                    value={tempRange.from}
                    onChange={(e) => setTempRange({ ...tempRange, from: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none px-6 py-4 rounded-2xl text-base font-black outline-none cursor-pointer dark:text-white shadow-inner appearance-none dark:[color-scheme:dark]"
                  >
                    {[...Array(13)].map((_, i) => <option key={i + 1} value={i + 1} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{i + 1}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Grade</label>
                <div className="relative group">
                  <select
                    value={tempRange.to}
                    onChange={(e) => setTempRange({ ...tempRange, to: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none px-6 py-4 rounded-2xl text-base font-black outline-none cursor-pointer dark:text-white shadow-inner appearance-none dark:[color-scheme:dark]"
                  >
                    {[...Array(13)].map((_, i) => <option key={i + 1} value={i + 1} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{i + 1}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => setIsRangeModalOpen(false)}
                className="w-full sm:flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 rounded-xl transition-all"
              >
                Discard
              </button>
              <button
                onClick={() => openConfirm({
                  title: 'Confirm Range',
                  message: `Apply academic range: Grade ${tempRange.from} → Grade ${tempRange.to}?`,
                  onConfirm: () => handleSaveRange(tempRange.from, tempRange.to)
                })}
                className="w-full sm:flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20"
              >
                Save Range
              </button>
            </div>
          </div>
        </div>
      </PortalPopup>

      {/* REUSABLE CONFIRMATION DIALOG */}
      {confirmConfig && (
        <ConfirmDialog
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={confirmConfig.onConfirm}
          title={confirmConfig.title}
          message={confirmConfig.message}
        />
      )}
    </div>
  );
};

export default GradeView;