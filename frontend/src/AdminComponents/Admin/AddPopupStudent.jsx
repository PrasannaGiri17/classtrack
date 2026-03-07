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
  ChevronDown,
} from "lucide-react";
import FailedPopup from "../SmallerComponents/FailedPopup";
import gradeService from "../../Api/gradeService";

export const AddPopupStudent = ({ isOpen, onClose, onSuccess, mode = 'add', studentData = null }) => {
  const isEditMode = mode === 'edit';
  const [formData, setFormData] = useState({
    name: "",
    birthdate: "",
    gender: "",
    fatherName: "",
    fatherPhone: "",
    motherName: "",
    motherPhone: "",
    loginEmail: "",
    currentAddress: "",
    class: "",
  });

  // Populate data when in edit mode
  useEffect(() => {
    if (isEditMode && studentData && isOpen) {
      setFormData({
        name: studentData.name || `${studentData.firstName || ''} ${studentData.lastName || ''}`.trim(),
        birthdate: studentData.birthdate ? new Date(studentData.birthdate).toISOString().split('T')[0] : "",
        gender: studentData.gender || "",
        fatherName: studentData.fatherName || "",
        fatherPhone: studentData.fatherPhone || "",
        motherName: studentData.motherName || "",
        motherPhone: studentData.motherPhone || "",
        loginEmail: studentData.email || "",
        currentAddress: studentData.Address || "",
        class: studentData.studentClass || studentData.class || "",
      });
    } else if (!isEditMode && isOpen) {
      // Reset for new enrollment
      setFormData({
        name: "",
        birthdate: "",
        gender: "",
        fatherName: "",
        fatherPhone: "",
        motherName: "",
        motherPhone: "",
        loginEmail: "",
        currentAddress: "",
        class: "",
      });
    }
  }, [isEditMode, studentData, isOpen]);

  const [popup, setPopup] = useState({ message: "", type: "error" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [grades, setGrades] = useState([]);

  // Fetch grades from backend
  useEffect(() => {
    const fetchGrades = async () => {
      if (isOpen) {
        try {
          const data = await gradeService.getGrades();
          if (Array.isArray(data)) {
            // Sort grades numerically
            const sortedGrades = data.sort((a, b) => a.gradeNumber - b.gradeNumber);
            setGrades(sortedGrades);
          }
        } catch (err) {
          console.error("Failed to fetch grades:", err);
        }
      }
    };
    fetchGrades();
  }, [isOpen]);

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

    // Validation: at least one guardian name required
    if (!formData.fatherName.trim() && !formData.motherName.trim()) {
      setPopup({ message: "Please enter at least Father Name or Mother Name.", type: "error" });
      setIsSubmitting(false);
      return;
    }

    // Validate phone numbers (if filled, must be 10 digits)
    if (formData.fatherPhone && !/^\d{10}$/.test(formData.fatherPhone)) {
      setPopup({ message: "Father's phone number must be exactly 10 digits.", type: "error" });
      setIsSubmitting(false);
      return;
    }
    if (formData.motherPhone && !/^\d{10}$/.test(formData.motherPhone)) {
      setPopup({ message: "Mother's phone number must be exactly 10 digits.", type: "error" });
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
      if (isEditMode && studentData?._id) {
        await axios.put(`http://localhost:7000/api/students/${studentData._id}`, {
          firstName,
          lastName,
          fatherName: formData.fatherName,
          fatherPhone: formData.fatherPhone,
          motherName: formData.motherName,
          motherPhone: formData.motherPhone,
          email: formData.loginEmail,
          Address: formData.currentAddress,
          studentClass: Number(formData.class),
          birthdate: formData.birthdate,
          gender: formData.gender,
        });
        setPopup({ message: "Student record updated successfully.", type: "success" });
      } else {
        await axios.post("http://localhost:7000/api/students/add", {
          firstName,
          lastName,
          fatherName: formData.fatherName,
          fatherPhone: formData.fatherPhone,
          motherName: formData.motherName,
          motherPhone: formData.motherPhone,
          email: formData.loginEmail,
          Address: formData.currentAddress,
          studentClass: Number(formData.class),
          birthdate: formData.birthdate,
          gender: formData.gender,
        });
        setPopup({ message: "Student record successfully saved.", type: "success" });
      }

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        setFormData({
          name: "",
          birthdate: "",
          gender: "",
          fatherName: "",
          fatherPhone: "",
          motherName: "",
          motherPhone: "",
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
      className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300 overflow-y-auto"
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
                {isEditMode ? 'Edit Student' : 'Enroll Student'}
              </h2>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-[0.2em] mt-1.5">
                {isEditMode ? 'Update Student Record' : 'New Student Record'}
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
                <span className="text-[9px] font-black text-slate-400 tracking-widest">
                  Personal Details
                </span>
                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-2" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1">
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
                  <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1">
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
                  <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1">
                    Gender
                  </label>
                  <div className="relative group">
                    <select
                      name="gender"
                      required
                      onChange={handleChange}
                      value={formData.gender}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white cursor-pointer shadow-inner dark:[color-scheme:dark] appearance-none pr-12"
                    >
                      <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select</option>
                      <option value="male" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Male</option>
                      <option value="female" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Female</option>
                      <option value="other" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Other</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1">
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
                  <span className="text-[9px] font-black text-slate-400 tracking-widest">
                    Academic Placement
                  </span>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-2" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1">
                    Grade
                  </label>
                  <div className="relative group">
                    <select
                      name="class"
                      required
                      onChange={handleChange}
                      value={formData.class}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white shadow-inner cursor-pointer dark:[color-scheme:dark] appearance-none pr-12"
                    >
                      <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select Grade</option>
                      {grades.map((grade) => (
                        <option key={grade._id || grade.gradeNumber} value={grade.gradeNumber} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                          Grade {grade.gradeNumber}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              </div>

              {/* Guardian Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-emerald-500" />
                  <span className="text-[9px] font-black text-slate-400 tracking-widest">
                    Guardian & Access
                  </span>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-2" />
                </div>

                {/* Father */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1">
                      Father Name <span className="text-emerald-500">*</span>
                    </label>
                    <input
                      name="fatherName"
                      onChange={handleChange}
                      value={formData.fatherName}
                      placeholder="Father's full name"
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1">
                      Father Number
                    </label>
                    <input
                      name="fatherPhone"
                      type="tel"
                      maxLength={10}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setFormData({ ...formData, fatherPhone: val });
                      }}
                      value={formData.fatherPhone}
                      placeholder="10-digit number"
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white shadow-inner"
                    />
                  </div>
                </div>

                {/* Mother */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 tracking-widests ml-1">
                      Mother Name <span className="text-emerald-500">*</span>
                    </label>
                    <input
                      name="motherName"
                      onChange={handleChange}
                      value={formData.motherName}
                      placeholder="Mother's full name"
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 tracking-widests ml-1">
                      Mother Number
                    </label>
                    <input
                      name="motherPhone"
                      type="tel"
                      maxLength={10}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setFormData({ ...formData, motherPhone: val });
                      }}
                      value={formData.motherPhone}
                      placeholder="10-digit number"
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white shadow-inner"
                    />
                  </div>
                </div>

                {/* Note */}
                <p className="text-[9px] text-slate-400 font-bold ml-1">* At least one of Father Name or Mother Name is required.</p>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1">
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


          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 sticky bottom-0 bg-white dark:bg-slate-900 pb-2 border-t dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 rounded-xl text-slate-500 font-black text-[10px] tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-10 py-3.5 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all font-black text-[10px] tracking-widest shadow-lg shadow-emerald-500/30 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check size={16} strokeWidth={3} />
              )}
              {isEditMode ? 'Save Changes' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
