import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Building2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GMainC } from '../Components/GlobalMainCalender/GMainC';


const stats = [
  { title: 'Total Schools', value: '12', icon: Building2, color: 'bg-indigo-500', trend: '+2', trendUp: true },
  { title: 'Total Students', value: '1,248', icon: Users, color: 'bg-emerald-500', trend: '+12.5%', trendUp: true },
  { title: 'Total Teachers', value: '84', icon: GraduationCap, color: 'bg-blue-500', trend: '+2.4%', trendUp: true },
];

const attendanceData = [
  { name: 'Mon', students: 1100 },
  { name: 'Tue', students: 1200 },
  { name: 'Wed', students: 1150 },
  { name: 'Thu', students: 1180 },
  { name: 'Fri', students: 1050 },
];

const SuDashboard = () => {
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [dashboardStats, setDashboardStats] = useState([
    { title: 'Total Schools', value: '0', icon: Building2, color: 'bg-indigo-500', trend: '...', trendUp: true },
    { title: 'Total Students', value: '0', icon: Users, color: 'bg-emerald-500', trend: '...', trendUp: true },
    { title: 'Total Teachers', value: '0', icon: GraduationCap, color: 'bg-blue-500', trend: '...', trendUp: true },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:7000/api/stats/overview');
        const data = response.data;

        setDashboardStats([
          { 
            title: 'Total Schools', 
            value: data.totalSchools.toString(), 
            icon: Building2, 
            color: 'bg-indigo-500', 
            trend: '+1', 
            trendUp: true 
          },
          { 
            title: 'Total Students', 
            value: data.totalStudents.toLocaleString(), 
            icon: Users, 
            color: 'bg-emerald-500', 
            trend: '+12', 
            trendUp: true 
          },
          { 
            title: 'Total Teachers', 
            value: data.totalTeachers.toString(), 
            icon: GraduationCap, 
            color: 'bg-blue-500', 
            trend: '+2', 
            trendUp: true 
          },
        ]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {dashboardStats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md dark:hover:shadow-emerald-900/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 shadow-${stat.color.split('-')[1]}-100 dark:shadow-none`}>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 hidden">
        {/* Attendance Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Attendance Overview</h3>
              <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Weekly student turnout analysis</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Enhanced Class/Section Filter */}
              <div className="relative group min-w-[180px]">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-emerald-500/20 text-xs font-black text-slate-600 dark:text-slate-300 rounded-xl pl-4 pr-10 py-3 outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm"
                >
                  <option value="All Classes">All Classes</option>
                  <optgroup label="Class 5">
                    <option value="Class 5 (All)">Class 5 (All Sections)</option>
                    <option value="Class 5 - Section A">Class 5 - Section A</option>
                    <option value="Class 5 - Section B">Class 5 - Section B</option>
                    <option value="Class 5 - Section C">Class 5 - Section C</option>
                  </optgroup>
                  <optgroup label="Class 6">
                    <option value="Class 6 (All)">Class 6 (All Sections)</option>
                    <option value="Class 6 - Section A">Class 6 - Section A</option>
                    <option value="Class 6 - Section B">Class 6 - Section B</option>
                  </optgroup>
                  <optgroup label="Class 7">
                    <option value="Class 7 (All)">Class 7 (All Sections)</option>
                    <option value="Class 7 - Section A">Class 7 - Section A</option>
                  </optgroup>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
              </div>

              {/* Time Filter */}
              <div className="relative group">
                <select className="appearance-none bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-emerald-500/20 text-xs font-black text-slate-600 dark:text-slate-300 rounded-xl pl-4 pr-10 py-3 outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm">
                  <option>This Week</option>
                  <option>Last Week</option>
                  <option>Monthly</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.1} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                  contentStyle={{
                    borderRadius: '24px',
                    border: 'none',
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    padding: '20px'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: '900', color: '#10b981' }}
                  labelStyle={{ marginBottom: '10px', color: '#64748b', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase' }}
                />
                <Bar dataKey="students" name="Students" fill="#10b981" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-10 mt-8 justify-center border-t border-slate-50 dark:border-slate-800 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20" />
              <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Student Attendance</span>
            </div>
          </div>
        </div>

        {/* Unified Calendar Component */}
        <div className="h-full min-h-[400px]">
          <GMainC />
        </div>
      </div>

      {/* Bottom Section: Recent Events & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 hidden">
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

export default SuDashboard;