import React, { useState } from 'react';
import { Plus, Bell, Download } from 'lucide-react';
import DetailedCalendar from '../AdminComponents/Calendar/DetailedCalendar';
import AddEventModal from '../AdminComponents/Calendar/AddEventModal';

const CalendarPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Academic Calendar
          </h1>
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2">
            Manage schedules, holidays, and campus events
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            <Download size={18} />
            Export
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={20} />
            Add Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Calendar View */}
        <div className="xl:col-span-3 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <DetailedCalendar />
        </div>

        {/* Sidebar Info & Notifications */}
        <div className="space-y-8">
          {/* Upcoming Highlights */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">
              Upcoming Events
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 bg-blue-500 text-white text-[9px] font-black uppercase rounded-lg">
                    Exams
                  </span>
                  <span className="text-[10px] font-bold text-blue-600">Dec 10-20</span>
                </div>

                <h4 className="text-xs font-black text-blue-900 dark:text-blue-200">
                  Final Semester Examinations
                </h4>
                <p className="text-[10px] font-bold text-blue-500 mt-1 uppercase tracking-wider">
                  All Secondary Classes
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 bg-red-500 text-white text-[9px] font-black uppercase rounded-lg">
                    Holiday
                  </span>
                  <span className="text-[10px] font-bold text-red-600">Dec 25</span>
                </div>

                <h4 className="text-xs font-black text-red-900 dark:text-red-200">
                  Christmas Break
                </h4>
                <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider">
                  Public Holiday
                </p>
              </div>
            </div>
          </div>

          {/* Smart Notification Alerts */}
          <div className="bg-emerald-600 dark:bg-emerald-700 p-8 rounded-[32px] text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                <Bell size={24} />
              </div>

              <h3 className="text-xl font-black mb-2">Smart Reminders</h3>

              <p className="text-emerald-50 text-xs font-bold leading-relaxed opacity-80">
                You have enabled automated reminders for all major holiday events.
              </p>

              <button className="mt-6 w-full py-3 bg-white text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-emerald-50 transition-all">
                Notification Settings
              </button>
            </div>

            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>

      <AddEventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default CalendarPage;
