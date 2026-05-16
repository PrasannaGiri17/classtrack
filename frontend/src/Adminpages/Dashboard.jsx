import React, { useState, useEffect } from 'react';
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
  Calendar,
  Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GiChampions } from "react-icons/gi";
import GMainC from '../AdminComponents/Dashboard/GMainC';
import studentService from '../Api/studentService';
import teacherService from '../Api/teacherService';
import attendanceService from '../Api/attendanceService';
import calendarService from '../Api/calendarService';
import resultService from '../Api/resultService';
import schoolNotificationService from '../Api/schoolNotificationService';
import { convertADtoBS } from "@adhikarisaroj795/nepali-calendar-react";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NEPALI_MONTHS = ["Baisakh", "Jestha", "Ashad", "Shrawan", "Bhadra", "Ashwin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"];

const DashboardPage = () => {
  const { schoolId } = useAuth();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [statsData, setStatsData] = useState([
    { title: 'Total Students', value: '0', icon: Users, color: 'bg-emerald-500' },
    { title: 'Total Teachers', value: '0', icon: GraduationCap, color: 'bg-blue-500' },
    { title: 'Pass Rate', value: '0%', icon: TrendingUp, color: 'bg-emerald-500', trend: '+0.8%', trendUp: true },
    { title: 'Fail Rate', value: '0%', icon: AlertCircle, color: 'bg-red-500', trend: '-0.2%', trendUp: false },
  ]);
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [students, teachers, events, results] = await Promise.all([
          studentService.getStudents(),
          teacherService.getAllTeachers(schoolId),
          calendarService.getEvents(),
          resultService.getResultsByGradeSectionTerm()
        ]);

        const totalStuds = students.length;
        setTotalStudentsCount(totalStuds);

        // Calculate Pass/Fail Rates
        let passCount = 0;
        let failCount = 0;
        const totalResults = results?.length || 0;

        if (totalResults > 0) {
          results.forEach(r => {
            if (r.summary?.status === 'Passed') passCount++;
            else if (r.summary?.status === 'Failed') failCount++;
          });
        }

        const passRate = totalResults > 0 ? ((passCount / totalResults) * 100).toFixed(1) + '%' : '0%';
        const failRate = totalResults > 0 ? ((failCount / totalResults) * 100).toFixed(1) + '%' : '0%';

        setStatsData(prev => prev.map(stat => {
          if (stat.title === 'Total Students') return { ...stat, value: totalStuds.toLocaleString() };
          if (stat.title === 'Total Teachers') return { ...stat, value: teachers.length.toLocaleString() };
          if (stat.title === 'Pass Rate') return { ...stat, value: passRate };
          if (stat.title === 'Fail Rate') return { ...stat, value: failRate };
          return stat;
        }));

        // Fetch Weekly Attendance
        const todayAD = new Date().toISOString().split('T')[0];
        const todayBS = convertADtoBS(todayAD);
        const [currentYear, currentMonthNum] = todayBS.split('-').map(Number);
        const currentMonthName = NEPALI_MONTHS[currentMonthNum - 1];

        const attData = await attendanceService.getAttendance(null, currentYear, currentMonthName);
        const holidays = (events || []).filter(e => e.type?.toUpperCase() === 'HOLIDAY' || e.isPublicHoliday);

        const currentWeekData = calculateWeeklySummary(attData?.attendanceData || [], holidays);
        setWeeklyAttendanceData(currentWeekData);

      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    const fetchNotifications = async () => {
      try {
        setIsNotifLoading(true);
        const role = 'admin';
        const adminId = localStorage.getItem("adminId");
        const data = await schoolNotificationService.getNotifications(role, adminId);
        setRecentNotifications(data.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setIsNotifLoading(false);
      }
    };

    fetchStats();
    fetchNotifications();
  }, [schoolId]);

  const calculateWeeklySummary = (attendanceRecords, holidays = []) => {
    const today = new Date();
    const recentDays = [];
    let checkDate = new Date(today);

    // Look back up to 12 days to find 7 working days (skipping Saturdays)
    for (let i = 0; i < 12 && recentDays.length < 7; i++) {
      if (checkDate.getDay() !== 6) {
        recentDays.push(new Date(checkDate));
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    recentDays.sort((a, b) => a - b);

    return recentDays.map((date) => {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = date.toISOString().split('T')[0];

      try {
        const bsDate = convertADtoBS(dateStr);
        const [year, monthNum, dayNum] = bsDate.split('-').map(Number);
        const label = `${dayName} ${dayNum}`;

        const isHoliday = holidays.some(h => {
          let hDate = h.nepali_date;
          if (!hDate && h.startDate) {
            try { hDate = convertADtoBS(new Date(h.startDate).toISOString().split('T')[0]).replace(/-/g, '/'); }
            catch (err) { return false; }
          }
          if (!hDate) return false;
          const parts = hDate.includes('/') ? hDate.split('/') : hDate.split('-');
          return parseInt(parts[0]) === year && parseInt(parts[1]) === monthNum && parseInt(parts[2]) === dayNum;
        });

        let presentCount = 0;
        attendanceRecords.forEach(record => {
          const status = record.dailyStatus?.[String(dayNum)] || record.dailyStatus?.[dayNum];
          if (status === 'P') presentCount++;
        });

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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, idx) => (
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
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 pb-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Attendance Overview</h3>
              <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">All Grades • Weekly Turnout</p>
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

          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.1} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 900 }}
                  dy={10}
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
                                  {data.students} out of {totalStudentsCount} Students Present
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
                  barSize={40}
                  minPointSize={10}
                >
                  {weeklyAttendanceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isHoliday ? '#ef4444' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-10 mt-4 justify-center">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20" />
              <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">School Attendance</span>
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
            <button onClick={() => navigate('/admin/activities')} className="text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] max-h-[400px]">
            {isNotifLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Syncing activities...</p>
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

        <div className="h-fit bg-emerald-600 dark:bg-emerald-700 p-8 rounded-3xl shadow-lg shadow-emerald-200 dark:shadow-none text-white relative overflow-hidden group">
          <div className="relative z-10 flex flex-col justify-start gap-8">
            <div className="space-y-6">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform shadow-inner">
                <GiChampions className="text-white w-7 h-7 drop-shadow-md" />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-3 tracking-tight">Thank You!</h3>
                <p className="text-emerald-50 text-sm font-bold max-w-xs leading-relaxed">
                  We are deeply grateful that you chose <span className="text-white underline decoration-white/30 underline-offset-4">Classtrack</span> as your partner in institutional excellence.
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <p className="text-[10px] font-black text-emerald-100/60 uppercase tracking-[0.3em] mb-4">Empowering Success</p>
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl transition-transform hover:scale-105">
                <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,1)]" />
                <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">Classtrack Official</span>
              </div>
            </div>
          </div>

          <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
          <div className="absolute bottom-[-40px] left-[-20px] w-64 h-64 bg-emerald-700/50 dark:bg-emerald-800/50 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;