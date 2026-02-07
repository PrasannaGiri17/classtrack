import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Calendar, Check, AlertCircle } from "lucide-react";
import { toast } from "../../MainSystemComponents/Toast";

const AddEventModal = ({ isOpen, onClose, onEventAdded }) => {
  const [isRange, setIsRange] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "event", // event, holiday, exam
    startDate: "",
    endDate: "",
    sendTo: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRangeToggle = (status) => {
    setIsRange(status);
    if (!status) {
      // If switching to single, clear end date or sync it on submit
      setFormData(prev => ({ ...prev, endDate: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        type: formData.category.toUpperCase(), // HOLIDAY, EXAMS, EVENT
        startDate: formData.startDate,
        endDate: isRange ? formData.endDate : formData.startDate,
        audience: formData.sendTo,
        description: formData.description,
        school_id: 1, // Default
        // Optional: map category to color explicitly if needed, 
        // but backend adds default based on type.
        // color: ...
      };

      const response = await fetch("http://localhost:7000/api/calendar/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      const data = await response.json();

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
        category: "event",
        startDate: "",
        endDate: "",
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
              <Calendar className="text-white w-6 h-6" />
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
                <option value="event">Campus Event</option>
                <option value="holiday">School Holiday</option>
                <option value="exams">Examination Period</option>
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
              <input
                required
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                type="date"
                className="w-full px-7 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[20px] text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:text-slate-200 shadow-inner"
              />
            </div>

            <div className={`md:col-span-6 space-y-2.5 ${!isRange ? "hidden" : ""}`}>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                End Date
              </label>
              <input
                disabled={!isRange}
                required={isRange}
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                type="date"
                className="w-full px-7 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[20px] text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:text-slate-200 shadow-inner disabled:opacity-50"
              />
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
                <option value="Students">Students</option>
                <option value="Teachers">Teachers</option>
                <option value="Whole School">Whole School</option>
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

          {/* Smart Notification Banner */}
          <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-[24px] border border-emerald-100 dark:border-emerald-900/30">
            <AlertCircle className="text-emerald-500 shrink-0" size={20} />
            <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 leading-relaxed uppercase tracking-wider">
              Smart Notification Enabled: Push alerts will be broadcasted to all enrolled users
              24h prior to the start date.
            </p>
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
