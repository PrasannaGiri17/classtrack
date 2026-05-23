import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Bell, Sun, Moon, Check, ArrowRight, User, MessageSquare } from 'lucide-react';
import { FaRegUser } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import messageService from '../../Api/messageService';
import schoolNotificationService from '../../Api/schoolNotificationService';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ activePage, isDarkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?._id || user?.userId;
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const [userName, setUserName] = useState(() => {
    const stored = localStorage.getItem("userName");
    return (stored && stored !== "undefined") ? stored : "Student";
  });
  const [userPhoto, setUserPhoto] = useState(localStorage.getItem("userPhoto") || null);
  const [unreadConversations, setUnreadConversations] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

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
          if (data && data.firstName) {
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
      const stored = localStorage.getItem("userName");
      setUserName((stored && stored !== "undefined") ? stored : "Student");
      setUserPhoto(localStorage.getItem("userPhoto") || null);
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
      discussions: 'Discussions',
      diary: 'Class Diary',
      fee: 'Fee',
      assignments: 'Assignments',
      quiz: 'Quiz',
      routine: 'Routine',
      calendar: 'Calendar',
      exam: 'Examination',
      notification: 'Announcements',
      Announcements: 'Announcements',
      profile: 'My Profile',
      messages: 'Messages',
      activities: 'Notifications'
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

  // Messages Unread Count Polling
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const data = await messageService.getConversations();
        const count = data.filter(conv => conv.unreadCount > 0).length;
        setUnreadConversations(count);
      } catch (err) {
        console.error("Unread count fetch error:", err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Fetch school-wide notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoadingNotifications(true);
        const studentId = localStorage.getItem("studentId");
        if (studentId && studentId !== "undefined" && studentId !== "null") {
          const data = await schoolNotificationService.getNotifications('student', studentId);
          setNotifications(data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications for navbar:", error);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

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

  const handleMarkAsRead = async (id) => {
    try {
      await schoolNotificationService.markAsRead(id);
      setNotifications(prev => prev.map(n =>
        n._id === id ? { ...n, readBy: [...(n.readBy || []), userId] } : n
      ));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await schoolNotificationService.markAllAsRead('student');
      setNotifications(prev => prev.map(n => ({
        ...n,
        readBy: [...(new Set([...(n.readBy || []), userId]))]
      })));
    } catch (error) {
      console.error("Failed to mark all read:", error);
    }
  };

  return (
    <div className="w-full flex items-center justify-between transition-colors">
      {/* Title & Date */}
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight transition-colors">{getPageDisplayName()}</h2>
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 transition-colors">{formattedDate}</p>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

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
          onClick={() => navigate('/student/messages')}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all relative"
          title="Messages"
        >
          <MessageSquare className="w-5 h-5" />
          {unreadConversations > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center text-[9px] font-bold text-white px-1 shadow-sm">
              {unreadConversations}
            </span>
          )}
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
          {notifications.filter(n => !n.readBy?.includes(userId)).length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center text-[9px] font-bold text-white px-1 shadow-sm">
              {notifications.filter(n => !n.readBy?.includes(userId)).length}
            </span>
          )}
        </button>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="absolute top-full right-[4rem] mt-3 w-96 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-2xl shadow-slate-200/50 dark:shadow-none z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>

            </div>
            <div className="max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
              {loadingNotifications ? (
                <div className="p-8 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing alerts...</p>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => {
                      if (!notif.readBy?.includes(userId)) {
                        handleMarkAsRead(notif._id);
                      }
                    }}
                    className="p-4 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-xs font-bold ${notif.readBy?.includes(userId) ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap ml-2">{getTimeAgo(notif.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 group-hover:line-clamp-none transition-all">
                      {notif.message}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{notif.sender}</span>
                      {!notif.readBy?.includes(userId) && (
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No recent notifications</p>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/student/activities')}
              className="w-full p-4 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800/50"
            >
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
            {userPhoto ? (
              <img
                src={userPhoto}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <FaRegUser className="text-emerald-500 w-5 h-5" />
            )}
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