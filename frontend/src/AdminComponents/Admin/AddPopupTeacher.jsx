import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { X, UserPlus, Check, User, Phone, BookOpen, ChevronDown } from "lucide-react";
import FailedPopup from "../SmallerComponents/FailedPopup";
import gradeService from "../../Api/gradeService";

const STORAGE_KEY = "draftTeacherEnrollment";

const AddPopupTeacher = ({ isOpen, onClose, onSuccess, teacherToEdit = null }) => {
  const initialData = {
    name: "",
    birthdate: "1995-01-01",
    qualification: "",
    gender: "",
    phoneNo: "",
    subject: "",
    secondarySubject: "",
    class: [],
    email: "",
    currentAddress: "",
  };

  const [formData, setFormData] = useState(initialData);

  const [popup, setPopup] = useState({ message: "", type: "error" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schoolConfig, setSchoolConfig] = useState(null);
  const [allSubjects, setAllSubjects] = useState([]);
  const [emailError, setEmailError] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const schoolId = localStorage.getItem("adminSchoolId") || localStorage.getItem("schoolId") || 1;
        const schoolRes = await axios.get(
          schoolId
            ? `http://localhost:7000/api/school/${schoolId}`
            : "http://localhost:7000/api/school"
        );
        const schoolData = Array.isArray(schoolRes.data)
          ? schoolRes.data.find(s => String(s.schoolId) === String(schoolId) || String(s._id) === String(schoolId)) || schoolRes.data[0]
          : schoolRes.data;
        setSchoolConfig(schoolData);

        const gradesData = await gradeService.getGrades(schoolId);
        if (gradesData && Array.isArray(gradesData)) {
          const subjectsSet = new Set();
          gradesData.forEach(g => {
            if (g.subjects) {
              g.subjects.forEach(s => {
                if (s.subjectId && s.subjectId.subjectName) {
                  subjectsSet.add(s.subjectId.subjectName);
                }
              });
            }
          });
          setAllSubjects(Array.from(subjectsSet).sort());
        }
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      }
    };
    if (isOpen) {
      fetchInitialData();
      if (teacherToEdit) {
        setFormData({
          name: `${teacherToEdit.firstName} ${teacherToEdit.lastName}`,
          birthdate: teacherToEdit.birthdate ? new Date(teacherToEdit.birthdate).toISOString().split('T')[0] : "1995-01-01",
          qualification: teacherToEdit.qualification || "",
          gender: teacherToEdit.gender || "",
          phoneNo: teacherToEdit.phone || "",
          subject: teacherToEdit.primarySubject?.subjectName || "",
          secondarySubject: teacherToEdit.secondarySubject?.subjectName || "",
          class: teacherToEdit.assignedGrades?.map(g => String(g.gradeNumber || g)) || [],
          email: teacherToEdit.email || "",
          currentAddress: teacherToEdit.currentAddress || "",
          classTeacher: teacherToEdit.classTeacher || "",
          assignedClasses: teacherToEdit.assignedClasses || null,
        });
      } else {
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
    }
  }, [isOpen, teacherToEdit]);

  const classes = React.useMemo(() => {
    if (!schoolConfig || !schoolConfig.gradeSpan) return [];
    const { start, end } = schoolConfig.gradeSpan;
    const list = [];
    for (let i = start; i <= end; i++) {
      list.push(String(i));
    }
    return list;
  }, [schoolConfig]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "phoneNo") {
      newValue = value.replace(/\D/g, "").slice(0, 10);
    }
    const updated = { ...formData, [name]: newValue };
    setFormData(updated);

    if (!teacherToEdit) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const handleClassChange = (selectedClass) => {
    let newClasses;
    if (formData.class.includes(selectedClass)) {
      newClasses = formData.class.filter((c) => c !== selectedClass);
    } else if (formData.class.length < 3) {
      newClasses = [...formData.class, selectedClass];
    } else {
      return;
    }

    const updated = { ...formData, class: newClasses };
    setFormData(updated);

    if (!teacherToEdit) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const handleEmailBlur = async () => {
    if (!formData.email || !formData.email.includes("@")) return;

    try {
      setIsCheckingEmail(true);
      const params = { email: formData.email };
      if (teacherToEdit) {
        params.excludeId = teacherToEdit._id;
        params.role = 'teacher';
      }
      
      const res = await axios.get("http://localhost:7000/api/auth/check-email", { params });
      if (res.data.exists) {
        setEmailError("This email is already registered.");
      } else {
        setEmailError("");
      }
    } catch (err) {
      console.error("Email check failed:", err);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (emailError) {
      setPopup({ message: emailError, type: "error" });
      return;
    }
    setIsSubmitting(true);
    const parts = formData.name.trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || ".";

    if (formData.phoneNo && formData.phoneNo.length !== 10) {
      setPopup({ message: "Phone number must be exactly 10 digits.", type: "error" });
      setIsSubmitting(false);
      return;
    }

    try {
      const schoolId = Number(localStorage.getItem("adminSchoolId") || localStorage.getItem("schoolId") || 1);
      const payload = {
        firstName, lastName, email: formData.email, phone: formData.phoneNo,
        gender: formData.gender, birthdate: formData.birthdate, currentAddress: formData.currentAddress,
        qualification: formData.qualification, primarySubject: formData.subject,
        secondarySubject: formData.secondarySubject, assignedGrades: formData.class, schoolId,
      };

      if (teacherToEdit) {
        await axios.put(`http://localhost:7000/api/teachers/${teacherToEdit._id}`, payload);
      } else {
        await axios.post("http://localhost:7000/api/teachers/add", payload);
        localStorage.removeItem(STORAGE_KEY);
      }

      setPopup({ message: `Teacher record successfully saved.`, type: "success" });
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        if (!teacherToEdit) setFormData(initialData);
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
    <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300 overflow-hidden" onClick={onClose}>
      <FailedPopup message={popup.message} type={popup.type} onClose={() => setPopup({ ...popup, message: "" })} />
      <div className="relative bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-[92vw] max-w-screen-lg border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 slide-in-from-top-4 duration-300 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <UserPlus size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white leading-none">{teacherToEdit ? "Edit Teacher" : "Enroll Teacher"}</h2>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1.5 tracking-widest uppercase font-black">Faculty Management</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <User size={12} className="text-emerald-500" />
                <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase text-xs uppercase font-black">Personal Details</span>
                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-2" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1 uppercase">Full Legal Name</label>
                <input name="name" required onChange={handleChange} value={formData.name} placeholder="Enter Full Name" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold dark:text-white shadow-inner" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1 uppercase">Date of Birth</label>
                <input name="birthdate" type="date" required onChange={handleChange} value={formData.birthdate} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold dark:text-white shadow-inner cursor-pointer dark:[color-scheme:dark]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1 uppercase">Qualification</label>
                  <input name="qualification" type="text" required onChange={handleChange} value={formData.qualification} placeholder="M.Ed, PhD" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold dark:text-white shadow-inner" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1 uppercase text-xs uppercase">Gender</label>
                  <select
                    name="gender" required onChange={handleChange} value={formData.gender}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold dark:text-white cursor-pointer shadow-inner dark:[color-scheme:dark]"
                  >
                    <option value="" className={optionClass}>Select</option>
                    <option value="male" className={optionClass}>Male</option>
                    <option value="female" className={optionClass}>Female</option>
                    <option value="other" className={optionClass}>Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1 uppercase uppercase text-xs">Residential Address</label>
                <textarea name="currentAddress" required onChange={handleChange} value={formData.currentAddress} rows={3} placeholder="Complete physical address" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold dark:text-white shadow-inner resize-none" />
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen size={12} className="text-emerald-500" />
                  <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase text-xs">Academic Specialization</span>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1 uppercase text-xs">Main Subject</label>
                    <div className="relative group">
                      <select name="subject" required onChange={handleChange} value={formData.subject} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none appearance-none pr-12 text-sm font-bold dark:text-white cursor-pointer shadow-inner dark:[color-scheme:dark]">
                        <option value="" className={optionClass}>Subject</option>
                        {allSubjects.map(s => <option key={s} value={s} className={optionClass}>{s}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1 uppercase text-xs">Secondary</label>
                    <div className="relative group">
                      <select name="secondarySubject" onChange={handleChange} value={formData.secondarySubject} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none appearance-none pr-12 text-sm font-bold dark:text-white cursor-pointer shadow-inner dark:[color-scheme:dark]">
                        <option value="" className={optionClass}>None</option>
                        {allSubjects.map(s => <option key={s} value={s} className={optionClass}>{s}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1 uppercase text-xs font-black">Assigned Grades (Max 3)</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {classes.map(cls => (
                      <button key={cls} type="button" onClick={() => handleClassChange(cls)} className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${formData.class.includes(cls) ? "bg-emerald-500 text-white shadow-lg active:scale-95" : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 active:scale-95 disabled:opacity-30"}`} disabled={formData.class.length >= 3 && !formData.class.includes(cls)}>Grade {cls}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-emerald-500" />
                  <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase text-xs">Contact Access</span>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-2" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1 uppercase">Phone Number</label>
                  <input name="phoneNo" type="tel" maxLength={10} onChange={handleChange} value={formData.phoneNo} placeholder="10-digit number" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold dark:text-white shadow-inner" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1 uppercase">Official Email</label>
                  <input 
                    name="email" 
                    type="email" 
                    required 
                    onChange={(e) => {
                      handleChange(e);
                      if (emailError) setEmailError("");
                    }} 
                    onBlur={handleEmailBlur}
                    value={formData.email} 
                    placeholder="faculty@example.com" 
                    className={`w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 text-sm font-bold dark:text-white shadow-inner transition-all ${emailError ? "ring-2 ring-red-500/50" : "focus:ring-emerald-500/20"}`} 
                  />
                  {emailError && <p className="text-[10px] font-bold text-red-500 ml-1 mt-1">{emailError}</p>}
                  {isCheckingEmail && <p className="text-[10px] font-bold text-emerald-500 ml-1 mt-1 animate-pulse">Checking availability...</p>}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-slate-800">
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 font-medium hover:bg-slate-800 transition-all active:scale-95">Cancel</button>
            <button type="submit" disabled={isSubmitting || !!emailError || isCheckingEmail} className="px-8 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-bold shadow-lg shadow-emerald-500/20 active:scale-95">{isSubmitting ? '...' : (teacherToEdit ? 'Update' : 'Enroll Teacher')}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddPopupTeacher;
