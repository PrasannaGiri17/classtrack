import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import schoolService from '../Api/schoolService';
import {
    Building2,
    MapPin,
    Mail,
    Globe,
    Phone,
    CalendarDays,
    UserCircle2,
    ScrollText,
    BookOpenCheck,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    ShieldCheck,
    Users
} from 'lucide-react';
import { PiTiktokLogo } from 'react-icons/pi';

const socialIcons = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    linkedin: Linkedin,
    tiktok: PiTiktokLogo
};

export default function SchoolPage() {
    const { id } = useParams();
    const [schoolData, setSchoolData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSchool = async () => {
            setLoading(true);
            setError(null);
            try {
                // Use route param first, fall back to the schoolId stored at login
                const schoolId = id || localStorage.getItem('schoolId');
                if (!schoolId) {
                    setError('No school ID found.');
                    setLoading(false);
                    return;
                }
                const data = await schoolService.getSchoolById(schoolId);
                setSchoolData(data);
            } catch (err) {
                console.error('Failed to fetch school data:', err);
                setError('Could not load school information. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchSchool();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !schoolData) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500">
                    <Building2 size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">School Not Found</h2>
                <p className="text-slate-500 dark:text-slate-400">
                    {error || 'The school profile you are looking for does not exist.'}
                </p>
            </div>
        );
    }

    // Normalise phone numbers from backend shape: { phoneNumber, type, isPrimary }
    const phones = (schoolData.phoneNumbers || []).map((p) => ({
        type: p.type || 'Main',
        number: p.phoneNumber || p.number || '',
    }));

    // Normalise social links from backend shape: { platform, url }
    const socials = (schoolData.socialLinks || [])
        .map((s) => ({
            platform: s.platform
                ? s.platform.charAt(0).toUpperCase() + s.platform.slice(1)
                : 'Link',
            url: s.url,
            icon: (s.platform || '').toLowerCase(),
        }));

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-500">

            {/* Cover Image & Header Area */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mt-2 relative">
                {/* Cover */}
                <div className="h-64 sm:h-80 w-full relative">
                    {schoolData.coverImage ? (
                        <img
                            src={schoolData.coverImage}
                            alt={`${schoolData.name} cover`}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                </div>

                {/* Profile Info Below */}
                <div className="px-8 pb-8 sm:px-12 pt-4 relative flex flex-col sm:flex-row gap-6 sm:items-start">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl border-4 border-white dark:border-slate-900 overflow-hidden bg-white dark:bg-slate-950 shadow-xl flex-shrink-0 relative z-10 -mt-20 sm:-mt-24">
                        {schoolData.logo ? (
                            <img
                                src={schoolData.logo}
                                alt={`${schoolData.name} logo`}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-emerald-500 flex items-center justify-center">
                                <Building2 size={48} className="text-white" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-2 pt-2 sm:pt-0 sm:mb-4 relative z-10">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none drop-shadow-sm">
                                {schoolData.name}
                            </h1>
                        </div>
                        {schoolData.motto && (
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <ScrollText size={16} className="text-emerald-500" />
                                "{schoolData.motto}"
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-500">
                {[
                    { label: 'Students', value: schoolData.studentCount ?? 0, icon: Users, color: 'from-blue-500 to-indigo-500' },
                    { label: 'Teachers', value: schoolData.teacherCount ?? 0, icon: UserCircle2, color: 'from-emerald-500 to-teal-500' },
                    { label: 'Grades', value: schoolData.gradeCount ?? 0, icon: BookOpenCheck, color: 'from-purple-500 to-pink-500' },
                    { label: 'Sections', value: schoolData.sectionCount ?? 0, icon: Building2, color: 'from-amber-500 to-orange-500' },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex items-center gap-4 hover:shadow-md hover:scale-[1.02] transition-all">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                                <Icon size={22} />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                                    {stat.value}
                                </p>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">
                                    {stat.label}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
            */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">

                    {/* School Information Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
                            <Building2 size={160} />
                        </div>

                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                                <BookOpenCheck size={18} />
                            </span>
                            School Information
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-6">
                            {schoolData.principalName && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <UserCircle2 size={14} className="text-indigo-500" />
                                        Principal
                                    </p>
                                    <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                                        {schoolData.principalName}
                                    </p>
                                </div>
                            )}

                            {schoolData.affiliation && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <ShieldCheck size={14} className="text-emerald-500" />
                                        Affiliation
                                    </p>
                                    <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                                        {schoolData.affiliation}
                                    </p>
                                </div>
                            )}

                            {schoolData.establishedYear && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <CalendarDays size={14} className="text-blue-500" />
                                        Established
                                    </p>
                                    <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                                        {schoolData.establishedYear}
                                    </p>
                                </div>
                            )}

                            {schoolData.activeYear && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <CalendarDays size={14} className="text-orange-500" />
                                        Active Academic Year
                                    </p>
                                    <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                                        {schoolData.activeYear}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Social Media Section */}
                    {socials.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                                    <Globe size={18} />
                                </span>
                                Social Media
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {socials.map((link, idx) => {
                                    const IconComponent = socialIcons[link.icon];
                                    return (
                                        <a
                                            key={idx}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-emerald-500/30 transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all">
                                                {IconComponent && <IconComponent size={20} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">{link.platform}</p>
                                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">{link.url}</p>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Phone Numbers Section */}
                    {phones.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                                    <Phone size={18} />
                                </span>
                                Phone Numbers
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {phones.map((phone, idx) => (
                                    <div key={idx} className="flex flex-col p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 transition-colors group bg-slate-50/50 dark:bg-slate-800/30">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{phone.type}</p>
                                        <a href={`tel:${phone.number}`} className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 group-hover:text-emerald-500 transition-colors flex items-center gap-2">
                                            <Phone size={12} className="opacity-40" />
                                            {phone.number}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* Right Column - Contact Info */}
                <div className="space-y-6">

                    {/* Primary Administrator */}
                    {schoolData.admin && (
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                                    <UserCircle2 size={18} />
                                </span>
                                Administrator
                            </h3>
                            <div className="flex items-center gap-4 mb-4">
                                {schoolData.admin.profilePhoto ? (
                                    <img
                                        src={schoolData.admin.profilePhoto}
                                        alt={schoolData.admin.name}
                                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/20"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-lg">
                                        {schoolData.admin.name ? schoolData.admin.name.charAt(0) : 'A'}
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]" title={schoolData.admin.name}>
                                        {schoolData.admin.name}
                                    </h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                        School Admin
                                    </p>
                                </div>
                            </div>
                            {/* <div className="space-y-2">
                                {schoolData.admin.email && (
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                        <Mail size={12} className="text-slate-400 flex-shrink-0" />
                                        <span className="truncate" title={schoolData.admin.email}>{schoolData.admin.email}</span>
                                    </div>
                                )}
                                {schoolData.admin.phone && (
                                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                        <Phone size={12} className="text-slate-400 flex-shrink-0" />
                                        <span>{schoolData.admin.phone}</span>
                                    </div>
                                )}
                            </div> */}
                        </div>
                    )}

                    {/* Contact & Connectivity Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600">
                                <MapPin size={18} />
                            </span>
                            Contact Info
                        </h3>

                        <div className="space-y-4">
                            {schoolData.address && (
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                    <MapPin size={20} className="text-slate-400 mt-1 flex-shrink-0" />
                                    <div className="space-y-1 relative top-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Address</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                                            {schoolData.address}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {schoolData.email && (
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                    <Mail size={20} className="text-slate-400 mt-1 flex-shrink-0" />
                                    <div className="space-y-1 relative top-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Email</p>
                                        <a href={`mailto:${schoolData.email}`} className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-emerald-500 transition-colors break-all">
                                            {schoolData.email}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {schoolData.website && (
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                    <Globe size={20} className="text-slate-400 mt-1 flex-shrink-0" />
                                    <div className="space-y-1 relative top-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Website</p>
                                        <a href={schoolData.website} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-emerald-500 transition-colors break-all">
                                            {schoolData.website.replace(/^https?:\/\//, '')}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Operating Hours */}
                    {schoolData.operatingHours && (
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center text-sky-600">
                                    <CalendarDays size={18} />
                                </span>
                                Operating Hours
                            </h3>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Opens</p>
                                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
                                        {schoolData.operatingHours.start || '09:00'}
                                    </p>
                                </div>
                                <div className="h-px flex-1 mx-4 bg-slate-200 dark:bg-slate-700" />
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Closes</p>
                                    <p className="text-lg font-black text-rose-500 dark:text-rose-400 mt-1">
                                        {schoolData.operatingHours.end || '16:00'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}