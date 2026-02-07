import React, { useState } from "react";
import {
  Users,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Activity,
  Award,
  GraduationCap,
  Crown,
  Megaphone,
  Send,
  Clock,
  MessageSquareQuote,
  X,
  Pin,
  User
} from "lucide-react";
import { AddPopupStudent } from "../TeacherComponents/Admin/AddPopupStudent";
import { toast } from "../MainSystemComponents/Toast";

const initialStudents = [
  { _id: "1", studentId: "2024001", firstName: "Cristiano", lastName: "Ronaldo", flag: "green", lastTerm: "3.8", attendance: "98%", section: "A", studentClass: "10" },
  { _id: "2", studentId: "2024002", firstName: "Luka", lastName: "Modric", flag: "yellow", lastTerm: "4.0", attendance: "95%", section: "A", studentClass: "10" },
  { _id: "3", studentId: "2024003", firstName: "Vinicius", lastName: "Junior", flag: "red", lastTerm: "3.2", attendance: "88%", section: "A", studentClass: "10" },
  { _id: "4", studentId: "2024004", firstName: "Jude", lastName: "Bellingham", flag: "green", lastTerm: "3.9", attendance: "99%", section: "A", studentClass: "10" },
  { _id: "5", studentId: "2024005", firstName: "Federico", lastName: "Valverde", flag: "green", lastTerm: "3.5", attendance: "92%", section: "A", studentClass: "10" },
  { _id: "6", studentId: "2024010", firstName: "Dani", lastName: "Carvajal", flag: "green", lastTerm: "3.0", attendance: "96%", section: "A", studentClass: "10" },
  { _id: "7", studentId: "2024011", firstName: "David", lastName: "Alaba", flag: "yellow", lastTerm: "3.6", attendance: "89%", section: "A", studentClass: "10" },
  { _id: "8", studentId: "2024012", firstName: "Eder", lastName: "Militao", flag: "green", lastTerm: "3.2", attendance: "93%", section: "A", studentClass: "10" },
  { _id: "9", studentId: "2024013", firstName: "Thibaut", lastName: "Courtois", flag: "green", lastTerm: "3.7", attendance: "94%", section: "A", studentClass: "10" },
  { _id: "10", studentId: "2024014", firstName: "Eduardo", lastName: "Camavinga", flag: "green", lastTerm: "3.4", attendance: "97%", section: "A", studentClass: "10" },
  { _id: "11", studentId: "2024015", firstName: "Rodrygo", lastName: "Goes", flag: "yellow", lastTerm: "3.3", attendance: "91%", section: "A", studentClass: "10" },
  { _id: "12", studentId: "2024016", firstName: "Antonio", lastName: "Rudiger", flag: "green", lastTerm: "3.1", attendance: "95%", section: "A", studentClass: "10" },
  { _id: "13", studentId: "2024017", firstName: "Arda", lastName: "Guler", flag: "green", lastTerm: "3.8", attendance: "90%", section: "A", studentClass: "10" },
  { _id: "14", studentId: "2024018", firstName: "Brahim", lastName: "Diaz", flag: "green", lastTerm: "3.6", attendance: "93%", section: "A", studentClass: "10" },
  { _id: "15", studentId: "2024019", firstName: "Ferland", lastName: "Mendy", flag: "yellow", lastTerm: "2.9", attendance: "85%", section: "A", studentClass: "10" },
  { _id: "16", studentId: "2024020", firstName: "Lucas", lastName: "Vazquez", flag: "green", lastTerm: "3.2", attendance: "98%", section: "A", studentClass: "10" },
  { _id: "17", studentId: "2024021", firstName: "Aurelien", lastName: "Tchouameni", flag: "green", lastTerm: "3.5", attendance: "94%", section: "A", studentClass: "10" },
  { _id: "18", studentId: "2024022", firstName: "Andriy", lastName: "Lunin", flag: "green", lastTerm: "3.9", attendance: "99%", section: "A", studentClass: "10" },
  { _id: "19", studentId: "2024023", firstName: "Fran", lastName: "Garcia", flag: "green", lastTerm: "3.0", attendance: "92%", section: "A", studentClass: "10" },
  { _id: "20", studentId: "2024024", firstName: "Kylian", lastName: "Mbappe", flag: "green", lastTerm: "4.0", attendance: "96%", section: "A", studentClass: "10" },
  { _id: "21", studentId: "2024025", firstName: "Endrick", lastName: "Felipe", flag: "green", lastTerm: "3.3", attendance: "90%", section: "A", studentClass: "10" },
  { _id: "22", studentId: "2024026", firstName: "Nico", lastName: "Paz", flag: "yellow", lastTerm: "3.2", attendance: "88%", section: "A", studentClass: "10" },
  { _id: "23", studentId: "2024027", firstName: "Mario", lastName: "Martin", flag: "green", lastTerm: "3.1", attendance: "94%", section: "A", studentClass: "10" },
  { _id: "24", studentId: "2024028", firstName: "Rafael", lastName: "Obrador", flag: "red", lastTerm: "2.8", attendance: "82%", section: "A", studentClass: "10" },
  { _id: "25", studentId: "2024029", firstName: "Jacob", lastName: "Ramon", flag: "green", lastTerm: "3.0", attendance: "91%", section: "A", studentClass: "10" },
  { _id: "26", studentId: "2024030", firstName: "Fran", lastName: "Gonzalez", flag: "green", lastTerm: "3.6", attendance: "95%", section: "A", studentClass: "10" },
  { _id: "27", studentId: "2024031", firstName: "Jeremy", lastName: "de Leon", flag: "yellow", lastTerm: "3.1", attendance: "87%", section: "A", studentClass: "10" },
  { _id: "28", studentId: "2024032", firstName: "Gonzalo", lastName: "Garcia", flag: "green", lastTerm: "3.4", attendance: "93%", section: "A", studentClass: "10" },
  { _id: "29", studentId: "2024033", firstName: "Chema", lastName: "Andres", flag: "green", lastTerm: "3.2", attendance: "90%", section: "A", studentClass: "10" },
  { _id: "30", studentId: "2024034", firstName: "Iker", lastName: "Bravo", flag: "green", lastTerm: "3.5", attendance: "92%", section: "A", studentClass: "10" },
];

