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
  togglePublish,
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
  initialPhases,
  onDownloadPDF,
  previewMode,
  setPreviewMode
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
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Examination Control</h3>
              <p className="text-sm font-medium text-slate-400 mt-2">Administrative dashboard for marking, analytics, and certified result preview.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          {/* Section 1: Marking Portal */}
          <div className="p-10 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="text-emerald-500" size={24} />
                <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Marking Portal Control</h4>
              </div>
              <div className="relative min-w-[120px]">
                <select
                  value={resYear}
                  onChange={e => setResYear(e.target.value)}
                  className="appearance-none w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none pr-10 cursor-pointer shadow-sm"
                >
                  {years.map(y => <option key={y} value={y}>{y} BS Cycle</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-emerald-500" />
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-100/50 dark:bg-slate-800/50">
                    <th className="pl-10 py-6 text-[13px] font-black text-slate-400 tracking-tight text-left whitespace-nowrap">Examination Phase</th>
                    <th className="px-6 py-6 text-[13px] font-black text-slate-400 tracking-tight text-center">Status</th>
                    <th className="px-6 py-6 text-[13px] font-black text-slate-400 tracking-tight text-center">Portal Action</th>
                    <th className="px-6 py-6 text-[13px] font-black text-slate-400 tracking-tight text-center">Result Status</th>
                    <th className="px-10 py-6 text-[13px] font-black text-slate-400 tracking-tight text-center whitespace-nowrap">Result Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {phases.map(p => (
                    <tr key={p.id} className="hover:bg-white dark:hover:bg-slate-800 transition-all">
                      <td className="pl-10 py-5 font-black text-sm text-slate-700 dark:text-slate-300 text-left whitespace-nowrap">{p.name}</td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-6 py-2 rounded-2xl text-[11px] font-black tracking-tight border transition-all ${p.status === 'Open' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 border-transparent'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center whitespace-nowrap">
                        <button
                          onClick={() => togglePhase(p.id)}
                          className={`px-8 py-3 rounded-2xl text-[11px] font-black tracking-tight transition-all shadow-lg active:scale-95 ${p.status === 'Open' ? 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600' : 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700'}`}
                        >
                          {p.status === 'Open' ? 'Close Portal' : 'Open Portal'}
                        </button>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-6 py-2 rounded-2xl text-[11px] font-black tracking-tight border transition-all ${p.publishStatus === 'Published' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 border-transparent'}`}>
                          {p.publishStatus}
                        </span>
                      </td>
                      <td className="px-10 py-5 text-center whitespace-nowrap">
                        <button
                          onClick={() => togglePublish(p.id)}
                          className={`px-8 py-3 rounded-2xl text-[11px] font-black tracking-tight transition-all shadow-lg active:scale-95 ${p.publishStatus === 'Published' ? 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600' : 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700'}`}
                        >
                          {p.publishStatus === 'Published' ? 'Hide Results' : 'Publish Results'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Performance Analytics
          <div className="p-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-3">
                <FileBarChart className="text-emerald-500" size={24} />
                <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Performance Analytics</h4>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[120px]">
                  <select
                    value={resYear}
                    onChange={e => setResYear(e.target.value)}
                    className="appearance-none w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none pr-10 cursor-pointer shadow-sm"
                  >
                    {years.map(y => <option key={y} value={y}>{y} BS Cycle</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                <div className="relative">
                  <select value={analyticsGrade} onChange={(e) => setAnalyticsGrade(e.target.value)} className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none pr-10">
                    {grades.map(g => <option key={g} value={g}>Grade {g}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                <div className="relative">
                  <select value={analyticsSection} onChange={(e) => setAnalyticsSection(e.target.value)} className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none pr-10">
                    {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-800/30 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 h-[320px] flex flex-col shadow-sm">
                <p className="text-[10px] font-black text-slate-400 tracking-tight mb-6">Grade Performance Ratios</p>
                <div className="flex-1"><ResponsiveContainer width="100%" height="100%"><BarChart data={analyticsGradeData}><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} stroke="#94a3b8" /><XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} /><Tooltip contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#fff', padding: '12px' }} /><Bar dataKey="average" fill="#10b981" radius={[8, 8, 0, 0]} barSize={32} /></BarChart></ResponsiveContainer></div>
              </div>
              <div className="bg-white dark:bg-slate-800/30 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 h-[320px] flex flex-col shadow-sm">
                <p className="text-[10px] font-black text-slate-400 tracking-tight mb-6">Sectional Averages - G{analyticsGrade}</p>
                <div className="flex-1"><ResponsiveContainer width="100%" height="100%"><BarChart data={analyticsSectionData}><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.05} stroke="#94a3b8" /><XAxis dataKey="section" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} /><Tooltip contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#fff', padding: '12px' }} /><Bar dataKey="average" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={32} /></BarChart></ResponsiveContainer></div>
              </div>
            </div>
          </div>
          */}

          {/* Section 3: Verified Result Preview */}
          <div className="p-10 bg-white dark:bg-slate-950/40">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-emerald-500" size={28} />
                <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Check Students Result</h4>
              </div>

              {/* View Switcher */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner group/switcher">
                <button
                  onClick={() => setPreviewMode('individual')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all duration-300 ${previewMode === 'individual' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-md scale-100' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 scale-95'}`}
                >
                  <User size={14} /> INDIVIDUAL
                </button>
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                <button
                  onClick={() => setPreviewMode('list')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${previewMode === 'list' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-md scale-100' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 scale-95'}`}
                >
                  <ClipboardCheck size={14} /> Classwise Lists
                </button>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row items-center justify-between gap-6 mb-8 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px]">
              <div className="flex flex-wrap items-center gap-4">
                {/* Year Selection Dropdown */}
                <div className="relative min-w-[110px]">
                  <select
                    value={resYear}
                    onChange={e => setResYear(e.target.value)}
                    className="appearance-none w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl text-[10px] font-black text-slate-900 dark:text-white tracking-tight outline-none pr-10 cursor-pointer"
                  >
                    {years.map(y => <option key={y} value={y}>{y} BS</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                <div className="relative min-w-[140px]">
                  <select value={resPhase} onChange={e => setResPhase(e.target.value)} className="appearance-none w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl text-[10px] font-black text-slate-900 dark:text-white tracking-tight outline-none pr-10 cursor-pointer">
                    {initialPhases.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                {/* Grade and Section Selection - Only for List mode */}
                {previewMode === 'list' && (
                  <>
                    <div className="relative min-w-[110px]">
                      <select
                        value={resGrade}
                        onChange={e => setResGrade(e.target.value)}
                        className="appearance-none w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl text-[10px] font-black text-slate-900 dark:text-white tracking-tight outline-none pr-10 cursor-pointer"
                      >
                        {grades.map(g => <option key={g} value={g}>Grade {g}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>

                    <div className="relative min-w-[130px]">
                      <select
                        value={resSection}
                        onChange={e => setResSection(e.target.value)}
                        className="appearance-none w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl text-[10px] font-black text-slate-900 dark:text-white tracking-tight outline-none pr-10 cursor-pointer"
                      >
                        <option value="All">All Sections</option>
                        {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </>
                )}
              </div>

              {previewMode === 'individual' && (
                <div className="flex items-center gap-4 w-full xl:w-auto">
                  <div className="relative flex-1 xl:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Search ID/Name..." value={resultSearch} onChange={e => setResultSearch(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-10 py-2.5 rounded-xl text-[10px] font-black text-slate-900 dark:text-white tracking-tight outline-none focus:ring-2 focus:ring-emerald-500/20" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrev} disabled={activeResultIndex === 0} className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={20} /></button>
                    <div className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black text-slate-400 tracking-tight">{activeResultIndex + 1} / {filteredResults.length || 0}</div>
                    <button onClick={handleNext} disabled={activeResultIndex >= filteredResults.length - 1} className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight size={20} /></button>
                  </div>
                </div>
              )}

              {previewMode === 'list' && (
                <div className="flex-1 xl:max-w-md relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" placeholder="Filter list by ID/Name..." value={resultSearch} onChange={e => setResultSearch(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-10 py-2.5 rounded-xl text-[10px] font-black text-slate-900 dark:text-white tracking-tight outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
              )}
            </div>

            {previewMode === 'individual' ? (
              currentResult ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[48px] p-10 shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                  <div className="absolute -right-20 -bottom-20 opacity-[0.03] pointer-events-none text-slate-900 dark:text-white"><Trophy size={400} /></div>

                  <div className="relative z-10 flex flex-col space-y-12">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                      <div className="flex items-center gap-6">
                        <div className="w-28 h-28 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-[36px] overflow-hidden flex items-center justify-center shadow-2xl shadow-emerald-500/30 ring-4 ring-white dark:ring-slate-800">
                          {currentResult.image ? (
                            <img
                              src={(currentResult.image.startsWith('http') || currentResult.image.startsWith('data:'))
                                ? currentResult.image
                                : `http://localhost:7000/${currentResult.image.replace(/\\/g, '/')}`}
                              alt={currentResult.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={56} className="text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">{currentResult.name}</h3>
                          <p className="text-sm font-bold text-slate-400 tracking-tight mb-4">SID: {currentResult.studentId} • Grade {currentResult.grade}-{currentResult.section}</p>
                          <span className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 text-[10px] font-black tracking-tight rounded-xl border border-emerald-500/10">
                            {currentResult.phase}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onDownloadPDF(currentResult)}
                          className="flex items-center gap-2 px-10 py-5 bg-emerald-600 text-white rounded-[24px] text-[11px] font-black tracking-tight shadow-2xl shadow-emerald-500/30 hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          <Download size={18} /> Download Official Transcript
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                      {Object.entries(currentResult.marks).map(([sub, data]) => (
                        <div key={sub} className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[32px] border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center group hover:border-indigo-500/30 transition-all shadow-sm">
                          <p className="text-[10px] font-black text-slate-400 tracking-tight mb-4 leading-none captialize">{sub}</p>
                          <p className={`text-4xl font-black leading-none mb-2 ${!data ? 'text-slate-300' : 'text-slate-800 dark:text-slate-100'}`}>
                            {data ? data.total : '—'}
                          </p>
                          <div className="flex items-center gap-3 mt-4">
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] font-black text-emerald-500 captialize">Theory</span>
                              <span className="text-sm font-black text-emerald-600">{data?.theory || 0}</span>
                            </div>
                            <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800" />
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] font-black text-indigo-500 captialize">Prac</span>
                              <span className="text-sm font-black text-indigo-600">{data?.practical || 0}</span>
                            </div>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-6 overflow-hidden flex">
                            <div
                              className="h-full bg-emerald-500 transition-all duration-1000"
                              style={{ width: `${(data?.theory || 0)}%` }}
                            />
                            <div
                              className="h-full bg-indigo-500 transition-all duration-1000"
                              style={{ width: `${(data?.practical || 0)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-end">
                      {/* Summary card — only shown when every subject has a published result */}
                      {(() => {
                        const allSubjectsPublished = Object.values(currentResult.marks).every(data => data != null);
                        return (
                          <div className="xl:col-span-4 grid grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800">
                            {allSubjectsPublished ? (
                              <>
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 tracking-tight mb-1">Percentage</p>
                                  <p className="text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{currentResult.percentage}%</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-black text-slate-400 tracking-tight mb-1">Grade Point</p>
                                  <p className="text-4xl font-black text-indigo-600 leading-none tracking-tighter">{currentResult.gpa}</p>
                                </div>
                                <div className="col-span-2 pt-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                  <div className={`px-5 py-2 rounded-xl text-[11px] font-black tracking-tight border shadow-sm ${currentResult.status === 'Passed' ? 'bg-emerald-500 text-white border-emerald-400' :
                                    currentResult.status === 'Failed' ? 'bg-red-500 text-white border-red-400' :
                                      'bg-slate-400 text-white border-slate-300'
                                    }`}>
                                    {currentResult.status}
                                  </div>
                                  <p className="text-[9px] font-bold text-slate-400 tracking-tight">Validated by System</p>
                                </div>
                              </>
                            ) : (
                              <div className="col-span-2 flex flex-col items-center justify-center py-4 gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                                  <span className="text-xl">⏳</span>
                                </div>
                                <p className="text-[10px] font-black text-slate-400 tracking-tight text-center leading-relaxed">
                                  Results pending<br />
                                  <span className="text-amber-500">Not all subjects published</span>
                                </p>
                                <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 tracking-tight">Awaiting all subject results</p>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      <div className="xl:col-span-8 flex flex-col">
                        <p className="text-[11px] font-black text-slate-400 tracking-tight mb-6 flex items-center gap-2">
                          <BarChart3 size={14} className="text-emerald-500" /> Subject Performance Trend
                        </p>
                        <div className="h-[140px] w-full bg-slate-50/50 dark:bg-slate-800/20 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800/50">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={Object.entries(currentResult.marks).map(([sub, val]) => ({ name: sub, val: val?.total || 0 }))}>
                              <Bar dataKey="val" radius={[4, 4, 0, 0]} barSize={24}>
                                {Object.values(currentResult.marks).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={(Number(entry?.total) >= 40) ? '#10b981' : '#ef4444'} />
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
                  <p className="text-[11px] font-black text-slate-400 tracking-tight">No student records found matching the filters</p>
                </div>
              )
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[48px] overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50">
                        <th className="pl-10 py-6 text-[10px] font-black text-slate-400 tracking-widest uppercase">Rank</th>
                        <th className="px-6 py-6 text-[10px] font-black text-slate-400 tracking-widest uppercase">Student Identity</th>
                        <th className="px-6 py-6 text-[10px] font-black text-slate-400 tracking-widest uppercase text-center">Class / Grade</th>
                        <th className="px-6 py-6 text-[10px] font-black text-slate-400 tracking-widest uppercase text-center">GPA</th>
                        <th className="px-6 py-6 text-[10px] font-black text-slate-400 tracking-widest uppercase text-center">Percentage</th>
                        <th className="pr-10 py-6 text-[10px] font-black text-slate-400 tracking-widest uppercase text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {[...filteredResults]
                        .sort((a, b) => b.percentage - a.percentage)
                        .map((student, index) => (
                          <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group/row">
                            <td className="pl-10 py-5">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border transition-all ${index === 0 ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                                index === 1 ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 shadow-sm' :
                                  index === 2 ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' :
                                    'bg-slate-50 dark:bg-slate-800 text-slate-400 border-transparent'
                                }`}>
                                {index + 1}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 group-hover/row:ring-2 group-hover/row:ring-emerald-500/50 transition-all">
                                  {student.image ? (
                                    <img
                                      src={(student.image.startsWith('http') || student.image.startsWith('data:'))
                                        ? student.image
                                        : `http://localhost:7000/${student.image.replace(/\\/g, '/')}`}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : <div className="w-full h-full flex items-center justify-center text-slate-400 font-black text-xs">{student.name[0]}</div>}
                                </div>
                                <div>
                                  <p className="text-xs font-black text-slate-700 dark:text-slate-200 tracking-tight">{student.name}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {student.studentId}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                G{student.grade}-{student.section}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              {Object.values(student.marks).every(d => d != null) ? (
                                <p className="text-sm font-black text-indigo-600 leading-none">{student.gpa}</p>
                              ) : (
                                <span className="text-[9px] font-black text-amber-500 tracking-tight">Pending</span>
                              )}
                            </td>
                            <td className="px-6 py-5 text-center">
                              {Object.values(student.marks).every(d => d != null) ? (
                                <p className="text-sm font-black text-slate-700 dark:text-slate-200 leading-none">{student.percentage}%</p>
                              ) : (
                                <span className="text-[9px] font-black text-amber-500 tracking-tight">Pending</span>
                              )}
                            </td>
                            <td className="pr-10 py-5 text-center">
                              {Object.values(student.marks).every(d => d != null) ? (
                                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black tracking-tight border ${student.status === 'Passed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                  student.status === 'Failed' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                    'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent'
                                  }`}>
                                  {student.status}
                                </span>
                              ) : (
                                <span className="px-4 py-1.5 rounded-xl text-[9px] font-black tracking-tight border bg-amber-500/10 text-amber-500 border-amber-500/20">
                                  Pending
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {filteredResults.length === 0 && (
                  <div className="py-24 text-center bg-white dark:bg-slate-900 flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 mb-4"><Search size={32} /></div>
                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">No batch records match filters</p>
                  </div>
                )}
              </div>
            )}
            {/* 
            <div className="mt-12 pt-12 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-10 px-4">
                <div className="flex items-center gap-3">
                  <Trophy className="text-yellow-500" size={28} />
                  <h4 className="text-xl font-black text-slate-900 dark:text-white captialize tracking-tight">
                    Rank Leaderboard
                  </h4>
                </div>
                <button 
                  onClick={() => setResSection(resSection === 'All' ? 'A' : 'All')}
                  className={`px-6 py-2.5 font-black text-[10px] capitalize tracking-widest rounded-xl transition-all shadow-lg active:scale-95 ${
                    resSection === 'All' 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'
                  }`}
                >
                  {resSection === 'All' ? 'View Section Only' : 'Compare with Grade'}
                </button>
              </div>

              <div className="flex flex-col gap-6 relative z-10">
                {[...filteredResults]
                  .sort((a, b) => b.percentage - a.percentage)
                  .map((student, index) => {
                    let glowClass = '';
                    let rankColor = 'text-slate-400';
                    let rankBg = 'bg-slate-50 dark:bg-slate-800';
                    let medalIcon = null;
                    const isSelected = currentResult?.studentId === student.studentId;

                    if (index === 0) {
                      glowClass = 'border-yellow-400/60 dark:border-yellow-400/40 shadow-[0_0_40px_6px_rgba(250,204,21,0.25)] dark:shadow-[0_0_40px_6px_rgba(250,204,21,0.18)]';
                      rankColor = 'text-yellow-400';
                      rankBg = 'bg-yellow-500/10 dark:bg-yellow-500/10';
                      medalIcon = '🥇';
                    } else if (index === 1) {
                      glowClass = 'border-slate-300/80 dark:border-slate-400/40 shadow-[0_0_40px_6px_rgba(203,213,225,0.3)] dark:shadow-[0_0_40px_6px_rgba(148,163,184,0.18)]';
                      rankColor = 'text-slate-400 dark:text-slate-300';
                      rankBg = 'bg-slate-200/40 dark:bg-slate-700/40';
                      medalIcon = '🥈';
                    } else if (index === 2) {
                      glowClass = 'border-orange-400/50 dark:border-orange-500/40 shadow-[0_0_40px_6px_rgba(251,146,60,0.2)] dark:shadow-[0_0_40px_6px_rgba(251,146,60,0.15)]';
                      rankColor = 'text-orange-400';
                      rankBg = 'bg-orange-500/10 dark:bg-orange-500/10';
                      medalIcon = '🥉';
                    } else if (student.percentage > 70) {
                      glowClass = 'border-emerald-400/40 dark:border-emerald-500/30 shadow-[0_0_24px_4px_rgba(16,185,129,0.12)]';
                      rankColor = 'text-emerald-500';
                      rankBg = 'bg-emerald-500/5 dark:bg-emerald-500/10';
                    } else if (student.percentage >= 50) {
                      glowClass = 'border-slate-200 dark:border-slate-700 shadow-sm';
                      rankColor = 'text-slate-400';
                    } else {
                      glowClass = 'border-red-400/40 dark:border-red-500/30 shadow-[0_0_24px_4px_rgba(239,68,68,0.12)]';
                      rankColor = 'text-red-500';
                    }

                    return (
                      <div
                        key={student.id}
                        className={`relative bg-white dark:bg-slate-900 border rounded-[40px] p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 cursor-default ${isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg' : glowClass} hover:translate-x-2`}
                      >
                        <div className="absolute -top-4 -left-4 z-20 flex items-center justify-center">
                          {medalIcon ? (
                            <span className="text-6xl leading-none drop-shadow-xl animate-in zoom-in-50 duration-500">{medalIcon}</span>
                          ) : (
                            <div className={`px-4 py-1 rounded-full text-xs font-black tracking-widest border-2 shadow-sm ${rankBg} ${rankColor} border-white dark:border-slate-800`}>
                              {`RANK #${index + 1}`}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-6 pl-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none captialize">
                                {student.name}
                              </h3>
                              {isSelected && <Eye size={18} className="text-emerald-500 animate-pulse" />}
                            </div>
                            <p className="text-[11px] font-black text-slate-400 captialize tracking-[0.2em] mt-3 bg-slate-100 dark:bg-slate-800/50 px-3 py-1 rounded-lg w-fit">
                              ID: {student.studentId}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-10 pr-4">
                          <div className="text-center group-hover:scale-110 transition-transform duration-500">
                            <p className="text-[10px] font-black text-slate-400 capitalize tracking-widest mb-2 opacity-60">GPA</p>
                            <p className="text-3xl font-black text-indigo-500 leading-none tracking-tighter">{student.gpa}</p>
                          </div>
                          <div className="w-px h-12 bg-slate-200 dark:bg-slate-800" />
                          <div className="text-center group-hover:scale-110 transition-transform duration-500">
                            <p className="text-[10px] font-black text-slate-400 capitalize tracking-widest mb-2 opacity-60">Percentage</p>
                            <p className={`text-3xl font-black leading-none tracking-tighter ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-400 dark:text-slate-300' : index === 2 ? 'text-orange-400' : student.percentage >= 50 ? 'text-emerald-500' : 'text-red-500'}`}>
                              {student.percentage}%
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {filteredResults.length === 0 && (
                  <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[48px] border-2 border-dashed border-slate-100 dark:border-slate-800">
                    <p className="text-[12px] font-black text-slate-400 capitalize tracking-[0.5em]">No records to rank</p>
                  </div>
                )}
              </div>
            </div>
            */}


          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlView;