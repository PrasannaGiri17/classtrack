import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import reallogo from '../../../Assests/Real_Madrid_CF.svg.png';
import { MdOutlineDashboard } from "react-icons/md"
import { FaSchool } from "react-icons/fa"
import { FaChalkboardTeacher } from "react-icons/fa"
import { PiStudent } from "react-icons/pi"
import { MdOutlineMoreTime } from "react-icons/md"
import { SiGoogleclassroom } from "react-icons/si"
import { PiExam } from "react-icons/pi"
import { IoCalendarOutline } from "react-icons/io5"
import { IoIosNotificationsOutline } from "react-icons/io"
import { MdExitToApp } from "react-icons/md"

const Sidebar = ({ activePage, setActivePage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getActivePage = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/school')) return 'school';
    if (path.includes('/student-record')) return 'student';
    if (path.includes('/teacher')) return 'teacher';
    if (path.includes('/timetable')) return 'timetable';
    if (path.includes('/classroom')) return 'classroom';
    if (path.includes('/calendar')) return 'calendar';
    if (path.includes('/exam')) return 'exam';
    if (path.includes('/notification')) return 'notification';
    return 'dashboard';
  };

  // Use prop if provided, otherwise use local state
  const currentActivePage = activePage || getActivePage();
  
  const menuItems = [
    { key: 'dashboard', icon: MdOutlineDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { key: 'school', icon: FaSchool, label: 'School', path: '/admin/school' },
    { key: 'student', icon: PiStudent, label: 'Student Record', path: '/admin/student-record' },
    { key: 'teacher', icon: FaChalkboardTeacher, label: 'Teacher', path: '/admin/teacher' },
    { key: 'timetable', icon: MdOutlineMoreTime, label: 'Timetable', path: '/admin/timetable' },
    { key: 'classroom', icon: SiGoogleclassroom, label: 'Classroom', path: '/admin/classroom' },
    { key: 'calendar', icon: IoCalendarOutline, label: 'Calendar', path: '/admin/calendar' },
    { key: 'exam', icon: PiExam, label: 'Exam', path: '/admin/exam' },
    { key: 'notification', icon: IoIosNotificationsOutline, label: 'Notification', path: '/admin/notification' },
  ];

  const handleMenuClick = (pageKey, path) => {
    if (setActivePage) {
      setActivePage(pageKey);
    }
    navigate(path);
  };

  const handleExit = () => {
    navigate('/login'); 
  };

  const isActive = (pageKey) => currentActivePage === pageKey;

  return (
    <div className="w-full h-full bg-white">
      {/* Header Section */}
      <div className="mb-8 pt-6">
        <div className="flex items-center gap-3 px-4">
          <img 
            src={reallogo} 
            alt="Real Madrid Logo" 
            className="w-12 h-12 rounded-lg object-contain" 
          />
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
            Real Madrid
          </h1>
        </div>
      </div>

      {/* Menu Section */}
      <div className="flex flex-col flex-1 gap-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 px-4">
          Menu
        </p>
        <div className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={item.key}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg transition-all duration-200 hover:translate-x-1 mx-2 ${
                  isActive(item.key) 
                    ? 'bg-green-500 text-white' 
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => handleMenuClick(item.key, item.path)}
              >
                <IconComponent className={`w-5 h-5 transition-colors duration-200 ${
                  isActive(item.key) 
                    ? 'text-white' 
                    : 'text-gray-500 hover:text-green-500'
                }`} />
                <span className="text-sm">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-6 pt-4 border-t border-gray-300 mx-4">
        <div 
          className={`flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg transition-all duration-200 hover:translate-x-1 mx-2 ${
            isActive('exit') 
              ? 'bg-red-500 text-white' 
              : 'text-gray-900 hover:bg-gray-100'
          }`}
          onClick={handleExit}
        >
          <MdExitToApp className={`w-5 h-5 transition-colors duration-200 ${
            isActive('exit') 
              ? 'text-white' 
              : 'text-gray-500 hover:text-red-500'
          }`} />
          <span className="text-sm">Exit</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar