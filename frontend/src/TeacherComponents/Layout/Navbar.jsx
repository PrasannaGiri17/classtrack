import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Sun, Moon, Check, ArrowRight, User, MessageSquare, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import teacherService from '../../Api/teacherService';
import messageService from '../../Api/messageService';
import ForgotPasswordModal from './ForgotPasswordModal';

const Navbar = ({ activePage, isDarkMode, toggleDarkMode }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [teacherInfo, setTeacherInfo] = useState(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);
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
      profile: 'My Profile',
      messages: 'Messages',
      discussions: 'Discussion',
      diary: 'Diary',
      quiz: 'Quiz Management',
      assignments: 'Assignments'
    };
    return pageNames[activePage] || 'Dashboard';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Search using useEffect
  useEffect(() => {
    if (searchQuery.trim().length < 4) {
      setSearchResults([]);
      setIsSearching(false);
      if (searchQuery.trim().length === 0) setShowSearchResults(false);
      return;
    }

    // Immediately show dropdown when threshold is hit
    setShowSearchResults(true);
    setIsSearching(true);

    const handler = setTimeout(async () => {
      try {
        const data = await messageService.getContacts(searchQuery);
        setSearchResults(data);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleResultClick = (result) => {
    setShowSearchResults(false);
    setSearchQuery("");
    // Teachers usually want to view student profiles or message them
    if (result.role === 'teacher') {
       // In teacher portal, we don't have a teacher record view like admin has, but we could navigate to chat
      navigate('/teacher/messages', { state: { contactId: result._id } });
    } else if (result.role === 'student') {
      navigate('/teacher/student-profile', { state: { studentId: result.studentId?._id || result._id } });
    }
  };

  const studentMatches = searchResults.filter(r => r.role === 'student');
  const teacherMatches = searchResults.filter(r => r.role === 'teacher');

  // Fetch teacher details
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        let teacherId = localStorage.getItem("teacherId");
        if (teacherId === "undefined" || teacherId === "null") teacherId = null;

        if (teacherId && teacherId !== "undefined" && teacherId !== "null") {
          const data = await teacherService.getTeacherById(teacherId);
          setTeacherInfo(data);
          // Sync localStorage
          localStorage.setItem("userName", `${data.firstName} ${data.lastName}`);
          if (data.profilePhoto) localStorage.setItem("userPhoto", data.profilePhoto);
        } else {
          // Fallback to localStorage if fetch fails or ID is missing
          setTeacherInfo({
            firstName: localStorage.getItem("userName")?.split(' ')[0] || "User",
            lastName: localStorage.getItem("userName")?.split(' ').slice(1).join(' ') || "",
            profilePhoto: localStorage.getItem("userPhoto")
          });
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
      <div className="w-full flex items-center justify-between transition-colors z-[100] relative">
        <style>{`
          @keyframes bounce-dots {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          .dot-pulse {
            animation: bounce-dots 0.6s infinite ease-in-out;
          }
        `}</style>
        {/* Title & Date */}
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight transition-colors">{getPageDisplayName()}</h2>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 transition-colors">{formattedDate}</p>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8 relative" ref={searchRef}>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search for students, teachers..."
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val.trim().length >= 4) setShowSearchResults(true);
              }}
              onFocus={() => searchQuery.trim().length >= 4 && setShowSearchResults(true)}
              className="w-full h-11 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl pl-11 pr-16 text-sm focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/10 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none dark:text-slate-200 dark:placeholder-slate-500"
            />
            
            {/* SEARCHING INDICATOR (3 Dots) */}
            {isSearching && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2 flex gap-1 items-center z-10">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-emerald-500 rounded-full dot-pulse"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            )}

            {searchQuery && (
              <button 
                onClick={() => {setSearchQuery(""); setSearchResults([]); setShowSearchResults(false);}}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors z-10"
              >
                <X className="w-3 h-3 text-slate-400" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 min-h-[100px]">
              <div className="max-h-[350px] overflow-y-auto">
                {isSearching ? (
                  <div className="p-8 flex flex-col items-center justify-center gap-3">
                    <div className="flex gap-2">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-emerald-500 rounded-full dot-pulse"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Searching database...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="p-2">
                    {/* Student Matches */}
                    {studentMatches.length > 0 && (
                      <div className="mb-2 last:mb-0">
                        <div className="px-4 py-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Matches</p>
                        </div>
                        {studentMatches.map((result) => (
                          <button
                            key={result._id}
                            onClick={() => handleResultClick(result)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-left group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                              {result.profilePhoto ? (
                                <img src={result.profilePhoto} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-emerald-500 font-bold text-xs">{result.name?.[0]}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{result.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                ID: {result.studentIdStr || 'N/A'} • GRADE {result.studentClass || 'N/A'}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Teacher Matches */}
                    {teacherMatches.length > 0 && (
                      <div className="mb-2 last:mb-0 pt-2 border-t border-slate-50 dark:border-slate-700/50">
                        <div className="px-4 py-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teacher Matches</p>
                        </div>
                        {teacherMatches.map((result) => (
                          <button
                            key={result._id}
                            onClick={() => handleResultClick(result)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-left group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                              {result.profilePhoto ? (
                                <img src={result.profilePhoto} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-blue-500 font-bold text-xs">{result.name?.[0]}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{result.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                {result.teacherCode || 'FACULTY'} • {result.facultySubject || 'Teacher'}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700/50 rounded-2xl flex items-center justify-center mb-3">
                      <Search className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No matches found</p>
                    <p className="text-[10px] text-slate-400 mt-1">Try a different name or ID</p>
                  </div>
                )}
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

          {/* Messages */}
          <button
            onClick={() => navigate('/teacher/messages')}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all relative"
            title="Messages"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
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