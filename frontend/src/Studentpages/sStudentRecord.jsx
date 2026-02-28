import React, { useState } from "react";
import {
  Users,
  Megaphone,
  Send,
  Clock,
  MessageSquareQuote,
  X,
  Pin,
  GraduationCap,
  Crown,
  User
} from "lucide-react";
import { toast } from '../MainSystemComponents/Toast';

const initialStudents = [
  { _id: "1", studentId: "2024001", firstName: "Cristiano", lastName: "Ronaldo", flag: "green", lastTerm: "3.8", attendance: "98%", section: "A", studentClass: "10" },
  { _id: "2", studentId: "2024002", firstName: "Luka", lastName: "Modric", flag: "yellow", lastTerm: "4.0", attendance: "95%", section: "A", studentClass: "10" },
  { _id: "3", studentId: "2024003", firstName: "Vinicius", lastName: "Junior", flag: "red", lastTerm: "3.2", attendance: "88%", section: "A", studentClass: "10" },
  { _id: "4", studentId: "2024004", firstName: "Jude", lastName: "Bellingham", flag: "green", lastTerm: "3.9", attendance: "99%", section: "A", studentClass: "10" },
  { _id: "5", studentId: "2024005", firstName: "Federico", lastName: "Valverde", flag: "green", lastTerm: "3.5", attendance: "92%", section: "A", studentClass: "10" },
  { _id: "6", studentId: "2024010", firstName: "Dani", lastName: "Carvajal", flag: "green", lastTerm: "3.0", attendance: "96%", section: "A", studentClass: "10" },
];

const INITIAL_NOTICES = [
  { id: "n1", text: "Please ensure all student IDs are visible during tomorrow's morning assembly.", timestamp: "2 hours ago", isPinned: true, authorType: 'teacher', authorName: 'Class Teacher' },
  { id: "n2", text: "Class monitor: Reminder to everyone to bring science lab coats tomorrow for the practical exam.", timestamp: "4 hours ago", isPinned: false, authorType: 'student', authorName: 'Federico Valverde' },
  { id: "n3", text: "Does anyone have the notes from yesterday's history lecture? I missed the last 15 minutes.", timestamp: "Yesterday", isPinned: false, authorType: 'student', authorName: 'Luka Modric' }
];

const SStudentRecord = () => {
  const [students] = useState(initialStudents);
  const [monitorId] = useState("5");
  const [notices, setNotices] = useState(INITIAL_NOTICES);
  const [newNoticeText, setNewNoticeText] = useState("");

  const currentMonitor = students.find(s => s._id === monitorId);

  const handlePostNotice = (e) => {
    e.preventDefault();
    if (!newNoticeText.trim()) return;

    const newNotice = {
      id: Date.now().toString(),
      text: newNoticeText.trim(),
      timestamp: "Just now",
      isPinned: false,
      authorType: 'teacher',
      authorName: 'Class Teacher'
    };

    setNotices([newNotice, ...notices]);
    setNewNoticeText("");
    toast({ type: 'success', message: 'Class notice posted successfully.' });
  };

  const handleDeleteNotice = (id) => {
    setNotices(prev => prev.filter(n => n.id !== id));
    toast({ type: 'info', message: 'Notice removed.' });
  };

  const handleTogglePin = (id) => {
    const target = notices.find(n => n.id === id);
    setNotices(prev => prev.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
    toast({ type: 'success', message: !target?.isPinned ? 'Notice pinned to top.' : 'Notice unpinned.' });
  };

  const sortedNotices = [...notices].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24">
      {/* Identity Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white dark:bg-slate-900 px-6 py-5 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center">
              <Users className="text-emerald-500 w-6 h-6" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Members</p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-none">{students.length}</h2>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 px-6 py-5 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center transition-colors">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Assigned Class</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none flex items-center gap-2">
              <GraduationCap size={16} className="text-emerald-500" /> Grade 10-A
            </h3>
          </div>
          <div className="bg-white dark:bg-slate-900 px-6 py-5 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center transition-colors">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Class Teacher</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none flex items-center gap-2">
              <User size={16} className="text-emerald-500" /> Prof. Carlo Ancelotti
            </h3>
          </div>
          <div className="bg-white dark:bg-slate-900 px-6 py-5 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center transition-colors">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Class Monitor</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none flex items-center gap-2">
              <Crown size={16} className={currentMonitor ? "text-amber-500" : "text-slate-300"} />
              {currentMonitor ? `${currentMonitor.firstName} ${currentMonitor.lastName}` : "None Assigned"}
            </h3>
          </div>
        </div>
      </div>

      {/* Notice Board Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-8 lg:p-12 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-12">

          {/* Input Section */}
          <div className="w-full space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
                <Megaphone size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Class Notice Board</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Broadcast important information</p>
              </div>
            </div>

            <form onSubmit={handlePostNotice} className="space-y-6">
              <div className="relative group">
                <MessageSquareQuote className="absolute left-6 top-6 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={24} />
                <textarea
                  value={newNoticeText}
                  onChange={(e) => setNewNoticeText(e.target.value)}
                  placeholder="Share an update with the classroom..."
                  className="w-full min-h-[140px] pl-16 pr-8 py-7 bg-slate-50 dark:bg-slate-800 border-none rounded-[32px] text-base font-medium dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none shadow-inner"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newNoticeText.trim()}
                  className="px-12 py-5 bg-emerald-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <Send size={18} /> Post Notice
                </button>
              </div>
            </form>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

          {/* List Section */}
          <div className="w-full space-y-8">
            <div className="flex items-center px-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Recent Announcements</span>
            </div>

            <div className="space-y-6 max-h-[700px] overflow-y-auto scrollbar-hide pr-2">
              {sortedNotices.length > 0 ? (
                sortedNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className={`group relative border rounded-[32px] p-8 transition-all hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-xl animate-in slide-in-from-right-4 duration-300 ${notice.isPinned
                      ? 'bg-emerald-50/20 dark:bg-emerald-900/20 border-emerald-500/30'
                      : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800'
                      }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${notice.isPinned ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Clock size={14} className="text-emerald-500" />
                          {notice.timestamp}
                        </div>
                      </div>

                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${notice.authorType === 'teacher'
                        ? 'bg-emerald-500/5 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-500/10'
                        : 'bg-indigo-500/5 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-500/10'
                        }`}>
                        {notice.authorType === 'teacher' ? <Users size={12} /> : <User size={12} />}
                        {notice.authorName}
                      </div>
                    </div>

                    <p className="text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {notice.text}
                    </p>

                    <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleTogglePin(notice.id)}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border ${notice.isPinned
                          ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg'
                          : 'text-slate-400 border-slate-100 dark:border-slate-800 hover:text-emerald-500 hover:bg-emerald-50'
                          }`}
                      >
                        <Pin size={14} className={notice.isPinned ? 'fill-white' : ''} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{notice.isPinned ? 'PINNED' : 'PIN'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteNotice(notice.id)}
                        className="px-3 py-1.5 text-slate-400 border border-slate-100 dark:border-slate-800 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <X size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">REMOVE</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[48px] flex flex-col items-center gap-4">
                  <Megaphone size={32} className="text-slate-200" />
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">The notice board is currently empty</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SStudentRecord;