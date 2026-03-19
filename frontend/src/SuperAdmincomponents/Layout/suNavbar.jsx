import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Bell, Sun, Moon, Check, ArrowRight, User, X, MessageSquare } from 'lucide-react';
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

const SuNavbar = ({ activePage, isDarkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchRef = useRef(null);

  const getPageDisplayName = () => {
    const pageNames = {
      dashboard: 'Dashboard',
      school: 'School Management',
      student: 'Student Records',
      teacher: 'Teacher Management',
      timetable: 'Timetable',
      classroom: 'Classroom',
      calendar: 'Calendar',
      exam: 'Examination',
      notification: 'Notifications',
      fees: 'Fee Management',
      messages: 'Messages'
    };
    return pageNames[activePage] || 'Dashboard';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    // Force re-render on profile update
    const handleUpdate = () => setUpdateTrigger(prev => !prev);
    window.addEventListener('profileUpdated', handleUpdate);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('profileUpdated', handleUpdate);
    };
  }, []);

  const [, setUpdateTrigger] = useState(false);

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
    navigate(`/student-record`); // In a real app, this would be a specific student ID path
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
                onClick={() => navigate('/super-admin/school')}
                className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest hover:underline"
              >
                View Global Registry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 relative">

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
          onClick={() => navigate('/super-admin/messages')}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all relative ${activePage === 'messages'
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100 dark:shadow-none'
            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400'
            }`}
          title="Messages"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2 transition-colors"></div>

        {/* User Profile */}
        <button className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left group">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-emerald-500/20 transition-all">
            <img
              src={localStorage.getItem("userPhoto") || "https://i.pinimg.com/736x/8b/27/ff/8b27ff4a7a6cefb81f33d8282b5dfaa7.jpg"}
              alt="Profile"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight transition-colors">
              {localStorage.getItem("suUserName") || "Super Admin"}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase transition-colors">SUPERADMIN</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default SuNavbar;