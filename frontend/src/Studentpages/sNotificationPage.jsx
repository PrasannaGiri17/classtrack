import React, { useState, useMemo, useEffect } from 'react';
import {
  Bell,
  Megaphone,
  Search,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Target,
  User,
  Clock,
  ChevronDown,
  Calendar
} from 'lucide-react';
import notificationService from '../Api/notificationService';
import PortalPopup from '../MainSystemComponents/PortalPopup';

const SNotificationPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [readIds, setReadIds] = useState(new Set());

  // Filters State
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState(null);

  // Fetch from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const data = await notificationService.getNotifications();
        if (Array.isArray(data)) {
          setAnnouncements(data);
        } else if (data && Array.isArray(data.data)) {
          setAnnouncements(data.data);
        }
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
        (a.message && a.message.toLowerCase().includes(q)) ||
        (a.sender && a.sender.toLowerCase().includes(q));

      return matchesPriority && matchesSearch;
    });
  }, [announcements, filterPriority, searchQuery]);

  const handleOpenPreview = (item) => {
    setPreviewItem(item);
    setReadIds(prev => new Set(prev).add(item._id));
  };

  const getPriorityStyles = (p) => {
    switch (p) {
      case 'urgent': return 'bg-red-500 text-white border-red-400 shadow-sm';
      case 'warning': return 'bg-amber-500 text-white border-amber-400 shadow-sm';
      case 'important': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getPriorityIcon = (p) => {
    switch (p) {
      case 'urgent': return <AlertCircle size={14} />;
      case 'warning': return <AlertTriangle size={14} />;
      case 'important': return <Info size={14} />;
      default: return <Bell size={14} />;
    }
  };

  const formatTimestamp = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 transform hover:rotate-3 transition-transform">
            <Megaphone className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">Announcements</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-3">Campus-wide Notification Dispatch</p>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
        <div className="md:col-span-3 relative group">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border border-transparent focus:ring-4 focus:ring-emerald-500/10 text-[10px] font-black text-slate-600 dark:text-slate-300 rounded-2xl pl-5 pr-12 py-4 outline-none cursor-pointer transition-all uppercase tracking-widest"
          >
            <option value="all">All Priorities</option>
            <option value="important">Important</option>
            <option value="urgent">Urgent</option>
            <option value="warning">Warnings</option>
            <option value="normal">General</option>
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
        </div>

        <div className="md:col-span-9 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search announcement title, content or sender..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-2xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all dark:text-slate-200 tracking-wide"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-40 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Synching with network...</p>
          </div>
        ) : filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((a) => {
            const isRead = readIds.has(a._id);
            const priorityStyle = getPriorityStyles(a.priority);

            return (
              <div
                key={a._id}
                onClick={() => handleOpenPreview(a)}
                className={`group relative bg-white dark:bg-slate-900 p-8 lg:p-10 rounded-[40px] border shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all transition-colors cursor-pointer overflow-hidden ${isRead ? 'border-slate-100 dark:border-slate-800/50' : 'border-emerald-500/20 bg-emerald-50/5 dark:bg-emerald-900/5 shadow-emerald-500/5'
                  }`}
              >
                {/* Priority Line */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${a.priority === 'urgent' ? 'bg-red-500' :
                    a.priority === 'warning' ? 'bg-amber-500' :
                      'bg-emerald-500'
                  }`} />

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl border text-[9px] font-black tracking-widest uppercase ${priorityStyle}`}>
                        {getPriorityIcon(a.priority)}
                        {a.priority}
                      </div>
                      <div className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-[9px] font-black text-slate-400 tracking-widest border border-transparent uppercase">
                        <Target size={10} className="text-emerald-500" />
                        {a.targetGroup || 'Everyone'}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight leading-tight group-hover:text-emerald-500 transition-colors capitalize mb-2">
                        {a.title}
                      </h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-4xl line-clamp-2 tranisition-colors">
                        {a.message}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between md:justify-start gap-4 text-[10px] font-bold text-slate-400 tracking-widest">
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-xl">
                      <Calendar size={12} className="text-emerald-500" />
                      {formatTimestamp(a.createdAt)}
                    </div>
                    <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl text-[10px] font-black text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 tracking-widest uppercase">
                      BY {a.sender || 'Admin User'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-32 text-center space-y-6 bg-slate-50/50 dark:bg-slate-900/10 rounded-[60px] border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-[32px] flex items-center justify-center mx-auto shadow-sm">
              <Bell size={40} className="text-slate-200 dark:text-slate-700" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">No Dispatches Found</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <PortalPopup isOpen={!!previewItem} onClose={() => setPreviewItem(null)}>
        {previewItem && (
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[48px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-8 duration-300 overflow-hidden flex flex-col max-h-[90vh]">

            <div className="px-10 py-10 border-b border-slate-50 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20 flex items-start justify-between gap-6 shrink-0">
              <div className="flex-1 text-left">
                <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl border text-[10px] font-black tracking-widest mb-6 uppercase ${getPriorityStyles(previewItem.priority)}`}>
                  {getPriorityIcon(previewItem.priority)}
                  {previewItem.priority}
                </div>
                <h3 className="text-3xl font-medium text-slate-900 dark:text-white tracking-tighter leading-tight capitalize">{previewItem.title}</h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 shadow-sm transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="px-10 py-6 bg-slate-50/30 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Target size={18} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Intended Recipient</p>
                  <p className="text-[11px] font-black text-slate-700 dark:text-slate-200">{previewItem.targetGroup || 'Everyone'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <User size={18} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Official Dispatch by</p>
                  <p className="text-[11px] font-black text-slate-700 dark:text-slate-200">{previewItem.sender || 'Admin User'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Clock size={18} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Dispatched At</p>
                  <p className="text-[11px] font-black text-slate-700 dark:text-slate-200">{formatTimestamp(previewItem.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 scrollbar-hide bg-white dark:bg-slate-900 transition-colors">
              <div className="prose prose-emerald prose-lg dark:prose-invert max-w-none">
                <p className="text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap uppercase font-mono italic">
                  {previewItem.message}
                </p>
              </div>
            </div>

            <div className="py-8 px-10 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-center shrink-0">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-12 py-4 bg-slate-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-[24px] text-[10px] font-black tracking-[0.2em] uppercase shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                Close Full Dispatch
              </button>
            </div>
          </div>
        )}
      </PortalPopup>
    </div>
  );
};

export default SNotificationPage;