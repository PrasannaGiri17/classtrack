import React, { useState, useEffect, useRef } from 'react';
import { FaRegUser } from "react-icons/fa6";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    User,
    Phone,
    MapPin,
    Hash,
    GraduationCap,
    TrendingUp,
    Calendar,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    Award,
    BookOpen,
    CreditCard,
    ArrowRight,
    ShieldCheck,
    FileText,
    Pencil,
    Trash2,
    Layers,
    Save,
    Check,
    X,
    Mail,
    Shield,
    Medal,
    Trophy,
    Target,
    Percent,
    CalendarDays,
    ArrowLeft
} from 'lucide-react';
import { toast } from '../MainSystemComponents/Toast';
import ConfirmDialog from '../MainSystemComponents/ConfirmDialog';
import { AddPopupStudent } from '../AdminComponents/Admin/AddPopupStudent';
import studentService from '../Api/studentService';
import attendanceService from '../Api/attendanceService';
import resultService from '../Api/resultService';
import gradeService from '../Api/gradeService';
import examService from '../Api/examService';
import feeService from '../Api/feeService';
import calendarService from '../Api/calendarService';
import flagService from '../Api/flagService';
import { convertADtoBS, convertBStoAD } from "@adhikarisaroj795/nepali-calendar-react";
import Loading from '../MainSystemComponents/Loading';
import { useAuth } from '../context/AuthContext';

// --- Helpers ---

const calculateAge = (dob) => {
    if (!dob || dob === '---') return null;
    const parts = dob.split('/');
    if (parts.length !== 3) return null;
    const [d, m, y] = parts.map(Number);
    if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
    const birth = new Date(y, m - 1, d);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const mDiff = today.getMonth() - birth.getMonth();
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
};

// --- Mock Data ---

const NEPALI_MONTHS = ["Baisakh", "Jestha", "Ashad", "Shrawan", "Bhadra", "Ashwin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"];

const STUDENT_ME_INITIAL = {
    flag: "green",
    name: 'Cristiano Ronaldo',
    rollNo: '07',
    studentId: 'S-2024001',
    grade: '10',
    section: 'A',
    dateOfBirth: '05/10/2004',
    avatarUrl: null,
    profilePhoto: null,
    email: 'cristiano.ronaldo@madridacademy.edu',
    phone: '98XXXXXXXX',
    fatherName: 'Jose Dinis Aveiro',
    fatherPhone: '+977-9800000000',
    motherName: 'geroionga',
    motherPhone: '1234567891',
    address: 'KATHMANDU, NP',
    permanentAddress: 'Nayabazar, Banasthali, Kathmandu',
    lastTermGPA: '3.85',
    classTeacher: 'Prof. Carlo Ancelotti',
    attendance: {
        month: 'Kartik',
        presentDays: 25,
        totalDays: 30,
        absentDates: ['2nd Kartik', '3rd Kartik', '12th Kartik', '25th Kartik', '28th Kartik', '30th Kartik']
    },
    yearlyAttendance: {
        rate: 92,
        present: 242,
        absent: 18
    },
    marksheet: {
        termName: 'First Term Examination 2080',
        percentage: '86.6%',
        gradePoint: '3.8',
        overallGrade: 'A',
        gradeRank: '14th',
        classRank: '5th',
        subjects: [
            { code: 'MATH', name: 'Mathematics', theory: 85, maxTheory: 100, grade: 'A+' },
            { code: 'SCI', name: 'Science', theory: 65, maxTheory: 75, practical: 25, maxPractical: 25, grade: 'A' },
            { code: 'ENG', name: 'English', theory: 88, maxTheory: 100, grade: 'A' },
            { code: 'SOC', name: 'Social Studies', theory: 92, maxTheory: 100, grade: 'A+' },
            { code: 'NEP', name: 'Nepali', theory: 75, maxTheory: 100, grade: 'B+' },
            { code: 'COM', name: 'Computer', theory: 60, maxTheory: 75, practical: 24, maxPractical: 25, grade: 'A+' },
            { code: 'ACC', name: 'Accountancy', theory: 80, maxTheory: 100, grade: 'A' },
            { code: 'OPM', name: 'Opt. Mathematics', theory: 89, maxTheory: 100, grade: 'A' },
        ]
    },
    feeStatus: {
        upcomingMonth: '---',
        upcomingAmount: 0,
        pendingMonthsCount: 0,
        totalDueAmount: 0,
        totalPaidAmount: 0
    }
};

// --- Sub-components ---

