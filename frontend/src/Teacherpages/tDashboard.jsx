import React, { useState, useEffect, useMemo } from 'react';
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
  Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GMainC from '../AdminComponents/Dashboard/GMainC';
import attendanceService from '../Api/attendanceService';
import gradeService from '../Api/gradeService';
import studentService from '../Api/studentService';
import calendarService from '../Api/calendarService';
import { convertADtoBS } from "@adhikarisaroj795/nepali-calendar-react";
import Loading from '../MainSystemComponents/Loading';
import { Cell } from 'recharts';
const NEPALI_MONTHS = [
  "Baisakh", "Jestha", "Ashad", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

const TDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [sectionInfo, setSectionInfo] = useState(null);
  const [statsData, setStatsData] = useState({
    totalStudents: 0,
    attendanceRate: 0,
    passRate: '94.2%', // Keeping mocked as it's not implemented yet
    failRate: '5.8%'
  });
  const [weeklyAttendanceData, setWeeklyAttendanceData] = useState([]);

  const teacherId = localStorage.getItem("teacherId");

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!teacherId) return;
      setIsLoading(true);
      try {
        // 1. Get Teacher's Section Info
        const secData = await gradeService.getSectionByTeacherId(teacherId);
        setSectionInfo(secData);

        if (secData?.sectionId) {
          // 2. Get Students for this section
          const students = await studentService.getStudentsByClassTeacher(teacherId);
          const totalStudents = students?.length || 0;

          // 3. Get Current BS Date
          const todayAD = new Date().toISOString().split('T')[0];
          const todayBS = convertADtoBS(todayAD);
          const [currentYear, currentMonthNum] = todayBS.split('-').map(Number);
          const currentMonthName = NEPALI_MONTHS[currentMonthNum - 1];

          // 4. Get Attendance Records
          const attData = await attendanceService.getAttendance(secData.sectionId, currentYear, currentMonthName);

          // 5. Get Holidays
          const events = await calendarService.getEvents();
          const holidays = (events || [])
            .filter(e => e.type?.toUpperCase() === 'HOLIDAY' || e.isPublicHoliday);

          // 6. Calculate Weekly Attendance
          const currentWeekData = calculateWeeklySummary(attData?.attendanceData || [], students, holidays);
          setWeeklyAttendanceData(currentWeekData);

          // 6. Calculate Average Attendance Rate for the week
          const totalPresents = currentWeekData.reduce((acc, day) => acc + day.students, 0);
          const totalPossible = totalStudents * currentWeekData.filter(d => d.students > 0).length;
          const attRate = totalPossible > 0 ? (totalPresents / totalPossible * 100).toFixed(1) : 0;

          setStatsData(prev => ({
            ...prev,
            totalStudents,
            attendanceRate: attRate
          }));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [teacherId]);

  const calculateWeeklySummary = (attendanceRecords, students, holidays = []) => {
    const today = new Date();

    // We fetch the last 7 working days to ensure a full working week (Sun-Fri) is always visible
    // even at the transition between weeks.
    const recentDays = [];
    let checkDate = new Date(today);

    // Look back up to 12 days to find 7 working days (skipping Saturdays)
    for (let i = 0; i < 12 && recentDays.length < 7; i++) {
      const dayOfWeek = checkDate.getDay();
      if (dayOfWeek !== 6) { // Skip Saturday
        recentDays.push(new Date(checkDate));
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Sort them chronologically (oldest to newest)
    recentDays.sort((a, b) => a - b);

    const summary = recentDays.map((date) => {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = date.toISOString().split('T')[0];

      try {
        const bsDate = convertADtoBS(dateStr);
        const [year, monthNum, dayNum] = bsDate.split('-').map(Number);

        // Label with day name and number for clarity (e.g., "Sun 8")
        const label = `${dayName} ${dayNum}`;

        // Check if this date is a holiday
        const isHoliday = holidays.some(h => {
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

        let presentCount = 0;
        attendanceRecords.forEach(record => {
          const status = record.dailyStatus?.[String(dayNum)] || record.dailyStatus?.[dayNum];
          if (status === 'P') {
            presentCount++;
          }
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

    return summary;
  };

  const stats = [
    { title: 'Your Students', value: statsData.totalStudents.toLocaleString(), icon: Users, color: 'bg-emerald-500', trend: '+0%', trendUp: true },
    { title: 'Attendance Rate', value: `${statsData.attendanceRate}%`, icon: Clock, color: 'bg-emerald-500', trend: 'Current Week', trendUp: true },
    { title: 'Pass Rate', value: statsData.passRate, icon: TrendingUp, color: 'bg-emerald-500', trend: '+0.8%', trendUp: true },
    { title: 'Fail Rate', value: statsData.failRate, icon: AlertCircle, color: 'bg-red-500', trend: '-0.2%', trendUp: false },
  ];

  if (isLoading) return <Loading fullScreen={true} text="Updating your dashboard..." />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md dark:hover:shadow-emerald-900/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                <stat.icon className="text-white w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
                {stat.trend}
                {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
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
              <BarChart data={weeklyAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                                  {data.students} out of {statsData.totalStudents} Students Present
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
            <button className="text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <Bell className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Registry Updated</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">New student enrollment records have been synchronized with the main database.</p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-2 block uppercase tracking-widest">2 hours ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-emerald-600 dark:bg-emerald-700 p-8 rounded-3xl shadow-lg shadow-emerald-200 dark:shadow-none text-white relative overflow-hidden group">
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md group-hover:scale-110 transition-transform">
                <Sparkles className="text-white w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tight">Academic Milestone</h3>
              <p className="text-emerald-100 text-sm font-medium mb-8 max-w-xs leading-relaxed">The school has achieved a record-breaking 94% pass rate this semester across all departments.</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} src={`https://picsum.photos/seed/${i + 100}/50/50`} className="w-10 h-10 rounded-full border-2 border-emerald-600 dark:border-emerald-700 object-cover shadow-sm" alt="Teacher" />
                ))}
              </div>
              <p className="text-xs font-bold text-white/90 tracking-wide">+12 Faculty Members</p>
            </div>
          </div>

          <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700"></div>
          <div className="absolute bottom-[-40px] left-[-20px] w-64 h-64 bg-emerald-700/50 dark:bg-emerald-800/50 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default TDashboard;