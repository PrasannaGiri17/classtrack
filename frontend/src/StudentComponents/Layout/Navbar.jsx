import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Bell, Sun, Moon, Check, ArrowRight, User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock student data for suggestions
const STUDENT_POOL = [
  { id: 's1', name: 'Cristiano Ronaldo', studentId: '2024001', grade: '10' },
  { id: 's2', name: 'Luka Modric', studentId: '2024002', grade: '10' },
  { id: 's3', name: 'Vinicius Junior', studentId: '2024003', grade: '9' },
  { id: 's4', name: 'Jude Bellingham', studentId: '2024004', grade: '11' },
  { id: 's5', name: 'Federico Valverde', studentId: '2024005', grade: '11' },
  { id: 's6', name: 'Kylian Mbappe', studentId: '2024006', grade: '9' },
  { id: 's7', name: 'Thibaut Courtois', studentId: '2024007', grade: '12' },
];

const Navbar = ({ activePage, isDarkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "Student");
  const [userPhoto, setUserPhoto] = useState(localStorage.getItem("userPhoto") || "https://picsum.photos/seed/admin/200/200");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const role = localStorage.getItem("role");
        const studentId = localStorage.getItem("studentId");
        const teacherId = localStorage.getItem("teacherId");
        const url = role === "student" ? `http://localhost:7000/api/students/${studentId}` : (role === "teacher" ? `http://localhost:7000/api/teachers/${teacherId}` : null);

        if (url && studentId || teacherId) {
          const res = await fetch(url);
          const data = await res.json();
          if (data) {
            const name = `${data.firstName} ${data.lastName || ''}`.trim();
            setUserName(name);
            localStorage.setItem("userName", name);
            if (data.profilePhoto) {
              setUserPhoto(data.profilePhoto);
              localStorage.setItem("userPhoto", data.profilePhoto);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch user in Navbar", err);
      }
    };

    const forceUpdate = () => {
      setUserName(localStorage.getItem("userName") || "Student");
      setUserPhoto(localStorage.getItem("userPhoto") || "https://picsum.photos/seed/admin/200/200");
    };

    window.addEventListener('profileUpdated', forceUpdate);

    if (userName === "Student" || userName === "User" || !localStorage.getItem("userPhoto")) {
      fetchUserData();
    }

    return () => window.removeEventListener('profileUpdated', forceUpdate);
  }, []);

  const getPageDisplayName = () => {
    const pageNames = {
      dashboard: 'Dashboard',
      classroom: 'Classroom',
      routine: 'Routine',
      calendar: 'Calendar',
      exam: 'Examination',
      notification: 'Notifications',
      profile: 'My Profile'
    };
    return pageNames[activePage] || 'Dashboard';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = useMemo(() => {
    if (searchQuery.trim().length < 3) return [];
    return STUDENT_POOL.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.includes(searchQuery)
    ).slice(0, 4); // Limit to 4 students as requested
  }, [searchQuery]);

  useEffect(() => {
    setShowSuggestions(suggestions.length > 0);
  }, [suggestions]);

  const handleSelectSuggestion = (id) => {
    setSearchQuery('');
    setShowSuggestions(false);
    navigate(`/student/classroom`);
  };

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
    <div className="w-full flex items-center justify-between transition-colors">
      {/* Title & Date */}
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight transition-colors">{getPageDisplayName()}</h2>
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 transition-colors">{formattedDate}</p>
      </div>

      {/* Enhanced Search Bar with Suggestions */}
      <div className="flex-1 max-w-md mx-8 relative" ref={searchRef}>
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search for students, teachers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/50 rounded-full pl-12 pr-10 text-sm font-medium text-slate-600 dark:text-slate-200 placeholder-slate-400 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-300 transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Suggestion Dropdown */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Matches</span>
            </div>
            <div className="p-2">
              {suggestions.map((student) => (
                <button
                  key={student.id}
                  onClick={() => handleSelectSuggestion(student.id)}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all text-left group"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-black text-[10px] shrink-0">
                    {student.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-emerald-600 transition-colors">{student.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID: {student.studentId} • Grade {student.grade}</p>
                  </div>
                  <ArrowRight size={14} className="text-slate-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 text-center border-t border-slate-50 dark:border-slate-800">
              <button
                onClick={() => navigate('/student/classroom')}
                className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest hover:underline"
              >
                View Global Registry
              </button>
            </div>
          </div>
        )}
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
            <div className="max-h-[350px] overflow-y-auto scrollbar-hide">
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
          onClick={() => navigate('/student/profile')}
          className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-emerald-500/20 transition-all">
            <img
              src={userPhoto}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight transition-colors">
              {userName}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase transition-colors">Student Profile</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Navbar;