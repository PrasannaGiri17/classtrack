import React from 'react';
import { 
  Settings2, 
  ClipboardCheck, 
  FileBarChart, 
  ShieldCheck, 
  ChevronDown, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Trophy, 
  Eye, 
  Download, 
  BarChart3 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';

const ControlView = ({
  phases,
  togglePhase,
  analyticsGrade,
  setAnalyticsGrade,
  analyticsSection,
  setAnalyticsSection,
  analyticsGradeData,
  analyticsSectionData,
  resYear,
  setResYear,
  resPhase,
  setResPhase,
  resGrade,
  setResGrade,
  resSection,
  setResSection,
  resultSearch,
  setResultSearch,
  activeResultIndex,
  handlePrev,
  handleNext,
  filteredResults,
  currentResult,
  grades,
  sections,
  years,
  initialPhases
}) => {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[48px] shadow-sm flex flex-col overflow-hidden">
        {/* Module Header */}
        <div className="p-10 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg text-white">
              <Settings2 size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Examination Control</h3>
              <p className="text-sm font-medium text-slate-400 mt-2">Administrative dashboard for marking, analytics, and certified result preview.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          {/* Section 1: Marking Portal */}
          <div className="p-10 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-8">
              <ClipboardCheck className="text-emerald-500" size={24} />
              <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Marking Portal Control</h4>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-100/50 dark:bg-slate-800/50">
                    <th className="pl-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Examination Phase</th>
                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="pr-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {phases.map(p => (
                    <tr key={p.id} className="hover:bg-white dark:hover:bg-slate-800 transition-all">
                      <td className="pl-10 py-5 font-black text-sm text-slate-700 dark:text-slate-300">{p.name}</td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                          p.status === 'Open' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 border-transparent'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="pr-10 py-5 text-right">
                        <button 
                          onClick={() => togglePhase(p.id)}
                          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            p.status === 'Open' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700'
                          }`}
                        >
                          {p.status === 'Open' ? 'Close Portal' : 'Open Portal'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Performance Analytics */}
          <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-3">
                <FileBarChart className="text-emerald-500" size={24} />
                <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">System Performance Analytics</h4>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select value={analyticsGrade} onChange={(e) => setAnalyticsGrade(e.target.value)} className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold outline-none pr-10">
                    {grades.map(g => <option key={g} value={g}>Grade {g}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                <div className="relative">
                  <select value={analyticsSection} onChange={(e) => setAnalyticsSection(e.target.value)} className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold outline-none pr-10">
                    {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-800/30 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 h-[320px] flex flex-col shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Grade Performance Ratios</p>
                <div className="flex-1"><ResponsiveContainer width="100%" height="100%"><BarChart data={analyticsGradeData}><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} stroke="#94a3b8" /><XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} /><Tooltip contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#fff', padding: '12px' }} /><Bar dataKey="average" fill="#10b981" radius={[8, 8, 0, 0]} barSize={32} /></BarChart></ResponsiveContainer></div>
              </div>
              <div className="bg-white dark:bg-slate-800/30 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 h-[320px] flex flex-col shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Sectional Averages - G{analyticsGrade}</p>
                <div className="flex-1"><ResponsiveContainer width="100%" height="100%"><BarChart data={analyticsSectionData}><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} stroke="#94a3b8" /><XAxis dataKey="section" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} /><Tooltip contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#fff', padding: '12px' }} /><Bar dataKey="average" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={32} /></BarChart></ResponsiveContainer></div>
              </div>
            </div>
          </div>

          {/* Section 3: Verified Result Preview */}
          <div className="p-10 bg-white dark:bg-slate-950/40">
            <div className="flex items-center gap-3 mb-10">
              <ShieldCheck className="text-emerald-500" size={28} />
              <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Verified Result Preview</h4>
            </div>

            <div className="flex flex-col xl:flex-row items-center justify-between gap-6 mb-8 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px]">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative min-w-[140px]">
                  <select value={resYear} onChange={e => setResYear(e.target.value)} className="appearance-none w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase outline-none pr-10 cursor-pointer">
                    {years.map(y => <option key={y} value={y}>{y} SESSION</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                <div className="relative min-w-[140px]">
                  <select value={resPhase} onChange={e => setResPhase(e.target.value)} className="appearance-none w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase outline-none pr-10 cursor-pointer">
                    {initialPhases.map(p => <option key={p.name} value={p.name}>{p.name.toUpperCase()}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                <div className="relative min-w-[110px]">
                  <select value={resGrade} onChange={e => setResGrade(e.target.value)} className="appearance-none w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase outline-none pr-10 cursor-pointer">
                    {grades.map(g => <option key={g} value={g}>GRADE {g}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                <div className="relative min-w-[110px]">
                  <select value={resSection} onChange={e => setResSection(e.target.value)} className="appearance-none w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase outline-none pr-10 cursor-pointer">
                    {sections.map(s => <option key={s} value={s}>SEC {s}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="flex items-center gap-4 w-full xl:w-auto">
                <div className="relative flex-1 xl:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" placeholder="Search ID/Name..." value={resultSearch} onChange={e => setResultSearch(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-10 py-2.5 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handlePrev} disabled={activeResultIndex === 0} className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={20} /></button>
                  <div className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeResultIndex + 1} / {filteredResults.length || 0}</div>
                  <button onClick={handleNext} disabled={activeResultIndex >= filteredResults.length - 1} className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight size={20} /></button>
                </div>
              </div>
            </div>

            {currentResult ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[48px] p-10 shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                <div className="absolute -right-20 -bottom-20 opacity-[0.03] pointer-events-none text-slate-900 dark:text-white"><Trophy size={400} /></div>

                <div className="relative z-10 flex flex-col space-y-12">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-[32px] flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 ring-4 ring-white dark:ring-slate-800">
                        <User size={48} />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">{currentResult.name}</h3>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">SID: {currentResult.studentId} • GRADE {currentResult.grade}-{currentResult.section}</p>
                        <span className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-500/10">
                          {currentResult.phase.toUpperCase()} PHASE
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button onClick={() => alert('PDF Viewer Loading...')} className="flex items-center gap-2 px-6 py-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all">
                        <Eye size={16} /> Preview PDF
                      </button>
                      <button onClick={() => alert(`Downloading Transcript: ${currentResult.name}`)} className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all">
                        <Download size={16} /> Download Official Transcript
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {Object.entries(currentResult.marks).map(([sub, mark]) => (
                      <div key={sub} className="p-5 bg-slate-50/50 dark:bg-slate-800/40 rounded-[24px] border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center group hover:border-emerald-500/30 transition-all">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 leading-none">{sub}</p>
                        <p className={`text-2xl font-black leading-none mb-1 ${mark === null ? 'text-slate-300' : 'text-slate-800 dark:text-slate-100'}`}>
                          {mark ?? '—'}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase opacity-40">/ 100</p>
                        <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${(Number(mark) >= 40) ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${mark ?? 0}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-end">
                    <div className="xl:col-span-4 grid grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Percentage</p>
                        <p className="text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{currentResult.percentage}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Grade Point</p>
                        <p className="text-4xl font-black text-indigo-600 leading-none tracking-tighter">{currentResult.gpa}</p>
                      </div>
                      <div className="col-span-2 pt-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border shadow-sm ${
                          currentResult.status === 'Passed' ? 'bg-emerald-500 text-white border-emerald-400' : 
                          currentResult.status === 'Failed' ? 'bg-red-500 text-white border-red-400' : 
                          'bg-slate-400 text-white border-slate-300'
                        }`}>
                          {currentResult.status}
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Validated by System</p>
                      </div>
                    </div>

                    <div className="xl:col-span-8 flex flex-col">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <BarChart3 size={14} className="text-emerald-500" /> Subject Performance Trend
                      </p>
                      <div className="h-[140px] w-full bg-slate-50/50 dark:bg-slate-800/20 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800/50">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={Object.entries(currentResult.marks).map(([sub, val]) => ({ name: sub, val: val || 0 }))}>
                            <Bar dataKey="val" radius={[4, 4, 0, 0]} barSize={24}>
                              {Object.values(currentResult.marks).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={(Number(entry) >= 40) ? '#10b981' : '#ef4444'} />
                              ))}
                            </Bar>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} dy={10} />
                            <Tooltip cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#fff', fontSize: '10px', padding: '8px' }} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-40 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[48px] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[32px] flex items-center justify-center text-slate-300 mb-6"><Search size={40} /></div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">No student records found matching the filters</p>
              </div>
            )}

            <div className="mt-12 flex items-center justify-center gap-3 text-slate-400 opacity-40">
              <ShieldCheck size={14} />
              <p className="text-[9px] font-bold uppercase tracking-[0.5em]">Institutional Integrity Record • Tamper-proof Certified</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlView;