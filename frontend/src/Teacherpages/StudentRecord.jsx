import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
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
  User,
  UserCheck,
  Paperclip,
  ChevronDown,
  ArrowLeft,
  Filter,
  MoreVertical
} from "lucide-react";
import { AddPopupStudent } from "../TeacherComponents/Admin/AddPopupStudent";
import Loading from "../MainSystemComponents/Loading";
import { toast } from "../MainSystemComponents/Toast";
import teacherService from "../Api/teacherService";
import studentService from "../Api/studentService";
import classroomNoticeService from "../Api/classroomNoticeService";
import gradeService from "../Api/gradeService";

const INITIAL_NOTICES = [
  { id: "n1", text: "Please ensure all student IDs are visible during tomorrow's morning assembly.", timestamp: "2 hours ago", isPinned: true, authorType: 'teacher', authorName: 'Class Teacher' },
  { id: "n2", text: "Class monitor: Reminder to everyone to bring science lab coats tomorrow for the practical exam.", timestamp: "4 hours ago", isPinned: false, authorType: 'student', authorName: 'Federico Valverde' },
  { id: "n3", text: "Does anyone have the notes from yesterday's history lecture? I missed the last 15 minutes.", timestamp: "Yesterday", isPinned: false, authorType: 'student', authorName: 'Luka Modric' }
];

