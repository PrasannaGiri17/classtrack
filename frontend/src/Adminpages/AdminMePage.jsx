import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    User,
    Phone,
    Mail,
    MapPin,
    GraduationCap,
    Calendar,
    Check,
    X,
    AlertCircle,
    ArrowLeft,
    Shield,
    Pencil,
    Lock,
    Loader2
} from "lucide-react";
import ForgotPasswordModal from "../TeacherComponents/Layout/ForgotPasswordModal";
import adminService from "../Api/adminService";
import { toast } from "../MainSystemComponents/Toast";
import Loading from "../MainSystemComponents/Loading";
import ConfirmDialog from "../MainSystemComponents/ConfirmDialog";
import PhotoCropModal from "../MainSystemComponents/PhotoCropModal";
import { getDecodedToken } from "../Utils/authUtils";

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

const AdminMePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [admin, setAdmin] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [pendingPhoto, setPendingPhoto] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        birthdate: "",
        qualification: "",
        gender: "",
        phoneNo: "",
        email: "",
        currentAddress: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                let adminData;
                let targetId = id;
                if (!targetId || targetId === "undefined" || targetId === "null") {
                    targetId = localStorage.getItem("adminId");
                }

                // Deep sync: try to extract from JWT if missing
                if (!targetId || targetId === "undefined" || targetId === "null") {
                    const payload = getDecodedToken(localStorage.getItem("token"));
                    if (payload && payload.adminId) {
                        targetId = payload.adminId;
                        localStorage.setItem("adminId", targetId);
                    }
                }

                if (targetId && targetId !== "undefined" && targetId !== "null") {
                    adminData = await adminService.getAdminById(targetId);
                } else {
                    toast({ type: 'error', message: "Admin ID not found. Please log in again to sync your credentials." });
                    setLoading(false);
                    return;
                }

                if (!adminData) {
                    throw new Error("Admin record not found in database.");
                }

                setAdmin(adminData);
                localStorage.setItem("userName", `${adminData.firstName} ${adminData.lastName}`);
                if (adminData.profilePhoto) localStorage.setItem("userPhoto", adminData.profilePhoto);

                // Pre-fill form
                setFormData({
                    firstName: adminData.firstName || "",
                    lastName: adminData.lastName || "",
                    birthdate: adminData.birthdate ? new Date(adminData.birthdate).toISOString().split('T')[0] : "",
                    qualification: adminData.qualification || "",
                    gender: adminData.gender || "",
                    phoneNo: adminData.phone || "",
                    email: adminData.email || "",
                    currentAddress: adminData.currentAddress || "",
                });

            } catch (err) {
                console.error("Failed to fetch admin data:", err);
                toast({ type: 'error', message: "Failed to load admin profile." });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const targetId = id || localStorage.getItem("adminId");
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                birthdate: formData.birthdate,
                qualification: formData.qualification,
                gender: formData.gender,
                phone: formData.phoneNo,
                currentAddress: formData.currentAddress,
                // email is omitted or kept same as backend won't allow change if we don't send it or send it same
            };

            const response = await adminService.updateAdmin(targetId, payload);
            if (response.admin) {
                setAdmin(response.admin);
                localStorage.setItem("userName", `${response.admin.firstName} ${response.admin.lastName}`);
                window.dispatchEvent(new Event('profileUpdated'));
                toast({ type: 'success', message: "Profile updated successfully!" });
                setIsEditing(false);
            }
        } catch (err) {
            console.error("Save error:", err);
            toast({ type: 'error', message: "Failed to save profile changes." });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast({ type: 'error', message: "Image size should be less than 10MB." });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedFile(reader.result);
                setIsCropModalOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropDone = (croppedImage) => {
        setPendingPhoto(croppedImage);
        setIsCropModalOpen(false);
        setIsConfirmOpen(true);
    };

    const confirmPhotoChange = async () => {
        setIsConfirmOpen(false);
        setIsUploading(true);
        try {
            let targetId = id || localStorage.getItem("adminId");
            if (!targetId && admin?._id) targetId = admin._id;

            if (!targetId) {
                toast({ type: 'error', message: "Admin ID not found." });
                setIsUploading(false);
                return;
            }

            const payload = {
                firstName: admin.firstName,
                lastName: admin.lastName,
                email: admin.email,
                phone: admin.phone,
                gender: admin.gender,
                birthdate: admin.birthdate,
                currentAddress: admin.currentAddress,
                qualification: admin.qualification,
                profilePhoto: pendingPhoto,
            };

            const response = await adminService.updateAdmin(targetId, payload);

            if (response.admin) {
                setAdmin(response.admin);
            } else {
                setAdmin(prev => ({ ...prev, profilePhoto: pendingPhoto }));
            }

            // Update localStorage for Navbar
            if (pendingPhoto) localStorage.setItem("userPhoto", pendingPhoto);

            // Tell Navbar to update
            window.dispatchEvent(new Event('profileUpdated'));
            toast({ type: 'success', message: "Profile photo updated successfully!" });
        } catch (err) {
            console.error("Error updating profile photo:", err);
            toast({ type: 'error', message: "Failed to update profile photo." });
        } finally {
            setIsUploading(false);
            setPendingPhoto(null);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    if (loading) {
        return (
            <div className="w-full h-[80vh] flex items-center justify-center">
                <Loading text="Syncing Admin records..." fullScreen={false} />
            </div>
        );
    }

    if (!admin) {
        return (
            <div className="w-full h-[80vh] flex flex-col items-center justify-center text-slate-400">
                <AlertCircle className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-sm font-bold">Admin Record Not Found</p>
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
                <div className="h-10 md:h-12 w-full bg-slate-100 dark:bg-slate-900 relative overflow-hidden transition-colors duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent dark:from-black/10" />
                    <div className="absolute top-[-50%] right-[-5%] w-48 h-48 bg-emerald-500/5 dark:bg-white/10 rounded-full blur-2xl" />

                    {/* Back/Close Button */}
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-black/5 dark:bg-black/10 hover:bg-black/10 dark:hover:bg-black/20 text-slate-400 dark:text-white transition-all backdrop-blur-md border border-black/5 dark:border-white/10 group/close z-10"
                        title="Back"
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
                                <div className="w-36 h-36 md:w-40 md:h-40 rounded-[36px] bg-white dark:bg-[#0b1220] p-1.5 shadow-xl border border-slate-200 dark:border-white/10 relative overflow-hidden">
                                    <div
                                        className="w-full h-full rounded-[30px] overflow-hidden bg-slate-50 dark:bg-slate-800 relative flex items-center justify-center cursor-pointer group/photo"
                                        onClick={handlePhotoClick}
                                    >
                                        {isUploading ? (
                                            <Loader2 size={32} className="text-emerald-500 animate-spin" />
                                        ) : (
                                            <>
                                                {admin.profilePhoto ? (
                                                    <img src={admin.profilePhoto} alt="Profile" className="w-full h-full object-cover transition-all duration-300 group-hover/photo:scale-105" />
                                                ) : (
                                                    <User size={48} className="text-emerald-500/30" />
                                                )}

                                                <div className="absolute inset-0 bg-black/20 dark:bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                                    <div className="w-14 h-14 bg-white/20 rounded-[18px] flex items-center justify-center border border-white/30 shadow-2xl backdrop-blur-md">
                                                        <Pencil size={22} className="text-white drop-shadow-md" />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                        />
                                    </div>
                                </div>
                                <div className="absolute bottom-1 right-1 w-8 h-8 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-emerald-500 dark:text-emerald-400 border-4 border-slate-50 dark:border-[#0b1220] shadow-lg z-20">
                                    <Shield size={14} fill="currentColor" />
                                </div>
                            </div>

                            <div className="text-center md:text-left pb-1 flex flex-col items-center md:items-start">
                                <div className="px-2.5 py-0.5 bg-slate-500/10 border border-slate-500/20 rounded-lg text-[10px] font-black mb-3 w-fit transition-all text-slate-500 capitalize tracking-widest">
                                    Administrator
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-4">
                                    {admin.firstName} {admin.lastName}
                                </h2>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-5">
                                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
                                        <Shield size={14} className="text-slate-500" />
                                        <span className="text-xs font-black tracking-[0.1em] text-slate-700 dark:text-slate-300">ID: {admin._id.toString().slice(-6).toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-slate-50/50 dark:bg-white/5 backdrop-blur-md rounded-[32px] border border-slate-100 dark:border-white/10 px-8 py-5 flex items-center justify-between lg:min-w-[420px]">
                            <div className="flex-1 flex flex-col items-center text-center min-w-fit">
                                <p className="text-[9px] font-black text-slate-400 mb-1.5 capitalize tracking-widest">Role</p>
                                <p className="text-lg font-black text-emerald-500 tracking-tight leading-none capitalize">
                                    Headmaster
                                </p>
                            </div>
                            <div className="w-px h-8 bg-slate-200 dark:bg-white/10 mx-4" />
                            <div className="flex-1 flex flex-col items-center text-center min-w-fit">
                                <p className="text-[9px] font-black text-slate-400 mb-1.5 capitalize tracking-widest">Qualification</p>
                                <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">{admin.qualification || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-white/10 w-full my-8" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-x-8 gap-y-6">
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black text-slate-400 capitalize tracking-widest">Email Address</p>
                            <p className="text-sm font-black text-slate-800 dark:text-white lowercase tracking-tight break-all">{admin.email}</p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black text-slate-400 capitalize tracking-widest">Contact No</p>
                            <p className="text-sm font-black text-slate-800 dark:text-white tracking-tight">{admin.phone || "N/A"}</p>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black text-slate-400 capitalize tracking-widest">Date of Birth</p>
                            <p className="text-sm font-black text-slate-800 dark:text-white tracking-tight">
                                {admin.birthdate ? new Date(admin.birthdate).toLocaleDateString('en-GB') : "N/A"}
                                {admin.birthdate && (
                                    <span className="text-emerald-500 ml-1">({calculateAge(admin.birthdate)})</span>
                                )}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsChangePasswordOpen(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-[10px] font-black rounded-xl transition-all shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <Lock size={12} className="text-emerald-500" />
                                Change Password
                            </button>
                            <button
                                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                                disabled={isSaving}
                                className={`flex items-center gap-2 px-5 py-2.5 ${isEditing ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white'} text-[10px] font-black rounded-xl transition-all shadow-sm border ${isEditing ? 'border-emerald-600' : 'border-slate-200 dark:border-white/10'} hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50`}
                            >
                                {isSaving ? (
                                    <Loader2 size={12} className="animate-spin" />
                                ) : isEditing ? (
                                    <Check size={12} className="text-white" />
                                ) : (
                                    <Pencil size={12} className="text-emerald-500" />
                                )}
                                {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
                            </button>
                            {isEditing && (
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        // Reset form data
                                        setFormData({
                                            firstName: admin.firstName || "",
                                            lastName: admin.lastName || "",
                                            birthdate: admin.birthdate ? new Date(admin.birthdate).toISOString().split('T')[0] : "",
                                            qualification: admin.qualification || "",
                                            gender: admin.gender || "",
                                            phoneNo: admin.phone || "",
                                            email: admin.email || "",
                                            currentAddress: admin.currentAddress || "",
                                        });
                                    }}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black rounded-xl transition-all border border-red-500/20"
                                >
                                    <X size={12} />
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {/* Main Form Fields */}
                <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-lg p-12 shadow-slate-500/5">
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {/* Personal Identification Group */}
                            <div className="space-y-6 md:col-span-2">
                                <div className="flex items-center gap-3">
                                    <User size={14} className="text-emerald-500" />
                                    <span className="text-[11px] font-black text-slate-400 capitalize tracking-[0.2em]">Account Details</span>
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 ml-1 capitalize tracking-widest">First Name</label>
                                        <input
                                            name="firstName"
                                            readOnly={!isEditing}
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className={`w-full px-5 py-4 ${isEditing ? 'bg-white dark:bg-slate-950 ring-2 ring-emerald-500/20 border-emerald-500/50' : 'bg-slate-50 dark:bg-slate-800/50 border-none'} rounded-2xl outline-none text-sm font-black transition-all dark:text-white shadow-inner ${!isEditing && 'cursor-default'}`}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 ml-1 capitalize tracking-widest">Last Name</label>
                                        <input
                                            name="lastName"
                                            readOnly={!isEditing}
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className={`w-full px-5 py-4 ${isEditing ? 'bg-white dark:bg-slate-950 ring-2 ring-emerald-500/20 border-emerald-500/50' : 'bg-slate-50 dark:bg-slate-800/50 border-none'} rounded-2xl outline-none text-sm font-black transition-all dark:text-white shadow-inner ${!isEditing && 'cursor-default'}`}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 ml-1 capitalize tracking-widest">Date of Birth</label>
                                        <input
                                            name="birthdate"
                                            type="date"
                                            readOnly={!isEditing}
                                            value={formData.birthdate}
                                            onChange={handleInputChange}
                                            className={`w-full px-5 py-4 ${isEditing ? 'bg-white dark:bg-slate-950 ring-2 ring-emerald-500/20 border-emerald-500/50' : 'bg-slate-50 dark:bg-slate-800/50 border-none'} rounded-2xl outline-none text-sm font-black transition-all dark:text-white shadow-inner ${!isEditing && 'cursor-default'}`}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 ml-1 capitalize tracking-widest">Qualification</label>
                                        <input
                                            name="qualification"
                                            readOnly={!isEditing}
                                            value={formData.qualification}
                                            onChange={handleInputChange}
                                            className={`w-full px-5 py-4 ${isEditing ? 'bg-white dark:bg-slate-950 ring-2 ring-emerald-500/20 border-emerald-500/50' : 'bg-slate-50 dark:bg-slate-800/50 border-none'} rounded-2xl outline-none text-sm font-black transition-all dark:text-white shadow-inner ${!isEditing && 'cursor-default'}`}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 ml-1 capitalize tracking-widest">Gender</label>
                                        <select
                                            name="gender"
                                            disabled={!isEditing}
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            className={`w-full px-5 py-4 ${isEditing ? 'bg-white dark:bg-slate-950 ring-2 ring-emerald-500/20 border-emerald-500/50' : 'bg-slate-50 dark:bg-slate-800/50 border-none'} rounded-2xl outline-none text-sm font-black transition-all dark:text-white shadow-inner ${!isEditing && 'cursor-default pointer-events-none'}`}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 ml-1 capitalize tracking-widest">Current Address</label>
                                        <textarea
                                            name="currentAddress"
                                            readOnly={!isEditing}
                                            value={formData.currentAddress}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className={`w-full px-5 py-4 ${isEditing ? 'bg-white dark:bg-slate-950 ring-2 ring-emerald-500/20 border-emerald-500/50' : 'bg-slate-50 dark:bg-slate-800/50 border-none'} rounded-2xl outline-none text-sm font-black transition-all dark:text-white resize-none shadow-inner ${!isEditing && 'cursor-default'}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Group */}
                            <div className="space-y-6 md:col-span-2">
                                <div className="flex items-center gap-3">
                                    <Shield size={14} className="text-emerald-500" />
                                    <span className="text-[11px] font-black text-slate-400 capitalize tracking-[0.2em]">Contact & Security</span>
                                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 ml-1 capitalize tracking-widest">Primary Phone</label>
                                        <input
                                            name="phoneNo"
                                            readOnly={!isEditing}
                                            value={formData.phoneNo}
                                            onChange={handleInputChange}
                                            className={`w-full px-5 py-4 ${isEditing ? 'bg-white dark:bg-slate-950 ring-2 ring-emerald-500/20 border-emerald-500/50' : 'bg-slate-50 dark:bg-slate-800/50 border-none'} rounded-2xl outline-none text-sm font-black transition-all dark:text-white shadow-inner ${!isEditing && 'cursor-default'}`}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 ml-1 capitalize tracking-widest">Portal Email </label>
                                        <input
                                            name="email"
                                            readOnly
                                            value={formData.email}
                                            className="w-full px-5 py-4 bg-slate-100 dark:bg-slate-900 border-none rounded-2xl outline-none text-sm font-black transition-all text-slate-400 shadow-inner cursor-not-allowed"
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
                    setSelectedFile(null);
                }}
                onConfirm={confirmPhotoChange}
                title="Change Profile Photo?"
                message="Are you sure you want to set this new image as your profile photo?"
            />

            <PhotoCropModal
                isOpen={isCropModalOpen}
                image={selectedFile}
                onClose={() => {
                    setIsCropModalOpen(false);
                    setSelectedFile(null);
                }}
                onDone={handleCropDone}
                onChange={() => {
                    setIsCropModalOpen(false);
                    fileInputRef.current?.click();
                }}
            />

            <ForgotPasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
                initialEmail={admin.email}
            />
        </div>
    );
};

export default AdminMePage;
