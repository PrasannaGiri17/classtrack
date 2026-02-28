import React, { useState, useMemo, useEffect } from 'react';
import {
  Bell,
  Megaphone,
  Search,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Calendar,
  ChevronDown,
  Target,
  User,
  Clock,
  Flame,
  Check,
  History,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';

// --- Dummy Data ---
const INITIAL_ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Final Term Examination Schedule',
    message: 'The final term examination for grades 8-12 will commence from March 15th. Please download the routine from the downloads section. All students are required to carry their ID cards and report to the exam hall 30 minutes before the commencement of the exam.',
    priority: 'urgent',
    target: 'All School',
    department: 'Academic Office',
    sender: 'Academic Office',
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    title: 'Science Department Meeting',
    message: 'Urgent meeting for all science faculty in the staff room at 3 PM today to discuss lab equipment upgrades and the upcoming regional science fair preparations. Your presence is mandatory as we will be finalizing the budget allocations.',
    priority: 'important',
    target: 'Science Department',
    department: 'Science',
    sender: 'Teacher User',
    timestamp: '4 hours ago'
  },
  {
    id: '3',
    title: 'Safety Protocol: Heavy Rain Warning',
    message: 'A heavy rain warning has been issued by the meteorological department for the next 48 hours. Schools will operate with modified hours tomorrow. Classes will conclude at 12:30 PM. Parents are requested to pick up their wards on time.',
    priority: 'warning',
    target: 'All School',
    department: 'Administration',
    sender: 'Administration',
    timestamp: 'Yesterday'
  }
];

const SNotificationPage = () => {
  const [announcements] = useState(INITIAL_ANNOUNCEMENTS);
  const [readIds, setReadIds] = useState(new Set());

  // State
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState(null);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(a => {
      const matchesPriority = filterPriority === 'all' || a.priority === filterPriority;
      const q = searchQuery.toLowerCase();
      const matchesSearch = a.title.toLowerCase().includes(q) ||
        a.message.toLowerCase().includes(q) ||
        a.sender.toLowerCase().includes(q);

      return matchesPriority && matchesSearch;
    });
  }, [announcements, filterPriority, searchQuery]);

  const handleOpenPreview = (item) => {
    setPreviewItem(item);
    setReadIds(prev => new Set(prev).add(item.id));
  };

  const priorityConfig = {
    urgent: { color: 'bg-red-500', text: 'text-red-500', pill: 'bg-red-500/10 border-red-500/20', icon: <Flame size={14} /> },
    warning: { color: 'bg-amber-500', text: 'text-amber-500', pill: 'bg-amber-500/10 border-amber-500/20', icon: <AlertTriangle size={14} /> },
    important: { color: 'bg-emerald-500', text: 'text-emerald-500', pill: 'bg-emerald-500/10 border-emerald-500/20', icon: <Info size={14} /> },
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-[28px] flex items-center justify-center shadow-2xl shadow-emerald-500/20 transform hover:scale-105 transition-all">
            <Megaphone className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">ANNOUNCEMENTS</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              CAMPUS-WIDE NOTIFICATION DISPATCH
            </p>
          </div>
        </div>
      </div>

      {/* Filter Row (Command Center) */}
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          {/* Priority Chips */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-full border border-slate-200 dark:border-slate-800 w-fit">
            {['all', 'urgent', 'important', 'warning'].map(p => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filterPriority === p
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Search Pill */}
          <div className="flex-1 max-w-2xl relative">
            <div className="flex items-center bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-full px-6 py-3.5 focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all group">
              <Search className="text-slate-400 group-focus-within:text-emerald-500 transition-colors mr-4" size={20} />
              <input
                type="text"
                placeholder="Search title, department, author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-sm font-bold outline-none dark:text-white placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-6">
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((a) => {
            const isRead = readIds.has(a.id);
            const config = priorityConfig[a.priority];

            return (
              <div
                key={a.id}
                onClick={() => handleOpenPreview(a)}
                className={`group relative grid grid-cols-[6px_1fr] bg-white dark:bg-slate-900/40 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-emerald-500/30 transition-all duration-300 cursor-pointer overflow-hidden ${isRead ? 'opacity-80' : ''
                  }`}
              >
                {/* Vertical Priority Strip */}
                <div className={`h-full ${config.color}`} />

                <div className="p-8 lg:p-10 flex flex-col md:flex-row md:items-start justify-between gap-10">
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className={`flex items-center gap-2 px-5 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest ${config.pill} ${config.text}`}>
                        {config.icon}
                        {a.priority}
                      </div>
                      <div className="flex items-center gap-2 px-5 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest border border-transparent">
                        <Target size={12} className="text-emerald-500" />
                        {a.department} • {a.target}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight group-hover:text-emerald-500 transition-colors uppercase">
                        {a.title}
                      </h3>
                      <p className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-4 max-w-4xl line-clamp-2 transition-colors">
                        {a.message}
                      </p>
                    </div>
                  </div>

                  {/* Right Meta Column */}
                  <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between md:justify-start gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <Clock size={14} className="text-emerald-500" />
                      {a.timestamp}
                    </div>
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
                      <User size={12} />
                      BY {a.sender}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-40 text-center space-y-6 bg-slate-50 dark:bg-slate-900/10 rounded-[48px] border-4 border-dashed border-slate-100 dark:border-slate-800">
            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Bell size={48} className="text-emerald-500/20" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">NO NOTIFICATIONS</p>
              <p className="text-xs font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest mt-2">Adjust your search to find dispatches</p>
            </div>
          </div>
        )}
      </div>

      {/* Message Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setPreviewItem(null)} />

          <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[48px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 slide-in-from-bottom-12 duration-500 overflow-hidden flex flex-col max-h-[90vh]">

            <div className="px-12 py-10 border-b border-slate-50 dark:border-slate-800 flex items-start justify-between gap-10 shrink-0">
              <div className="flex-1">
                <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest mb-6 ${previewItem.priority === 'urgent' ? 'bg-red-500 text-white border-red-400' :
                  previewItem.priority === 'warning' ? 'bg-amber-500 text-white border-amber-400' :
                    'bg-emerald-500 text-white border-emerald-400'
                  }`}>
                  {priorityConfig[previewItem.priority].icon}
                  {previewItem.priority}
                </div>
                <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight uppercase">
                  {previewItem.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="w-14 h-14 flex items-center justify-center rounded-[20px] bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-all shrink-0 active:scale-90"
              >
                <X size={32} />
              </button>
            </div>

            <div className="px-12 py-8 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-50 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 items-center gap-8 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Target size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Recipient Scope</p>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{previewItem.target}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Authorized Sender</p>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{previewItem.sender}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Dispatch Time</p>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{previewItem.timestamp}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 scrollbar-hide">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-2xl font-medium text-slate-600 dark:text-slate-300 leading-loose whitespace-pre-wrap first-letter:text-6xl first-letter:font-black first-letter:text-emerald-500 first-letter:mr-4 first-letter:float-left uppercase">
                  {previewItem.message}
                </p>
              </div>
            </div>

            <div className="py-10 px-12 border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-end shrink-0">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-12 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-3"
              >
                DISMISS NOTIFICATION
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SNotificationPage;