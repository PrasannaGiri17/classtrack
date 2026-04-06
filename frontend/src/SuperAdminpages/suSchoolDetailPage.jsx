import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Phone, Mail, Globe, Users, BookOpen,
  GraduationCap, Award, Facebook, Instagram, Twitter,
  Building2, User, ShieldCheck, CheckCircle2, Calendar, Bookmark, Quote, Trash2
} from 'lucide-react';
import ConfirmDialog from '../MainSystemComponents/ConfirmDialog';
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
          sectionCount: data.sectionCount || 0,
          wholeSchoolGPA: data.wholeSchoolGPA || 0,

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
          gradeGPA: [] // Placeholder
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching school details:", error);
        setLoading(false);
      }
    };

    if (id) fetchSchoolDetails();
  }, [id]);

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
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors font-medium"
      >
        <ArrowLeft size={18} />
        Back to Schools
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

          {/* Delete Button */}
          <div className="absolute top-6 right-6">
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
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{school.gradeCount}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Grades</p>
            </div>
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-[24px] border border-slate-200 dark:border-slate-800/60 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500 mb-3">
                <Award size={24} />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{school.wholeSchoolGPA.toFixed(2)}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">Overall GPA</p>
            </div>
          </div>

          {/* Grade by Grade GPA */}
          <div className="bg-white dark:bg-[#0f172a] rounded-[24px] border border-slate-200 dark:border-slate-800/60 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Award size={20} className="text-emerald-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Grade by Grade GPA</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {school.gradeGPA.map((item, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-[#1e293b] p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{item.grade}</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">{item.gpa.toFixed(2)}</span>
                  {/* Visual indicator bar */}
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(item.gpa / 4.0) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: People & Contact */}
        <div className="space-y-6">

          {/* Admin Profile */}
          <div className="bg-[#0f172a] rounded-[24px] border border-slate-800/60 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <ShieldCheck size={20} className="text-emerald-500" />
              <h2 className="text-xl font-bold text-white tracking-tight">School Administrator</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-8">
              <div className="relative group shrink-0">
                <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                {school.admin.photo ? (
                  <img
                    src={school.admin.photo}
                    alt={school.admin.name}
                    className="w-32 h-32 rounded-full object-cover border-2 border-slate-700/50 relative z-10 p-1 bg-slate-900 shadow-2xl shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-[#1e293b] flex items-center justify-center text-slate-400 border-2 border-slate-700/50 relative z-10 shadow-2xl shrink-0">
                    <User size={48} className="opacity-50" />
                  </div>
                )}
                <div className="absolute bottom-1 right-1 bg-emerald-500 text-white p-2.5 rounded-full shadow-lg z-20 border-2 border-[#0f172a]">
                  <CheckCircle2 size={18} />
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left py-2 min-w-0">
                <h3 className="text-2xl font-bold text-white tracking-tight mb-2 truncate">
                  {school.admin.name}
                </h3>
                <div className="flex items-center justify-center sm:justify-start gap-4 group/link mt-1">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover/link:bg-emerald-500 group-hover/link:text-white transition-all shrink-0">
                    <Mail size={16} />
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <a 
                      href={`mailto:${school.admin.email}`} 
                      className="text-xs sm:text-sm text-slate-300 hover:text-emerald-400 transition-colors font-semibold truncate block"
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
    </div>
  );
};

export default SuSchoolDetailPage;