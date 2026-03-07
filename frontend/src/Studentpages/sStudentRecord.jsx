import React, { useState, useEffect } from "react";
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
import studentService from "../Api/studentService";
import classroomNoticeService from "../Api/classroomNoticeService";
import gradeService from "../Api/gradeService";
import Loading from "../MainSystemComponents/Loading";

const SStudentRecord = () => {
  const [students, setStudents] = useState([]);
  const [monitorId, setMonitorId] = useState(null);
  const [notices, setNotices] = useState([]);
  const [newNoticeText, setNewNoticeText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sectionInfo, setSectionInfo] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);

  // Notice Pagination
  const [noticePage, setNoticePage] = useState(1);
  const noticesPerPage = 4;

  const studentId = localStorage.getItem("studentId");

  useEffect(() => {
    const fetchClassroomData = async () => {
      if (!studentId) {
        setIsLoading(false);
        return;
      }
      try {
        // 1. Get Logged in student's profile to find their section
        const profile = await studentService.getStudentById(studentId);
        setStudentInfo(profile);

        const sectionId = profile.sectionId?._id || profile.sectionId;
        const gradeNum = profile.gradeId?.gradeNumber || profile.studentClass;

        if (sectionId) {
          // 2. Fetch parallel data
          const [studentsRes, noticesRes, sectionRes] = await Promise.allSettled([
            studentService.getStudentsBySection(gradeNum, sectionId),
            classroomNoticeService.getNoticesBySection(sectionId),
            gradeService.getSectionById(sectionId)
          ]);

          if (studentsRes.status === 'fulfilled') setStudents(studentsRes.value || []);
          if (noticesRes.status === 'fulfilled') setNotices(noticesRes.value || []);
          if (sectionRes.status === 'fulfilled') {
            setSectionInfo(sectionRes.value);
            setMonitorId(sectionRes.value.classMonitorId);
          }
        }
      } catch (err) {
        console.error("Failed to load classroom records:", err);
        toast({ type: 'error', message: 'Failed to load classroom data.' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchClassroomData();
  }, [studentId]);

  const currentMonitor = students.find(s => s._id === monitorId);

  const handlePostNotice = async (e) => {
    e.preventDefault();
    const sectionId = studentInfo?.sectionId?._id || studentInfo?.sectionId;
    if (!newNoticeText.trim() || !sectionId) return;

    try {
      const noticeData = {
        text: newNoticeText.trim(),
        authorId: studentId,
        authorName: `${studentInfo.firstName} ${studentInfo.lastName}`,
        authorType: 'student',
        sectionId: sectionId
      };

      const createdNotice = await classroomNoticeService.createNotice(noticeData);
      setNotices([createdNotice, ...notices]);
      setNewNoticeText("");
      toast({ type: 'success', message: 'Class notice posted successfully.' });
    } catch (error) {
      toast({ type: 'error', message: 'Failed to post notice.' });
    }
  };

  const handleDeleteNotice = async (id) => {
    try {
      await classroomNoticeService.deleteNotice(id, studentId, 'student');
      setNotices(prev => prev.filter(n => n._id !== id));
      toast({ type: 'info', message: 'Notice removed.' });
    } catch (error) {
      toast({ type: 'error', message: 'Failed to remove notice.' });
    }
  };

  const handleTogglePin = async (id) => {
    // Usually only teacher or monitor might have pin rights, but we'll follow backend rules
    try {
      const updated = await classroomNoticeService.togglePinNotice(id, studentId, 'student');
      setNotices(prev => prev.map(n => n._id === id ? updated : n));
      toast({ type: 'success', message: updated.isPinned ? 'Notice pinned to top.' : 'Notice unpinned.' });
    } catch (error) {
      toast({ type: 'error', message: 'Unauthorized to pin notices.' });
    }
  };

  const sortedNotices = [...notices].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  // Notice Pagination Logic
  const totalNoticePages = Math.ceil(sortedNotices.length / noticesPerPage) || 1;
  const currentNotices = sortedNotices.slice((noticePage - 1) * noticesPerPage, noticePage * noticesPerPage);

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-40">
        <Loading fullScreen={false} text="Syncing classroom records..." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24 px-4 sm:px-0">
      {/* Identity Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white dark:bg-slate-900 px-6 py-5 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center">
              <Users className="text-emerald-500 w-6 h-6" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Members</p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-none">{students.length}</h2>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 px-6 py-5 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center transition-colors">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Assigned Class</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none flex items-center gap-2">
              <GraduationCap size={16} className="text-emerald-500" /> {sectionInfo?.gradeName}-{sectionInfo?.sectionName}
            </h3>
          </div>
          <div className="bg-white dark:bg-slate-900 px-6 py-5 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center transition-colors">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Class Teacher</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-none flex items-center gap-2">
              <User size={16} className="text-emerald-500" /> {sectionInfo?.classTeacherName || "Fetching..."}
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

      {/* REDESIGNED NOTICE BOARD - Mobile App Style (Adaptive Light/Dark) */}
      <div className="bg-white dark:bg-[#071425] rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl overflow-hidden p-6 sm:p-8 lg:p-10 space-y-8 transition-all duration-500">

        {/* 1. Header Area (Reduced Height) */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Class Notice Board</h3>
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
                className="px-8 py-3 bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-[16px] font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-600/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Send size={14} /> Post Announcement
              </button>
            </div>
          </form>
        </div>

        {/* 3. Announcements Feed */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Latest Announcements</span>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded-lg border border-emerald-500/20 uppercase tracking-widest">
              {notices.length} ACTIVE
            </span>
          </div>

          <div className="space-y-4">
            {currentNotices.length > 0 ? (
              currentNotices.map((notice) => (
                <div
                  key={notice._id}
                  className={`group relative rounded-[32px] p-6 border transition-all duration-300 ${notice.isPinned
                    ? 'bg-emerald-50/20 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20 shadow-xl shadow-emerald-500/5'
                    : 'bg-slate-50 dark:bg-[#0B1B2E] border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-100 dark:hover:bg-[#0E1F35]'
                    }`}
                >
                  <div className="flex flex-col gap-4">
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${notice.isPinned ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                          <Clock size={12} className="text-emerald-500" />
                          {new Date(notice.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${notice.authorType === 'teacher'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/10'
                        : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/10'
                        }`}>
                        By {notice.authorName}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap line-clamp-4">
                        {notice.text}
                      </p>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-white/5 pt-4">
                      <div className="flex items-center gap-2">
                        {notice.isPinned && (
                          <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                            <Pin size={12} className="fill-emerald-500" /> Pinned to top
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleTogglePin(notice._id)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${notice.isPinned ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5'
                            }`}
                        >
                          <Pin size={14} className={notice.isPinned ? 'fill-emerald-500' : ''} />
                        </button>
                        <button
                          onClick={() => handleDeleteNotice(notice._id)}
                          className="w-9 h-9 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
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

        {/* 4. Pagination (Paddington Style) */}
        <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
            <button
              type="button"
              disabled={noticePage === 1}
              onClick={() => setNoticePage(p => p - 1)}
              className="px-4 py-2 hover:text-emerald-500 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            >
              « PREV
            </button>
            <div className="mx-4 bg-slate-50 dark:bg-[#0B1B2E] border border-slate-200 dark:border-white/10 px-6 py-3 rounded-full text-slate-900 dark:text-white min-h-[44px] flex items-center justify-center shadow-inner font-black">
              PAGE {noticePage} OF {totalNoticePages}
            </div>
            <button
              type="button"
              disabled={noticePage === totalNoticePages}
              onClick={() => setNoticePage(p => p + 1)}
              className="px-4 py-2 hover:text-emerald-500 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            >
              NEXT »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SStudentRecord;