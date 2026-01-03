import React, { useState } from "react";
import axios from "axios";
import { X, UserPlus, Check, AlertCircle, User, Phone, BookOpen } from "lucide-react";
import FailedPopup from "../SmallerComponents/FailedPopup";

const AddPopupTeacher = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phoneNo: "",
    subject: "",
    secondarySubject: "",
    class: [],
    email: "",
    currentAddress: "",
  });

  const [popup, setPopup] = useState({
    message: "",
    type: "error",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClassChange = (selectedClass) => {
    if (formData.class.includes(selectedClass)) {
      setFormData({
        ...formData,
        class: formData.class.filter((c) => c !== selectedClass),
      });
    } else if (formData.class.length < 3) {
      setFormData({
        ...formData,
        class: [...formData.class, selectedClass],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const parts = formData.name.trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || ".";

    try {
      const res = await axios.post("http://localhost:7000/teachers/add", {
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phoneNo,
        gender: formData.gender,
        currentAddress: formData.currentAddress,
        qualification: formData.age, // Mapping age to qualification as an example
        primarySubject: null,
        secondarySubject: null,
        assignedGrades: [],
        assignedSections: [],
      });

      setPopup({
        message: res.data?.message || "Teacher record successfully saved.",
        type: "success",
      });

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        setFormData({
          name: "",
          age: "",
          gender: "",
          phoneNo: "",
          subject: "",
          secondarySubject: "",
          class: [],
          email: "",
          currentAddress: "",
        });
        setPopup({ message: "", type: "error" });
      }, 1500);
    } catch (err) {
      setPopup({
        message: err?.response?.data?.message || "Record creation failed. Please check your inputs.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 pt-6 sm:pt-12 bg-black/70 animate-in fade-in duration-300 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <FailedPopup message={popup.message} type={popup.type} onClose={() => setPopup({ ...popup, message: "" })} />
      
      <div 
        className="relative bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-[92vw] max-w-screen-lg max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 slide-in-from-top-4 duration-300 scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 border-b border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <UserPlus size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Enroll Teacher</h2>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1.5">New Academic Record</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all group"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
            
            {/* Left Column: Faculty Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                 <User size={12} className="text-emerald-500" />
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Personal Identification</span>
                 <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-2" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                <input name="name" required onChange={handleChange} value={formData.name} placeholder="e.g. Cristiano Ronaldo" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white shadow-inner" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Age</label>
                  <input name="age" type="number" required onChange={handleChange} value={formData.age} placeholder="Years" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white shadow-inner" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                  <select name="gender" required onChange={handleChange} value={formData.gender} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white cursor-pointer shadow-inner">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Residential Address</label>
                <textarea name="currentAddress" required onChange={handleChange} value={formData.currentAddress} rows={3} placeholder="Complete physical home address" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white resize-none shadow-inner" />
              </div>
            </div>

            {/* Right Column: Academic & Contact */}
            <div className="space-y-8">
              {/* Specialized Skills */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                   <BookOpen size={12} className="text-emerald-500" />
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Academic Specialization</span>
                   <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Core Subject</label>
                    <input name="subject" required onChange={handleChange} value={formData.subject} placeholder="e.g. Science" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white shadow-inner" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Elective Subject</label>
                    <input name="secondarySubject" required onChange={handleChange} value={formData.secondarySubject} placeholder="e.g. English" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white shadow-inner" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assigned Grades (Max 3)</label>
                  <div className="flex flex-wrap gap-2 p-1">
                    {classes.map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => handleClassChange(cls)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          formData.class.includes(cls)
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500"
                        } ${
                          formData.class.length >= 3 && !formData.class.includes(cls)
                            ? "opacity-30 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={formData.class.length >= 3 && !formData.class.includes(cls)}
                      >
                        Grade {cls}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                   <Phone size={12} className="text-emerald-500" />
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact & Portal Access</span>
                   <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-2" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Primary Phone Number</label>
                  <input name="phoneNo" type="tel" required onChange={handleChange} value={formData.phoneNo} placeholder="Mobile or Work contact" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white shadow-inner" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Official Portal Email</label>
                  <input name="email" type="email" required onChange={handleChange} value={formData.email} placeholder="For academic communication" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white shadow-inner" />
                </div>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30 flex items-start gap-3">
            <AlertCircle className="text-emerald-500 mt-0.5 shrink-0" size={16} />
            <p className="text-[9px] font-medium text-emerald-800 dark:text-emerald-300 leading-relaxed uppercase tracking-wider">
              Verification Notice: By publishing this record, you confirm that the academic qualifications and contact details have been officially verified.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 sticky bottom-0 bg-white dark:bg-slate-900 pb-2 border-t dark:border-slate-800">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3.5 rounded-xl text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Discard
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2 px-10 py-3.5 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/30 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check size={16} strokeWidth={3} />
              )}
              Submit Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPopupTeacher;