import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import {
  X,
  UserPlus,
  Check,
  User,
  Phone,
  GraduationCap,
  ChevronDown,
} from "lucide-react";
import FailedPopup from "../SmallerComponents/FailedPopup";
import gradeService from "../../Api/gradeService";

const STORAGE_KEY = "draftStudentEnrollment";

export const AddPopupStudent = ({ isOpen, onClose, onSuccess, mode = 'add', studentData = null }) => {
  const isEditMode = mode === 'edit';
  const initialData = {
    name: "",
    birthdate: "2015-01-01",
    gender: "",
    fatherName: "",
    fatherPhone: "",
    motherName: "",
    motherPhone: "",
    loginEmail: "",
    currentAddress: "",
    class: "",
  };

  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    if (isEditMode && studentData && isOpen) {
      setFormData({
        name: studentData.name || `${studentData.firstName || ''} ${studentData.lastName || ''}`.trim(),
        birthdate: studentData.birthdate ? new Date(studentData.birthdate).toISOString().split('T')[0] : "2015-01-01",
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
      // Check localStorage for draft
      const draft = localStorage.getItem(STORAGE_KEY);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setFormData({ ...initialData, ...parsed });
        } catch (e) {
          setFormData(initialData);
        }
      } else {
        setFormData(initialData);
      }
    }
  }, [isEditMode, studentData, isOpen]);

  const [popup, setPopup] = useState({ message: "", type: "error" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    const fetchGrades = async () => {
      if (isOpen) {
        try {
          const schoolId = localStorage.getItem("adminSchoolId") || localStorage.getItem("schoolId") || 1;
          const data = await gradeService.getGrades(schoolId);
          if (Array.isArray(data)) {
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

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 5);
  const maxDateString = maxDate.toISOString().split('T')[0];

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "fatherPhone" || name === "motherPhone") {
      newValue = value.replace(/\D/g, "").slice(0, 10);
    }
    const updated = { ...formData, [name]: newValue };
    setFormData(updated);

    // Save to localStorage ONLY if NOT in edit mode
    if (!isEditMode) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const parts = formData.name.trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || ".";

    if (!formData.fatherName.trim() && !formData.motherName.trim()) {
      setPopup({ message: "Please enter at least Father Name or Mother Name.", type: "error" });
      setIsSubmitting(false);
      return;
    }

    if (formData.fatherPhone && formData.fatherPhone.length !== 10) {
      setPopup({ message: "Father's phone number must be 10 digits.", type: "error" });
      setIsSubmitting(false);
      return;
    }
    if (formData.motherPhone && formData.motherPhone.length !== 10) {
      setPopup({ message: "Mother's phone number must be 10 digits.", type: "error" });
      setIsSubmitting(false);
      return;
    }

    try {
      const schoolId = Number(localStorage.getItem("adminSchoolId") || localStorage.getItem("schoolId") || 1);
      const newClassNum = Number(formData.class);

      const payload = {
        firstName, lastName,
        fatherName: formData.fatherName, fatherPhone: formData.fatherPhone,
        motherName: formData.motherName, motherPhone: formData.motherPhone,
        email: formData.loginEmail, Address: formData.currentAddress,
        studentClass: newClassNum, birthdate: formData.birthdate,
        gender: formData.gender, schoolId
      };

      // AUTOMATIC ACADEMIC PLACEMENT SYNC ON EDIT
      if (isEditMode && studentData) {
        // Find the full grade object for the selected class number
        const newGradeObj = grades.find(g => Number(g.gradeNumber) === newClassNum);

        // If the grade number has changed from the original record
        if (newClassNum !== Number(studentData.studentClass)) {
          console.log(`Grade changed from ${studentData.studentClass} to ${newClassNum}. Updating classId and resetting section.`);
          payload.classId = newGradeObj ? newGradeObj._id : null;
          payload.sectionId = null; // Remove from existing section as it belongs to old grade
        } else {
          // Grade is same, preserve existing IDs if not specifically changed elsewhere
          payload.classId = studentData.classId || (newGradeObj ? newGradeObj._id : null);
          payload.sectionId = studentData.sectionId || null;
        }
      } else {
        // NEW STUDENT ENROLLMENT
        const matchingGrade = grades.find(g => Number(g.gradeNumber) === newClassNum);
        payload.classId = matchingGrade ? matchingGrade._id : null;
        payload.sectionId = null; // New students start with no section
      }

      if (isEditMode && studentData) {
        await axios.put(`http://localhost:7000/api/students/${studentData._id}`, payload);
        setPopup({ message: "Student record updated successfully.", type: "success" });
      } else {
        await axios.post("http://localhost:7000/api/students/add", payload);
        // Clear draft on SUCCESSFUL enrollment
        localStorage.removeItem(STORAGE_KEY);
        setPopup({ message: "Student record successfully saved.", type: "success" });
      }

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        setFormData(initialData);
        setPopup({ message: "", type: "error" });
      }, 1500);
    } catch (err) {
      setPopup({ message: err?.response?.data?.message || "Operation failed.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const optionClass = "bg-white dark:bg-slate-900 text-slate-900 dark:text-white";

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300 overflow-y-auto" onClick={onClose}>
      <FailedPopup message={popup.message} type={popup.type} onClose={() => setPopup({ ...popup, message: "" })} />
      <div className="relative bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-[92vw] max-w-screen-lg max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 slide-in-from-top-4 duration-300 scrollbar-hide" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 border-b border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <UserPlus size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{isEditMode ? 'Edit Student' : 'Enroll Student'}</h2>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-[0.2em] mt-1.5 uppercase font-black">Record Management</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <User size={12} className="text-emerald-500" />
                <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase text-xs">Personal Details</span>
                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-2" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1 uppercase">Full Name</label>
                <input name="name" required onChange={handleChange} value={formData.name} placeholder="Student Full Name" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold dark:text-white shadow-inner" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1 uppercase">Birthdate</label>
                  <input name="birthdate" type="date" required max={maxDateString} onChange={handleChange} value={formData.birthdate} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold dark:text-white shadow-inner dark:[color-scheme:dark]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1 uppercase">Gender</label>
                  <div className="relative group">
                    <select
                      name="gender" required onChange={handleChange} value={formData.gender}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold dark:text-white cursor-pointer appearance-none pr-12 shadow-inner dark:[color-scheme:dark]"
                    >
                      <option value="" className={optionClass}>Select</option>
                      <option value="male" className={optionClass}>Male</option>
                      <option value="female" className={optionClass}>Female</option>
                      <option value="other" className={optionClass}>Other</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1 uppercase">Residential Address</label>
                <textarea name="currentAddress" required onChange={handleChange} value={formData.currentAddress} rows={3} placeholder="Complete physical address" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold dark:text-white shadow-inner resize-none" />
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <GraduationCap size={12} className="text-emerald-500" />
                  <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase text-xs">Academic Placement</span>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-2" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1 uppercase">Grade</label>
                  <div className="relative group">
                    <select
                      name="class" required onChange={handleChange} value={formData.class}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none appearance-none pr-12 text-sm font-bold dark:text-white cursor-pointer shadow-inner dark:[color-scheme:dark]"
                    >
                      <option value="" className={optionClass}>Select Grade</option>
                      {grades.map(g => (
                        <option key={g._id} value={g.gradeNumber} className={optionClass}>Grade {g.gradeNumber}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-emerald-500" />
                  <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase text-xs">Guardian & Access</span>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1 uppercase">Father Name <span className="text-emerald-500">*</span></label>
                    <input name="fatherName" onChange={handleChange} value={formData.fatherName} placeholder="Father full name" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold dark:text-white shadow-inner" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1 uppercase">Father Number</label>
                    <input name="fatherPhone" type="tel" maxLength={10} onChange={handleChange} value={formData.fatherPhone} placeholder="10 digits" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold dark:text-white shadow-inner" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1 uppercase">Mother Name <span className="text-emerald-500">*</span></label>
                    <input name="motherName" onChange={handleChange} value={formData.motherName} placeholder="Mother full name" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold dark:text-white shadow-inner" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1 uppercase">Mother Number</label>
                    <input name="motherPhone" type="tel" maxLength={10} onChange={handleChange} value={formData.motherPhone} placeholder="10 digits" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold dark:text-white shadow-inner" />
                  </div>
                </div>
                <div className="space-y-1.5 mt-4">
                  <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1 uppercase">Login Email</label>
                  <input name="loginEmail" type="email" required onChange={handleChange} value={formData.loginEmail} placeholder="student@example.com" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold dark:text-white shadow-inner" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-slate-800">
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 font-medium hover:bg-slate-800 transition-all active:scale-95">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-bold shadow-lg shadow-emerald-500/20 active:scale-95">{isSubmitting ? '...' : (isEditMode ? 'Update' : 'Enroll Student')}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
