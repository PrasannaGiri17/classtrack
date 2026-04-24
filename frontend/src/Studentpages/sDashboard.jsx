import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  ListTodo,
  BookOpen,
  NotebookPen,
  ClipboardList,
  Clock,
  Calendar,
  Medal,
  Trophy
} from 'lucide-react';
import GMainC from '../AdminComponents/Dashboard/GMainC';
import { convertADtoBS, convertBStoAD } from "@adhikarisaroj795/nepali-calendar-react";
import studentService from '../Api/studentService';
import attendanceService from '../Api/attendanceService';
import calendarService from '../Api/calendarService';
import resultService from '../Api/resultService';
import examService from '../Api/examService';
import diaryService from '../Api/diaryService';
import gradeService from '../Api/gradeService';
import timetableService from '../Api/timetableService';
import routineService from '../Api/routineService';
import notificationService from '../Api/notificationService';
import schoolNotificationService from '../Api/schoolNotificationService';
import { getHolidayOnDate, getNepaliDateInfo } from '../Utils/nepaliDateHelpers';
import { formatDistanceToNow } from 'date-fns';

const TERM_ORDER = {
  "First Mid Term": 1,
  "First Term": 2,
  "Second Mid Term": 3,
  "Second Term": 4,
  "Third Mid Term": 5,
  "Third Term": 6,
  "Final Term": 6
};

// --- Helpers ---
const RadialGauge = ({ title, subtitle, value, label, percent, color }) => {
  const radius = 80;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="bg-white dark:bg-slate-900 p-5 lg:p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-lg transition-all relative overflow-hidden group/gauge">
      {/* Decorative background pulse */}
      <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none group-hover/gauge:bg-emerald-500/10 transition-colors duration-700" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-full text-left mb-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none">{title}</h3>
          <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2">{subtitle}</p>
        </div>

        <div className="relative w-[240px] h-[140px] flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 140">
            {/* Background Track */}
            <path
              d="M 20 120 A 100 100 0 0 1 220 120"
              fill="none"
              stroke="#f1f5f9"
              className="dark:stroke-slate-800"
              strokeWidth="20"
              strokeLinecap="round"
            />
            {/* Progress Track */}
            <path
              d="M 20 120 A 100 100 0 0 1 220 120"
              fill="none"
              stroke={color}
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray={Math.PI * 100}
              strokeDashoffset={Math.PI * 100 - (percent / 100) * (Math.PI * 100)}
              className="transition-all duration-[1500ms] ease-out"
              style={{ filter: `drop-shadow(0 0 12px ${color}40)` }}
            />
          </svg>
          <div className="relative z-10 text-center mt-14">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">{value}</div>
          </div>
        </div>
      </div>
    </div>
  );
};



// Dynamic task data handle



