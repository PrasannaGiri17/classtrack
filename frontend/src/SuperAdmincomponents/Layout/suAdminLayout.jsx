import React, { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import SuSidebar from './suSidebar.jsx';
import SuNavbar from './suNavbar.jsx';

const SuAdminLayout = () => {
  const location = useLocation();
  const [activePage, setActivePage] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/dashboard')) setActivePage('dashboard');
    else if (path.includes('/schools')) setActivePage('schools');
    else if (path.includes('/school')) setActivePage('school');
    else if (path.includes('/student-record')) setActivePage('student');
    else if (path.includes('/teacher')) setActivePage('teacher');
    else if (path.includes('/timetable')) setActivePage('timetable');
    else if (path.includes('/classroom')) setActivePage('classroom');
    else if (path.includes('/calendar')) setActivePage('calendar');
    else if (path.includes('/exam')) setActivePage('exam');
    else if (path.includes('/notification')) setActivePage('notification');
    else if (path.includes('/fees')) setActivePage('fees');
    else if (path.includes('/messages')) setActivePage('messages');
  }, [location.pathname]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="flex w-full h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar - Fixed Left */}
      <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 z-30 shadow-sm transition-all duration-300">
        <SuSidebar activePage={activePage} />
      </aside>

      {/* Main Content Area */}
      <div className="ml-[260px] flex-1 flex flex-col h-screen relative overflow-hidden">
        {/* Navbar - Sticky Top */}
        <header className="sticky top-0 z-20 w-full h-[72px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-8 flex items-center transition-colors">
          <SuNavbar
            activePage={activePage}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
          />
        </header>

        {/* Scrollable Main View */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuAdminLayout;