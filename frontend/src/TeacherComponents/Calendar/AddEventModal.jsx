import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Calendar as CalendarIcon, Check, AlertCircle, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "../../MainSystemComponents/Toast";
import teacherService from "../../Api/teacherService";
import calendarService from "../../Api/calendarService";
import CustomNepaliHolidayCalendar from "../../MainSystemComponents/CustomNepaliHolidayCalendar";

const AddEventModal = ({ isOpen, onClose, onEventAdded }) => {
  const [isRange, setIsRange] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "class test", // class test, homework
    startDate: null,
    endDate: null,
    sendTo: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [classOptions, setClassOptions] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const startRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const events = await calendarService.getEvents();
        const holidayMapped = (events || []).filter(e => e && (e.type?.toUpperCase() === 'HOLIDAY' || e.isPublicHoliday));
        setHolidays(holidayMapped);
      } catch (err) {
        console.error("Failed to fetch holidays:", err);
      }
    };
    fetchHolidays();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (startRef.current && !startRef.current.contains(event.target)) setShowStartCalendar(false);
      if (endRef.current && !endRef.current.contains(event.target)) setShowEndCalendar(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const fetchTeacherClasses = async () => {
      const teacherId = localStorage.getItem('teacherId');
      if (!teacherId || teacherId === 'undefined' || teacherId === 'null') return;
      try {
        const teacher = await teacherService.getTeacherById(teacherId);
        const classes = teacher.assignedClasses || [];

        // Derived options like Whole Grade X
        const uniqueGrades = [...new Set(classes.map(c => {
          const m = c.match(/(?:Grade\s+|G)(\d+)/i);
          return m ? m[1] : null;
        }).filter(Boolean))];

        const wholeGradeOptions = uniqueGrades.map(g => `Whole Grade ${g}`);
        const allOptions = [...wholeGradeOptions, ...classes];
        setClassOptions(allOptions);
      } catch (err) {
        console.error('Failed to fetch teacher classes:', err);
      }
    };
    fetchTeacherClasses();
  }, [isOpen]);

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRangeToggle = (status) => {
    setIsRange(status);
    if (!status) {
      setFormData(prev => ({ ...prev, endDate: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.title || !formData.startDate || !formData.sendTo || (isRange && !formData.endDate)) {
      toast({
        type: 'error',
        message: 'Fill Title, Date, and Audience.',
        duration: 4000
      });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        title: formData.title,
        type: formData.category.toUpperCase(), // HOLIDAY, EXAMS, EVENT
        startDate: formData.startDate ? formData.startDate.toISOString() : null,
        endDate: isRange ? (formData.endDate ? formData.endDate.toISOString() : null) : (formData.startDate ? formData.startDate.toISOString() : null),
        audience: formData.sendTo,
        description: formData.description,
      };

      await calendarService.createEvent(payload);

      // Success Notification
      toast({
        type: 'success',
        message: 'Event published successfully!',
        duration: 4000
      });

      // Reset and close
      onEventAdded(); // Trigger refresh in parent
      setFormData({
        title: "",
        category: "class test",
        startDate: null,
        endDate: null,
        sendTo: "",
        description: ""
      });
      setIsRange(false);
      onClose();

    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        type: 'error',
        message: 'Failed to create event. Please check inputs.',
      });
    } finally {
      setLoading(false);
    }
  };


  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-10 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20">
              <CalendarIcon className="text-white w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                Create New Event
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">
                Manage Academic Schedule
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form
          id="add-event-form"
          className="flex-1 overflow-y-auto px-10 py-8 space-y-6 scrollbar-hide"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Event Title */}
            <div className="md:col-span-12 space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Event Title
              </label>
              <input
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                autoFocus
                type="text"
                placeholder="e.g. Science Exhibition or Mid-Term Exams"
                className="w-full px-7 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[20px] text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:text-slate-200 shadow-inner"
              />
            </div>

            {/* Event Category */}
            <div className="md:col-span-6 space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Event Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-7 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[20px] text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:text-slate-200 cursor-pointer shadow-inner appearance-none"
              >
                <option value="class test">Class Test</option>
                <option value="homework">Homework</option>
              </select>
            </div>

            {/* Multi-day Toggle */}
            <div className="md:col-span-6 space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Multiple Days?
              </label>
              <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-[20px] shadow-inner">
                <button
                  type="button"
                  onClick={() => handleRangeToggle(false)}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isRange
                    ? "bg-white dark:bg-slate-700 text-emerald-500 shadow-sm"
                    : "text-slate-400"
                    }`}
                >
                  Single
                </button>
                <button
                  type="button"
                  onClick={() => handleRangeToggle(true)}
                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isRange
                    ? "bg-white dark:bg-slate-700 text-emerald-500 shadow-sm"
                    : "text-slate-400"
                    }`}
                >
                  Range
                </button>
              </div>
            </div>

            {/* Dates */}
            <div className="md:col-span-6 space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {isRange ? "Start Date" : "Event Date"}
              </label>
              <div className="relative group" ref={startRef}>
                <button
                  type="button"
                  onClick={() => setShowStartCalendar(!showStartCalendar)}
                  className="w-full px-7 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[20px] text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:text-slate-200 shadow-inner flex items-center justify-between group"
                >
                  <span className={formData.startDate ? "text-slate-900 dark:text-white" : "text-slate-400"}>
                    {formData.startDate ? formData.startDate.toLocaleDateString() : (isRange ? "Select Start Date" : "Select Event Date")}
                  </span>
                  <CalendarIcon size={18} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                </button>

                <AnimatePresence>
                  {showStartCalendar && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
                      animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                      exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
                      className="absolute top-1/2 left-[70%] z-[9999] w-[480px] shadow-2xl"
                    >
                      <CustomNepaliHolidayCalendar
                        selectedDate={formData.startDate || new Date()}
                        onChange={(date) => {
                          setFormData({ ...formData, startDate: date });
                          setShowStartCalendar(false);
                        }}
                        holidays={holidays}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className={`md:col-span-6 space-y-2.5 ${!isRange ? "hidden" : ""}`}>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                End Date
              </label>
              <div className="relative group" ref={endRef}>
                <button
                  type="button"
                  disabled={!isRange}
                  onClick={() => setShowEndCalendar(!showEndCalendar)}
                  className="w-full px-7 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[20px] text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:text-slate-200 shadow-inner flex items-center justify-between group disabled:opacity-50"
                >
                  <span className={formData.endDate ? "text-slate-900 dark:text-white" : "text-slate-400"}>
                    {formData.endDate ? formData.endDate.toLocaleDateString() : "Select End Date"}
                  </span>
                  <CalendarIcon size={18} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                </button>

                <AnimatePresence>
                  {showEndCalendar && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
                      animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                      exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
                      className="absolute top-1/2 left-[70%] z-[9999] w-[480px] shadow-2xl"
                    >
                      <CustomNepaliHolidayCalendar
                        selectedDate={formData.endDate || new Date()}
                        onChange={(date) => {
                          setFormData({ ...formData, endDate: date });
                          setShowEndCalendar(false);
                        }}
                        holidays={holidays}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Send To */}
            <div className="md:col-span-12 space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Send To
              </label>
              <select
                name="sendTo"
                value={formData.sendTo}
                onChange={handleChange}
                required
                className="w-full px-7 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[20px] text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:text-slate-200 cursor-pointer shadow-inner appearance-none"
              >
                <option value="" disabled>Select audience</option>
                {classOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <p className="text-[10px] font-medium text-slate-400 ml-1 mt-1.5">
                Choose who will receive this event notification.
              </p>
            </div>

            {/* Internal Description */}
            <div className="md:col-span-12 space-y-2.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Internal Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Provide context for teachers and parents..."
                className="w-full px-7 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[24px] text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:text-slate-200 resize-none shadow-inner leading-relaxed"
              />
            </div>
          </div>


        </form>

        {/* Footer */}
        <div className="px-10 py-6 border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-end gap-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-4 rounded-xl text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Discard
          </button>

          <button
            type="submit"
            form="add-event-form"
            disabled={loading}
            className={`flex items-center gap-3 px-12 py-4 bg-emerald-500 text-white rounded-[20px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Publishing...' : (
              <>
                <Check size={18} strokeWidth={3} />
                Publish Event
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddEventModal;
