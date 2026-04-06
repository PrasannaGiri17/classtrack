import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users,
  GraduationCap,
  ArrowUpRight,
  ArrowDownRight,
  Building2
} from 'lucide-react';


const SuDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState([
    { title: 'Total Schools', value: '0', icon: Building2, color: 'bg-indigo-500', trend: '...', trendUp: true },
    { title: 'Total Students', value: '0', icon: Users, color: 'bg-emerald-500', trend: '...', trendUp: true },
    { title: 'Total Teachers', value: '0', icon: GraduationCap, color: 'bg-blue-500', trend: '...', trendUp: true },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('superAdminToken');
        const response = await axios.get('http://localhost:7000/api/stats/overview', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = response.data;

        setDashboardStats([
          { 
            title: 'Total Schools', 
            value: (data.totalSchools || 0).toString(), 
            icon: Building2, 
            color: 'bg-indigo-500', 
            trend: '+1', 
            trendUp: true 
          },
          { 
            title: 'Total Students', 
            value: (data.totalStudents || 0).toLocaleString(), 
            icon: Users, 
            color: 'bg-emerald-500', 
            trend: '+12', 
            trendUp: true 
          },
          { 
            title: 'Total Teachers', 
            value: (data.totalTeachers || 0).toString(), 
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
    </div>
  );
};

export default SuDashboard;