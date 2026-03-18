import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import schoolService from '../../Api/schoolService';
import {
  LayoutDashboard,
  School,
  Users,
  GraduationCap,
  Clock,
  Store,
  Calendar,
  FileText,
  Bell,
  LogOut
} from 'lucide-react';

const Sidebar = ({ activePage }) => {
  const navigate = useNavigate();
  const [schoolInfo, setSchoolInfo] = useState({ name: '', logo: null });

  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        const data = await schoolService.getSchool();
        if (data && data.name) {
          setSchoolInfo(data);
        }
      } catch (error) {
        console.error("Error fetching school info:", error);
      }
    };
    fetchSchoolInfo();
  }, []);

  const menuItems = [
    { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/teacher/dashboard' },
    { key: 'routine', icon: Clock, label: 'Routine', path: '/teacher/routine' },
    { key: 'attendance', icon: Users, label: 'Attendance', path: '/teacher/attendance' },
    { key: 'student', icon: GraduationCap, label: 'Classroom', path: '/teacher/student-record' },
    { key: 'calendar', icon: Calendar, label: 'Calendar', path: '/teacher/calendar' },
    { key: 'exam', icon: FileText, label: 'Exam', path: '/teacher/exam' },
    { key: 'quiz', icon: FileText, label: 'Quiz', path: '/teacher/quiz' },
    { key: 'diary', icon: FileText, label: 'Diary', path: '/teacher/diary' },
    { key: 'assignments', icon: FileText, label: 'Assignments', path: '/teacher/assignments' },
    { key: 'notification', icon: Bell, label: 'Announcements', path: '/teacher/notification' },
  ];
  return (
    <div className="flex flex-col h-full">
      {/* Branding */}
      <div className="h-[88px] flex items-center px-6 border-b border-slate-50 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden">
            {schoolInfo.logo ? (
              <img src={schoolInfo.logo} alt="School Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-emerald-500 flex items-center justify-center">
                <School className="text-white w-7 h-7" />
              </div>
            )}
          </div>
          <div className="max-w-[140px]">
            <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight truncate leading-tight">
              {schoolInfo.name || "School Name"}
            </h1>
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] block mt-0.5">
              ClassTrack
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
        <p className="px-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Main Menu</p>

        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.key;

            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100 dark:shadow-none'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400'
                  }`} />
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute left-[-16px] w-1.5 h-6 bg-emerald-500 rounded-r-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-50 dark:border-slate-800 transition-colors">
        <button
          onClick={() => {
            localStorage.clear();
            navigate('/login');
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div >
  );
};

export default Sidebar;