const HomeworkCard = ({ hw }) => {
  const [isCompleted, setIsCompleted] = useState(false);

  return (
    <div className={`p-4 rounded-2xl transition-all duration-500 group relative z-0 hover:z-10 h-fit cursor-default border ${isCompleted
      ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70'
      : 'bg-white dark:bg-slate-900/60 border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 shadow-sm hover:shadow-xl hover:scale-[1.03] hover:-translate-y-1'
      }`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest transition-colors ${isCompleted ? 'text-emerald-600 bg-emerald-600/10' : 'text-emerald-500 bg-emerald-500/10'
          }`}>{hw.subject}</span>

        <button
          onClick={() => setIsCompleted(!isCompleted)}
          className={`group/check p-1 rounded-lg transition-all ${isCompleted ? 'bg-emerald-500 text-white' : 'hover:bg-emerald-500/10 text-slate-400 dark:text-slate-500 hover:text-emerald-500'
            }`}
        >
          {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
        </button>
      </div>
      <p className={`text-sm font-bold leading-snug transition-all duration-300 line-clamp-2 group-hover:line-clamp-none italic ${isCompleted
        ? 'text-emerald-600/50 line-through decoration-2'
        : 'text-slate-700 dark:text-slate-300 group-hover:text-emerald-500'
        }`}>
        "{hw.task}"
      </p>
    </div>
  );
};

const SDashboard = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedHomeworkDate, setSelectedHomeworkDate] = useState('Today');
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "Student");

  const [termGPA, setTermGPA] = useState("0.00");
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [gradeRank, setGradeRank] = useState("---");
  const [classRank, setClassRank] = useState("---");

  const [className, setClassName] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [gradeNum, setGradeNum] = useState("");
  const [activeTermDisplay, setActiveTermDisplay] = useState("");
  const [holidays, setHolidays] = useState([]);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [isDiaryLoading, setIsDiaryLoading] = useState(false);
  const [dateOptions, setDateOptions] = useState([]);
  const [actualSelectedDate, setActualSelectedDate] = useState(new Date());

  useEffect(() => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      let label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      if (i === 0) label = "Today";
      if (i === 1) label = "Yesterday";
      options.push({ label, date: d });
    }
    setDateOptions(options);
    setSelectedHomeworkDate(options[0].label);
    setActualSelectedDate(options[0].date);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getNotifications();
        if (Array.isArray(data)) {
          setAnnouncements(data);
        } else if (data && Array.isArray(data.data)) {
          setAnnouncements(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch announcements:", err);
      }
    };

    const fetchSchoolNotifications = async () => {
      try {
        setLoadingNotifications(true);
        const studentId = localStorage.getItem("studentId");
        if (studentId && studentId !== "undefined") {
          const data = await schoolNotificationService.getNotifications('student', studentId);
          setRecentNotifications(data);
        }
      } catch (err) {
        console.error("Failed to fetch recent activity:", err);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
    fetchSchoolNotifications();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const role = localStorage.getItem("role");
        const studentId = localStorage.getItem("studentId");
        if (role === "student" && studentId) {
          const data = await studentService.getStudentById(studentId);
          if (data) {
            const name = `${data.firstName} ${data.lastName || ''}`.trim();
            setUserName(name);
            localStorage.setItem("userName", name);

            const gNum = String(data.studentClass || data.gradeId?.gradeNumber || "");
            setGradeNum(gNum);

            let sectionInfo = null;
            const sectionId = data.sectionId?._id || data.sectionId;
            if (sectionId) {
              const sectionRes = await gradeService.getSectionById(sectionId);
              if (sectionRes) {
                sectionInfo = sectionRes;
                setClassName(`${sectionRes.gradeName} Section ${sectionRes.sectionName}`);
                setSectionName(sectionRes.sectionName);
              }
            }

            const allHolidays = await calendarService.getEvents().catch(() => []);
            setHolidays((allHolidays || []).filter(e => e && (e.type?.toUpperCase() === 'HOLIDAY' || e.isPublicHoliday)));

            // Fetch Yearly Attendance Rate
            try {
              const todayBS = convertADtoBS(new Date().toISOString().split('T')[0]);
              const [currentBSYear] = todayBS.split('-').map(Number);
              const yearlyData = await attendanceService.getStudentYearlyAttendance(data._id, currentBSYear || 2081);

              if (yearlyData) {
                const startAD = convertBStoAD(`${currentBSYear || 2081}-01-01`);
                const endAD = new Date().toISOString().split('T')[0];

                const holidaysList = await calendarService.getEvents(startAD, endAD);
                const holidayDates = new Set(
                  holidaysList
                    .filter(e => e.type === 'HOLIDAY')
                    .map(e => new Date(e.startDate).toISOString().split('T')[0])
                );

                let workingDaysCount = 0;
                let cur = new Date(startAD);
                const end = new Date(endAD);
                while (cur <= end) {
                  const dayOfWeek = cur.getDay(); // 6 is Saturday
                  const dateStr = cur.toISOString().split('T')[0];
                  if (dayOfWeek !== 6 && !holidayDates.has(dateStr)) {
                    workingDaysCount++;
                  }
                  cur.setDate(cur.getDate() + 1);
                }

                if (workingDaysCount > 0) {
                  setAttendanceRate(Math.round((yearlyData.present / workingDaysCount) * 100));
                } else {
                  setAttendanceRate(yearlyData.rate || 0);
                }
              }
            } catch (e) {
              console.warn("Failed to fetch dashboard attendance", e);
            }

            // Fetch Term GPA (Latest Published)
            try {
              const { year: currentYear } = getNepaliDateInfo(new Date());
              let activeTerm = null;
              let activeYear = currentYear;
              let examConfigData = await examService.getExamData(currentYear);

              const getLatestPublished = (config) => {
                if (!config || !config.termStatuses) return null;
                const published = config.termStatuses
                  .filter(t => t.isPublished)
                  .sort((a, b) => (TERM_ORDER[b.term] || 0) - (TERM_ORDER[a.term] || 0));
                return published.length > 0 ? published[0].term : null;
              };

              activeTerm = getLatestPublished(examConfigData);

              if (!activeTerm) {
                // Try previous year
                activeYear = currentYear - 1;
                examConfigData = await examService.getExamData(activeYear);
                activeTerm = getLatestPublished(examConfigData);
              }

              if (activeTerm) {
                // Fetch ALL results for the student for this specific year
                const studentResults = await resultService.getStudentResults(data._id, activeYear);
                const studentResultForTerm = studentResults.find(r => r.term === activeTerm);

                if (studentResultForTerm) {
                  // Use historical grade/section from the result record itself
                  const targetGradeId = studentResultForTerm.gradeId?._id || studentResultForTerm.gradeId;
                  const targetSectionName = studentResultForTerm.sectionName;

                  const allGradeResults = await resultService.getResultsByGradeSectionTerm(targetGradeId, undefined, activeTerm, activeYear);

                  if (allGradeResults && allGradeResults.length > 0) {
                    const uniqueResultsMap = new Map();
                    allGradeResults.forEach(r => {
                      const sid = r.studentId?._id?.toString() || r.studentId?.toString();
                      if (sid) uniqueResultsMap.set(sid, r);
                    });
                    const uniqueGradeResults = Array.from(uniqueResultsMap.values());

                    // Ranking
                    const sortedByGrade = uniqueGradeResults.sort((a, b) => (Number(b.summary?.percentage) || 0) - (Number(a.summary?.percentage) || 0));
                    const gradeRankIdx = sortedByGrade.findIndex(r => (r.studentId?._id?.toString() || r.studentId?.toString()) === data._id?.toString());

                    const sectionResults = uniqueGradeResults.filter(r =>
                      (r.sectionName || "").toString().trim().toLowerCase() === (targetSectionName || "").toString().trim().toLowerCase()
                    );
                    const sortedBySection = sectionResults.sort((a, b) => (Number(b.summary?.percentage) || 0) - (Number(a.summary?.percentage) || 0));
                    const sectionRankIdx = sortedBySection.findIndex(r => (r.studentId?._id?.toString() || r.studentId?.toString()) === data._id?.toString());

                    const getRankSuffix = (n) => {
                      if (n === -1) return "---";
                      const i = n + 1;
                      const j = i % 10, k = i % 100;
                      if (j === 1 && k !== 11) return i + "st";
                      if (j === 2 && k !== 12) return i + "nd";
                      if (j === 3 && k !== 13) return i + "rd";
                      return i + "th";
                    };

                    setGradeRank(getRankSuffix(gradeRankIdx));
                    setClassRank(getRankSuffix(sectionRankIdx));
                    setActiveTermDisplay(`${activeTerm} ${activeYear}`);

                    if (studentResultForTerm.summary && studentResultForTerm.summary.gpa) {
                      setTermGPA(Number(studentResultForTerm.summary.gpa).toFixed(2));
                    }
                  }
                }
              }
            } catch (e) {
              console.warn("Failed to fetch dashboard GPA/Rankings", e);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch user in Dashboard", err);
      }
    };

    fetchUserData();
  }, []);

  const fetchDiary = useCallback(async () => {
    if (!className || !gradeNum || !sectionName || !actualSelectedDate) return;
    setIsDiaryLoading(true);
    try {
      const weekday = actualSelectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

      const [diaryRes, timetableRes] = await Promise.all([
        diaryService.getDiariesByClass(className, actualSelectedDate).catch(() => []),
        timetableService.getTimetable(gradeNum, sectionName, weekday).catch(() => null)
      ]);

      if (!timetableRes || !timetableRes.slots) {
        setDiaryEntries([]);
        return;
      }

      const merged = timetableRes.slots.map(slot => {
        const assignment = timetableRes.assignments[slot.id];
        if (!assignment) return null;

        const diaryEntry = diaryRes.find(d => d.periodId.includes(slot.id));
        let taskText = "";
        if (diaryEntry?.homework && diaryEntry?.activity) {
          taskText = `Activity: ${diaryEntry.activity} | HW: ${diaryEntry.homework}`;
        } else if (diaryEntry?.homework) {
          taskText = `HW: ${diaryEntry.homework}`;
        } else if (diaryEntry?.activity) {
          taskText = `Activity: ${diaryEntry.activity}`;
        } else {
          taskText = "No task logged for this session.";
        }

        return {
          subject: assignment.subjectName,
          task: taskText,
          _id: diaryEntry?._id || `temp-${slot.id}`
        };
      }).filter(item => item !== null);

      setDiaryEntries(merged);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch diary:", err);
    } finally {
      setIsDiaryLoading(false);
    }
  }, [className, gradeNum, sectionName, actualSelectedDate]);

  useEffect(() => {
    fetchDiary();
  }, [fetchDiary]);

  const currentHoliday = useMemo(() => {
    if (!holidays || !holidays.length) return null;
    return getHolidayOnDate(actualSelectedDate, holidays);
  }, [actualSelectedDate, holidays]);

  // Pagination Logic
  const totalPages = Math.ceil(diaryEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentHomework = diaryEntries.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight ">
          Welcome back, <span className="text-emerald-500">{userName.split(' ')[0] || "Student"}</span>!
        </h1>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
          Here's what's happening in your classes today.
        </p>
      </div>

      {/* Stats Grid - 3 Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RadialGauge
          title="Overall Performance"
          subtitle={activeTermDisplay ? `${activeTermDisplay} GPA` : "Last Exam Academic GPA"}
          value={termGPA}
          percent={(parseFloat(termGPA) / 4.0) * 100 || 0}
          color="#10b981"
        />
        <RadialGauge
          title="Attendance Track"
          subtitle="Academic Year Presence"
          value={`${attendanceRate}%`}
          percent={attendanceRate}
          color="#10b981"
        />
        {/* Class Rank Section */}
        <div className="bg-white dark:bg-slate-900 p-6 lg:p-7 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-lg flex flex-col transition-all group/rank">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none">Class Position</h3>
            <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2">{activeTermDisplay ? `${activeTermDisplay} Performance` : "Last Exam Performance"}</p>
          </div>

          <div className="flex-1 flex items-center">
            <div className="grid grid-cols-2 gap-2 w-full">
              {/* Grade Rank */}
              <div className="flex items-center gap-4 group/medal">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 transition-transform group-hover/medal:scale-110">
                  <Medal size={30} />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-black text-emerald-500 tracking-tighter tabular-nums leading-none">{gradeRank}</div>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">In Grade</p>
                </div>
              </div>

              {/* Class Rank */}
              <div className="flex items-center gap-4 group/trophy">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0 transition-transform group-hover/trophy:scale-110">
                  <Trophy size={30} />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-black text-purple-500 tracking-tighter tabular-nums leading-none">{classRank}</div>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">In Class</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Routine & Homework Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Homework Diary - Expanded */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl transition-all h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                <NotebookPen size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Homework Diary</h3>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2 italic shadow-emerald-500/5">Pending Subject Tasks</p>
              </div>
            </div>

            {/* Date Filter Dropdown */}
            <div className="relative group min-w-[140px]">
              <select
                value={selectedHomeworkDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedHomeworkDate(val);
                  const found = dateOptions.find(o => o.label === val);
                  if (found) setActualSelectedDate(found.date);
                }}
                className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:border-emerald-500/50 text-[10px] font-black text-slate-600 dark:text-slate-300 rounded-xl pl-4 pr-10 py-2.5 outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm shadow-emerald-500/5"
              >
                {dateOptions.map((opt, i) => (
                  <option key={i} value={opt.label}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>

          {isDiaryLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10">
              <span className="text-xs font-bold text-slate-400 animate-pulse">Syncing class diary...</span>
            </div>
          ) : currentHoliday ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 bg-red-50/50 dark:bg-red-900/10 rounded-[32px] border border-red-100 dark:border-red-900/20 shadow-sm p-4">
              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-red-500 shadow-lg shadow-red-500/10 mb-2">
                <Calendar size={32} className="text-red-500" />
              </div>
              <span className="px-3 py-1 bg-red-500 text-white text-[9px] font-black tracking-widest rounded-full shadow-md shadow-red-500/20">Holiday</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{currentHoliday.holidayName || currentHoliday.title || "School Holiday"}</h3>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-4">Operations suspended for this date.</p>
            </div>
          ) : (
            <>
              {diaryEntries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 flex-1">
                  {currentHomework.map((hw) => (
                    <HomeworkCard key={hw._id} hw={hw} />
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/80 rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100 dark:border-slate-800 mb-2">
                    <BookOpen size={32} className="text-slate-300" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">No Diary Entries</h4>
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest">No assigned tasks logged for this date.</p>
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {startIndex + 1}-{Math.min(startIndex + itemsPerPage, diaryEntries.length)} of {diaryEntries.length} Subjects
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-all border border-slate-100 dark:border-slate-700"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 rounded-lg text-[9px] font-black transition-all ${currentPage === i + 1
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-all border border-slate-100 dark:border-slate-700"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Unified Calendar Component */}
        <div className="h-full min-h-[400px]">
          <GMainC />
        </div>
      </div>

      {/* Bottom Section: Recent Events & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 lg:p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm transition-all flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
            <button onClick={() => navigate('/student/activities')} className="text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4 max-h-[360px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {loadingNotifications ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Syncing activity...</p>
              </div>
            ) : recentNotifications.length > 0 ? (
              recentNotifications.map((notif) => (
                <div key={notif._id} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                    <Bell className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{notif.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-2 block uppercase tracking-widest">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No recent activity found</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Announcements</h3>
            </div>
            <button onClick={() => navigate('/student/activities')} className="text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {announcements.map((item, idx) => (
              <div key={item._id || item.id || idx} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.priority === 'urgent' ? 'bg-red-500' :
                  item.priority === 'warning' ? 'bg-amber-500' :
                    item.priority === 'important' ? 'bg-blue-500' : 'bg-slate-400'
                  }`} />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${item.priority === 'urgent' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                  item.priority === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                    item.priority === 'important' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  }`}>{item.priority || 'normal'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SDashboard;