import React, { useState } from 'react';
import { Plus, X, RefreshCw } from 'lucide-react';

const GradeView = ({ range, sectionMap, onUpdateRange, onUpdateSections, gradeList }) => {
  const [isRangeModalOpen, setIsRangeModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [tempRange, setTempRange] = useState(range);
  const [syncCount, setSyncCount] = useState(1);

  const getSectionLetters = (count) => {
    if (!count || count <= 0) return [];
    return Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i));
  };

  const renderSectionBadges = (count) => {
    if (!count || count <= 0) return <span className="text-slate-400 font-bold">—</span>;
    
    const letters = getSectionLetters(count);
    const displayLimit = count === 6 ? 6 : 5;
    const visibleLetters = letters.slice(0, displayLimit);
    const moreCount = count > 6 ? count - 5 : 0;

    return (
      <div className="flex flex-wrap justify-center gap-1.5 min-h-[24px]">
        {visibleLetters.map((letter) => (
          <span 
            key={letter} 
            className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-md text-[10px] font-black border border-emerald-100/50 dark:border-emerald-900/30 uppercase tracking-tighter shadow-sm"
          >
            {letter}
          </span>
        ))}
        {moreCount > 0 && (
          <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-md text-[10px] font-black border border-slate-100 dark:border-slate-700 shadow-sm uppercase tracking-tighter">
            +{moreCount} more
          </span>
        )}
      </div>
    );
  };

  const handleSyncApply = () => {
    const validatedCount = Math.max(1, Math.min(10, syncCount));
    gradeList.forEach(grade => {
      onUpdateSections(grade, validatedCount);
    });
    setIsSyncModalOpen(false);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">Grade Matrix</h2>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-2 mt-2 inline-flex">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Span:</span>
            <span className="text-xs font-bold text-emerald-600">Grade {range.from} — {range.to}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button 
            onClick={() => setIsSyncModalOpen(true)} 
            className="h-11 px-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 group"
          >
            <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
            Sync Sections
          </button>
          <button 
            onClick={() => setIsRangeModalOpen(true)} 
            className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Define Academic Range
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {gradeList.map((grade) => (
          <div key={grade} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-emerald-500/30 transition-all text-center">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg mb-5 mx-auto group-hover:scale-110 transition-transform">
              {grade}
            </div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight mb-3 leading-none">Grade {grade}</h4>
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">Sections</p>
              <div className="mt-1">
                {renderSectionBadges(sectionMap[grade])}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isRangeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Academic Span</h3>
              <button onClick={() => setIsRangeModalOpen(false)} className="h-10 w-10 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-all text-slate-400"><X size={20} /></button>
            </div>
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">From Grade</label>
                  <select 
                    value={tempRange.from} 
                    onChange={(e) => setTempRange({...tempRange, from: parseInt(e.target.value)})} 
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-3 rounded-xl text-sm font-bold outline-none cursor-pointer dark:text-white"
                  >
                    {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">To Grade</label>
                  <select 
                    value={tempRange.to} 
                    onChange={(e) => setTempRange({...tempRange, to: parseInt(e.target.value)})} 
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none px-4 py-3 rounded-xl text-sm font-bold outline-none cursor-pointer dark:text-white"
                  >
                    {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                  </select>
                </div>
              </div>
              <button 
                onClick={() => { onUpdateRange(tempRange.from, tempRange.to); setIsRangeModalOpen(false); }}
                className="h-12 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg shadow-emerald-200 dark:shadow-none"
              >
                Sync Range
              </button>
            </div>
          </div>
        </div>
      )}

      {isSyncModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center">
                  <RefreshCw size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Sync Sections</h3>
              </div>
              <button onClick={() => setIsSyncModalOpen(false)} className="h-10 w-10 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-all text-slate-400"><X size={20} /></button>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Total Sections (1-10)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    min={1} 
                    max={10} 
                    value={syncCount} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) setSyncCount(Math.max(1, Math.min(10, val)));
                      else if (e.target.value === "") setSyncCount("");
                    }}
                    onBlur={() => { if (syncCount === "") setSyncCount(1); }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none px-5 py-4 rounded-xl text-base font-bold outline-none focus:ring-2 focus:ring-emerald-100 shadow-inner dark:text-white"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase tracking-wider pointer-events-none">Limit 10</span>
                </div>
                <p className="text-[10px] font-medium text-slate-400 leading-relaxed px-1">This will apply the same section count to <span className="text-emerald-600 font-bold">all grades</span> currently in your framework.</p>
              </div>
              
              <div className="flex items-center gap-3 pt-2">
                <button 
                  onClick={() => setIsSyncModalOpen(false)}
                  className="h-12 flex-1 px-4 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSyncApply}
                  className="h-12 flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg shadow-emerald-100 dark:shadow-none"
                >
                  Apply Sync
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeView;