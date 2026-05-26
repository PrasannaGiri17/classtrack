import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Sparkles,
  ChevronDown,
  Calendar,
  Clock,
  Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GMainC from '../AdminComponents/Dashboard/GMainC';
import attendanceService from '../Api/attendanceService';
import gradeService from '../Api/gradeService';
import studentService from '../Api/studentService';
import calendarService from '../Api/calendarService';
import timetableService from '../Api/timetableService';
import resultService from '../Api/resultService';
import teacherService from '../Api/teacherService';
import schoolNotificationService from '../Api/schoolNotificationService';
import { convertADtoBS } from "@adhikarisaroj795/nepali-calendar-react";
import Loading from '../MainSystemComponents/Loading';
import { Cell } from 'recharts';
import notificationService from '../Api/notificationService';
const NEPALI_MONTHS = [
  "Baisakh", "Jestha", "Ashad", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

const TDashboard = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "Teacher");
  const [sectionInfo, setSectionInfo] = useState(null);
  const [statsData, setStatsData] = useState({
    totalStudents: 0,
    attendanceRate: 0,
    passRate: '0%',
    failRate: '0%',
    avgMarkPercent: '0%'
  });
  const [weeklyAttendanceData, setWeeklyAttendanceData] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [isNotifLoading, setIsNotifLoading] = useState(false);

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const teacherId = localStorage.getItem("teacherId");

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!teacherId) return;
      setIsLoading(true);
      try {
        // 1. Fetch multi-source data for classrooms, assignments, and results
        const [secData, routine, grades, events, allStudents, teacherData, results] = await Promise.all([
          gradeService.getSectionByTeacherId(teacherId),
          timetableService.getTeacherRoutine(teacherId),
          gradeService.getGrades(),
          calendarService.getEvents(),
          studentService.getStudents(),
          teacherService.getTeacherById(teacherId),
          resultService.getResultsByGradeSectionTerm()
        ]);

        setSectionInfo(secData);

        // 2. Identify all sections assigned to this teacher
        const assignedSectionIds = new Set();
        if (secData?.sectionId) assignedSectionIds.add(String(secData.sectionId));
        const routineSlots = routine ? Object.values(routine).flat() : [];
        if (routineSlots.length > 0) {
          routineSlots.forEach(slot => {
            const raw = slot.rawIds;
            if (raw && raw.gradeNumber && raw.sectionName) {
              const grade = grades.find(g => Number(g.gradeNumber) === Number(raw.gradeNumber));
              if (grade && Array.isArray(grade.sections)) {
                const section = grade.sections.find(s => s.sectionName === raw.sectionName);
                if (section && section._id) assignedSectionIds.add(String(section._id));
              }
            }
          });
        }

        // 3. Filter students from all unique assigned sections
        const teacherStudents = allStudents.filter(s => s.sectionId && assignedSectionIds.has(String(s.sectionId)));
        const totalStudentsCount = teacherStudents.length;

        // 4. Identify Teacher's Subjects
        const mySubjectIds = new Set();
        if (teacherData.primarySubject?._id) mySubjectIds.add(String(teacherData.primarySubject._id));
        if (teacherData.secondarySubject?._id) mySubjectIds.add(String(teacherData.secondarySubject._id));

        // 5. Calculate Subject-Specific Pass/Fail Rates
        let teacherPassCount = 0;
        let teacherTotalResults = 0;
        let teacherTotalMarks = 0;

        if (results && results.length > 0) {
          results.forEach(res => {
            // Check if result record belongs to one of teacher's students/sections
            if (assignedSectionIds.has(String(res.sectionId || res.gradeId?.sections?.[0]?._id))) {
              const subjectMarks = res.marks.filter(m => mySubjectIds.has(String(m.subjectId?._id || m.subjectId)));

              subjectMarks.forEach(m => {
                const total = (m.theoryMarks || 0) + (m.practicalMarks || 0);
                teacherTotalResults++;
                teacherTotalMarks += total;
                if (total >= 40) teacherPassCount++;
              });
            }
          });
        }

        const passRate = teacherTotalResults > 0 ? ((teacherPassCount / teacherTotalResults) * 100).toFixed(1) + '%' : '0%';
        const failRate = teacherTotalResults > 0 ? ((100 - (teacherPassCount / teacherTotalResults) * 100)).toFixed(1) + '%' : '0%';
        const avgMarkPercent = teacherTotalResults > 0 ? (teacherTotalMarks / teacherTotalResults).toFixed(1) + '%' : '0%';

        if (assignedSectionIds.size > 0) {
          // 6. Get Current BS Date
          // 7. Get Attendance Records (Handle month crossing for weekly summary)
          const targetSectionId = secData?.sectionId || Array.from(assignedSectionIds)[0];
          const now = new Date();
          const todayAD = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          const todayBS = convertADtoBS(todayAD);
          const [currentYear, currentMonthNum] = todayBS.split('-').map(Number);
          const currentMonthName = NEPALI_MONTHS[currentMonthNum - 1];

          // Determine if the last 7 days span two months
          const sevenDaysAgoAD = new Date();
          sevenDaysAgoAD.setDate(sevenDaysAgoAD.getDate() - 7);
          const sevenDaysAgoBS = convertADtoBS(sevenDaysAgoAD.toISOString().split('T')[0]);
          const [prevYear, prevMonthNum] = sevenDaysAgoBS.split('-').map(Number);

          const fetchAttPromises = [
            attendanceService.getAttendance(targetSectionId, currentYear, currentMonthName)
          ];

          // If crossing months, fetch the previous month too
          if (prevMonthNum !== currentMonthNum) {
            fetchAttPromises.push(attendanceService.getAttendance(targetSectionId, prevYear, NEPALI_MONTHS[prevMonthNum - 1]));
          }

          const attResponses = await Promise.all(fetchAttPromises);
          const currentMonthAtt = attResponses[0];
          const prevMonthAtt = attResponses[1]; // might be undefined

          // 8. Get Holidays
          const holidays = (events || [])
            .filter(e => e.type?.toUpperCase() === 'HOLIDAY' || e.isPublicHoliday);

          // 9. Calculate Weekly Attendance
          const primaryClassStudents = teacherStudents.filter(s => String(s.sectionId) === String(targetSectionId));
          const currentWeekData = calculateWeeklySummary(
            currentMonthAtt?.attendanceData || [],
            prevMonthAtt?.attendanceData || [],
            primaryClassStudents,
            holidays,
            currentMonthNum,
            prevMonthNum
          );
          setWeeklyAttendanceData(currentWeekData);

          // 10. Calculate Average Attendance Rate for the CURRENT MONTH
          let monthlyPresentCount = 0;
          let monthlyTotalPossible = 0;
          const monthRecords = currentMonthAtt?.attendanceData || [];

          if (monthRecords.length > 0) {
            // Get all days that have at least one record (to count working days)
            const recordedDays = new Set();
            monthRecords.forEach(studentRec => {
              if (studentRec.dailyStatus) {
                Object.keys(studentRec.dailyStatus).forEach(day => {
                  const status = studentRec.dailyStatus[day];
                  if (status && status !== '-') {
                    recordedDays.add(day);
                    if (status === 'P') monthlyPresentCount++;
                  }
                });
              }
            });

            monthlyTotalPossible = monthRecords.length * recordedDays.size;
          }

          const attRate = monthlyTotalPossible > 0
            ? ((monthlyPresentCount / monthlyTotalPossible) * 100).toFixed(1)
            : 0;

          const primaryClassCount = primaryClassStudents.length;

          setStatsData(prev => ({
            ...prev,
            totalStudents: totalStudentsCount,
            primaryClassCount,
            attendanceRate: attRate,
            passRate,
            failRate,
            avgMarkPercent
          }));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    const fetchNotifications = async () => {
      try {
        setIsNotifLoading(true);
        if (teacherId && teacherId !== "undefined") {
          const data = await schoolNotificationService.getNotifications('teacher', teacherId);
          setRecentNotifications(data.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to fetch recent activity:", err);
      } finally {
        setIsNotifLoading(false);
      }
    };
    fetchNotifications();
  }, [teacherId]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
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
    fetchAnnouncements();
  }, []);

  const calculateWeeklySummary = (currentMonthAtt, prevMonthAtt, students, holidays = [], currentMonth, prevMonth) => {
    const today = new Date();
    const recentDays = [];
    let checkDate = new Date(today);

    // Show last 7 days including Saturdays (to match AttendancePage's exhaustive view)
    for (let i = 0; i < 7; i++) {
      recentDays.push(new Date(checkDate));
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Sort chronologically
    recentDays.sort((a, b) => a - b);

    return recentDays.map((date) => {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      // Use local parts to avoid UTC time shift (especially critical in Nepal UTC+5:45)
      const yearAD = date.getFullYear();
      const monthAD = String(date.getMonth() + 1).padStart(2, '0');
      const dayAD = String(date.getDate()).padStart(2, '0');
      const dateStr = `${yearAD}-${monthAD}-${dayAD}`;
      const isSaturday = date.getDay() === 6;

      try {
        const bsDate = convertADtoBS(dateStr);
        const [year, monthNum, dayNum] = bsDate.split('-').map(Number);
        const label = `${dayName} ${dayNum}`;

        // Context-aware attendance lookup (handle month crossing)
        const relevantAttArray = (monthNum === currentMonth) ? currentMonthAtt : (monthNum === prevMonth ? prevMonthAtt : []);

        // Check if holiday
        const isPublicHoliday = holidays.some(h => {
          let hDate = h.nepali_date;
          if (!hDate && h.startDate) {
            try {
              hDate = convertADtoBS(new Date(h.startDate).toISOString().split('T')[0]).replace(/-/g, '/');
            } catch (err) { return false; }
          }
          if (!hDate) return false;
          const parts = hDate.includes('/') ? hDate.split('/') : hDate.split('-');
          return parseInt(parts[0]) === year && parseInt(parts[1]) === monthNum && parseInt(parts[2]) === dayNum;
        });

        const isHoliday = isSaturday || isPublicHoliday;

        let presentCount = 0;
        if (!isHoliday) {
          relevantAttArray.forEach(record => {
            const status = record.dailyStatus?.[String(dayNum)] || record.dailyStatus?.[dayNum];
            if (status === 'P') presentCount++;
          });
        }

        return {
          name: label,
          students: presentCount,
          date: dateStr,
          isToday: dateStr === today.toISOString().split('T')[0],
          isHoliday
        };
      } catch (e) {
        return { name: dayName, students: 0 };
      }
    });
  };

  const stats = [
    { title: 'Your Students', value: statsData.totalStudents.toLocaleString(), icon: Users, color: 'bg-emerald-500', trend: 'Aggregate', trendUp: true },
    { title: 'Monthly Attendance', value: `${statsData.attendanceRate}%`, icon: Clock, color: 'bg-emerald-500', trend: 'Primary Class', trendUp: true },
    { title: 'Pass Rate', value: statsData.passRate, icon: TrendingUp, color: 'bg-emerald-500', trend: `Avg: ${statsData.avgMarkPercent}`, trendUp: true },
    { title: 'Fail Rate', value: statsData.failRate, icon: AlertCircle, color: 'bg-red-500', trend: 'Subject Specific', trendUp: false },
  ];

  if (isLoading) return <Loading fullScreen={true} text="Updating your dashboard..." />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight ">
          Welcome back, <span className="text-emerald-500">{userName.split(' ')[0] || "Teacher"}</span>!
        </h1>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
          Here's what's happening in your classes today.
        </p>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md dark:hover:shadow-emerald-900/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                <stat.icon className="text-white w-6 h-6" />
              </div>

            </div>
            <div>
              <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white transition-colors tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Attendance Overview</h3>
              <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
                {sectionInfo ? `Grade ${sectionInfo.gradeNumber} - ${sectionInfo.sectionName}` : 'No Class Assigned'} • Weekly Turnout
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                  This Week
                </span>
              </div>
            </div>
          </div>

          <div className="h-[380px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.1} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 900 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 900 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">{label}</p>
                          <div className="flex items-center gap-2">
                            {data.isHoliday ? (
                              <>
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                <span className="text-sm font-black text-red-500 uppercase">School Holiday</span>
                              </>
                            ) : (
                              <>
                                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                <span className="text-sm font-black text-emerald-500">
                                  {data.students} out of {statsData.primaryClassCount || 0} Students Present
                                </span>
                              </>
                            )}
                          </div>
                          {data.isToday && (
                            <p className="mt-2 text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md inline-block uppercase">Today</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="students"
                  name="Students"
                  radius={[10, 10, 0, 0]}
                  barSize={60}
                  minPointSize={10} // Ensure holiday bars with 0 attendance are visible
                >
                  {weeklyAttendanceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isHoliday ? '#ef4444' : '#10b981'}
                      fillOpacity={entry.isHoliday ? 1 : 1}
                      stroke={entry.isHoliday ? '#ef4444' : 'none'}
                      strokeWidth={entry.isHoliday ? 2 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-10 mt-4 justify-center border-t border-slate-50 dark:border-slate-800 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20" />
              <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{sectionInfo ? `Grade ${sectionInfo.gradeNumber} - ${sectionInfo.sectionName}` : 'Class'} Attendance</span>
            </div>
          </div>
        </div>

        {/* Unified Calendar Component */}
        <div className="h-full min-h-[400px]">
          <GMainC />
        </div>
      </div>

      {/* Bottom Section: Recent Events & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
            <button onClick={() => navigate('/teacher/notification')} className="text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] max-h-[400px]">
            {isNotifLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Syncing activity...</p>
              </div>
            ) : recentNotifications.length > 0 ? (
              recentNotifications.map((notif) => (
                <div key={notif._id} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow shrink-0">
                    <Bell className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{notif.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-2 block uppercase tracking-widest">
                      {getTimeAgo(notif.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No recent activity</p>
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
            <button onClick={() => navigate('/teacher/notification')} className="text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {announcements.map((item, idx) => {
              const priority = item.priority?.toLowerCase().trim();
              return (
                <div key={item._id || item.id || idx} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${priority === 'urgent' ? 'bg-emerald-600' :
                    priority === 'warning' ? 'bg-red-500' :
                      priority === 'important' ? 'bg-emerald-500' : 
                        priority === 'syllabus' || priority === 'syallbus' ? 'bg-blue-500' : 'bg-slate-400'
                    }`} />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${priority === 'urgent' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    priority === 'warning' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                      priority === 'important' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        priority === 'syllabus' || priority === 'syallbus' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}>{item.priority || 'normal'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TDashboard;