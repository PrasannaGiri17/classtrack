import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Moon, Check, ArrowRight, User, X, Users, Building2, SquareUser } from 'lucide-react';
import { FaRegUser } from "react-icons/fa6";
import { TbMessageChatbot } from "react-icons/tb";
import axios from 'axios';


const SuNavbar = ({ activePage, isDarkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allSchools, setAllSchools] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchRef = useRef(null);

  // Fetch schools from backend
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('superAdminToken');
        const response = await axios.get('http://localhost:7000/api/school', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setAllSchools(response.data);
      } catch (error) {
        console.error("Error fetching schools for search:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

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
      messagebot: 'Chatbot Message'
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
    if (searchQuery.trim().length < 2) return [];
    return allSchools.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.address && s.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.schoolId && s.schoolId.toString().includes(searchQuery))
    ).slice(0, 5);
  }, [searchQuery, allSchools]);

  useEffect(() => {
    setShowSuggestions(suggestions.length > 0);
  }, [suggestions]);

  const handleSelectSuggestion = (id) => {
    setSearchQuery('');
    setShowSuggestions(false);
    navigate(`/super-admin/school/${id}`);
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
            placeholder="Search for School..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 bg-white dark:bg-slate-800 border border-emerald-100 dark:border-emerald-900/50 rounded-full pl-12 pr-10 text-sm font-medium text-slate-600 dark:text-slate-200 placeholder-slate-400 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-300 transition-all outline-none"
          />
          {loading && (
            <div className="absolute right-12 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-emerald-500"></div>
            </div>
          )}
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
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">School Matches</span>
            </div>
            <div className="p-2">
              {suggestions.map((school) => (
                <button
                  key={school._id || school.schoolId}
                  onClick={() => handleSelectSuggestion(school.schoolId || school._id)}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all text-left group"
                >
                  <div className="w-12 h-12 flex items-center justify-center shrink-0">
                    {school.logo ? (
                      <img src={school.logo} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <Building2 size={24} className="text-emerald-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-emerald-600 transition-colors">{school.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID: {school.schoolId} • {school.address || school.location || 'Location Not Set'}</p>
                  </div>
                  <ArrowRight size={14} className="text-slate-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 text-center border-t border-slate-50 dark:border-slate-800">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                  navigate('/super-admin/school');
                }}
                className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 tracking-widest hover:underline"
              >
                View All Schools
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 relative">
        {/* Message Bot */}
        <button
          onClick={() => navigate('/super-admin/messagebot')}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
          title="SU Message Bot"
        >
          <TbMessageChatbot className="w-5 h-5" />
        </button>

        {/* Dark Mode Toggle */}

        <button
          onClick={toggleDarkMode}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2 transition-colors"></div>

        {/* User Profile */}
        <button className="flex items-center gap-3 p-1.5 pr-4 rounded-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left group">
          <div className="w-12 h-12 rounded-none flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-emerald-500/20 transition-all">
            <FaRegUser className="w-7 h-7 text-slate-500 dark:text-slate-400 group-hover:text-emerald-500 transition-colors" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight transition-colors">
              {localStorage.getItem("suUserName") || "Super Admin"}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase transition-colors">SUPER ADMIN</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default SuNavbar;