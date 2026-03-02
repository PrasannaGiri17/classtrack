import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Sun, Moon, Check, ArrowRight, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import teacherService from '../../Api/teacherService';
import ForgotPasswordModal from './ForgotPasswordModal';

const Navbar = ({ activePage, isDarkMode, toggleDarkMode }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const [teacherInfo, setTeacherInfo] = useState(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();


  const getPageDisplayName = () => {
    const pageNames = {
      dashboard: 'Dashboard',
      school: 'School Management',
      student: 'Classroom',
      routine: 'Routine',
      attendance: 'Attendance',
      teacher: 'Teacher Management',
      timetable: 'Timetable',
      classroom: 'Classroom',
      calendar: 'Calendar',
      exam: 'Examination',
      notification: 'Notifications',
      fee: 'Fee Management',
      profile: 'My Profile'
    };
    return pageNames[activePage] || 'Dashboard';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch teacher details
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        let teacherId = localStorage.getItem("teacherId");
        if (teacherId === "undefined" || teacherId === "null") teacherId = null;

        if (teacherId) {
          const data = await teacherService.getTeacherById(teacherId);
          setTeacherInfo(data);
        } else {
          const allTeachers = await teacherService.getAllTeachers();
          if (allTeachers && allTeachers.length > 0) {
            setTeacherInfo(allTeachers[0]);
          }
        }
      } catch (error) {
        console.error("Failed to load teacher data for navbar:", error);
      }
    };

    fetchTeacher();

    // Listen to custom event for profile updates
    const handleProfileUpdate = () => {
      fetchTeacher();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const notifications = [
    { id: 1, title: 'Fee Payment Success', msg: 'Student ID #1024 paid fees.', time: '5m ago', unread: true },
    { id: 2, title: 'New Faculty Request', msg: 'Dr. Sarah applied for Maths dept.', time: '1h ago', unread: true },
    { id: 3, title: 'Exam Date Reminder', msg: 'Mid-term schedule published.', time: '3h ago', unread: false },
  ];

  return (
    <>
      <div className="w-full flex items-center justify-between transition-colors">
        {/* Title & Date */}
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight transition-colors">{getPageDisplayName()}</h2>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 transition-colors">{formattedDate}</p>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search for students, teachers..."
              className="w-full h-11 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl pl-11 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/10 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none dark:text-slate-200 dark:placeholder-slate-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 relative" ref={notificationRef}>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all relative ${showNotifications
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100 dark:shadow-none'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute top-full right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-2xl shadow-slate-200/50 dark:shadow-none z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
                <button className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-4 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-xs font-bold ${notif.unread ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] font-medium text-slate-400">{notif.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 group-hover:line-clamp-none transition-all">
                      {notif.msg}
                    </p>
                    {notif.unread && (
                      <div className="mt-2 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
              <button className="w-full p-4 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800/50">
                View all activities <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2 transition-colors"></div>

          {/* User Profile */}
          <button
            onClick={() => navigate('/teacher/profile')}
            className="relative flex items-center gap-3 p-1.5 pr-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left group"
          >

            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-emerald-500/20 transition-all z-0">
              {teacherInfo?.profilePhoto ? (
                <img
                  src={teacherInfo.profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={18} className="text-emerald-500" />
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight transition-colors">
                {teacherInfo ? `${teacherInfo.firstName} ${teacherInfo.lastName}` : "Loading..."}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase transition-colors">Teacher</p>
            </div>
          </button>
        </div>
      </div>

    </>
  );
};

export default Navbar;