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
  Calendar,
  Trash2,
  BookOpen
} from 'lucide-react';
import notificationService from '../Api/notificationService';
import PortalPopup from '../MainSystemComponents/PortalPopup';

const SNotificationPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [readIds, setReadIds] = useState(() => {
    const saved = localStorage.getItem('readAnnouncementIds');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

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

    const handleEsc = (e) => {
      if (e.key === 'Escape') setPreviewItem(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(a => {
      const matchesPriority = filterPriority === 'all' || a.priority === filterPriority;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        a.title.toLowerCase().includes(q) ||
        (a.message && a.message.toLowerCase().includes(q)) ||
        (a.sender && a.sender.toLowerCase().includes(q));
      return matchesPriority && matchesSearch;
    });
  }, [announcements, filterPriority, searchQuery]);

  const handleOpenPreview = (item) => {
    setPreviewItem(item);
    setReadIds(prev => {
      const newReadIds = new Set(prev).add(item._id);
      localStorage.setItem('readAnnouncementIds', JSON.stringify(Array.from(newReadIds)));
      return newReadIds;
    });
  };

  const getPriorityStyles = (p) => {
    switch (p?.toLowerCase()) {
      case 'urgent': return 'bg-emerald-600 text-white border-emerald-500 shadow-sm';
      case 'warning': return 'bg-red-500 text-white border-red-400 shadow-sm';
      case 'important': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'syllabus': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getPriorityIcon = (p) => {
    switch (p?.toLowerCase()) {
      case 'urgent': return <AlertCircle size={14} />;
      case 'warning': return <AlertTriangle size={14} />;
      case 'important': return <Info size={14} />;
      case 'syllabus': return <BookOpen size={14} />;
      default: return <Bell size={14} />;
    }
  };

  const getPriorityBar = (p) => {
    switch (p) {
      case 'urgent': return 'bg-red-500';
      case 'warning': return 'bg-amber-500';
      default: return 'bg-emerald-500';
    }
  };

  const formatTimestamp = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    return (
      date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' at ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">

      {/* Header */}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Megaphone className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Announcements</h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-2 uppercase">All School Announcements</p>
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
            <option value="syllabus">Syllabus</option>
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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Syncing with network...</p>
          </div>
        ) : filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((a) => {
            const isRead = readIds.has(a._id);
            return (
              <div
                key={a._id}
                onClick={() => handleOpenPreview(a)}
                className={`bg-white dark:bg-slate-900 p-8 rounded-[40px] border shadow-sm hover:border-emerald-500/40 hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden ${isRead
                  ? 'border-slate-100 dark:border-slate-800'
                  : 'border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-900/5'
                  }`}
              >
                {/* Unread left bar */}
                {!isRead && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                )}

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">

                  {/* Left: Badges + Title + Message */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl border text-[9px] font-black tracking-widest uppercase ${getPriorityStyles(a.priority)}`}>
                        {getPriorityIcon(a.priority)}
                        {a.priority}
                      </div>
                      <div className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-[9px] font-black text-slate-400 tracking-widest border border-transparent uppercase">
                        <Target size={10} className="text-emerald-500" />
                        {a.targetGroup || 'Everyone'}
                      </div>
                    </div>

                    <div>
                      <h3 className={`text-xl font-black tracking-tight group-hover:text-emerald-600 transition-colors leading-tight ${!isRead ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                        {a.title}
                      </h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2.5 max-w-4xl line-clamp-2">
                        {a.message}
                      </p>
                    </div>
                  </div>

                  {/* Right: Timestamp + Sender */}
                  <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between md:justify-start gap-4 text-[10px] font-bold text-slate-400 tracking-widest">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-emerald-500" />
                      {formatTimestamp(a.createdAt)}
                    </div>
                    <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl text-[10px] font-black text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 flex items-center gap-2 uppercase tracking-widest">
                      BY {a.sender || 'Admin'}
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
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-8 duration-300 overflow-hidden flex flex-col max-h-[85vh]">

            {/* Modal Header */}
            <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl border text-[10px] font-black tracking-widest mb-4 ${getPriorityStyles(previewItem.priority)}`}>
                  {getPriorityIcon(previewItem.priority)}
                  {previewItem.priority}
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
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

            {/* Modal Meta Row */}
            <div className="px-10 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-50 dark:border-slate-800 grid grid-cols-3 items-center text-center">

              {/* Announcement For */}
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Target size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 tracking-widest">Announcement For:</p>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-300">{previewItem.targetGroup || 'Everyone'}</p>
                </div>
              </div>

              {/* Announcement By */}
              <div className="flex items-center justify-center gap-3 mx-auto">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <User size={16} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black text-slate-400 tracking-widest">Announcement By:</p>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-300">{previewItem.sender || 'Admin User'}</p>
                </div>
              </div>

              {/* Sent At */}
              <div className="flex items-center gap-3 justify-end text-right">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Clock size={16} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black text-slate-400 tracking-widest">Sent At:</p>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-300">{formatTimestamp(previewItem.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-base font-medium text-slate-600 dark:text-slate-300 leading-loose whitespace-pre-wrap">
                  {previewItem.message}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="py-6 px-10 border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-center">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-8 py-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 rounded-2xl text-[10px] font-black tracking-widest transition-all"
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
