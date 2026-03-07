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
import notificationService from '../Api/notificationService';
import PortalPopup from '../MainSystemComponents/PortalPopup';

// --- Simple Time Ago Utility ---
const timeAgo = (date) => {
  if (!date) return "Unknown time";
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return interval + " years ago";
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + " months ago";
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return interval + " days ago";
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return interval + " hours ago";
  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

const SNotificationPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [readIds, setReadIds] = useState(new Set());

  // State
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState(null);

  // Fetch from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const data = await notificationService.getNotifications();
        setAnnouncements(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(a => {
      const matchesPriority = filterPriority === 'all' || a.priority === filterPriority;
      const q = searchQuery.toLowerCase();
      const matchesSearch = a.title.toLowerCase().includes(q) ||
        a.message.toLowerCase().includes(q) ||
        (a.sender && a.sender.toLowerCase().includes(q));

      return matchesPriority && matchesSearch;
    });
  }, [announcements, filterPriority, searchQuery]);

  const handleOpenPreview = (item) => {
    setPreviewItem(item);
    setReadIds(prev => new Set(prev).add(item._id));
  };

  const priorityConfig = {
    urgent: { color: 'bg-red-500', text: 'text-red-500', pill: 'bg-red-500/10 border-red-500/20', icon: <Flame size={14} /> },
    warning: { color: 'bg-amber-500', text: 'text-amber-500', pill: 'bg-amber-500/10 border-amber-500/20', icon: <AlertTriangle size={14} /> },
    important: { color: 'bg-emerald-500', text: 'text-emerald-500', pill: 'bg-emerald-500/10 border-emerald-500/20', icon: <Info size={14} /> },
    normal: { color: 'bg-slate-400', text: 'text-slate-500', pill: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700', icon: <Bell size={14} /> },
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
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">Announcements</h1>
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
            {['all', 'urgent', 'important', 'warning', 'normal'].map(p => (
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
                placeholder="Search title, sender..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-sm font-bold outline-none dark:text-white placeholder:text-slate-500 font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="py-40 flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading Dispatches...</p>
          </div>
        ) : filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((a) => {
            const isRead = readIds.has(a._id);
            const config = priorityConfig[a.priority] || priorityConfig.normal;

            return (
              <div
                key={a._id}
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
                        {a.targetGroup}
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
                      {timeAgo(a.createdAt)}
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
      <PortalPopup isOpen={!!previewItem} onClose={() => setPreviewItem(null)}>
        {previewItem && (
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-8 duration-300 overflow-hidden flex flex-col max-h-[85vh]">

            <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex items-start justify-between gap-6 shrink-0">
              <div className="flex-1 text-left">
                <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl border text-[10px] font-black tracking-widest mb-4 ${previewItem.priority === 'urgent' ? 'bg-red-500 text-white border-red-400' :
                    previewItem.priority === 'warning' ? 'bg-amber-500 text-white border-amber-400' :
                      previewItem.priority === 'important' ? 'bg-emerald-500 text-white border-emerald-400' :
                        'bg-slate-500 text-white border-slate-400'
                  }`}>
                  {priorityConfig[previewItem.priority]?.icon || priorityConfig.normal.icon}
                  {previewItem.priority}
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight uppercase font-mono">
                  {previewItem.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all shrink-0"
              >
                <X size={28} />
              </button>
            </div>

            <div className="px-10 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-50 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 items-center gap-6 shrink-0 text-center">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Target size={16} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Target Scope</p>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-200">{previewItem.targetGroup}</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <User size={16} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Authorized Sender</p>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-200">{previewItem.sender}</p>
                </div>
              </div>

              <div className="flex items-center justify-center sm:justify-end gap-3 text-right">
                <div className="text-right ml-auto">
                  <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase text-right">Timestamp</p>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-200 text-right">{timeAgo(previewItem.createdAt)}</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Clock size={16} />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 scrollbar-hide bg-white dark:bg-slate-900">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap uppercase font-mono">
                  {previewItem.message}
                </p>
              </div>
            </div>

            <div className="py-6 px-10 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-center shrink-0">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-8 py-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 rounded-2xl text-[10px] font-black tracking-widest uppercase shadow-sm transition-all"
              >
                Dismiss Preview
              </button>
            </div>
          </div>
        )}
      </PortalPopup>
    </div>
  );
};

export default SNotificationPage;