const SStudentRecord = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [monitorId, setMonitorId] = useState(null);
  const itemsPerPage = 8;

  const [notices, setNotices] = useState([]);
  const [sectionInfo, setSectionInfo] = useState(null);
  const [newNoticeText, setNewNoticeText] = useState("");
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Notice Pagination
  const [noticePage, setNoticePage] = useState(1);
  const noticesPerPage = 4;

  const teacherId = localStorage.getItem("teacherId");

  useEffect(() => {
    const fetchTeacherAndStudents = async () => {
      if (!teacherId) {
        setIsLoading(false);
        return;
      }
      try {
        const [teacherRes, studentsRes, sectionRes] = await Promise.allSettled([
          teacherService.getTeacherById(teacherId),
          studentService.getStudentsByClassTeacher(teacherId),
          gradeService.getSectionByTeacherId(teacherId)
        ]);

        if (teacherRes.status === 'fulfilled') setTeacherInfo(teacherRes.value);
        if (studentsRes.status === 'fulfilled') setStudents(studentsRes.value || []);

        if (sectionRes.status === 'fulfilled') {
          const secData = sectionRes.value;
          setSectionInfo(secData);
          setMonitorId(secData?.classMonitorId);

          if (secData?.sectionId) {
            try {
              const noticeData = await classroomNoticeService.getNoticesBySection(secData.sectionId);
              setNotices(noticeData);
            } catch (err) {
              console.error("Failed to load notices:", err);
            }
          }
        } else {
          console.warn("Section info not found:", sectionRes.reason);
        }

        if (teacherRes.status === 'rejected' && studentsRes.status === 'rejected') {
          toast({ type: 'error', message: 'Failed to load classroom records.' });
        }
      } catch (error) {
        console.error("Error in fetch sequence:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeacherAndStudents();
  }, [teacherId]);

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



  const handleToggleMonitor = async (id) => {
    if (!sectionInfo?.sectionId) return;

    try {
      const isRemoving = monitorId === id;
      const payload = {
        sectionId: sectionInfo.sectionId,
        studentId: isRemoving ? null : id
      };

      await gradeService.assignClassMonitor(payload);

      if (isRemoving) {
        setMonitorId(null);
        toast({ type: 'info', message: 'Class monitor unassigned.' });
      } else {
        setMonitorId(id);
        const student = students.find(s => s._id === id);
        toast({ type: 'success', message: `${student?.firstName} assigned as Class Monitor.` });
      }
    } catch (error) {
      console.error("Error updating monitor:", error);
      toast({ type: 'error', message: 'Failed to update class monitor.' });
    }
  };

  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!newNoticeText.trim() || !sectionInfo?.sectionId) return;

    try {
      const noticeData = {
        text: newNoticeText.trim(),
        authorId: teacherId,
        authorName: 'Class Teacher',
        authorType: 'teacher',
        sectionId: sectionInfo.sectionId
      };

      const createdNotice = await classroomNoticeService.createNotice(noticeData);
      setNotices([createdNotice, ...notices]);
      setNewNoticeText("");
      toast({ type: 'success', message: 'Class notice posted successfully.' });
    } catch (error) {
      toast({ type: 'error', message: 'Failed to post notice.' });
    }
  };

  const handleStudentClick = (student) => {
    navigate('/teacher/student-profile', { state: { studentData: student } });
  };

  const handleDeleteNotice = async (id) => {
    try {
      await classroomNoticeService.deleteNotice(id, teacherId, 'teacher');
      setNotices(prev => prev.filter(n => n._id !== id));
      toast({ type: 'info', message: 'Notice removed.' });
    } catch (error) {
      toast({ type: 'error', message: 'Failed to delete notice.' });
    }
  };

  const handleTogglePin = async (id) => {
    try {
      const updated = await classroomNoticeService.togglePinNotice(id, teacherId, 'teacher');
      setNotices(prev => prev.map(n => n._id === id ? updated : n));
      toast({ type: 'success', message: updated.isPinned ? 'Notice pinned to top.' : 'Notice unpinned.' });
    } catch (error) {
      toast({ type: 'error', message: 'Failed to update notice.' });
    }
  };

  const sortedNotices = [...notices].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  // Notice Pagination Logic
  const totalNoticePages = Math.ceil(sortedNotices.length / noticesPerPage) || 1;
  const currentNotices = sortedNotices.slice((noticePage - 1) * noticesPerPage, noticePage * noticesPerPage);

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-0 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24">
      {/* Identity Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white dark:bg-slate-900 px-6 py-5 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center transition-colors">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Students</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none flex items-center gap-2">
              <Users size={16} className="text-emerald-500" /> {students.length}
            </h3>
          </div>
          <div className="bg-white dark:bg-slate-900 px-6 py-5 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center transition-colors">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Assigned Class</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none flex items-center gap-2">
              <GraduationCap size={16} className="text-emerald-500" /> {teacherInfo?.classTeacher || "Not Assigned"}
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20">
                    <Loading fullScreen={false} text="Syncing classroom data..." />
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((s) => {
                  const isMonitor = s._id === monitorId;
                  return (
                    <tr
                      key={s._id}
                      onClick={() => handleStudentClick(s)}
                      className={`group cursor-pointer transition-all ${isMonitor ? 'bg-emerald-50/20 dark:bg-emerald-900/5' : 'hover:bg-emerald-50/30 dark:hover:bg-emerald-900/5'}`}
                    >
                      <td className="pl-12 pr-6 py-6"><span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-colors ${isMonitor ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200/50 dark:border-slate-700'}`}>
                        {s.studentId?.includes('-') ? (() => {
                          const parts = s.studentId.split('-');
                          return `${parts[0]}-${parts[parts.length - 1]}`;
                        })() : s.studentId}
                      </span></td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs shadow-inner shrink-0 transition-colors overflow-hidden ${isMonitor ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/20 text-emerald-600'}`}>
                            {s.profilePhoto ? (
                              <img src={s.profilePhoto} alt={s.firstName} className="w-full h-full object-cover" />
                            ) : (
                              <>{s.firstName?.[0]}{s.lastName?.[0]}</>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`font-black leading-tight truncate text-base ${isMonitor ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>{s.firstName} {s.lastName}</p>
                              {isMonitor && <Crown size={14} className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)] animate-pulse" />}
                            </div>
                            {isMonitor && <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">Current Class Monitor</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center"><div className="inline-flex flex-col items-center"><div className={`flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400`}><Award size={14} /><span className="text-sm font-black tracking-tight">{s.lastTerm}</span></div><span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Last Term</span></div></td>
                      <td className="px-6 py-6 text-center"><div className="inline-flex flex-col items-center"><div className={`flex items-center gap-1.5 text-slate-700 dark:text-slate-200`}><UserCheck size={14} className="text-emerald-500" /><span className="text-sm font-black tracking-tight">{s.attendance}</span></div><span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Current Rate</span></div></td>
                      <td className="px-6 py-6 text-center"><div className={`mx-auto w-4 h-4 rounded-md ring-4 shadow-lg transition-transform hover:scale-110 ${getFlagColor(s.flag)}`} /></td>
                      <td className="pr-12 pl-6 py-6 text-center"><div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all"><button onClick={(e) => { e.stopPropagation(); handleToggleMonitor(s._id); }} className={`w-10 h-10 flex items-center justify-center transition-all rounded-xl ${isMonitor ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`} title={isMonitor ? "Remove Monitor Role" : "Assign as Monitor"}><Crown size={18} /></button></div></td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={6} className="py-32 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No classroom members found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="w-full px-8 py-5 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-50 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} Classroom Members</p>
          <div className="flex items-center gap-3">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500 transition-all shadow-sm active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft size={16} /></button>
            <div className="flex items-center gap-2">{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (<button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 flex items-center justify-center rounded-xl text-[10px] font-black transition-all ${currentPage === page ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border border-emerald-400" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500"}`}>{page}</button>))}</div>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500 transition-all shadow-sm active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* REDESIGNED NOTICE BOARD - Mobile App Style (Adaptive Light/Dark) */}
      <div className="bg-white dark:bg-[#071425] rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-8 transition-all duration-500">

        {/* 1. Header Area (Reduced Height) */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Notice Board</h3>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Post class announcements</p>
            </div>
          </div>
        </div>

        {/* 2. New Notice Composer (Compact) */}
        <div className="bg-slate-50 dark:bg-[#0B1B2E] rounded-[24px] border border-slate-100 dark:border-white/5 p-5 shadow-inner group focus-within:border-emerald-500/30 transition-all">
          <form onSubmit={handlePostNotice} className="space-y-4">
            <div className="relative">
              <textarea
                value={newNoticeText}
                onChange={(e) => setNewNoticeText(e.target.value)}
                placeholder="Type a new notice for your class..."
                className="w-full min-h-[100px] bg-transparent border-none text-slate-900 dark:text-white text-sm font-semibold outline-none resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500 scrollbar-hide"
              />
            </div>

            <div className="flex items-center justify-end border-t border-slate-200/50 dark:border-white/5 pt-4">
              <button
                type="submit"
                disabled={!newNoticeText.trim()}
                className="px-6 py-2.5 bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-[12px] font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-600/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Send size={14} /> Post
              </button>
            </div>
          </form>
        </div>

        {/* 3. Announcements Feed */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Latest Announcements</span>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded-lg border border-emerald-500/20">
              {notices.length} ACTIVE
            </span>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="py-12">
                <Loading fullScreen={false} text="Fetching announcements..." />
              </div>
            ) : currentNotices.length > 0 ? (
              currentNotices.map((notice) => (
                <div
                  key={notice._id}
                  className={`group relative rounded-[24px] p-5 border transition-all duration-300 ${notice.isPinned
                    ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20 shadow-xl shadow-emerald-500/5'
                    : 'bg-slate-50 dark:bg-[#0B1B2E] border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-100 dark:hover:bg-[#0E1F35]'
                    }`}
                >
                  <div className="flex flex-col gap-4">
                    {/* Card Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${notice.isPinned ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{new Date(notice.createdAt).toLocaleString()}</span>
                      </div>

                      <div className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${notice.authorType === 'teacher' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : 'bg-slate-200 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                        }`}>
                        By {notice.authorName}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed line-clamp-3">
                        {notice.text}
                      </p>
                    </div>

                    {/* Card Actions (Compact Icon Buttons) */}
                    <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-white/5 pt-3">
                      <div className="flex items-center gap-2">
                        {notice.isPinned && (
                          <div className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                            <Pin size={10} className="fill-emerald-500" /> Pinned
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleTogglePin(notice._id)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${notice.isPinned ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5'
                            }`}
                        >
                          <Pin size={14} className={notice.isPinned ? 'fill-emerald-500' : ''} />
                        </button>
                        <button
                          onClick={() => handleDeleteNotice(notice._id)}
                          className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-widest">No active notices</div>
            )}
          </div>
        </div>

        {/* 4. Pagination (Paddington Style) */}
        <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
            <button
              type="button"
              disabled={noticePage === 1}
              onClick={() => setNoticePage(p => p - 1)}
              className="px-3 py-2 hover:text-emerald-500 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            >
              « PREV
            </button>
            <div className="mx-2 bg-slate-50 dark:bg-[#0B1B2E] border border-slate-200 dark:border-white/10 px-4 py-3 rounded-full text-slate-900 dark:text-white min-h-[44px] flex items-center justify-center shadow-inner">
              PAGE {noticePage} OF {totalNoticePages}
            </div>
            <button
              type="button"
              disabled={noticePage === totalNoticePages}
              onClick={() => setNoticePage(p => p + 1)}
              className="px-3 py-2 hover:text-emerald-500 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            >
              NEXT »
            </button>
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