const AttendanceSummaryCard = ({ yearly, studentId }) => {
    const todayBS = convertADtoBS(new Date().toISOString().split('T')[0]);
    const [currentBSYear, currentBSMonth] = todayBS.split('-').map(Number);

    const [selectedMonth, setSelectedMonth] = useState(NEPALI_MONTHS[currentBSMonth - 1] || "Falgun");
    const [selectedYear, setSelectedYear] = useState(currentBSYear || 2081);
    const [monthlyData, setMonthlyData] = useState(null);
    const [loading, setLoading] = useState(true);

    const getBSMonthDateRange = (y, m) => {
        const startStr = `${y}-${String(m + 1).padStart(2, '0')}-01`;
        const startAD = new Date(convertBStoAD(startStr));
        let lastAD = new Date(startAD);
        let dayBS = 1;
        while (dayBS < 33) {
            const nextBS = `${y}-${String(m + 1).padStart(2, '0')}-${String(dayBS + 1).padStart(2, '0')}`;
            try {
                const nextAD = convertBStoAD(nextBS);
                if (!nextAD) break;
                lastAD = new Date(nextAD);
                dayBS++;
            } catch (e) {
                break;
            }
        }
        return { startAD, lastAD };
    };

    const getWorkingDaysCount = async (startAD, endAD) => {
        try {
            const holidaysList = await calendarService.getEvents(
                new Date(startAD).toISOString().split('T')[0],
                new Date(endAD).toISOString().split('T')[0]
            );
            const holidayDates = new Set(
                holidaysList
                    .filter(e => e.type === 'HOLIDAY')
                    .map(e => new Date(e.startDate).toISOString().split('T')[0])
            );

            let count = 0;
            let cur = new Date(startAD);
            const end = new Date(endAD);
            while (cur <= end) {
                if (cur.getDay() !== 6 && !holidayDates.has(cur.toISOString().split('T')[0])) {
                    count++;
                }
                cur.setDate(cur.getDate() + 1);
            }
            return count;
        } catch (err) { return 0; }
    };

    const fetchMonthly = async () => {
        if (!studentId) return;
        setLoading(true);
        try {
            const [data, range] = await Promise.all([
                attendanceService.getStudentMonthlyAttendance(studentId, selectedYear, selectedMonth),
                Promise.resolve(getBSMonthDateRange(selectedYear, NEPALI_MONTHS.indexOf(selectedMonth)))
            ]);
            const workingDays = await getWorkingDaysCount(range.startAD, range.lastAD);

            if (data && data.dailyStatus) {
                let present = 0, absents = [];
                Object.keys(data.dailyStatus).forEach(day => {
                    if (data.dailyStatus[day] === 'P') present++;
                    if (data.dailyStatus[day] === 'A') {
                        let suffix = 'th';
                        const dNum = parseInt(day);
                        if (dNum % 10 === 1 && dNum !== 11) suffix = 'st';
                        else if (dNum % 10 === 2 && dNum !== 12) suffix = 'nd';
                        else if (dNum % 10 === 3 && dNum !== 13) suffix = 'rd';
                        absents.push(`${day}${suffix} ${selectedMonth}`);
                    }
                });
                setMonthlyData({ presentDays: present, totalDays: workingDays || 25, absentDates: absents });
            } else {
                setMonthlyData({ presentDays: 0, totalDays: workingDays || 25, absentDates: [] });
            }
        } catch (err) {
            setMonthlyData({ presentDays: 0, totalDays: 25, absentDates: [] });
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchMonthly(); }, [selectedMonth, selectedYear, studentId]);

    const displayMonthly = monthlyData || { presentDays: 0, totalDays: 25, absentDates: [] };
    const presentPercent = displayMonthly.totalDays > 0 ? Math.round((displayMonthly.presentDays / displayMonthly.totalDays) * 100) : 0;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 p-7 lg:p-9">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                        <CalendarDays size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">Attendance Summary</h3>
                        <p className="text-[10px] font-semibold text-slate-400 mt-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                            Academic Year 2083
                        </p>
                    </div>
                </div>
            </div>

            {/* Two-column body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">

                {/* LEFT — Monthly */}
                <div className="space-y-5">

                    {/* Month selector */}
                    <div className="relative w-fit">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="appearance-none bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white px-4 py-2 pr-8 rounded-xl text-xs font-bold outline-none border border-slate-200 dark:border-slate-700 cursor-pointer transition-all focus:ring-2 focus:ring-emerald-500/20"
                        >
                            {NEPALI_MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Big ratio */}
                    <div>
                        <div className="flex items-baseline gap-1.5 pt-2">
                            <span className="text-[11px] font-medium text-slate-400">
                                Days present in <span className="font-bold text-emerald-500">{selectedMonth}</span>
                            </span>
                        </div>
                        {/* Monthly progress bar */}
                        <div className="mt-3 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                style={{ width: `${presentPercent}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{presentPercent}% attendance this month</p>
                    </div>

                    {/* Absence registry */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wide">Absence Registry</p>
                            <span className="px-2.5 py-0.5 bg-red-50 dark:bg-red-500/10 text-red-500 text-[9px] font-black rounded-full border border-red-100 dark:border-red-500/20">
                                {displayMonthly.absentDates.length} Dates
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {displayMonthly.absentDates.map((date, idx) => (
                                <span key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-[9px] font-semibold text-slate-600 dark:text-slate-400">
                                    <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                                    {date}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT — Yearly */}
                <div className="space-y-5 md:pl-6 md:border-l border-slate-100 dark:border-slate-800">
                    {/* Rate */}
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest mb-3">Yearly Performance</p>
                        <div className="flex items-end gap-3 mb-3">
                            <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none tabular-nums">{yearly.rate}%</span>
                            <span className="mb-1.5 px-2.5 py-1 bg-emerald-500 rounded-xl text-[9px] font-black text-white shadow-sm shadow-emerald-500/30">Rate</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                style={{ width: `${yearly.rate}%` }}
                            />
                        </div>
                    </div>

                    {/* Stat grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Present */}
                        <div className="bg-emerald-50/60 dark:bg-emerald-500/5 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-500/10 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">Present</span>
                            </div>
                            <p className="text-3xl font-black text-slate-900 dark:text-white leading-none tabular-nums">{yearly.present}</p>
                            <p className="text-[9px] font-semibold text-emerald-600/70 dark:text-emerald-400/60">Total Days</p>
                        </div>

                        {/* Absent */}
                        <div className="bg-red-50/60 dark:bg-red-500/5 rounded-2xl p-4 border border-red-100 dark:border-red-500/10 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">Absent</span>
                            </div>
                            <p className="text-3xl font-black text-red-500 leading-none tabular-nums">{yearly.absent}</p>
                            <p className="text-[9px] font-semibold text-red-500/50">Missed Days</p>
                        </div>

                        {/* Total school days */}
                        <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">Total School Days</span>
                            </div>
                            <p className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight tabular-nums">{yearly.totalDays || (yearly.present + yearly.absent)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StudentProfileHeader = ({ student, onUpdate, onEditClick, onDeleteClick, role }) => {
    const navigate = useNavigate();
    const [currentAvatar, setCurrentAvatar] = useState(student.profilePhoto || student.avatarUrl);
    const fileInputRef = useRef(null);
    const [isAvatarConfirmOpen, setIsAvatarConfirmOpen] = useState(false);
    const [pendingAvatar, setPendingAvatar] = useState(null);

    useEffect(() => {
        if (student.profilePhoto) {
            setCurrentAvatar(student.profilePhoto);
        } else {
            setCurrentAvatar(student.avatarUrl);
        }
    }, [student.profilePhoto, student.avatarUrl]);

    const flag = (student.flag || 'green').toLowerCase();
    const flagThemes = {
        red: {
            banner: 'bg-red-600 dark:bg-red-700',
            badge: 'bg-red-500/10 text-red-500',
            icon: 'text-red-500',
            accent: 'bg-red-500',
            label: 'Red Flagged'
        },
        amber: {
            banner: 'bg-amber-500 dark:bg-amber-600',
            badge: 'bg-amber-500/10 text-amber-500',
            icon: 'text-amber-500',
            accent: 'bg-amber-500',
            label: 'Yellow Flagged'
        },
        yellow: {
            banner: 'bg-amber-500 dark:bg-amber-600',
            badge: 'bg-amber-500/10 text-amber-500',
            icon: 'text-amber-500',
            accent: 'bg-amber-500',
            label: 'Yellow Flagged'
        },
        green: {
            banner: 'bg-emerald-600 dark:bg-emerald-700',
            badge: 'bg-emerald-500/10 text-emerald-500',
            icon: 'text-emerald-500',
            accent: 'bg-emerald-500',
            label: 'Green Flagged'
        },
        none: {
            banner: 'bg-slate-300 dark:bg-slate-400',
            badge: 'bg-slate-500/10 text-slate-500',
            icon: 'text-slate-500',
            accent: 'bg-slate-300',
            label: 'Not Flagged'
        }
    };

    const currentTheme = (student.flagDetails && flag) ? (flagThemes[flag] || flagThemes.none) : flagThemes.none;

    const handleImageClick = () => fileInputRef.current?.click();

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPendingAvatar(reader.result);
                setIsAvatarConfirmOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarConfirm = async () => {
        if (pendingAvatar) {
            try {
                // Call onUpdate to save to backend
                await onUpdate({ profilePhoto: pendingAvatar });
                setCurrentAvatar(pendingAvatar);
                toast({ type: 'success', message: 'Profile picture updated successfully!' });
            } catch (err) {
                console.error("Failed to update avatar:", err);
                toast({ type: 'error', message: 'Failed to save profile picture' });
            }
        }
        setIsAvatarConfirmOpen(false);
        setPendingAvatar(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="relative w-full bg-white dark:bg-[#0b1220] rounded-[40px] transition-all group/card">
            {/* 1. Header Banner */}
            <div className={`h-10 md:h-12 w-full ${currentTheme.banner} relative rounded-t-[40px] transition-colors duration-500 group/banner cursor-help`}>
                <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent rounded-t-[40px]" />

                {/* Hover Tooltip - Academic Summary */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex gap-3 opacity-0 group-hover/banner:opacity-100 transition-all duration-500 pointer-events-none translate-y-2 group-hover/banner:translate-y-0 z-50">
                    <div className="bg-[#1a2235]/95 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-2xl shadow-2xl flex flex-col gap-1 min-w-[160px]">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Attendance</span>
                        </div>
                        <p className="text-xs font-black text-white whitespace-nowrap leading-tight mt-1">
                            {student.yearlyAttendance?.present || 0} / {student.yearlyAttendance?.totalDays || 0} <span className="text-slate-400 font-bold ml-0.5">Days</span>
                        </p>
                    </div>

                    <div className="bg-[#1a2235]/95 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-2xl shadow-2xl flex flex-col gap-1 min-w-[160px]">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                {student.flagDetails?.academicYear} {student.flagDetails?.termPair || student.flagDetails?.term || 'Academic'}
                            </span>
                        </div>
                        <p className="text-xs font-black text-white whitespace-nowrap leading-tight mt-1">
                            {student.flagDetails?.termScore || student.flagDetails?.finalTermScore ? (((student.flagDetails.termScore || student.flagDetails.finalTermScore) / 100) * 4).toFixed(2) : "0.00"} <span className="text-slate-400 font-bold ml-0.5">GPA</span>
                        </p>
                    </div>

                    <div className="bg-[#1a2235]/95 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-2xl shadow-2xl flex flex-col gap-1 min-w-[120px]">
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-circle-info text-[9px] text-slate-400"></i>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                {student.flagDetails ? 'Flag Logic' : 'No Data to Flag'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-0.5 mt-1">
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-[8px] text-slate-400 font-bold">Attendance:</span>
                                <span className={`text-[9px] font-black ${student.flagDetails ? (student.flagDetails.attendancePct >= 80 ? 'text-emerald-400' : student.flagDetails.attendancePct >= 60 ? 'text-amber-400' : 'text-red-400') : 'text-slate-500'}`}>
                                    {student.flagDetails?.attendancePct != null ? `${student.flagDetails.attendancePct.toFixed(1)}%` : 'No Data'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <span className="text-[8px] text-slate-400 font-bold">Academic:</span>
                                <span className={`text-[9px] font-black ${student.flagDetails ? (student.flagDetails.termScore >= 75 ? 'text-emerald-400' : student.flagDetails.termScore >= 60 ? 'text-amber-400' : 'text-red-400') : 'text-slate-500'}`}>
                                    {student.flagDetails?.termScore != null ? `${student.flagDetails.termScore.toFixed(1)}%` : 'No Data'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back/Close Button */}
                <button
                    onClick={() => navigate(`/${role}/student-record`)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-white transition-all group/close z-10"
                    title="Back to Student Records"
                >
                    <X size={14} className="transition-transform group-hover/close:rotate-90" />
                </button>
            </div>

            {/* 2. Main Identity Section */}
            <div className="px-8 md:px-14 pb-10">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 -mt-6 md:-mt-8 relative z-10">

                    {/* Avatar & Basic Info */}
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
                        <div className="relative group cursor-pointer" onClick={handleImageClick}>
                            <div className="w-36 h-36 md:w-40 md:h-40 rounded-[36px] bg-[#0b1220] p-1.5 shadow-2xl border border-white/10 relative overflow-hidden">
                                <div className="w-full h-full rounded-[30px] overflow-hidden bg-slate-800 relative">
                                    {currentAvatar ? (
                                        <img
                                            src={currentAvatar}
                                            alt={student.name}
                                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:blur-[3px]"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                            <FaRegUser className="text-slate-500 w-12 h-12" />
                                        </div>
                                    )}
                                    {/* Pencil Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl">
                                            <Pencil size={20} className="text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`absolute bottom-1 right-1 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white border-4 border-[#0b1220] shadow-lg z-20 transition-colors`}>
                                <Shield size={14} fill="currentColor" />
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                        </div>

                        <div className="text-center md:text-left pb-1 flex flex-col items-center md:items-start">
                            <div className={`px-2.5 py-0.5 ${currentTheme.badge} border rounded-lg text-[7px] font-black uppercase tracking-[0.2em] mb-3 w-fit transition-all`}>
                                {currentTheme.label}
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-4">
                                {student.name}
                            </h2>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-5">
                                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
                                    <Hash size={14} className="text-emerald-500" />
                                    <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-700 dark:text-slate-300">{student.studentId}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50/50 dark:bg-white/5 rounded-[32px] px-8 py-5 flex items-center justify-between lg:min-w-[420px]">
                        <div className="flex-1 flex flex-col items-center text-center min-w-fit">
                            <p className="text-[8px] font-black text-slate-400 tracking-widest mb-1.5">Gpa</p>
                            <p className={`text-2xl font-black ${currentTheme.icon} tracking-tight leading-none transition-colors`}>{student.lastTermGPA}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-white/10 mx-2" />
                        <div className="flex-1 flex flex-col items-center text-center min-w-fit">
                            <p className="text-[8px] font-black text-slate-400 tracking-widest mb-1.5">Rank</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{student.marksheet.gradeRank}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-white/10 mx-2" />
                        <div className="flex-1 flex flex-col items-center text-center min-w-fit">
                            <p className="text-[8px] font-black text-slate-400 tracking-widest mb-1.5">Roll</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{student.rollNo}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-white/10 mx-2" />
                        <div className="flex-1 flex flex-col items-center text-center min-w-fit">
                            <p className="text-[8px] font-black text-slate-400 tracking-widest mb-1.5">Attendance</p>
                            <p className={`text-2xl font-black ${currentTheme.icon} tracking-tight leading-none transition-colors`}>{student.yearlyAttendance?.rate || 0}%</p>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-white/10 w-full my-8" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-y-6">
                    <div className="space-y-1.5">
                        <p className="text-[9px] font-black text-slate-400 tracking-widest">Email Address</p>
                        <p className="text-sm font-black text-slate-800 dark:text-white lowercase tracking-tight">{student.email}</p>
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-[9px] font-black text-slate-400 tracking-widest">Grade Level</p>
                        <p className="text-sm font-black text-slate-800 dark:text-white tracking-tight">Grade {student.grade} {student.section}</p>
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-[9px] font-black text-slate-400 tracking-widest">Date Of Birth</p>
                        <p className="text-sm font-black text-slate-800 dark:text-white tracking-tight">
                            {student.dateOfBirth || '---'}
                            {student.dateOfBirth && calculateAge(student.dateOfBirth) !== null && !isNaN(calculateAge(student.dateOfBirth)) && (
                                <span className="text-emerald-500"> ({calculateAge(student.dateOfBirth)})</span>
                            )}
                        </p>
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-[9px] font-black text-slate-400 tracking-widest">Class Teacher</p>
                        <p className="text-sm font-black text-slate-800 dark:text-white tracking-tight">{student.classTeacher}</p>
                    </div>

                    {/* Action Buttons */}
                    {role === 'admin' && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onEditClick}
                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl transition-all shadow-sm shadow-emerald-500/30 hover:shadow-md hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <Pencil size={13} />
                                Edit Student
                            </button>
                            <button
                                onClick={onDeleteClick}
                                className="flex items-center justify-center w-10 h-10 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20 shadow-sm hover:shadow-red-500/20 hover:-translate-y-0.5 active:translate-y-0"
                                title="Delete Student"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={isAvatarConfirmOpen}
                onClose={() => { setIsAvatarConfirmOpen(false); setPendingAvatar(null); }}
                onConfirm={handleAvatarConfirm}
                title="Update Profile Picture?"
                message="Are you sure you want to change your current profile picture with the selected one?"
            />
        </div>
    );
};

// --- Detailed Marksheet Components ---

const SubjectResultCard = ({ s }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const totalFullMarks = 100;
    const overallPercent = ((s.theory + (s.practical || 0)) / totalFullMarks) * 100;
    const theoryDash = (s.theory / totalFullMarks) * circumference;
    const practicalDash = (s.practical / totalFullMarks) * circumference;

    return (
        <div className="bg-slate-50 dark:bg-[#0b1220] rounded-[40px] p-8 border border-slate-200 dark:border-slate-800/60 shadow-xl flex flex-col items-center gap-8 group hover:border-emerald-500/30 transition-all duration-500 relative overflow-hidden">
            {/* Subject Name Badge */}
            <div className="px-5 py-2 bg-slate-200 dark:bg-slate-900/80 rounded-2xl border border-slate-300 dark:border-slate-700/50">
                <span className="text-[10px] font-black text-slate-800 dark:text-white capitalize tracking-[0.2em]">{s.name}</span>
            </div>

            <div className="relative flex items-center justify-center w-full py-2">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none overflow-visible" viewBox="0 0 110 110">
                        {/* Background track */}
                        <circle cx="55" cy="55" r={radius} className="fill-none stroke-slate-200 dark:stroke-slate-800/60 stroke-[5]" />

                        {/* Theory arc — green */}
                        <circle
                            cx="55" cy="55" r={radius}
                            fill="none" stroke="#10b981" strokeWidth="5"
                            strokeDasharray={`${theoryDash} ${circumference}`}
                            strokeLinecap="round"
                            style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.5))' }}
                        />

                        {/* Practical arc — indigo, starts after theory */}
                        {s.maxPractical > 0 && (
                            <circle
                                cx="55" cy="55" r={radius}
                                fill="none" stroke="#818cf8" strokeWidth="5"
                                strokeDasharray={`${practicalDash} ${circumference}`}
                                strokeDashoffset={-theoryDash}
                                strokeLinecap="round"
                                style={{ filter: 'drop-shadow(0 0 4px rgba(129,140,248,0.5))' }}
                            />
                        )}
                    </svg>

                    {/* Scores inside circle */}
                    <div className="flex flex-col items-center justify-center z-10">
                        {s.maxPractical > 0 ? (
                            <div className="flex items-center gap-1.5">
                                <span className="text-2xl font-black text-emerald-500 leading-none tabular-nums">{s.theory}</span>
                                <span className="text-base font-black text-slate-400 dark:text-slate-600 leading-none">|</span>
                                <span className="text-2xl font-black text-indigo-400 leading-none tabular-nums">{s.practical}</span>
                            </div>
                        ) : (
                            <span className="text-3xl font-black text-emerald-500 leading-none tabular-nums">{s.theory}</span>
                        )}
                        <div className="h-px w-8 bg-slate-300 dark:bg-slate-700/50 my-1.5" />
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tabular-nums">
                            100
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer Stats */}
            <div className="w-full space-y-3 pt-5 border-t border-slate-200 dark:border-slate-800/40">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-wider">Theory</span>
                        {s.maxPractical > 0 && (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block ml-2" />
                                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-wider">Practical</span>
                            </>
                        )}
                    </div>
                    <span className="text-xs font-black text-emerald-500">{s.grade}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${overallPercent}%` }} />
                </div>
            </div>
        </div>
    );
};

const MarksheetSection = ({ marksheet }) => {
    return (
        <div className="space-y-8">
            {/* 1. Balanced 3-Column Summary Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-50 dark:bg-[#0b1220] rounded-[40px] px-8 py-5 border border-slate-200 dark:border-slate-800/60 shadow-lg flex items-center gap-6 relative overflow-hidden group">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                        <Medal size={24} />
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-[0.25em]">Rank Outcome</p>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                            {marksheet.gradeRank} <span className="text-[10px] text-slate-400 font-bold ml-1 tracking-tight">Grade</span>
                        </h4>
                    </div>
                </div>

                {/* Class Rank Card */}
                <div className="bg-slate-50 dark:bg-[#0b1220] rounded-[40px] px-8 py-5 border border-slate-200 dark:border-slate-800/60 shadow-lg flex items-center gap-6 relative overflow-hidden group">
                    <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                        <Trophy size={24} />
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-[0.25em]">Rank Of Class</p>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                            {marksheet.classRank} <span className="text-[10px] text-slate-400 font-bold ml-1 tracking-tight">Section</span>
                        </h4>
                    </div>
                </div>

                {/* Unified Results Summary Card - Matching Screenshot */}
                <div className="bg-slate-50 dark:bg-[#0b1220] rounded-[40px] px-10 py-5 border border-slate-200 dark:border-slate-800/60 shadow-lg flex items-center justify-between overflow-hidden relative group/summary">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/[0.03] blur-[80px] rounded-full pointer-events-none group-hover/summary:bg-indigo-500/[0.05] transition-colors duration-700" />

                    {/* Percentage (Left) */}
                    <div className="flex-1 flex flex-col items-start gap-0.5 relative z-10">
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] leading-none">Percentage</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">{marksheet.percentage}</p>
                    </div>

                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-800/60 mx-4" />

                    {/* Grade Point (Center) */}
                    <div className="flex-1 flex flex-col items-center text-center gap-0.5 relative z-10">
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] leading-none">Gpa</p>
                        <p className="text-3xl font-black text-indigo-500 dark:text-indigo-400 tracking-tighter tabular-nums leading-none">{marksheet.gradePoint}</p>
                    </div>

                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-800/60 mx-4" />

                    {/* Overall Grade (Right) */}
                    <div className="flex-1 flex flex-col items-center text-center gap-0.5 relative z-10">
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] leading-none">Grade</p>
                        <p className="text-3xl font-black text-emerald-500 tracking-tighter leading-none">{marksheet.overallGrade}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {marksheet.subjects.map((s) => (
                    <SubjectResultCard key={s.code} s={s} />
                ))}
            </div>
        </div>
    );
};

const InfoItem = ({ label, value, icon, accent, red }) => (
    <div className="space-y-2 group">
        <div className="flex items-center gap-2">
            {icon}
            <span className="text-[10px] font-black text-slate-400 tracking-widest">{label}</span>
        </div>
        <p className={`text-lg font-black tracking-tight leading-tight transition-colors ${red ? 'text-red-500' : accent ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-100 group-hover:text-emerald-600'
            }`}>
            {value || "---"}
        </p>
    </div>
);

const EditableInfoItem = ({ label, value, onChange, icon, placeholder, maxLength }) => (
    <div className="space-y-2.5 group">
        <div className="flex items-center gap-2">
            {icon}
            <span className="text-[10px] font-black text-slate-400 tracking-widest">{label}</span>
        </div>
        <div className="relative group/input">
            <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || `Enter ${label}`} maxLength={maxLength} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-base font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/40 outline-none transition-all shadow-inner" />
            {maxLength && <span className="absolute right-4 bottom-2 text-[8px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-tighter">{value.length}/{maxLength}</span>}
        </div>
    </div>
);

const StudentPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const role = user?.role || 'admin';
    const [isLoaded, setIsLoaded] = useState(false);
    const [student, setStudent] = useState(STUDENT_ME_INITIAL);
    const [selectedTerm, setSelectedTerm] = useState('First Term');
    const [availableTerms, setAvailableTerms] = useState(['First Term', 'Second Term', 'Third Term']);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [examConfig, setExamConfig] = useState(null);
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
    const [isTermDropdownOpen, setIsTermDropdownOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null); // { year, gradeId, gradeNumber }
    const [availableRecords, setAvailableRecords] = useState([]);

    const fetchResults = async (studentId, currentClass, sectionName, gradeId, year) => {
        try {
            const [allGradeResults, grades, examConfig] = await Promise.all([
                resultService.getResultsByGradeSectionTerm(gradeId, null, selectedTerm, year),
                gradeService.getGrades(),
                examService.getExamData()
            ]);

            if (examConfig?.termStatuses) {
                setExamConfig(examConfig);
                setAvailableTerms(examConfig.termStatuses.map(t => t.term));
            }

            // 1. Resolve published status
            const termStatus = examConfig?.termStatuses?.find(
                t => t.term.toLowerCase().trim() === selectedTerm.toLowerCase().trim()
            );
            const published = termStatus?.isPublished === true;

            if (!published) {
                setStudent(prev => ({
                    ...prev,
                    marksheet: { ...prev.marksheet, subjects: [] }
                }));
                return;
            }

            // 2. Calculate Ranks
            const uniqueResultsMap = new Map();
            allGradeResults.forEach(r => {
                const sid = r.studentId?._id?.toString() || r.studentId?.toString();
                if (sid) uniqueResultsMap.set(sid, r);
            });
            const uniqueGradeResults = Array.from(uniqueResultsMap.values());

            const sortedByGrade = uniqueGradeResults.sort((a, b) => (b.summary?.percentage || 0) - (a.summary?.percentage || 0));
            const gradeRankIdx = sortedByGrade.findIndex(r => (r.studentId?._id?.toString() || r.studentId?.toString()) === studentId?.toString());

            // Filter for current section only (robust comparison)
            const currentSectionName = (sectionName || "").toString().trim().toLowerCase();
            const sectionResults = uniqueGradeResults.filter(r =>
                (r.sectionName || "").toString().trim().toLowerCase() === currentSectionName
            );
            const sortedBySection = sectionResults.sort((a, b) => (b.summary?.percentage || 0) - (a.summary?.percentage || 0));
            const sectionRankIdx = sortedBySection.findIndex(r => (r.studentId?._id?.toString() || r.studentId?.toString()) === studentId?.toString());

            const getRankSuffix = (n) => {
                if (n === -1) return "---";
                const i = n + 1;
                const j = i % 10, k = i % 100;
                if (j === 1 && k !== 11) return i + "st";
                if (j === 2 && k !== 12) return i + "nd";
                if (j === 3 && k !== 13) return i + "rd";
                return i + "th";
            };

            const gradeRank = getRankSuffix(gradeRankIdx);
            const sectionRank = getRankSuffix(sectionRankIdx);

            // 3. Find specific student result
            const currentResult = allGradeResults.find(r => r.studentId?._id?.toString() === studentId?.toString());
            const currentGradeConfig = grades.find(g => g.gradeNumber.toString() === currentClass?.toString());

            const calculateGrade = (total) => {
                if (total >= 90) return 'A+';
                if (total >= 80) return 'A';
                if (total >= 70) return 'B+';
                if (total >= 60) return 'B';
                if (total >= 50) return 'C+';
                if (total >= 40) return 'C';
                return 'D';
            };

            let marksData = [];
            if (currentGradeConfig) {
                marksData = (currentGradeConfig.subjects || []).map(gs => {
                    const subId = gs.subjectId?._id?.toString();
                    const markEntry = currentResult?.marks?.find(m => (m.subjectId?._id || m.subjectId)?.toString() === subId);
                    return {
                        code: subId,
                        name: gs.subjectId?.subjectName || 'Unknown',
                        theory: markEntry ? (markEntry.theoryMarks ?? 0) : 0,
                        maxTheory: gs.theoryFullMarks || gs.fullMarks || 100,
                        practical: markEntry ? (markEntry.practicalMarks ?? 0) : 0,
                        maxPractical: gs.practicalFullMarks || gs.practicalMarks || (markEntry?.practicalMarks > 0 ? 25 : 0),
                        grade: markEntry ? calculateGrade(markEntry.theoryMarks + (markEntry.practicalMarks || 0)) : '—'
                    };
                });
            }

            const overallGpa = currentResult?.summary?.gpa ? Number(currentResult.summary.gpa).toFixed(2) : "0.00";

            setStudent(prev => ({
                ...prev,
                lastTermGPA: overallGpa,
                marksheet: {
                    ...prev.marksheet,
                    percentage: currentResult?.summary?.percentage ? `${Number(currentResult.summary.percentage).toFixed(2)}%` : '0.00%',
                    gradePoint: overallGpa,
                    overallGrade: currentResult?.summary?.percentage ? calculateGrade(currentResult.summary.percentage) : '—',
                    gradeRank: gradeRank,
                    classRank: sectionRank,
                    subjects: marksData
                }
            }));
        } catch (e) {
            console.warn("Results fetch error", e);
        }
    };

    const fetchStudent = async () => {
        try {
            if (id) {
                const todayBS = convertADtoBS(new Date().toISOString().split('T')[0]);
                const [curY] = todayBS.split('-').map(Number);
                const startAD = convertBStoAD(`${curY}-01-01`);
                const endAD = new Date().toISOString().split('T')[0];

                // 1. Fetch student first to get the correct student._id (in case 'id' is a userId)
                const studentData = await studentService.getStudentById(id);
                const realStudentId = studentData._id;

                // 2. Fetch other data using the resolved student ID
                const [yearlyRes, holidaysList, flagRes, allResults] = await Promise.allSettled([
                    attendanceService.getStudentYearlyAttendance(realStudentId, curY || 2081),
                    calendarService.getEvents(startAD, endAD),
                    flagService.getLatestFlag(realStudentId),
                    resultService.getStudentResults(realStudentId)
                ]);

                const data = studentData;
                const yearlyData = yearlyRes.status === 'fulfilled' ? yearlyRes.value : null;
                const holidaysData = holidaysList.status === 'fulfilled' ? holidaysList.value : [];
                const latestFlag = flagRes.status === 'fulfilled' ? (Array.isArray(flagRes.value) ? flagRes.value[0] : flagRes.value) : null;
                const resultsData = allResults.status === 'fulfilled' ? allResults.value : [];

                const holidayDates = new Set(holidaysData.filter(e => e.type === 'HOLIDAY').map(e => new Date(e.startDate).toISOString().split('T')[0]));

                let workingDaysCount = 0;
                let cur = new Date(startAD);
                const end = new Date(endAD);
                while (cur <= end) {
                    if (cur.getDay() !== 6 && !holidayDates.has(cur.toISOString().split('T')[0])) workingDaysCount++;
                    cur.setDate(cur.getDate() + 1);
                }

                const finalYearly = yearlyData ? {
                    present: yearlyData.present,
                    absent: yearlyData.absent,
                    totalDays: workingDaysCount,
                    rate: workingDaysCount > 0 ? Math.round((yearlyData.present / workingDaysCount) * 100) : 0
                } : STUDENT_ME_INITIAL.yearlyAttendance;

                let finalFeeStatus = STUDENT_ME_INITIAL.feeStatus;
                if (role === 'admin') {
                    try {
                        const feeRes = await feeService.getFeeSummary(realStudentId);
                        if (feeRes) {
                            finalFeeStatus = {
                                upcomingMonth: feeRes.upcomingMonth || "N/A",
                                upcomingAmount: feeRes.upcomingAmount || 0,
                                pendingMonthsCount: feeRes.unpaidCount || 0,
                                totalDueAmount: feeRes.totalDue || 0,
                                totalPaidAmount: feeRes.totalPaid || 0
                            };
                        }
                    } catch (fe) {
                        console.warn("Fee fetch failed", fe);
                    }
                }

                // Process historical records for dropdown
                const recordsMap = new Map();
                resultsData.forEach(res => {
                    const rGradeId = res.gradeId?._id?.toString() || res.gradeId?.toString();
                    if (rGradeId) {
                        const key = `${res.academicYear}-${rGradeId}`;
                        if (!recordsMap.has(key)) {
                            recordsMap.set(key, {
                                year: res.academicYear,
                                gradeId: rGradeId,
                                gradeNumber: res.gradeId?.gradeNumber || "Unknown"
                            });
                        }
                    }
                });

                // Add current academic record if not present
                const curGradeId = data.classId?._id?.toString() || data.classId?.toString();
                if (curGradeId) {
                    const currentKey = `${curY || 2081}-${curGradeId}`;
                    if (!recordsMap.has(currentKey)) {
                        recordsMap.set(currentKey, {
                            year: curY || 2081,
                            gradeId: curGradeId,
                            gradeNumber: data.studentClass
                        });
                    }
                }

                const recordsList = Array.from(recordsMap.values()).sort((a, b) => b.year - a.year || b.gradeNumber - a.gradeNumber);
                setAvailableRecords(recordsList);

                // Default selection is current record or first record
                const initialRecord = recordsList.find(r => r.year === (curY || 2081)) || recordsList[0] || null;
                setSelectedRecord(initialRecord);

                setStudent(prev => ({
                    ...prev,
                    ...data,
                    name: `${data.firstName} ${data.lastName}`,
                    rollNo: data.rollNumber ? String(data.rollNumber).padStart(2, '0') : "---",
                    grade: data.studentClass,
                    section: data.sectionId?.sectionName || "",
                    classTeacher: data.sectionId?.classTeacherId ? `${data.sectionId.classTeacherId.firstName} ${data.sectionId.classTeacherId.lastName || ""}` : "Unassigned",
                    permanentAddress: data.Address || data.permanentAddress || data.address || "---",
                    dateOfBirth: data.birthdate ? new Date(data.birthdate).toISOString().split('T')[0].split('-').reverse().join('/') : null,
                    yearlyAttendance: finalYearly,
                    feeStatus: finalFeeStatus,
                    flag: latestFlag?.flagColor || data.flag || "green",
                    flagDetails: latestFlag
                }));

                // Remove redundant call as useEffect will handle it
                // await fetchResults(id, data.studentClass, data.sectionId?.sectionName, data.gradeId?._id, curY || 2081);
            }
            setIsLoaded(true);
        } catch (err) {
            console.error(err);
            toast({ type: 'error', message: 'Failed to load profile' });
            setIsLoaded(true);
        }
    };

    useEffect(() => {
        if (id) fetchStudent();
    }, [id, refreshTrigger]);

    useEffect(() => {
        if (id && selectedRecord && selectedTerm) {
            fetchResults(id, selectedRecord.gradeNumber, student.section, selectedRecord.gradeId, selectedRecord.year);
        }
    }, [id, selectedRecord, selectedTerm, student.section]);

    const handleUpdateStudent = async (updatedFields) => {
        try {
            if (id) {
                const response = await axios.put(`http://localhost:7000/api/students/${id}`, updatedFields);
                setStudent(prev => ({ ...prev, ...response.data }));
            } else {
                // For mock data
                setStudent(prev => ({ ...prev, ...updatedFields }));
            }
        } catch (err) {
            console.error("Update failed:", err);
            toast({ type: 'error', message: 'Failed to update record' });
            throw err;
        }
    };

    const handleDelete = async () => {
        try {
            await studentService.deleteStudent(id);
            toast({ type: 'success', message: 'Student record deleted successfully.' });
            navigate(`/${role}/student-record`);
        } catch (err) {
            console.error("Deletion failed:", err);
            toast({ type: 'error', message: 'Failed to delete student record.' });
        } finally {
            setIsDeleteConfirmOpen(false);
        }
    };

    if (!isLoaded) {
        return <Loading text="Fetching student profile..." fullScreen={true} />;
    }

    return (
        <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
            {/* Back Button */}
            <div className="flex items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-2.5 px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 active:scale-95"
                >
                    <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Back to List</span>
                </button>
            </div>

            <div className="flex flex-col gap-8">
                <StudentProfileHeader
                    student={student}
                    onUpdate={handleUpdateStudent}
                    onEditClick={() => setIsEditPopupOpen(true)}
                    onDeleteClick={() => setIsDeleteConfirmOpen(true)}
                    role={role}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <GuardianInfoCard student={student} />
                    {role === 'admin' ? (
                        <FeeStatusCard feeStatus={student.feeStatus} studentId={id} role={role} />
                    ) : (
                        <div className="bg-slate-50/50 dark:bg-[#0b1220]/50 rounded-[40px] border border-dashed border-slate-200 dark:border-white/10 p-8 flex flex-col items-center justify-center text-center gap-4 group/restricted">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center text-slate-400 dark:text-slate-600 transition-colors group-hover/restricted:text-amber-500/50">
                                <Shield size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Finance Restricted</h3>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 px-10">
                                    Financial details are only accessible to administrative personnel.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <AttendanceSummaryCard yearly={student.yearlyAttendance} studentId={id} />

                <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm p-8 lg:p-12 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/10 transition-colors">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Latest Marksheet</h3>
                                <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-2">{selectedTerm} Examination {student.flagDetails?.academicYear || 2081}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Academic Year Dropdown */}
                            <div className="relative group/select">
                                <label className="absolute -top-2 left-4 px-1.5 bg-white dark:bg-slate-900 text-[8px] font-black text-slate-400 tracking-widest z-10 transition-colors group-focus-within/select:text-emerald-500">
                                    Academic Year
                                </label>
                                <div className="flex items-center relative">
                                    <button
                                        onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                                        className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm font-black text-slate-700 dark:text-slate-200 outline-none transition-all cursor-pointer shadow-inner min-w-[160px] tracking-wider group"
                                    >
                                        {selectedRecord ? `Grade ${selectedRecord.gradeNumber} (${selectedRecord.year})` : "No Record"}
                                        <ChevronDown size={18} className={`text-slate-400 group-hover:text-emerald-500 transition-all ${isYearDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                                    </button>

                                    {isYearDropdownOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-[60]"
                                                onClick={() => setIsYearDropdownOpen(false)}
                                            />
                                            <div className="absolute top-full left-0 w-full mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-[70] animate-in fade-in zoom-in-95 duration-200 p-2">
                                                <div className="max-h-60 overflow-y-auto scrollbar-hide space-y-1">
                                                    {availableRecords.map((rec, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => {
                                                                setSelectedRecord(rec);
                                                                setIsYearDropdownOpen(false);
                                                            }}
                                                            className={`w-full px-5 py-3 text-[11px] font-black text-left rounded-2xl transition-all uppercase tracking-widest ${selectedRecord?.year === rec.year && selectedRecord?.gradeId === rec.gradeId
                                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-emerald-500'
                                                                }`}
                                                        >
                                                            Grade {rec.gradeNumber} ({rec.year})
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Academic Term Dropdown */}
                            <div className="relative group/select">
                                <label className="absolute -top-2 left-4 px-1.5 bg-white dark:bg-slate-900 text-[8px] font-black text-slate-400 tracking-widest z-10 transition-colors group-focus-within/select:text-emerald-500">
                                    Academic Term
                                </label>
                                <div className="flex items-center relative">
                                    <button
                                        onClick={() => setIsTermDropdownOpen(!isTermDropdownOpen)}
                                        className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm font-black text-slate-700 dark:text-slate-200 outline-none transition-all cursor-pointer shadow-inner min-w-[200px] tracking-wider group"
                                    >
                                        {selectedTerm}
                                        <ChevronDown size={18} className={`text-slate-400 group-hover:text-emerald-500 transition-all ${isTermDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                                    </button>

                                    {isTermDropdownOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-[60]"
                                                onClick={() => setIsTermDropdownOpen(false)}
                                            />
                                            <div className="absolute top-full left-0 w-full mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-[70] animate-in fade-in zoom-in-95 duration-200 p-2">
                                                <div className="max-h-60 overflow-y-auto scrollbar-hide space-y-1">
                                                    {availableTerms.map(term => (
                                                        <button
                                                            key={term}
                                                            onClick={() => {
                                                                setSelectedTerm(term);
                                                                setIsTermDropdownOpen(false);
                                                            }}
                                                            className={`w-full px-5 py-3 text-[11px] font-black text-left rounded-2xl transition-all uppercase tracking-widest ${selectedTerm === term
                                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-emerald-500'
                                                                }`}
                                                        >
                                                            {term}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {(() => {
                        const termStatus = examConfig?.termStatuses?.find(
                            t => t.term.toLowerCase().trim() === selectedTerm.toLowerCase().trim()
                        );
                        const isPublished = termStatus?.isPublished === true;

                        if (!isPublished) {
                            return (
                                <div className="flex flex-col items-center justify-center py-20 gap-8">
                                    <div className="w-20 h-20 rounded-[28px] bg-slate-100 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </div>
                                    <div className="text-center space-y-3">
                                        <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Results Not Available</h4>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest max-w-sm mx-auto">
                                            Academic records for{' '}
                                            <span className="text-emerald-500 font-black">{selectedTerm}</span>{' '}
                                            have not been finalized or published by the examination board yet.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                                            <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
                                        </svg>
                                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em]">Pending Publication</span>
                                    </div>
                                </div>
                            );
                        }
                        return <MarksheetSection marksheet={student.marksheet} />;
                    })()}
                </div>
            </div>

            <AddPopupStudent
                isOpen={isEditPopupOpen}
                onClose={() => setIsEditPopupOpen(false)}
                onSuccess={() => {
                    setIsEditPopupOpen(false);
                    toast({ type: 'success', message: 'Student record updated.' });
                    setRefreshTrigger(prev => prev + 1);
                }}
                mode="edit"
                studentData={student}
            />

            <ConfirmDialog
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Delete Student Record?"
                message={`Are you sure you want to permanently delete the record for ${student.name}? This action cannot be undone.`}
                confirmText="Delete"
                confirmColor="bg-red-500"
            />
        </div>
    );
};

const GuardianInfoCard = ({ student }) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm p-8 lg:p-10 transition-all hover:shadow-md relative">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 transition-colors">
                        <User size={20} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Guardian Details</h3>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-8">
                <InfoItem label="Father Name" value={student.fatherName} icon={<User size={14} className="text-emerald-500" />} />
                <InfoItem label="Father Number" value={student.fatherPhone} icon={<Phone size={14} className="text-emerald-500" />} />
                <InfoItem label="Mother Name" value={student.motherName} icon={<User size={14} className="text-emerald-500" />} />
                <InfoItem label="Mother Number" value={student.motherPhone} icon={<Phone size={14} className="text-emerald-500" />} />
                <div className="sm:col-span-2 pt-2 border-t border-slate-50 dark:border-white/5">
                    <InfoItem label="Permanent Address" value={student.permanentAddress} icon={<MapPin size={14} className="text-emerald-500" />} />
                </div>
            </div>
        </div>
    );
};

const SkeletonBlock = ({ height }) => (<div className={`w-full ${height} bg-slate-200 dark:bg-slate-800/50 rounded-[40px]`} />);

const FeeStatusCard = ({ feeStatus, studentId, role }) => {
    const navigate = useNavigate();
    return (
        <div className="bg-white dark:bg-[#0b1220] rounded-[40px] border border-slate-100 dark:border-white/5 shadow-xl p-6 lg:p-8 transition-all relative overflow-hidden group/card shadow-indigo-500/5 h-full flex flex-col justify-between">
            {/* Decorative background elements */}
            <div className="absolute top-[-80px] left-[-80px] w-64 h-64 bg-indigo-500/[0.05] blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-40px] right-[-40px] w-64 h-64 bg-emerald-500/[0.03] blur-[100px] rounded-full pointer-events-none transition-colors" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-inner transition-colors">
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Finances</h3>
                            <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 tracking-widest mt-0.5">Status Overview</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(`/${role === 'admin' ? 'admin' : 'teacher'}/fee/student/${studentId}`)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black rounded-xl transition-all shadow-sm shadow-emerald-500/30 hover:shadow-md hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 tracking-widest"
                    >
                        Full Fee Record
                        <ArrowRight size={13} />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {/* Total Payments Card */}
                    <div className="bg-emerald-50 dark:bg-emerald-500/[0.06] p-4 lg:p-5 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 transition-all hover:bg-emerald-100/50 dark:hover:bg-emerald-500/[0.1] group/item">
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldCheck size={12} className="text-emerald-500" />
                            <span className="text-[9px] font-black text-emerald-500/60 tracking-widest">Total Payments</span>
                        </div>
                        <p className="text-3xl font-black text-emerald-500 leading-none tracking-tight tabular-nums">
                            <span className="text-lg font-bold text-emerald-500/40 mr-1">Rs.</span>
                            {(feeStatus?.totalPaidAmount || 0).toLocaleString()}
                        </p>
                    </div>

                    {/* Total Dues Card */}
                    <div className="bg-red-50 dark:bg-red-500/[0.06] p-4 lg:p-5 rounded-2xl border border-red-200 dark:border-red-500/20 transition-all hover:bg-red-100/50 dark:hover:bg-red-500/[0.1] group/item">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertCircle size={12} className="text-red-500" />
                            <span className="text-[9px] font-black text-red-500/60 tracking-widest">Total Dues</span>
                        </div>
                        <p className="text-3xl font-black text-red-500 leading-none tracking-tight tabular-nums">
                            <span className="text-lg font-bold text-red-500/40 mr-1">Rs.</span>
                            {(feeStatus?.totalDueAmount || 0).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentPage;