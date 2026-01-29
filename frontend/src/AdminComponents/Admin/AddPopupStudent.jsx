import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import {
  X,
  UserPlus,
  Check,
  AlertCircle,
  User,
  Phone,
  GraduationCap,
} from "lucide-react";
import FailedPopup from "../SmallerComponents/FailedPopup";

export const AddPopupStudent = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    birthdate: "",
    gender: "",
    parentName: "",
    parentPhone: "",
    loginEmail: "",
    currentAddress: "",
    class: "",
  });

  const [popup, setPopup] = useState({ message: "", type: "error" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation: Age 5+
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 5);
  const maxDateString = maxDate.toISOString().split('T')[0];

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const parts = formData.name.trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || ".";

    // Client-side validations
    if (!/^\d{10}$/.test(formData.parentPhone)) {
      setPopup({ message: "Parent phone number must be exactly 10 digits.", type: "error" });
      setIsSubmitting(false);
      return;
    }

    const birthDate = new Date(formData.birthdate);
    if (birthDate > maxDate) {
      setPopup({ message: "Student must be at least 5 years old.", type: "error" });
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post("http://localhost:7000/api/students/add", {
        firstName,
        lastName,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        email: formData.loginEmail,
        Address: formData.currentAddress,
        studentClass: Number(formData.class),
        birthdate: formData.birthdate,
        gender: formData.gender,
      });

      setPopup({ message: "Student record successfully saved.", type: "success" });

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        setFormData({
          name: "",
          birthdate: "",
          gender: "",
          parentName: "",
          parentPhone: "",
          loginEmail: "",
          currentAddress: "",
          class: "",
        });
        setPopup({ message: "", type: "error" });
      }, 1500);
    } catch (err) {
      setPopup({
        message:
          err?.response?.data?.message ||
          "Record creation failed. Please check your inputs.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-start justify-center p-4 sm:p-6 pt-6 sm:pt-12 animate-in fade-in duration-300 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <FailedPopup
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ ...popup, message: "" })}
      />

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
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                Enroll Student
              </h2>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1.5">
                New Student Record
              </p>
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
            {/* Left Column: Personal Identification */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <User size={12} className="text-emerald-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Personal Details
                </span>
                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-2" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Full Name
                </label>
                <input
                  name="name"
                  required
                  onChange={handleChange}
                  value={formData.name}
                  placeholder="e.g. Cristiano Ronaldo"
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white placeholder:text-slate-300 shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Birthdate
                  </label>
                  <input
                    name="birthdate"
                    type="date"
                    required
                    max={maxDateString}
                    onChange={handleChange}
                    value={formData.birthdate}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    required
                    onChange={handleChange}
                    value={formData.gender}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white cursor-pointer shadow-inner"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Residential Address
                </label>
                <textarea
                  name="currentAddress"
                  required
                  onChange={handleChange}
                  value={formData.currentAddress}
                  rows={3}
                  placeholder="Complete physical address"
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white resize-none shadow-inner"
                />
              </div>
            </div>

            {/* Right Column: Academic & Guardian */}
            <div className="space-y-8">
              {/* Academic Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <GraduationCap size={12} className="text-emerald-500" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Academic Placement
                  </span>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-2" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Grade
                  </label>
                  <select
                    name="class"
                    required
                    onChange={handleChange}
                    value={formData.class}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white shadow-inner"
                  >
                    <option value="">Select Grade</option>
                    {[...Array(13)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Grade {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guardian Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-emerald-500" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Guardian & Access
                  </span>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-2" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Parent/Guardian Name
                    </label>
                    <input
                      name="parentName"
                      required
                      onChange={handleChange}
                      value={formData.parentName}
                      placeholder="Full legal name"
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white shadow-inner"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Parent Number
                    </label>
                    <input
                      name="parentPhone"
                      required
                      type="tel"
                      pattern="\d{10}"
                      title="Please enter a 10-digit phone number"
                      maxLength={10}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setFormData({ ...formData, parentPhone: val });
                      }}
                      value={formData.parentPhone}
                      placeholder="Primary phone number (10 digits)"
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Login Email
                  </label>
                  <input
                    name="loginEmail"
                    type="email"
                    required
                    onChange={handleChange}
                    value={formData.loginEmail}
                    placeholder="For academic portal access"
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30 flex items-start gap-3">
            <AlertCircle className="text-emerald-500 mt-0.5 shrink-0" size={16} />
            <p className="text-[9px] font-medium text-emerald-800 dark:text-emerald-300 leading-relaxed uppercase tracking-wider">
              Verification Notice: Data entered here will be synced with the official student records.
              Ensure all credentials are correct before publishing.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 sticky bottom-0 bg-white dark:bg-slate-900 pb-2 border-t dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 rounded-xl text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
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
              Enroll Student
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
