import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { X, UserPlus, Check, AlertCircle, User, Phone, BookOpen, ChevronDown } from "lucide-react";
import FailedPopup from "../SmallerComponents/FailedPopup";
import gradeService from "../../Api/gradeService";

const AddPopupTeacher = ({ isOpen, onClose, onSuccess, teacherToEdit = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    birthdate: "",
    qualification: "",
    gender: "",
    phoneNo: "",
    subject: "",
    secondarySubject: "",
    class: [],
    email: "",
    currentAddress: "",
  });

  const [popup, setPopup] = useState({ message: "", type: "error" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schoolConfig, setSchoolConfig] = useState(null);
  const [allSubjects, setAllSubjects] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch school config scoped to the logged-in admin's school
        const adminSchoolId = localStorage.getItem("schoolId");
        const schoolRes = await axios.get(
          adminSchoolId
            ? `http://localhost:7000/api/school/${adminSchoolId}`
            : "http://localhost:7000/api/school"
        );
        // API may return a single object or an array; normalise to single object
        const schoolData = Array.isArray(schoolRes.data)
          ? schoolRes.data.find(s => String(s.schoolId) === String(adminSchoolId) || String(s._id) === String(adminSchoolId)) || schoolRes.data[0]
          : schoolRes.data;
        setSchoolConfig(schoolData);

        // Fetch subjects
        const gradesData = await gradeService.getGrades();
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
          birthdate: teacherToEdit.birthdate ? new Date(teacherToEdit.birthdate).toISOString().split('T')[0] : "",
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
        setFormData({
          name: "",
          birthdate: "",
          qualification: "",
          gender: "",
          phoneNo: "",
          subject: "",
          secondarySubject: "",
          class: [],
          email: "",
          currentAddress: "",
        });
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
  if (typeof document === "undefined") return null;

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
      setFormData({ ...formData, class: [...formData.class, selectedClass] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const parts = formData.name.trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || ".";

    try {
      const schoolId = Number(localStorage.getItem("schoolId") || 1);

      const payload = {
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phoneNo,
        gender: formData.gender,
        birthdate: formData.birthdate,
        currentAddress: formData.currentAddress,
        qualification: formData.qualification,
        primarySubject: formData.subject,
        secondarySubject: formData.secondarySubject,
        assignedGrades: formData.class,
        schoolId,
      };

      let res;
      if (teacherToEdit) {
        res = await axios.put(`http://localhost:7000/api/teachers/${teacherToEdit._id}`, payload);
      } else {
        res = await axios.post("http://localhost:7000/api/teachers/add", payload);
      }

      setPopup({
        message: res.data?.message || `Teacher record successfully ${teacherToEdit ? "updated" : "saved"}.`,
        type: "success",
      });

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        if (!teacherToEdit) {
          setFormData({
            name: "",
            birthdate: "",
            qualification: "",
            gender: "",
            phoneNo: "",
            subject: "",
            secondarySubject: "",
            class: [],
            email: "",
            currentAddress: "",
          });
        }
        setPopup({ message: "", type: "error" });
      }, 1500);
    } catch (err) {
      setPopup({
        message: err?.response?.data?.message || `Record ${teacherToEdit ? "update" : "creation"} failed. Please check your inputs.`,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300 overflow-hidden"
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
        className="relative bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-[92vw] max-w-screen-lg border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 slide-in-from-top-4 duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <UserPlus size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {teacherToEdit ? "Edit Teacher Record" : "Enroll Teacher"}
              </h2>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-[0.2em] mt-1.5">
                {teacherToEdit ? "Update Faculty Details" : "New Academic Record"}
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
        {/* Form (no scrolling) */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
            {/* Left Column */}
            <div className="space-y-6">

              <div className="flex items-center gap-2">
                <User size={12} className="text-emerald-500" />
                <span className="text-[9px] font-black text-slate-400 tracking-widest">
                  Personal Identification
                </span>
                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-2" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1">
                  Full Legal Name
                </label>
                <input
                  name="name"
                  required
                  onChange={handleChange}
                  value={formData.name}
                  placeholder="e.g. Cristiano Ronaldo"
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1">
                  Date of Birth
                </label>
                <input
                  name="birthdate"
                  type="date"
                  required
                  onChange={handleChange}
                  value={formData.birthdate}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white shadow-inner cursor-pointer"
                />
              </div>



              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1">
                    Qualification
                  </label>
                  <input
                    name="qualification"
                    type="text"
                    required
                    onChange={handleChange}
                    value={formData.qualification}
                    placeholder="e.g. M.Ed, B.Sc"
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    required
                    onChange={handleChange}
                    value={formData.gender}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white cursor-pointer shadow-inner dark:[color-scheme:dark]"
                  >
                    <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select</option>
                    <option value="male" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Male</option>
                    <option value="female" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Female</option>
                    <option value="other" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Other</option>
                  </select>
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
                  placeholder="Complete physical home address"
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white resize-none shadow-inner"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen size={12} className="text-emerald-500" />
                  <span className="text-[9px] font-black text-slate-400 tracking-widest">
                    Academic Specialization
                  </span>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1">
                      Main Subject
                    </label>
                    <div className="relative group">
                      <select
                        name="subject"
                        required
                        onChange={handleChange}
                        value={formData.subject}
                        className="appearance-none w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white shadow-inner cursor-pointer dark:[color-scheme:dark]"
                      >
                        <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Main Subject</option>
                        {allSubjects.map(sub => (
                          <option key={sub} value={sub} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{sub}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Secondary Subject <span className="text-[8px] opacity-70">(Optional)</span>
                    </label>
                    <div className="relative group">
                      <select
                        name="secondarySubject"
                        onChange={handleChange}
                        value={formData.secondarySubject}
                        className="appearance-none w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white shadow-inner cursor-pointer dark:[color-scheme:dark]"
                      >
                        <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">None</option>
                        {allSubjects.map(sub => (
                          <option key={sub} value={sub} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{sub}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1">
                    Assigned Grades (Max 3)
                  </label>
                  <div className="flex flex-wrap gap-2 p-1">
                    {classes.map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => handleClassChange(cls)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${formData.class.includes(cls)
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500"
                          } ${formData.class.length >= 3 && !formData.class.includes(cls)
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

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-emerald-500" />
                  <span className="text-[9px] font-black text-slate-400 tracking-widest">
                    Contact & Portal Access
                  </span>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-2" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1">
                    Primary Phone Number
                  </label>
                  <input
                    name="phoneNo"
                    type="tel"
                    required
                    onChange={handleChange}
                    value={formData.phoneNo}
                    placeholder="Mobile or Work contact"
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 tracking-widest ml-1">
                    Official Portal Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    onChange={handleChange}
                    value={formData.email}
                    placeholder="For academic communication"
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-bold transition-all dark:text-white shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-bold shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check size={18} />
              )}
              {teacherToEdit ? "Update Record" : "Submit Record"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddPopupTeacher;