const INITIAL_NOTICES = [
  { id: "n1", text: "Please ensure all student IDs are visible during tomorrow's morning assembly.", timestamp: "2 hours ago", isPinned: true, authorType: 'teacher', authorName: 'Class Teacher' },
  { id: "n2", text: "Class monitor: Reminder to everyone to bring science lab coats tomorrow for the practical exam.", timestamp: "4 hours ago", isPinned: false, authorType: 'student', authorName: 'Federico Valverde' },
  { id: "n3", text: "Does anyone have the notes from yesterday's history lecture? I missed the last 15 minutes.", timestamp: "Yesterday", isPinned: false, authorType: 'student', authorName: 'Luka Modric' }
];

const SStudentRecord = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState(initialStudents);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [monitorId, setMonitorId] = useState("5");
  const itemsPerPage = 8;

  const [notices, setNotices] = useState(INITIAL_NOTICES);
  const [newNoticeText, setNewNoticeText] = useState("");

  const currentMonitor = students.find(s => s._id === monitorId);

  const getFlagColor = (flag) => {
    switch (flag) {
      case "red": return "bg-red-500 shadow-red-500/20 ring-red-500/10";
      case "yellow": return "bg-yellow-500 shadow-yellow-500/20 ring-yellow-500/10";
      case "green": return "bg-[#22c55e] shadow-emerald-500/20 ring-emerald-500/10";
      default: return "bg-gray-400 shadow-gray-400/20 ring-gray-400/10";
    }
  };

  const filtered = students.filter(s =>
    `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(s.studentId || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const handleDelete = (id) => {
    if (!window.confirm("Remove student from class roster?")) return;
    setStudents(prev => prev.filter(s => s._id !== id));
    if (id === monitorId) setMonitorId(null);
    if (currentItems.length === 1 && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleToggleMonitor = (id) => {
    if (monitorId === id) {
      setMonitorId(null);
      toast({ type: 'info', message: 'Class monitor unassigned.' });
    } else {
      setMonitorId(id);
      const student = students.find(s => s._id === id);
      toast({ type: 'success', message: `${student?.firstName} assigned as Class Monitor.` });
    }
  };

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
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-0 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24">
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
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Class Monitor</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none flex items-center gap-2">
              <Crown size={16} className={currentMonitor ? "text-amber-500" : "text-slate-300"} />
              {currentMonitor ? `${currentMonitor.firstName} ${currentMonitor.lastName}` : "None Assigned"}
            </h3>
          </div>
        </div>

        <div className="flex-1 max-sm:w-full max-w-sm relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search classroom members..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-6 h-12 bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-full text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/20 transition-all dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-500 shadow-inner"
          />
        </div>
      </div>

      {/* Classroom Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors h-auto">
        <div className="w-full overflow-x-auto scrollbar-hide">
          <table className="w-full min-w-[1000px] table-auto text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                <th className="pl-12 pr-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[180px]">ID Number</th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Profile</th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">GPA Performance</th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Attendance Rate</th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Academic Flag</th>
                <th className="pr-12 pl-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {currentItems.length > 0 ? (
                currentItems.map((s) => {
                  const isMonitor = s._id === monitorId;
                  return (
                    <tr key={s._id} className={`group transition-all ${isMonitor ? 'bg-emerald-50/20 dark:bg-emerald-900/5' : 'hover:bg-emerald-50/30 dark:hover:bg-emerald-900/5'}`}>
                      <td className="pl-12 pr-6 py-6"><span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-colors ${isMonitor ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200/50 dark:border-slate-700'}`}>{s.studentId}</span></td>
                      <td className="px-6 py-6"><div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs shadow-inner shrink-0 transition-colors ${isMonitor ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/20 text-emerald-600'}`}>{s.firstName?.[0]}{s.lastName?.[0]}</div><div className="min-w-0"><div className="flex items-center gap-2"><p className={`font-black leading-tight truncate text-base ${isMonitor ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>{s.firstName} {s.lastName}</p>{isMonitor && <Crown size={14} className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)] animate-pulse" />}</div>{isMonitor && <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">Current Class Monitor</p>}</div></div></td>
                      <td className="px-6 py-6 text-center"><div className="inline-flex flex-col items-center"><div className={`flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400`}><Award size={14} /><span className="text-sm font-black tracking-tight">{s.lastTerm}</span></div><span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Last Term</span></div></td>
                      <td className="px-6 py-6 text-center"><div className="inline-flex flex-col items-center"><div className={`flex items-center gap-1.5 text-slate-700 dark:text-slate-200`}><Activity size={14} className="text-emerald-500" /><span className="text-sm font-black tracking-tight">{s.attendance}</span></div><span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Current Rate</span></div></td>
                      <td className="px-6 py-6 text-center"><div className={`mx-auto w-4 h-4 rounded-md ring-4 shadow-lg transition-transform hover:scale-110 ${getFlagColor(s.flag)}`} /></td>
                      <td className="pr-12 pl-6 py-6 text-center"><div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all"><button onClick={() => handleToggleMonitor(s._id)} className={`w-10 h-10 flex items-center justify-center transition-all rounded-xl ${isMonitor ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`} title={isMonitor ? "Remove Monitor Role" : "Assign as Monitor"}><Crown size={18} /></button><button onClick={() => handleDelete(s._id)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl" title="Remove Member"><Trash2 size={18} /></button></div></td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={6} className="py-32 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No classroom members found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="w-full px-12 py-8 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-50 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} Classroom Members</p>
          <div className="flex items-center gap-3">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="w-11 h-11 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500 transition-all shadow-sm active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft size={18} /></button>
            <div className="flex items-center gap-2">{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (<button key={page} onClick={() => setCurrentPage(page)} className={`w-11 h-11 flex items-center justify-center rounded-xl text-[10px] font-black transition-all ${currentPage === page ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border border-emerald-400" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500"}`}>{page}</button>))}</div>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="w-11 h-11 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500 transition-all shadow-sm active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      {/* Notice Board Section - Restructured to Vertical Stack */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-8 lg:p-12 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-12">

          {/* Top: Input Section */}
          <div className="w-full space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
                <Megaphone size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Notice Board</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Post class announcements</p>
              </div>
            </div>

            <form onSubmit={handlePostNotice} className="space-y-6">
              <div className="relative group">
                <MessageSquareQuote className="absolute left-6 top-6 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={24} />
                <textarea
                  value={newNoticeText}
                  onChange={(e) => setNewNoticeText(e.target.value)}
                  placeholder="Type a new notice for your class here..."
                  className="w-full min-h-[140px] pl-16 pr-8 py-7 bg-slate-50 dark:bg-slate-800 border-none rounded-[32px] text-base font-medium dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none shadow-inner"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newNoticeText.trim()}
                  className="px-12 py-5 bg-emerald-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                >
                  <Send size={18} /> Post to Board
                </button>
              </div>
            </form>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

          {/* Bottom: List Section */}
          <div className="w-full space-y-8 min-w-0">
            <div className="flex items-center justify-between px-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Latest Announcements</span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-4 py-1.5 rounded-lg">
                {notices.length} ACTIVE
              </span>
            </div>

            <div className="space-y-6 max-h-[600px] overflow-y-auto scrollbar-hide pr-2">
              {sortedNotices.length > 0 ? (
                sortedNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className={`group relative border rounded-[32px] p-8 transition-all hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-xl animate-in slide-in-from-right-4 duration-300 min-w-0 overflow-hidden flex flex-col gap-6 ${notice.isPinned
                      ? 'bg-emerald-50/20 dark:bg-emerald-900/20 border-emerald-500/30 shadow-emerald-500/5'
                      : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800'
                      }`}
                  >
                    {/* Header Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`shrink-0 w-2.5 h-2.5 rounded-full ${notice.isPinned ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          <Clock size={14} className="text-emerald-500" />
                          {notice.timestamp}
                        </div>
                      </div>

                      <div className={`flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${notice.authorType === 'teacher'
                        ? 'bg-emerald-500/5 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-500/10'
                        : 'bg-indigo-500/5 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-500/10'
                        }`}>
                        {notice.authorType === 'teacher' ? <Users size={12} /> : <User size={12} />}
                        By {notice.authorName} {notice.authorType === 'student' ? '(Student)' : ''}
                      </div>
                    </div>

                    {/* Notice Text */}
                    <div className="min-w-0 flex-1 px-1">
                      <p className="text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed break-all overflow-wrap-anywhere whitespace-pre-wrap">
                        {notice.text}
                      </p>
                    </div>

                    {/* Actions Row - Compact & Always Visible */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-end gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePin(notice.id)}
                          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border ${notice.isPinned
                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20'
                            : 'text-slate-400 border-slate-100 dark:border-slate-800 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                            }`}
                          title={notice.isPinned ? "Unpin Notice" : "Pin to Top"}
                        >
                          <Pin size={14} className={notice.isPinned ? 'fill-white' : ''} />
                          <span className="text-[9px] font-black uppercase tracking-widest">{notice.isPinned ? 'PINNED' : 'PIN POST'}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteNotice(notice.id)}
                          className="px-3 py-1.5 text-slate-400 border border-slate-100 dark:border-slate-800 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all flex items-center gap-1.5"
                          title="Delete Notice"
                        >
                          <X size={14} />
                          <span className="text-[9px] font-black uppercase tracking-widest">DELETE</span>
                        </button>
                      </div>
                    </div>

                    {/* Highlighted Pin Badge decoration */}
                    {notice.isPinned && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />
                    )}
                  </div>
                ))
              ) : (
                <div className="py-24 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[48px] flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-200">
                    <Megaphone size={32} />
                  </div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No active notices for this classroom session</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <AddPopupStudent
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSuccess={() => { }}
      />
    </div>
  );
};

export default SStudentRecord;