import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    User,
    Phone,
    Mail,
    MapPin,
    BookOpen,
    GraduationCap,
    Calendar,
    ChevronDown,
    Check,
    X,
    AlertCircle,
    ArrowLeft,
    Shield,
    Pencil,
    Loader2
} from "lucide-react";
import teacherService from "../Api/teacherService";
import gradeService from "../Api/gradeService";
import axios from "axios";
import { toast } from "../MainSystemComponents/Toast";
import Loading from "../MainSystemComponents/Loading";
import ConfirmDialog from "../MainSystemComponents/ConfirmDialog";
import AddPopupTeacher from "../AdminComponents/Admin/AddPopupTeacher";

const calculateAge = (birthDate) => {
    if (!birthDate) return "";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

const TeacherPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [allSubjects, setAllSubjects] = useState([]);
    const [schoolConfig, setSchoolConfig] = useState(null);
    const [teacher, setTeacher] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [pendingPhoto, setPendingPhoto] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [formData, setFormData] = useState({
        name: "",
        birthdate: "",
        qualification: "",
        gender: "",
        phoneNo: "",
        subject: "",
        secondarySubject: "",
        class: [],
        assignedSections: [],
        email: "",
        currentAddress: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch teacher data
                const teacherData = await teacherService.getTeacherById(id);
                setTeacher(teacherData);

                // Pre-fill form
                setFormData({
                    name: `${teacherData.firstName} ${teacherData.lastName}`,
                    birthdate: teacherData.birthdate ? new Date(teacherData.birthdate).toISOString().split('T')[0] : "",
                    qualification: teacherData.qualification || "",
                    gender: teacherData.gender || "",
                    phoneNo: teacherData.phone || "",
                    subject: typeof teacherData.primarySubject === 'object' ? teacherData.primarySubject?.subjectName : teacherData.primarySubject || "",
                    secondarySubject: typeof teacherData.secondarySubject === 'object' ? teacherData.secondarySubject?.subjectName : teacherData.secondarySubject || "",
                    class: teacherData.assignedGrades?.map(g => String(g.gradeNumber || g)) || [],
                    assignedSections: teacherData.assignedSections || [],
                    email: teacherData.email || "",
                    currentAddress: teacherData.currentAddress || "",
                });

                // Fetch school config and subjects
                const [schoolRes, gradesData] = await Promise.all([
                    axios.get("http://localhost:7000/api/school"),
                    gradeService.getGrades()
                ]);

                setSchoolConfig(schoolRes.data);

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
                console.error("Failed to fetch data:", err);
                toast({ type: 'error', message: "Failed to load faculty details." });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, refreshTrigger]);

    const classes = React.useMemo(() => {
        if (!schoolConfig || !schoolConfig.gradeSpan) return [];
        const { start, end } = schoolConfig.gradeSpan;
        const list = [];
        for (let i = start; i <= end; i++) {
            list.push(String(i));
        }
        return list;
    }, [schoolConfig]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleClassChange = (selectedClass) => {
        if (formData.class.includes(selectedClass)) {
            setFormData({ ...formData, class: formData.class.filter((c) => c !== selectedClass) });
        } else if (formData.class.length < 3) {
            setFormData({ ...formData, class: [...formData.class, selectedClass] });
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast({ type: 'error', message: "Image size should be less than 2MB." });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPendingPhoto(reader.result);
                setIsConfirmOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const confirmPhotoChange = () => {
        setPhotoPreview(pendingPhoto);
        setIsConfirmOpen(false);
        setPendingPhoto(null);
        toast({ type: 'success', message: "Profile photo updated in memory. Remember to save the record!", duration: 3000 });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const parts = formData.name.trim().split(/\s+/);
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ") || ".";

        try {
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
                profilePhoto: photoPreview || teacher.profilePhoto,
            };

            const response = await teacherService.updateTeacher(id, payload);
            if (response.teacher) {
                setTeacher(response.teacher);
                setPhotoPreview(null);
            }
            toast({ type: 'success', message: "Faculty record updated successfully." });
        } catch (err) {
            console.error(err);
            toast({ type: 'error', message: "Update failed. Please check your inputs." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
    };

    if (loading) {
        return (
            <div className="w-full h-[80vh] flex items-center justify-center">
                <Loading text="Syncing Faculty records..." fullScreen={false} />
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="w-full h-[80vh] flex flex-col items-center justify-center text-slate-400">
                <AlertCircle className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-sm font-bold">Faculty Record Not Found</p>
                <button onClick={() => navigate(-1)} className="mt-6 text-emerald-500 font-bold flex items-center gap-2">
                    <ArrowLeft size={16} /> GO BACK
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* 1. Slim Compact Header */}
            <div className="relative w-full bg-white dark:bg-[#0b1220] rounded-[40px] shadow-xl border border-slate-100 dark:border-slate-800/40 overflow-hidden transition-all group/card mb-8">
                {/* Header Banner */}
                <div className="h-10 md:h-12 w-full bg-emerald-600 dark:bg-emerald-700 relative overflow-hidden transition-colors duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
                    <div className="absolute top-[-50%] right-[-5%] w-48 h-48 bg-white/10 rounded-full blur-2xl" />

                    {/* Back/Close Button */}
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-white transition-all backdrop-blur-md border border-white/10 group/close z-10"
                        title="Back to Records"
                    >
                        <X size={14} className="transition-transform group-hover/close:rotate-90" />
                    </button>
                </div>

                {/* Main Identity Section */}
                <div className="px-8 md:px-14 pb-10">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 -mt-6 md:-mt-8 relative z-10">
                        {/* Avatar & Basic Info Group */}
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
                            <div className="relative group">
                                <div className="w-36 h-36 md:w-40 md:h-40 rounded-[36px] bg-[#0b1220] p-1.5 shadow-xl border border-white/10 relative overflow-hidden">
                                    <div className="w-full h-full rounded-[30px] overflow-hidden bg-slate-800 relative flex items-center justify-center">
                                        {(photoPreview || teacher.profilePhoto) ? (
                                            <img src={photoPreview || teacher.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={48} className="text-emerald-500/30" />
                                        )}
                                    </div>
                                </div>
                                <div className="absolute bottom-1 right-1 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white border-4 border-[#0b1220] shadow-lg z-20">
                                    <Shield size={14} fill="currentColor" />
                                </div>
                            </div>

                            <div className="text-center md:text-left pb-1 flex flex-col items-center md:items-start">
                                <div className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-black mb-3 w-fit transition-all text-emerald-500">
                                    Teacher
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-4">
                                    {teacher.firstName} {teacher.lastName}
                                </h2>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-5">
                                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
                                        <Shield size={14} className="text-emerald-500" />
                                        <span className="text-xs font-black tracking-[0.1em] text-slate-700 dark:text-slate-300">{teacher.teacherCode}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats / IDs */}
                        <div className="bg-slate-50/50 dark:bg-white/5 backdrop-blur-md rounded-[32px] border border-slate-100 dark:border-white/10 px-8 py-5 flex items-center justify-between lg:min-w-[420px]">
                            <div className="flex-1 flex flex-col items-center text-center min-w-fit">
                                <p className="text-[9px] font-black text-slate-400 mb-1.5">Main Subject</p>
                                <p className="text-lg font-black text-emerald-500 tracking-tight leading-none">
                                    {typeof teacher.primarySubject === 'object' ? teacher.primarySubject?.subjectName : teacher.primarySubject || "N/A"}
                                </p>
                            </div>
                            <div className="w-px h-8 bg-slate-200 dark:bg-white/10 mx-4" />
                            <div className="flex-1 flex flex-col items-center text-center min-w-fit">
                                <p className="text-[9px] font-black text-slate-400 mb-1.5">Qualification</p>
                                <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">{teacher.qualification || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-white/10 w-full my-8" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-x-8 gap-y-6">
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black text-slate-400">Email Address</p>
                            <p className="text-sm font-black text-slate-800 dark:text-white lowercase tracking-tight break-all">{teacher.email}</p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black text-slate-400">Contact No</p>
                            <p className="text-sm font-black text-slate-800 dark:text-white tracking-tight">{teacher.phone || "N/A"}</p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black text-slate-400">Date of Birth</p>
                            <p className="text-sm font-black text-slate-800 dark:text-white tracking-tight">
                                {teacher.birthdate ? new Date(teacher.birthdate).toLocaleDateString('en-GB') : "N/A"}
                                {teacher.birthdate && (
                                    <span className="text-emerald-500 ml-1">({calculateAge(teacher.birthdate)})</span>
                                )}
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black text-slate-400">Assigned Grades</p>
                            <p className="text-sm font-black text-slate-800 dark:text-white tracking-tight">
                                {teacher.assignedGrades?.map(g => g.gradeNumber || g).join(", ") || "N/A"}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsEditPopupOpen(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black rounded-xl transition-all shadow-sm shadow-emerald-500/30 hover:shadow-md hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <Pencil size={12} />
                                Edit
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {/* Main Form Fields */}
                <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-lg p-12 shadow-emerald-500/5">
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {/* Personal Identification Group */}
                            <div className="space-y-6 md:col-span-2">
                                <div className="flex items-center gap-3">
                                    <User size={14} className="text-emerald-500" />
                                    <span className="text-[11px] font-black text-slate-400">Personal Identification</span>
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 ml-1">Full Legal Name</label>
                                        <input
                                            name="name"
                                            readOnly
                                            value={formData.name}
                                            placeholder="e.g. Cristiano Ronaldo"
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl outline-none text-sm font-black transition-all dark:text-white shadow-inner cursor-default"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 ml-1">Date of Birth</label>
                                        <div className="relative group">
                                            <input
                                                name="birthdate"
                                                type="date"
                                                readOnly
                                                value={formData.birthdate}
                                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl outline-none text-sm font-black transition-all dark:text-white shadow-inner cursor-default"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 ml-1">Qualification</label>
                                        <input
                                            name="qualification"
                                            readOnly
                                            value={formData.qualification}
                                            placeholder="e.g. M.Ed, B.Sc"
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl outline-none text-sm font-black transition-all dark:text-white shadow-inner cursor-default"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 ml-1">Gender</label>
                                        <div className="relative group">
                                            <select
                                                name="gender"
                                                disabled
                                                value={formData.gender}
                                                className="appearance-none w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl outline-none text-sm font-black transition-all dark:text-white shadow-inner cursor-default"
                                            >
                                                <option value="">Select</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 ml-1">Residential Address</label>
                                        <textarea
                                            name="currentAddress"
                                            readOnly
                                            value={formData.currentAddress}
                                            rows={3}
                                            placeholder="Complete physical home address"
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl outline-none text-sm font-black transition-all dark:text-white resize-none shadow-inner cursor-default"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Academic Specialization Group */}
                            <div className="space-y-6 md:col-span-2">
                                <div className="flex items-center gap-3">
                                    <BookOpen size={14} className="text-emerald-500" />
                                    <span className="text-[11px] font-black text-slate-400">Academic Specialization</span>
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 ml-1">Main Subject</label>
                                        <div className="relative group">
                                            <select
                                                name="subject"
                                                disabled
                                                value={formData.subject}
                                                className="appearance-none w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl outline-none text-sm font-black transition-all dark:text-white shadow-inner cursor-default"
                                            >
                                                <option value="">Select Main Subject</option>
                                                {allSubjects.map(sub => (
                                                    <option key={sub} value={sub}>{sub}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 ml-1">Secondary Subject</label>
                                        <div className="relative group">
                                            <select
                                                name="secondarySubject"
                                                disabled
                                                value={formData.secondarySubject}
                                                className="appearance-none w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl outline-none text-sm font-black transition-all dark:text-white shadow-inner cursor-default"
                                            >
                                                <option value="">Select Secondary Subject</option>
                                                {allSubjects.map(sub => (
                                                    <option key={sub} value={sub}>{sub}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="md:col-span-1 space-y-3">
                                        <label className="text-[10px] font-bold text-slate-400 ml-1">Assigned Grades</label>
                                        <div className="flex flex-wrap gap-3">
                                            {classes.map((cls) => (
                                                <button
                                                    key={cls}
                                                    type="button"
                                                    className={`px-6 py-3 rounded-2xl text-[10px] font-black transition-all border cursor-default ${formData.class.includes(cls)
                                                        ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                                                        : "bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-800"
                                                        }`}
                                                    disabled
                                                >
                                                    Grade {cls}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="md:col-span-1 space-y-3">
                                        <label className="text-[10px] font-bold text-slate-400 ml-1">Assigned Classrooms</label>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.assignedSections && formData.assignedSections.length > 0 ? (
                                                formData.assignedSections.map((room) => (
                                                    <div
                                                        key={room}
                                                        className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 rounded-xl text-[10px] font-black"
                                                    >
                                                        {room}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 text-slate-400 rounded-xl text-[10px] font-bold italic border border-slate-100 dark:border-slate-800">
                                                    No Classrooms Assigned
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact & Portal Group */}
                            <div className="space-y-6 md:col-span-2">
                                <div className="flex items-center gap-3">
                                    <Shield size={14} className="text-emerald-500" />
                                    <span className="text-[11px] font-black text-slate-400">Contact & Portal Access</span>
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 ml-1">Primary Phone Number</label>
                                        <input
                                            name="phoneNo"
                                            type="tel"
                                            readOnly
                                            value={formData.phoneNo}
                                            placeholder="Mobile or Work contact"
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl outline-none text-sm font-black transition-all dark:text-white shadow-inner cursor-default"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 ml-1">Official Portal Email</label>
                                        <input
                                            name="email"
                                            type="email"
                                            readOnly
                                            value={formData.email}
                                            placeholder="For academic communication"
                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl outline-none text-sm font-black transition-all dark:text-white shadow-inner cursor-default"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => {
                    setIsConfirmOpen(false);
                    setPendingPhoto(null);
                }}
                onConfirm={confirmPhotoChange}
                title="Change Profile Photo?"
                message="Are you sure you want to change the profile photo? You will still need to click 'Edit Faculty' above and save to update this permanently."
            />

            <AddPopupTeacher
                isOpen={isEditPopupOpen}
                onClose={() => setIsEditPopupOpen(false)}
                onSuccess={() => {
                    setIsEditPopupOpen(false);
                    setRefreshTrigger(prev => prev + 1);
                    toast({ type: 'success', message: "Faculty record updated successfully." });
                }}
                teacherToEdit={teacher}
            />
        </div >
    );
};

export default TeacherPage;
