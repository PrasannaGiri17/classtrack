import React, { useState } from 'react';
import { X, Calendar, Check, AlertCircle } from 'lucide-react';

const AddEventModal = ({ isOpen, onClose }) => {
  const [isRange, setIsRange] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Modal Header */}
        <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20">
              <Calendar className="text-white w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Create New Event</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Manage Academic Schedule</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-400">
            <X size={28} />
          </button>
        </div>

        {/* Form Body */}
        <form className="p-10 space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Title</label>
            <input 
              type="text" 
              placeholder="e.g. Science Exhibition or Mid-Term Exams" 
              className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:text-slate-200 shadow-inner"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Category</label>
              <select className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:text-slate-200 cursor-pointer shadow-inner">
                <option value="event">Campus Event</option>
                <option value="holiday">School Holiday</option>
                <option value="exam">Examination Period</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Multiple Days?</label>
              <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl shadow-inner">
                <button 
                  type="button"
                  onClick={() => setIsRange(false)}
                  className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isRange ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' : 'text-slate-400'}`}
                >
                  Single
                </button>
                <button 
                  type="button"
                  onClick={() => setIsRange(true)}
                  className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isRange ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' : 'text-slate-400'}`}
                >
                  Range
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isRange ? 'Start Date' : 'Event Date'}</label>
              <input 
                type="date" 
                className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:text-slate-200 shadow-inner"
              />
            </div>
            {isRange && (
              <div className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-300">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                <input 
                  type="date" 
                  className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:text-slate-200 shadow-inner"
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Description</label>
            <textarea 
              rows={3}
              placeholder="Provide context for teachers and parents..."
              className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:text-slate-200 resize-none shadow-inner"
            ></textarea>
          </div>

          <div className="flex items-center gap-4 p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-[28px] border border-emerald-100 dark:border-emerald-900/30">
            <AlertCircle className="text-emerald-500 shrink-0" size={24} />
            <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 leading-relaxed uppercase tracking-wider">
              Smart Notification Enabled: Push alerts will be broadcasted to all enrolled users 24h prior to the start date.
            </p>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6">
            <button 
              type="button"
              onClick={onClose}
              className="px-10 py-5 rounded-2xl text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Discard
            </button>
            <button 
              type="submit"
              onClick={(e) => { e.preventDefault(); onClose(); }}
              className="flex items-center gap-3 px-14 py-5 bg-emerald-500 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Check size={20} strokeWidth={3} />
              Publish Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;