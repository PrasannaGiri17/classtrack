import React, { useState, useEffect, useRef } from "react";
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
  MoreVertical,
  ShieldAlert,
  List
} from "lucide-react";
import { CiGrid32 } from "react-icons/ci";
import { AddPopupStudent } from "../TeacherComponents/Admin/AddPopupStudent";
import Loading from "../MainSystemComponents/Loading";
import { toast } from "../MainSystemComponents/Toast";
import teacherService from "../Api/teacherService";
import timetableService from "../Api/timetableService";
import studentService from "../Api/studentService";
import classroomNoticeService from "../Api/classroomNoticeService";
import gradeService from "../Api/gradeService";
import attendanceService from "../Api/attendanceService";

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
  const [viewMode, setViewMode] = useState('grid');
  const [monitorId, setMonitorId] = useState(null);
  const itemsPerPage = 8;

  const [notices, setNotices] = useState([]);
  const [sectionInfo, setSectionInfo] = useState(null);
  const [newNoticeText, setNewNoticeText] = useState("");
  const [teacherInfo, setTeacherInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [assignedTeachers, setAssignedTeachers] = useState([]);
  const teacherScrollRef = useRef(null);
  const scrollTeachers = (dir) => {
    if (teacherScrollRef.current) teacherScrollRef.current.scrollBy({ left: dir * 250, behavior: 'smooth' });
  };

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
        
        if (studentsRes.status === 'fulfilled') {
          const rawStudents = studentsRes.value || [];
          
          // Use academic year 2082 as requested
          const currentYear = 2082;
          
          // Enhanced fetch: Get yearly attendance rate for each student
          const studentsWithAttendance = await Promise.all(
            rawStudents.map(async (s) => {
              try {
                const attRes = await attendanceService.getStudentYearlyAttendance(s._id, currentYear);
                return { ...s, attendance: (attRes.rate || 0) + "%" };
              } catch (err) {
                console.error(`Failed to fetch attendance for student ${s._id}:`, err);
                return { ...s, attendance: "0%" };
              }
            })
          );
          setStudents(studentsWithAttendance);
        }

        if (sectionRes.status === 'fulfilled') {
          const secData = sectionRes.value;
          setSectionInfo(secData);
          setMonitorId(secData?.classMonitorId);

          if (secData?.sectionId) {
            try {
              const [noticeData, activeTeachers] = await Promise.all([
                classroomNoticeService.getNoticesBySection(secData.sectionId),
                timetableService.getSectionTeachersFromTimetable(secData.gradeNumber, secData.sectionName)
              ]);
              setNotices(noticeData);
              // Filter out the current teacher viewing the page so they don't see themselves as "Other Faculty"
              const otherTeachers = activeTeachers.filter(t => t._id !== (teacherRes.value?._id || teacherRes.value?.id));
              setAssignedTeachers(otherTeachers);
            } catch (err) {
              console.error("Failed to load section details:", err);
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
      case "amber":
      case "yellow": return "bg-amber-500 shadow-amber-500/20 ring-amber-500/10";
      case "green": return "bg-emerald-500 shadow-emerald-500/20 ring-emerald-500/10";
      default: return "bg-slate-300 dark:bg-slate-700 shadow-slate-500/10 ring-slate-500/5";
    }
  };

  const filtered = students.filter(s =>
    `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(s.studentId || "").toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (a.rollNumber != null && b.rollNumber != null) {
      return a.rollNumber - b.rollNumber;
    }
    const nameA = `${a.firstName || ""} ${a.lastName || ""}`.toLowerCase();
    const nameB = `${b.firstName || ""} ${b.lastName || ""}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });

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

  if (isLoading) return <Loading fullScreen={true} text="Syncing classroom data..." />;

  if (!isLoading && !sectionInfo?.sectionId) {
    return (
      <div className="flex flex-col items-center justify-center py-40 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-red-500/10 rounded-[32px] flex items-center justify-center text-red-500 mb-8 border border-red-500/20 shadow-2xl shadow-red-500/10">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 text-center uppercase">Access Denied</h2>
        <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center max-w-md leading-relaxed bg-slate-50 dark:bg-slate-800/40 px-8 py-4 rounded-[24px] border border-slate-100 dark:border-slate-800/50">
          This portal is reserved exclusively for <span className="text-red-500">Class Teachers</span>. You are not currently assigned to any classroom management profile.
        </p>
      </div>
    );
  }

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
              <GraduationCap size={16} className="text-emerald-500" /> {sectionInfo?.gradeNumber ? `Grade ${sectionInfo.gradeNumber}-${sectionInfo.sectionName}` : (teacherInfo?.classTeacher || "Not Assigned")}
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

        <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 w-full">
          <div className="flex-1 relative group w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search classroom members..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-6 h-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-500 shadow-sm"
            />
          </div>

          {/* Grid / List Toggle Button */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1.5 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-[18px] transition-all ${
                viewMode === 'grid' 
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <CiGrid32 size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-[18px] transition-all ${
                viewMode === 'list' 
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Data View */}
      {isLoading ? (
        <div className="py-24 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <Loading fullScreen={false} text="Syncing classroom data..." />
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentItems.length > 0 ? (
            currentItems.map((s) => {
              const isMonitor = s._id === monitorId;
              return (
                <div 
                  key={s._id} 
                  className={`bg-white dark:bg-slate-900 rounded-[32px] border shadow-sm overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 group relative flex flex-col ${isMonitor ? 'border-emerald-500/30' : 'border-slate-100 dark:border-slate-800'}`}
                  onClick={() => handleStudentClick(s)}
                >
                  {/* Monitor Icon Flag */}
                  {isMonitor && (
                    <div className="absolute top-4 left-4 z-10 w-8 h-8 flex items-center justify-center bg-amber-500 text-white rounded-xl shadow-lg animate-pulse">
                      <Crown size={16} />
                    </div>
                  )}

                  {/* Top: Profile */}
                  <div className="p-6 pb-5 flex flex-col items-center text-center border-b border-slate-50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-800/10">
                    <div className={`w-20 h-20 mb-4 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner ring-4 ring-white dark:ring-slate-900 overflow-hidden ${isMonitor ? 'bg-emerald-500 text-white' : 'bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/20 text-emerald-600 dark:text-emerald-400'}`}>
                      {s.profilePhoto ? (
                        <img src={s.profilePhoto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <>{s.firstName?.[0]}{s.lastName?.[0]}</>
                      )}
                    </div>
                    <h3 className={`font-black text-lg leading-tight mb-1 ${isMonitor ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>{s.firstName} {s.lastName}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Roll: {s.rollNumber ? String(s.rollNumber).padStart(2, '0') : '—'} • ID: {s.studentId}</p>
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <UserCheck size={14} className="text-emerald-500" />
                      <span className="font-bold">{s.attendance || "0%"} Yearly Rate</span>
                    </div>
                  </div>

                  {/* Bottom: Details */}
                  <div className="p-6 flex-1 flex flex-col gap-5 bg-white dark:bg-slate-900">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                        <div className={`mx-auto w-4 h-4 rounded-md ring-4 shadow-lg ${getFlagColor(s.flag)}`} />
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Role</p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleToggleMonitor(s._id); }}
                          className={`mx-auto w-8 h-8 flex items-center justify-center rounded-lg transition-all ${isMonitor ? 'bg-amber-500 text-white' : 'text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                        >
                          <Crown size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-32 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No classroom members found</div>
          )}
        </div>
      ) : (
        /* List View (Table) */
        <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors h-auto">
          <div className="w-full overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[1000px] table-auto text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="pl-12 pr-4 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap w-[100px] text-center">Roll No</th>
                  <th className="pl-8 pr-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[180px]">ID Number</th>
                  <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Profile</th>
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
                      <tr
                        key={s._id}
                        onClick={() => handleStudentClick(s)}
                        className={`group cursor-pointer transition-all ${isMonitor ? 'bg-emerald-50/20 dark:bg-emerald-900/5' : 'hover:bg-emerald-50/30 dark:hover:bg-emerald-900/5'}`}
                      >
                        <td className="pl-12 pr-4 py-6 text-center text-xs font-bold text-slate-400">{s.rollNumber ? String(s.rollNumber).padStart(2, '0') : '—'}</td>
                        <td className="pl-8 pr-6 py-6"><span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-colors ${isMonitor ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200/50 dark:border-slate-700'}`}>
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
                        <td className="px-6 py-6 text-center"><div className="inline-flex flex-col items-center"><div className={`flex items-center gap-1.5 text-slate-700 dark:text-slate-200`}><UserCheck size={14} className="text-emerald-500" /><span className="text-sm font-black tracking-tight">{s.attendance || "0%"}</span></div><span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Yearly Rate</span></div></td>
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
        </div>
      )}

      {/* Pagination Footer */}
      {!isLoading && (
        <div className="w-full px-8 py-5 bg-slate-50/50 dark:bg-slate-800/50 rounded-[28px] border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} Classroom Members</p>
          <div className="flex items-center gap-3">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500 transition-all shadow-sm active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft size={16} /></button>
            <div className="flex items-center gap-2">{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (<button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 flex items-center justify-center rounded-xl text-[10px] font-black transition-all ${currentPage === page ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border border-emerald-400" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500"}`}>{page}</button>))}</div>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500 transition-all shadow-sm active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* ─── Assigned Teachers Section ─── */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center">
              <GraduationCap className="text-emerald-500" size={22} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Assigned Teachers</h3>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Other Faculty for Grade {sectionInfo?.gradeNumber}-{sectionInfo?.sectionName}</p>
            </div>
          </div>
          {assignedTeachers.length > 0 && (
            <div className="flex items-center gap-2">
              <button onClick={() => scrollTeachers(-1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-500 transition-all">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => scrollTeachers(1)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-500 transition-all">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        <div ref={teacherScrollRef} className="flex items-stretch gap-5 overflow-x-auto pb-4 snap-x snap-mandatory" style={{scrollbarWidth:'none',msOverflowStyle:'none'}}>
          {assignedTeachers.length > 0 ? (
            assignedTeachers.map((t) => (
              <div
                key={t._id}
                className="group relative flex flex-col items-center text-center bg-gradient-to-b from-emerald-50/60 to-white dark:from-emerald-900/10 dark:to-slate-900 rounded-[36px] pt-8 pb-6 px-6 border border-emerald-100/60 dark:border-emerald-800/20 hover:border-emerald-300/80 dark:hover:border-emerald-600/30 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 min-w-[220px] max-w-[220px] snap-center cursor-default"
              >
                {/* Avatar */}
                <div className="relative mb-4">
                  <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center text-3xl font-black shadow-lg overflow-hidden ring-2 transition-transform duration-500 group-hover:scale-105 ${
                    t.profilePhoto 
                      ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/20 ring-emerald-400 dark:ring-emerald-500'
                      : 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-emerald-500/10 ring-emerald-400 dark:ring-emerald-600 border border-emerald-300 dark:border-emerald-700'
                  }`}>
                    {t.profilePhoto ? (
                      <img src={t.profilePhoto} alt={t.firstName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="drop-shadow-sm">{t.firstName?.[0]}{t.lastName?.[0] || ""}</span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 w-full">
                  <h4 className="text-[15px] font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                    {t.firstName} {t.lastName}
                  </h4>
                  <div className="inline-flex items-center px-3 py-1 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-300 dark:border-emerald-700">
                    <span className="text-[9px] font-black uppercase tracking-[0.15em]">
                      {t.primarySubject?.subjectName || t.primarySubject || 'Faculty'}
                    </span>
                  </div>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 pt-1 break-all leading-relaxed">
                    {t.email}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full py-10 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-20">No other faculty assigned yet</p>
            </div>
          )}
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