import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, MapPin, Phone, FileText, User, Mail, Users, Calendar, Globe, X, Check, Settings, Search, Trash2 } from 'lucide-react';
import PortalPopup from '../MainSystemComponents/PortalPopup';
import { toast } from '../MainSystemComponents/Toast';
import ConfirmDialog from '../MainSystemComponents/ConfirmDialog';

const SchoolCard = ({ school, navigate, handleDeleteClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimerRef = useRef(null);

  const handleMouseEnter = () => {
    hoverTimerRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    setIsHovered(false);
  };

  return (
    <div
      onClick={() => navigate(`/super-admin/school/${school.id}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer ${isHovered ? 'shadow-xl -translate-y-1' : 'shadow-sm'
        }`}
    >
      {/* Cover Image */}
      <div className="h-48 w-full relative bg-slate-200 dark:bg-slate-800 overflow-hidden">
        {school.coverImage ? (
          <img
            src={school.coverImage}
            alt={`${school.name} cover`}
            className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : ''}`}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center text-slate-400 transition-transform duration-700 ${isHovered ? 'scale-110' : ''}`}>
            <Building2 size={48} opacity={0.5} />
          </div>
        )}
        {/* Delete Button positioned on the cover image */}
        <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
          <button
            onClick={(e) => handleDeleteClick(e, school.id)}
            className="p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-sm shadow-red-500/20 backdrop-blur-md transition-colors"
            title="Delete School"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Logo overlapping the cover */}
      <div className={`absolute top-40 left-6 w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-md border border-slate-100 dark:border-slate-800 z-20 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
        {school.logo ? (
          <img src={school.logo} alt={`${school.name} logo`} className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
        ) : (
          <Building2 size={28} className="text-emerald-600 dark:text-emerald-400" />
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 pt-10 flex-1 flex flex-col bg-white dark:bg-slate-900 relative z-0">
        <h3 className={`text-xl font-bold transition-colors mb-2 ${isHovered ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
          {school.name}
        </h3>
        <div className="space-y-3 mt-4 flex-1">
          <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
            <MapPin size={18} className="shrink-0 mt-0.5 text-slate-400" />
            <span className="leading-relaxed">{school.address}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <Phone size={18} className="shrink-0 text-slate-400" />
            <span>{school.contactNumber}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <Phone size={18} className="shrink-0 text-emerald-400" />
            <span>{school.otherNumber}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <FileText size={18} className="shrink-0 text-slate-400" />
            <span className="text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline font-medium">{school.kycDocument}</span>
          </div>
        </div>

        {/* Expanded Details (Hidden by default, shown after 3s hover) */}
        <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isHovered ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden">
            <div className={`pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 transition-opacity duration-300 delay-100 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Mail size={18} className="shrink-0 text-slate-400" />
                <span>{school.email || 'contact@school.edu'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Globe size={18} className="shrink-0 text-slate-400" />
                <span className="text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline">{school.website || 'www.school.edu'}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300 pt-1">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Users size={16} className="text-slate-400" />
                    <div className="flex items-baseline gap-1">
                      <span className={`font-bold transition-colors ${isHovered ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                        {school.studentCount}
                      </span>
                      <span className="text-[10px] uppercase opacity-60 font-medium text-slate-500 dark:text-slate-400">Students</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User size={16} className="text-slate-400" />
                    <div className="flex items-baseline gap-1">
                      <span className={`font-bold transition-colors ${isHovered ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                        {school.teacherCount}
                      </span>
                      <span className="text-[10px] uppercase opacity-60 font-medium text-slate-500 dark:text-slate-400">Teachers</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  <span className="font-medium text-[11px]">Est. {school.establishedYear || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const SuSchoolsPage = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axios.get('http://localhost:7000/api/school');
        const data = response.data;

        if (data && Array.isArray(data)) {
          // Map backend array to frontend format
          const formatted = data.map(item => ({
            id: item._id ? item._id.toString() : Math.random().toString(),
            name: item.name || 'Unnamed School',
            address: item.address || 'No Address',
            contactNumber: item.phoneNumbers?.[0]?.phoneNumber || 'N/A',
            otherNumber: item.phoneNumbers?.[1]?.phoneNumber || 'N/A',
            kycDocument: item.kycDocument || 'Not Uploaded',
            status: item.status === 'Active' ? 'Active' : 'Not Active',
            coverImage: item.coverImage || 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=2069&auto=format&fit=crop',
            logo: item.logo,
            email: item.email,
            website: item.website,
            studentCount: item.studentCount || 0,
            teacherCount: item.teacherCount || 0,
            establishedYear: item.establishedYear,
          }));
          setSchools(formatted);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching schools:", error);
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSchool, setNewSchool] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, schoolId: null });
  const [phoneErrors, setPhoneErrors] = useState({ contactNumber: '', otherNumber: '' });

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('schoolRegistrationDraft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed && typeof parsed === 'object') {
          setNewSchool(parsed);
        }
      } catch (e) {
        console.error("Error parsing school draft", e);
      }
    }
  }, []);

  // Save draft whenever newSchool changes
  useEffect(() => {
    if (newSchool && Object.keys(newSchool).length > 0) {
      localStorage.setItem('schoolRegistrationDraft', JSON.stringify(newSchool));
    }
  }, [newSchool]);

  const filteredSchools = schools.filter(school =>
    (school.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (school.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (school.principalName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSchool = async (e) => {
    e.preventDefault();

    // --- Phone validation before submitting ---
    const contact = newSchool.contactNumber || '';
    const other   = newSchool.otherNumber   || '';

    if (!contact || contact.length < 10) {
      setPhoneErrors(prev => ({ ...prev, contactNumber: 'Must be exactly 10 digits' }));
      toast({ type: 'error', message: 'Contact Number must be exactly 10 digits.' });
      return;
    }
    if (other && other.length < 10) {
      setPhoneErrors(prev => ({ ...prev, otherNumber: 'Must be exactly 10 digits' }));
      toast({ type: 'error', message: 'Other Number must be exactly 10 digits if provided.' });
      return;
    }

    setRegistrationLoading(true);
    try {
      const payload = {
        name: newSchool.name,
        address: newSchool.address,
        principalName: newSchool.principalName,
        phoneNumbers: [
          { phoneNumber: newSchool.contactNumber, isPrimary: true, type: 'main' },
          ...(newSchool.otherNumber ? [{ phoneNumber: newSchool.otherNumber, isPrimary: false, type: 'other' }] : [])
        ],
        kycDocument: newSchool.kycDocument,
        status: 'Not Active',
        coverImage: newSchool.coverImage,
        logo: newSchool.logo,
        email: newSchool.adminEmail,
        adminName: newSchool.adminName,
        adminEmail: newSchool.adminEmail,
      };

      const response = await axios.post('http://localhost:7000/api/school/add', payload);
      const savedSchool = response.data.school;

      const formatted = {
        id: savedSchool._id,
        name: savedSchool.name,
        address: savedSchool.address,
        contactNumber: savedSchool.phoneNumbers?.[0]?.phoneNumber || 'N/A',
        otherNumber: savedSchool.phoneNumbers?.[1]?.phoneNumber || 'N/A',
        kycDocument: savedSchool.kycDocument,
        status: savedSchool.status,
        coverImage: savedSchool.coverImage,
        logo: savedSchool.logo,
        email: savedSchool.email,
        website: savedSchool.website,
        studentCount: 'N/A',
        principalName: savedSchool.principalName, // Added to formatted object
        establishedYear: savedSchool.establishedYear,
      };

      setSchools([...schools, formatted]);
      setIsAddModalOpen(false);
      setNewSchool({});
      setPhoneErrors({ contactNumber: '', otherNumber: '' });
      localStorage.removeItem('schoolRegistrationDraft');
      toast({ type: 'success', message: response.data.message || "School registered successfully!" });
    } catch (error) {
      console.error("Error adding school:", error);
      const errorMsg = error.response?.data?.message || "Failed to register school. Please try again.";
      toast({ type: 'error', message: errorMsg });
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleDeleteClick = (e, schoolId) => {
    e.stopPropagation();
    setDeleteDialog({ isOpen: true, schoolId });
  };

  const confirmDeleteSchool = async () => {
    if (!deleteDialog.schoolId) return;

    try {
      const response = await axios.delete(`http://localhost:7000/api/school/delete/${deleteDialog.schoolId}`);
      setSchools(schools.filter(school => school.id !== deleteDialog.schoolId));
      toast({ type: 'success', message: response.data.message || "School and associated records deleted successfully!" });
    } catch (error) {
      console.error("Error deleting school:", error);
      toast({ type: 'error', message: error.response?.data?.message || "Failed to delete school." });
    } finally {
      setDeleteDialog({ isOpen: false, schoolId: null });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="bg-white dark:bg-slate-900 px-6 py-3.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center shrink-0">
            <Building2 className="text-emerald-500 w-6 h-6" />
          </div>
          <div className="flex flex-col items-center justify-center pr-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Schools</p>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-none">{schools.length}</h2>
          </div>
        </div>

        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search school records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm dark:text-slate-200"
          />
        </div>

        <button
          onClick={() => {
            // Keep the draft if it exists, otherwise start clean
            setPhoneErrors({ contactNumber: '', otherNumber: '' });
            setIsAddModalOpen(true);
          }}
          className="px-8 py-3.5 bg-emerald-500 text-white rounded-full font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 whitespace-nowrap"
        >
          <Plus size={18} /> ADD SCHOOL
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredSchools.map(school => (
          <SchoolCard
            key={school.id}
            school={school}
            navigate={navigate}
            handleDeleteClick={handleDeleteClick}
          />
        ))}
      </div>

      {/* Add Modal */}
      <PortalPopup isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setPhoneErrors({ contactNumber: '', otherNumber: '' }); }}>
        <div className="bg-white dark:bg-[#0f172a] rounded-[24px] w-full max-w-5xl shadow-2xl border border-slate-200 dark:border-slate-800/60 overflow-hidden flex flex-col max-h-[90vh] text-slate-800 dark:text-slate-200 font-sans">
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-800/60 flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
                <Building2 size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Register New School</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-bold text-[10px]">New School Record</p>
              </div>
            </div>
            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1">
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAddSchool} className="p-6 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
              {/* Left Column: School Details */}
              <div className="space-y-6 pb-4">
                {/* Section Header */}
                <div className="flex items-center gap-3">
                  <User size={16} className="text-emerald-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">School Details</span>
                  <div className="h-px bg-slate-200 dark:bg-slate-800/60 flex-1"></div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">School Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3.5 bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-transparent rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all text-sm"
                    placeholder="e.g. Springfield High"
                    value={newSchool.name || ''}
                    onChange={e => setNewSchool({ ...newSchool, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">School Address</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3.5 bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-transparent rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all text-sm"
                    placeholder="Complete physical address"
                    value={newSchool.address || ''}
                    onChange={e => setNewSchool({ ...newSchool, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      className={`w-full px-4 py-3.5 bg-slate-100 dark:bg-[#1e293b] border rounded-xl focus:outline-none focus:ring-1 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all text-sm ${
                        phoneErrors.contactNumber
                          ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
                          : 'border-slate-200 dark:border-transparent focus:ring-emerald-500'
                      }`}
                      placeholder="Enter 10-digit number"
                      value={newSchool.contactNumber || ''}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setNewSchool({ ...newSchool, contactNumber: val });
                        setPhoneErrors(prev => ({
                          ...prev,
                          contactNumber: val.length > 0 && val.length < 10 ? 'Must be exactly 10 digits' : ''
                        }));
                      }}
                    />
                    {phoneErrors.contactNumber && (
                      <p className="mt-1.5 text-[11px] font-semibold text-red-500">{phoneErrors.contactNumber}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Other Number</label>
                    <input
                      type="tel"
                      maxLength={10}
                      className={`w-full px-4 py-3.5 bg-slate-100 dark:bg-[#1e293b] border rounded-xl focus:outline-none focus:ring-1 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all text-sm ${
                        phoneErrors.otherNumber
                          ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
                          : 'border-slate-200 dark:border-transparent focus:ring-emerald-500'
                      }`}
                      placeholder="Alternative number"
                      value={newSchool.otherNumber || ''}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setNewSchool({ ...newSchool, otherNumber: val });
                        setPhoneErrors(prev => ({
                          ...prev,
                          otherNumber: val.length > 0 && val.length < 10 ? 'Must be exactly 10 digits' : ''
                        }));
                      }}
                    />
                    {phoneErrors.otherNumber && (
                      <p className="mt-1.5 text-[11px] font-semibold text-red-500">{phoneErrors.otherNumber}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">School Principal Name <span className="text-emerald-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="Principal's full name"
                      className="w-full px-4 py-3.5 bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-transparent rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all text-sm"
                      value={newSchool.principalName || ''}
                      onChange={e => setNewSchool({ ...newSchool, principalName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Principal KYC Document <span className="text-emerald-500">*</span></label>
                    <input
                      type="file"
                      required
                      className="w-full px-4 py-[11px] bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-transparent rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-slate-600 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white dark:file:bg-[#0f172a] file:text-emerald-600 dark:file:text-emerald-500 hover:file:bg-slate-50 dark:hover:file:bg-slate-800 transition-all cursor-pointer"
                      onChange={e => setNewSchool({ ...newSchool, kycDocument: e.target.files?.[0]?.name || '' })}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: App & Media */}
              <div className="space-y-6">
                {/* Section Header */}
                <div className="flex items-center gap-3">
                  <Settings size={16} className="text-emerald-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">App & Media Settings</span>
                  <div className="h-px bg-slate-200 dark:bg-slate-800/60 flex-1"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Admin Name <span className="text-emerald-500">*</span></label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3.5 bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-transparent rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all text-sm"
                      placeholder="Admin's full name"
                      value={newSchool.adminName || ''}
                      onChange={e => setNewSchool({ ...newSchool, adminName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Admin Email <span className="text-emerald-500">*</span></label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3.5 bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-transparent rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all text-sm"
                      placeholder="For portal access"
                      value={newSchool.adminEmail || ''}
                      onChange={e => setNewSchool({ ...newSchool, adminEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Cover Image (Optional URL)</label>
                  <input
                    type="url"
                    className="w-full px-4 py-3.5 bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-transparent rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all text-sm"
                    placeholder="https://example.com/image.jpg"
                    value={newSchool.coverImage || ''}
                    onChange={e => setNewSchool({ ...newSchool, coverImage: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Logo Image (Optional URL)</label>
                  <input
                    type="url"
                    className="w-full px-4 py-3.5 bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-transparent rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all text-sm"
                    placeholder="https://example.com/logo.png"
                    value={newSchool.logo || ''}
                    onChange={e => setNewSchool({ ...newSchool, logo: e.target.value })}
                  />
                </div>

                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2">* Admin Name and Email are required for initial portal setup.</p>
              </div>
            </div>



            <div className="flex justify-end items-center gap-6 pt-6 border-t border-slate-200 dark:border-slate-800/60">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                }}
                className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                disabled={registrationLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={registrationLoading}
                className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 font-bold flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {registrationLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <Check size={18} strokeWidth={3} />
                )}
                {registrationLoading ? "Registering..." : "Register School"}
              </button>
            </div>
          </form>
        </div>
      </PortalPopup>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, schoolId: null })}
        onConfirm={confirmDeleteSchool}
        title="Confirm School Deletion"
        message="Are you sure you want to delete this school? All associated admin and user records will also be permanently removed. This action cannot be undone."
      />
    </div>
  );
};

export default SuSchoolsPage;