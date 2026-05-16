import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Phone, Mail, Globe, Users, BookOpen,
  GraduationCap, Award, Facebook, Instagram, Twitter,
  Building2, User, ShieldCheck, CheckCircle2, Calendar, Bookmark, Quote, Trash2,
  Clock, Download, FileText, Settings, X, Check, Pencil
} from 'lucide-react';
import ConfirmDialog from '../MainSystemComponents/ConfirmDialog';
import PortalPopup from '../MainSystemComponents/PortalPopup';
import { toast } from '../MainSystemComponents/Toast';

// Using a placeholder icon for TikTok since lucide-react doesn't have a dedicated one
const TikTokIcon = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const SuSchoolDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedSchool, setEditedSchool] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const fetchSchoolDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:7000/api/school/${id}`);
        const data = response.data;

        // Map backend data to frontend structure
        // Note: Some counts and profile sub-objects are not in the current School model 
        // and would normally come from other related collections or aggregations.
        // For now, we'll map what we have and keep placeholders for the rest.
        setSchool({
          id: data._id,
          name: data.name,
          address: data.address,
          status: data.status || 'Active',
          coverImage: data.coverImage || 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=2069&auto=format&fit=crop',
          logo: data.logo,
          email: data.email,
          website: data.website,
          establishedYear: data.establishedYear,
          motto: data.motto,
          affiliation: data.affiliation || 'N/A',

          // These would typically come from count APIs or aggregations
          studentCount: data.studentCount || 0,
          teacherCount: data.teacherCount || 0,
          gradeCount: data.gradeCount || 0,
          gradeSpan: data.gradeSpan || { start: null, end: null },
          sectionCount: data.sectionCount || 0,
          wholeSchoolGPA: data.wholeSchoolGPA || 0,
          operatingHours: data.operatingHours || { start: "09:00", end: "16:00" },
          kycDocument: data.kycDocument,

          admin: data.admin ? {
            name: data.admin.name,
            photo: data.admin.profilePhoto,
            email: data.admin.email,
            phone: data.admin.phone,
            address: data.admin.currentAddress
          } : {
            name: 'No Admin Profile',
            photo: null,
            email: data.email,
            phone: null,
            address: null
          },



          contactNumbers: data.phoneNumbers?.map(n => `${n.phoneNumber} (${n.type})`) || [],
          social: {
            facebook: data.socialLinks?.find(s => s.platform === 'facebook')?.url || '#',
            instagram: data.socialLinks?.find(s => s.platform === 'instagram')?.url || '#',
            tiktok: data.socialLinks?.find(s => s.platform === 'tiktok')?.url || '#',
          },
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching school details:", error);
        setLoading(false);
      }
    };

    if (id) fetchSchoolDetails();
  }, [id]);

  const handleUpdateSchool = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', editedSchool.name || '');
      formData.append('address', editedSchool.address || '');
      formData.append('motto', editedSchool.motto || '');
      formData.append('website', editedSchool.website || '');
      formData.append('email', editedSchool.email || '');
      formData.append('logo', editedSchool.logo || '');
      formData.append('coverImage', editedSchool.coverImage || '');

      const phoneNumbers = [
        { phoneNumber: editedSchool.contactNumber, isPrimary: true, type: 'main' },
        ...(editedSchool.otherNumber ? [{ phoneNumber: editedSchool.otherNumber, isPrimary: false, type: 'other' }] : [])
      ];
      formData.append('phoneNumbers', JSON.stringify(phoneNumbers));

      const socialLinks = [
        { platform: 'facebook', url: editedSchool.social?.facebook || '#' },
        { platform: 'instagram', url: editedSchool.social?.instagram || '#' },
        { platform: 'tiktok', url: editedSchool.social?.tiktok || '#' },
      ];
      formData.append('socialLinks', JSON.stringify(socialLinks));

      if (editedSchool.kycFile) {
        formData.append('kycDocument', editedSchool.kycFile);
      }

      const response = await axios.put(`http://localhost:7000/api/school/update/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update local state with the new data from response
      const updatedData = response.data.school;
      setSchool(prev => ({
        ...prev,
        ...updatedData,
        social: {
          facebook: updatedData.socialLinks?.find(s => s.platform === 'facebook')?.url || '#',
          instagram: updatedData.socialLinks?.find(s => s.platform === 'instagram')?.url || '#',
          tiktok: updatedData.socialLinks?.find(s => s.platform === 'tiktok')?.url || '#',
        },
        contactNumbers: updatedData.phoneNumbers?.map(n => `${n.phoneNumber} (${n.type})`) || []
      }));

      setIsEditModalOpen(false);
      toast({ type: 'success', message: "School details updated successfully!" });
    } catch (error) {
      console.error("Error updating school:", error);
      toast({ type: 'error', message: error.response?.data?.message || "Failed to update school." });
    } finally {
      setUpdateLoading(false);
    }
  };
  const confirmDeleteSchool = async () => {
    try {
      const response = await axios.delete(`http://localhost:7000/api/school/delete/${id}`);
      toast({ type: 'success', message: response.data.message || "School and associated records deleted successfully!" });
      setDeleteDialog(false);
      navigate('/super-admin/school', { replace: true });
    } catch (error) {
      console.error("Error deleting school:", error);
      toast({ type: 'error', message: error.response?.data?.message || "Failed to delete school." });
      setDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-400">School record not found.</h2>
        <button onClick={() => navigate('/super-admin/school')} className="mt-4 text-emerald-500 hover:underline">
          Go back to list
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Back Button */}
      <button
        onClick={() => navigate('/super-admin/school')}
        className="group flex items-center gap-3 px-6 py-2 rounded-full border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#0f172a] hover:border-emerald-500/50 transition-all duration-300 shadow-sm w-fit"
      >
        <ArrowLeft size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-emerald-500 transition-colors" />
        <span className="text-xs font-black tracking-[0.1em] text-slate-600 dark:text-slate-400 group-hover:text-emerald-500 transition-colors">
          BACK TO LIST
        </span>
      </button>

      {/* Header Section (Cover & Logo) */}
      <div className="bg-white dark:bg-[#0f172a] rounded-[24px] border border-slate-200 dark:border-slate-800/60 overflow-hidden shadow-sm">
        <div className="h-64 sm:h-80 w-full relative bg-slate-200 dark:bg-slate-800">
          <img
            src={school.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

          {/* Action Buttons */}
          <div className="absolute top-6 right-6 flex items-center gap-3">
            <button
              onClick={() => {
                setEditedSchool({
                  ...school,
                  contactNumber: school.contactNumbers?.[0]?.split(' ')[0] || '',
                  otherNumber: school.contactNumbers?.[1]?.split(' ')[0] || '',
                });
                setIsEditModalOpen(true);
              }}
              className="p-3 bg-white/90 dark:bg-[#0f172a]/90 hover:bg-emerald-500 hover:text-white text-slate-600 dark:text-slate-300 rounded-full shadow-lg backdrop-blur-md transition-all hover:-translate-y-0.5 border border-white/20"
              title="Edit School"
            >
              <Pencil size={20} />
            </button>
            <button
              onClick={() => setDeleteDialog(true)}
              className="p-3 bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-lg shadow-red-500/20 backdrop-blur-md transition-all hover:-translate-y-0.5"
              title="Delete School"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div className="px-6 sm:px-10 pb-8 relative">
          {/* Logo */}
          <div className="absolute -top-16 left-6 sm:left-10 w-32 h-32 bg-white dark:bg-[#1e293b] rounded-2xl flex items-center justify-center shadow-xl border-4 border-white dark:border-[#0f172a] z-10 overflow-hidden">
            {school.logo ? (
              <img src={school.logo} alt="Logo" className="w-24 h-24 object-contain" referrerPolicy="no-referrer" />
            ) : (
              <Building2 size={48} className="text-emerald-500" />
            )}
          </div>

          <div className="pt-20 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                {school.name}
              </h1>
              {school.motto && (
                <p className="text-emerald-600 dark:text-emerald-400 font-medium italic mt-2 flex items-center gap-2">
                  <Quote size={14} className="opacity-70" />
                  "{school.motto}"
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar size={16} className="text-emerald-500" />
                  Est. {school.establishedYear}
                </div>
                <div className="flex items-center gap-1.5">
                  <Bookmark size={16} className="text-emerald-500" />
                  {school.affiliation}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-emerald-500" />
                  {school.address}
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe size={16} className="text-emerald-500" />
                  <a href={`https://${school.website}`} target="_blank" rel="noreferrer" className="hover:text-emerald-500 transition-colors">
                    {school.website}
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail size={16} className="text-emerald-500" />
                  <a href={`mailto:${school.email}`} className="hover:text-emerald-500 transition-colors">
                    {school.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-col items-end gap-3 lg:self-end">

              <div className="flex items-center gap-3">
                <a href={school.social.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1e293b] flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-[#1877F2] hover:text-white transition-all">
                  <Facebook size={20} />
                </a>
                <a href={school.social.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1e293b] flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-[#E4405F] hover:text-white transition-all">
                  <Instagram size={20} />
                </a>
                <a href={school.social.tiktok} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1e293b] flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-black dark:hover:bg-white dark:hover:text-black hover:text-white transition-all">
                  <TikTokIcon size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left Column: Stats & GPA */}
        <div className="xl:col-span-2 space-y-6">
          {/* Key Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-[24px] border border-slate-200 dark:border-slate-800/60 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500 mb-3">
                <Users size={24} />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{school.studentCount.toLocaleString()}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Students</p>
            </div>
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-[24px] border border-slate-200 dark:border-slate-800/60 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500 mb-3">
                <GraduationCap size={24} />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{school.teacherCount}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Teachers</p>
            </div>
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-[24px] border border-slate-200 dark:border-slate-800/60 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-500 mb-3">
                <BookOpen size={24} />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {school.gradeSpan?.start && school.gradeSpan?.end
                  ? `${school.gradeSpan.start}-${school.gradeSpan.end}`
                  : 'N/A'}
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Grade</p>
            </div>
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-[24px] border border-slate-200 dark:border-slate-800/60 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500 mb-3">
                <Clock size={24} />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {school.operatingHours.start} - {school.operatingHours.end}
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Operating Time</p>
            </div>
          </div>

          {/* KYC Document Download */}
          <div className="bg-white dark:bg-[#0f172a] rounded-[24px] border border-slate-200 dark:border-slate-800/60 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-emerald-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">KYC Document</h2>
              </div>
              {school.kycDocument && (
                <button
                  onClick={() => {
                    // Assuming KYC documents are served from a specific path or are external URLs
                    const url = school.kycDocument.startsWith('http')
                      ? school.kycDocument
                      : `http://localhost:7000/uploads/kyc/${school.kycDocument}`;
                    window.open(url, '_blank');
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#00D084] hover:bg-[#00B875] text-white rounded-full text-sm font-bold transition-all shadow-lg shadow-[#00D084]/30 active:scale-95"
                >
                  <Download size={18} />
                  Download
                </button>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#0f172a] flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                <FileText size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {school.kycDocument || 'No document uploaded'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wider font-bold">Principal Verification Document</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: People & Contact */}
        <div className="space-y-6">

          {/* Admin Profile */}
          <div className="bg-white dark:bg-[#0f172a] rounded-[24px] border border-slate-200 dark:border-slate-800/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck size={20} className="text-emerald-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">School Administrator</h2>
            </div>

            <div className="flex items-center gap-5">
              <div className="relative group shrink-0">
                <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                {school.admin.photo ? (
                  <img
                    src={school.admin.photo}
                    alt={school.admin.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700/50 relative z-10 p-0.5 bg-white dark:bg-slate-900 shadow-xl"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-[#1e293b] flex items-center justify-center text-slate-400 border-2 border-slate-200 dark:border-slate-700/50 relative z-10 shadow-xl">
                    <User size={32} className="opacity-50" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg z-20 border-2 border-white dark:border-[#0f172a]">
                  <CheckCircle2 size={12} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-1 truncate">
                  {school.admin.name}
                </h3>
                <div className="flex items-center gap-3 group/link mt-1">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover/link:bg-emerald-500 group-hover/link:text-white transition-all shrink-0">
                    <Mail size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <a
                      href={`mailto:${school.admin.email}`}
                      className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-400 transition-colors whitespace-nowrap overflow-hidden text-ellipsis block"
                      title={school.admin.email}
                    >
                      {school.admin.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>






          {/* Contact Numbers */}
          <div className="bg-white dark:bg-[#0f172a] rounded-[24px] border border-slate-200 dark:border-slate-800/60 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Phone size={20} className="text-emerald-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Contact Numbers</h2>
            </div>
            <div className="space-y-4">
              {school.contactNumbers.map((num, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-slate-100 dark:border-slate-700/50">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-[#0f172a] flex items-center justify-center text-emerald-500 shadow-sm">
                    <Phone size={14} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{num}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={confirmDeleteSchool}
        title="Confirm School Deletion"
        message="Are you sure you want to delete this school? All associated admin and user records will also be permanently removed. This action cannot be undone."
      />

      {/* Edit Modal */}
      <PortalPopup isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <div className="bg-white dark:bg-[#0f172a] rounded-[24px] w-full max-w-5xl shadow-2xl border border-slate-200 dark:border-slate-800/60 overflow-hidden flex flex-col max-h-[90vh] text-slate-800 dark:text-slate-200 font-sans">
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-800/60 flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
                <Settings size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Edit School: {school.name}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-bold text-[10px]">Update School Record</p>
              </div>
            </div>
            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1">
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleUpdateSchool} className="p-6 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
              {/* Left Column: School Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Building2 size={16} className="text-emerald-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Basic Information</span>
                  <div className="h-px bg-slate-200 dark:bg-slate-800/60 flex-1"></div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">School Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3.5 bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-transparent rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all text-sm"
                    value={editedSchool.name || ''}
                    onChange={e => setEditedSchool({ ...editedSchool, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Motto</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3.5 bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-transparent rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all text-sm"
                    value={editedSchool.motto || ''}
                    onChange={e => setEditedSchool({ ...editedSchool, motto: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Address</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3.5 bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-transparent rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all text-sm"
                    value={editedSchool.address || ''}
                    onChange={e => setEditedSchool({ ...editedSchool, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Contact Number</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      className="w-full px-4 py-3.5 bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-transparent rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all text-sm"
                      value={editedSchool.contactNumber || ''}
                      onChange={e => setEditedSchool({ ...editedSchool, contactNumber: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Other Number</label>
                    <input
                      type="tel"
                      maxLength={10}
                      className="w-full px-4 py-3.5 bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-transparent rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all text-sm"
                      value={editedSchool.otherNumber || ''}
                      onChange={e => setEditedSchool({ ...editedSchool, otherNumber: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Change KYC Document</label>
                  <input
                    type="file"
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-transparent rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-slate-600 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white dark:file:bg-[#0f172a] file:text-emerald-600 dark:file:text-emerald-500 hover:file:bg-slate-50 dark:hover:file:bg-slate-800 transition-all cursor-pointer"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEditedSchool({ ...editedSchool, kycFile: file });
                      }
                    }}
                  />
                  <p className="text-[10px] text-slate-400 mt-2 italic">* Upload a new file only if you want to replace the current KYC document.</p>
                </div>
              </div>

              {/* Right Column: Media & Contact */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Globe size={16} className="text-emerald-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Media & Digital</span>
                  <div className="h-px bg-slate-200 dark:bg-slate-800/60 flex-1"></div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Website</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3.5 bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-transparent rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all text-sm"
                    value={editedSchool.website || ''}
                    onChange={e => setEditedSchool({ ...editedSchool, website: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Logo URL</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3.5 bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-transparent rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all text-sm"
                    value={editedSchool.logo || ''}
                    onChange={e => setEditedSchool({ ...editedSchool, logo: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Cover Image URL</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3.5 bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-transparent rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all text-sm"
                    value={editedSchool.coverImage || ''}
                    onChange={e => setEditedSchool({ ...editedSchool, coverImage: e.target.value })}
                  />
                </div>

              </div>
            </div>

            <div className="flex justify-end items-center gap-6 pt-6 mt-8 border-t border-slate-200 dark:border-slate-800/60">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                disabled={updateLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateLoading}
                className="px-8 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 font-bold flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {updateLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <Check size={18} strokeWidth={3} />
                )}
                SAVE CHANGES
              </button>
            </div>
          </form>
        </div>
      </PortalPopup>
    </div>
  );
};

export default SuSchoolDetailPage;