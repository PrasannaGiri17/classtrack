import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  ArrowLeft,
  ShieldCheck,
  FileText,
  Pencil,
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
  Loader2,
  Lock
} from 'lucide-react';
import { toast } from '../MainSystemComponents/Toast';
import ConfirmDialog from '../MainSystemComponents/ConfirmDialog';
import studentService from '../Api/studentService';
import attendanceService from '../Api/attendanceService';
import feeService from '../Api/feeService';
import resultService from '../Api/resultService';
import examService from '../Api/examService';
import gradeService from '../Api/gradeService';
import PhotoCropModal from '../MainSystemComponents/PhotoCropModal';
import ForgotPasswordModal from '../TeacherComponents/Layout/ForgotPasswordModal';
import { convertADtoBS, convertBStoAD } from "@adhikarisaroj795/nepali-calendar-react";
import calendarService from '../Api/calendarService';

// --- Helpers ---

const calculateAge = (dob) => {
  if (!dob) return null;
  const [d, m, y] = dob.split('/');
  const birth = new Date(y, m - 1, d);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const mDiff = today.getMonth() - birth.getMonth();
  if (mDiff < 0 || (mDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

// --- Mock Data ---

const NEPALI_MONTHS = ["Baisakh", "Jestha", "Ashad", "Shrawan", "Bhadra", "Ashwin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"];

const STUDENT_ME_INITIAL = {
  flag: 'green',
  name: '---',
  rollNo: '---',
  studentId: '---',
  grade: '---',
  section: '---',
  dateOfBirth: '---',
  avatarUrl: 'https://i.pinimg.com/736x/8b/27/ff/8b27ff4a7a6cefb81f33d8282b5dfaa7.jpg',
  email: '---',
  phone: '---',
  fatherName: '---',
  fatherPhone: '---',
  motherName: '---',
  motherPhone: '---',
  address: '---',
  permanentAddress: '---',
  lastTermGPA: '---',
  classTeacher: '---',
  attendance: {
    month: '---',
    presentDays: 0,
    totalDays: 30,
    absentDates: []
  },
  yearlyAttendance: {
    rate: 0,
    present: 0,
    absent: 0
  },
  marksheet: {
    termName: '---',
    percentage: '0%',
    gradePoint: '0.0',
    overallGrade: '---',
    gradeRank: '---',
    classRank: '---',
    subjects: []
  },
  feeStatus: {
    upcomingMonth: '---',
    upcomingAmount: 0,
    pendingMonthsCount: 0,
    totalDueAmount: 0
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
      const start = new Date(startAD);
      const end = new Date(endAD);
      const holidaysList = await calendarService.getEvents(
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0]
      );
      const holidayDates = new Set(
        holidaysList
          .filter(e => e.type === 'HOLIDAY')
          .map(e => new Date(e.startDate).toISOString().split('T')[0])
      );

      let count = 0;
      let cur = new Date(start);
      while (cur <= end) {
        const dayOfWeek = cur.getDay();
        const dateStr = cur.toISOString().split('T')[0];
        if (dayOfWeek !== 6 && !holidayDates.has(dateStr)) {
          count++;
        }
        cur.setDate(cur.getDate() + 1);
      }
      return count;
    } catch (err) {
      console.warn("Failed to calculate working days from calendar", err);
      return 0;
    }
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
        let present = 0;
        let absents = [];
        const statusData = data.dailyStatus;
        Object.keys(statusData).forEach(day => {
          if (statusData[day] === 'P') present++;
          if (statusData[day] === 'A') {
            let suffix = 'th';
            const dayNum = parseInt(day);
            if (dayNum % 10 === 1 && dayNum !== 11) suffix = 'st';
            else if (dayNum % 10 === 2 && dayNum !== 12) suffix = 'nd';
            else if (dayNum % 10 === 3 && dayNum !== 13) suffix = 'rd';
            absents.push(`${day}${suffix} ${selectedMonth}`);
          }
        });

        setMonthlyData({
          presentDays: present,
          totalDays: workingDays || 25,
          absentDates: absents
        });
      } else {
        setMonthlyData({ presentDays: 0, totalDays: workingDays || 25, absentDates: [] });
      }
    } catch (err) {
      console.warn("No specific attendance found for this month.");
      setMonthlyData({ presentDays: 0, totalDays: 30, absentDates: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthly();
  }, [selectedMonth, selectedYear, studentId]);

  const displayMonthly = monthlyData || { presentDays: 0, totalDays: 30, absentDates: [] };
  const attendanceRate = displayMonthly.totalDays > 0 ? Math.round((displayMonthly.presentDays / displayMonthly.totalDays) * 100) : 0;

  return (
    <div className="bg-white dark:bg-[#0b1220] rounded-[32px] border border-slate-100 dark:border-white/5 shadow-xl p-5 lg:p-6 transition-all relative overflow-hidden group/card shadow-emerald-500/5">
      {/* Decorative background elements */}
      <div className="absolute top-[-100px] right-[-100px] w-80 h-80 bg-emerald-500/[0.05] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-indigo-500/[0.03] blur-[100px] rounded-full pointer-events-none" />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-inner">
            <CalendarDays size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white capitalize tracking-tight leading-none">Attendance Summary</h3>
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 capitalize tracking-widest mt-1.5 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-emerald-500/50" />
              Academic Year {selectedYear}
            </p>
          </div>
        </div>
      </div>

      {/* Body Row (2 Columns) */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-start relative z-10 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>

        {/* A) Left Column (Monthly) */}
        <div className="space-y-4">
          <div className="space-y-3">
            {/* Month Dropdown */}
            <div className="relative w-fit">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest outline-none border border-slate-200 dark:border-white/5 cursor-pointer pr-8 transition-all shadow-sm"
              >
                {NEPALI_MONTHS.map(m => <option key={m} value={m} className="bg-slate-900 text-white">{m}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none transition-transform" />
            </div>

            {/* Monthly Ratio */}
            <div className="space-y-1 mt-3 text-left">
              <div className="flex items-end gap-1.5">
                <span className="text-5xl font-black text-emerald-500 tracking-tighter leading-none tabular-nums">
                  {displayMonthly.presentDays}
                </span>
                <span className="text-2xl font-black text-slate-300 dark:text-slate-600 tracking-tighter leading-none mb-0.5">/</span>
                <span className="text-2xl font-black text-slate-400 dark:text-slate-500 tracking-tighter leading-none mb-0.5">
                  {displayMonthly.totalDays}
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-300 tracking-wide mt-1.5">
                Days present in <span className="text-emerald-500 font-black">{selectedMonth}</span>
              </p>
            </div>

            {/* Left side progress bar */}
            <div className="pt-1.5">
              <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${attendanceRate}%` }} />
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2">
                {attendanceRate}% attendance this month
              </p>
            </div>
          </div>

          {/* Absence Registry Chips */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/20 p-4 rounded-[16px] border border-slate-100 dark:border-white/[0.05] mt-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-300 tracking-wider">Absence Registry</p>
              <div className="px-2 py-0.5 bg-red-500/10 rounded-md">
                <span className="text-[9px] font-black text-red-500">{displayMonthly.absentDates.length} Dates</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {displayMonthly.absentDates.length > 0 ? displayMonthly.absentDates.map((date, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-[#111827] rounded-[10px] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 text-[10px] font-bold tracking-wider shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {date}
                </div>
              )) : (
                <span className="text-[9px] font-bold text-slate-400 italic">No recorded absences</span>
              )}
            </div>
          </div>
        </div>

        {/* B) Right Column (Yearly) */}
        <div className="md:pl-8 lg:pl-12 flex flex-col justify-start space-y-4 md:border-l border-slate-100 dark:border-white/10">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-300 tracking-wider">Yearly Performance</p>

            <div className="relative group/stat">
              <div className="flex items-center gap-3">
                <h4 className="text-[64px] font-black text-slate-900 dark:text-white tracking-tighter leading-none tabular-nums">
                  {yearly.rate}%
                </h4>
                <div className="px-4 py-1.5 bg-emerald-500 rounded-full text-[10px] font-black text-white tracking-widest shadow-lg shadow-emerald-500/20">
                  Rate
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full mt-3 overflow-hidden relative">
                <div className="absolute top-0 left-0 h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-1000" style={{ width: `${yearly.rate}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-[#111f27] p-5 rounded-[20px] border border-slate-100 dark:border-emerald-500/10 space-y-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-500 tracking-widest">Present</span>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight tabular-nums mt-1.5 mb-0.5">{yearly.present}</p>
              <p className="text-[10px] font-bold text-emerald-500 tracking-wider">Total Days</p>
            </div>

            <div className="bg-slate-50 dark:bg-[#1f1519] p-5 rounded-[20px] border border-slate-100 dark:border-red-500/10 space-y-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-[10px] font-bold text-slate-400 dark:text-white tracking-widest">Absent</span>
              </div>
              <p className="text-3xl font-black text-red-500 leading-none tracking-tight tabular-nums mt-1.5 mb-0.5">{yearly.absent}</p>
              <p className="text-[10px] font-bold text-red-500 tracking-wider">Missed Days</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#111827] px-5 py-4 rounded-[20px] border border-slate-100 dark:border-white/5 flex justify-between items-center mt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span className="text-[10px] font-bold text-slate-900 dark:text-white tracking-widest">Total School Days</span>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight tabular-nums">{yearly.totalDays || (yearly.present + yearly.absent)}</p>
          </div>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="absolute top-[-40px] right-[-40px] w-64 h-64 bg-emerald-500/[0.03] blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20px] left-[-20px] w-40 h-40 bg-indigo-500/[0.02] blur-[80px] rounded-full pointer-events-none" />
    </div>
  );
};

const StudentProfileHeader = ({ student, onUpdate, readOnly }) => {
  const [currentAvatar, setCurrentAvatar] = useState(student.avatarUrl);
  const fileInputRef = useRef(null);
  const [isAvatarConfirmOpen, setIsAvatarConfirmOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  useEffect(() => {
    setCurrentAvatar(student.avatarUrl);
  }, [student.avatarUrl]);

  const flag = (student.flag || 'green').toLowerCase();
  const flagThemes = {
    red: {
      banner: 'bg-red-600 dark:bg-red-700',
      badge: 'bg-red-500/10 border-red-500/20 text-red-500',
      icon: 'text-red-500',
      accent: 'bg-red-500',
      label: 'FLAGGED PROFILE'
    },
    yellow: {
      banner: 'bg-amber-500 dark:bg-amber-600',
      badge: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
      icon: 'text-amber-500',
      accent: 'bg-amber-500',
      label: 'WARNING STATUS'
    },
    green: {
      banner: 'bg-emerald-600 dark:bg-emerald-700',
      badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
      icon: 'text-emerald-500',
      accent: 'bg-emerald-500',
      label: 'STUDENT PROFILE'
    }
  };

  const currentTheme = flagThemes[flag] || flagThemes.green;

  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile(reader.result);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropDone = (croppedImage) => {
    setPendingAvatar(croppedImage);
    setIsCropModalOpen(false);
    setIsAvatarConfirmOpen(true);
  };

  const handleAvatarConfirm = async () => {
    if (pendingAvatar) {
      setIsUploading(true);
      setIsAvatarConfirmOpen(false);
      try {
        const studentId = localStorage.getItem("studentId");
        if (!studentId) {
          toast({ type: 'error', message: 'Student ID not found' });
          return;
        }

        // Use the studentService to update the student with a complete payload to ensure validation passes
        const payload = {
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          studentClass: student.studentClass,
          profilePhoto: pendingAvatar
        };

        await studentService.updateStudent(studentId, payload);

        setCurrentAvatar(pendingAvatar);
        onUpdate({ avatarUrl: pendingAvatar });

        // Sync with localStorage
        localStorage.setItem("userPhoto", pendingAvatar);

        // Dispatch event for Navbar to update
        window.dispatchEvent(new Event('profileUpdated'));

        toast({ type: 'success', message: 'Profile picture updated successfully!' });
      } catch (err) {
        console.error("Failed to update profile photo:", err);
        toast({ type: 'error', message: 'Failed to update profile picture' });
      } finally {
        setIsUploading(false);
        setPendingAvatar(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="relative w-full bg-white dark:bg-[#0b1220] rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800/40 overflow-hidden transition-all group/card">
      {/* 1. Dynamic Banner */}
      <div className={`h-10 md:h-12 w-full ${currentTheme.banner} relative overflow-hidden transition-colors duration-500`}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
        <div className="absolute top-[-50%] right-[-5%] w-48 h-48 bg-white/10 rounded-full blur-2xl" />
      </div>

      {/* 2. Main Identity Section */}
      <div className="px-8 md:px-14 pb-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 -mt-6 md:-mt-8 relative z-10">

          {/* Avatar & Basic Info */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
            <div className={`relative group ${readOnly ? '' : 'cursor-pointer'}`} onClick={readOnly ? null : handleImageClick}>
              <div className="w-36 h-36 md:w-40 md:h-40 rounded-[36px] bg-[#0b1220] p-1.5 shadow-2xl border border-white/10 relative overflow-hidden">
                <div className="w-full h-full rounded-[30px] overflow-hidden bg-slate-800 relative flex items-center justify-center">
                  {isUploading ? (
                    <Loader2 size={32} className="text-emerald-500 animate-spin" />
                  ) : (
                    <>
                      <img
                        src={currentAvatar}
                        alt={student.name}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:blur-[3px]"
                      />
                      {/* Pencil Overlay */}
                      {!readOnly && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl">
                            <Pencil size={20} className="text-white" />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className={`absolute bottom-1 right-1 w-8 h-8 ${currentTheme.accent} rounded-xl flex items-center justify-center text-white border-4 border-[#0b1220] shadow-lg z-20 transition-colors`}>
                <Shield size={14} fill="currentColor" />
              </div>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
            </div>

            <div className="text-center md:text-left pb-1 flex flex-col items-center md:items-start">
              <div className={`px-2.5 py-0.5 ${currentTheme.badge} border rounded-lg text-[7px] font-black capitalize tracking-[0.2em] mb-3 w-fit transition-all`}>
                {currentTheme.label}
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white capitalize tracking-tighter leading-none mb-4">
                {student.name}
              </h2>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-5">
                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
                  <Hash size={14} className={currentTheme.icon} />
                  <span className="text-xs font-black capitalize tracking-[0.1em] text-slate-700 dark:text-slate-300">{student.studentId}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50/50 dark:bg-white/5 backdrop-blur-md rounded-[32px] border border-slate-100 dark:border-white/10 px-8 py-5 flex items-center justify-between lg:min-w-[420px]">
            <div className="flex-1 flex flex-col items-center text-center min-w-fit">
              <p className="text-[8px] font-black text-slate-400 capitalize tracking-widest mb-1.5">GPA</p>
              <p className={`text-2xl font-black ${currentTheme.icon} tracking-tight leading-none capitalize transition-colors`}>{student.lastTermGPA}</p>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-white/10 mx-2" />
            <div className="flex-1 flex flex-col items-center text-center min-w-fit">
              <p className="text-[8px] font-black text-slate-400 capitalize tracking-widest mb-1.5">RANK</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none capitalize">{student.marksheet.gradeRank}</p>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-white/10 mx-2" />
            <div className="flex-1 flex flex-col items-center text-center min-w-fit">
              <p className="text-[8px] font-black text-slate-400 capitalize tracking-widest mb-1.5">ROLL</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none capitalize">{student.rollNo}</p>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-white/10 mx-2" />
            <div className="flex-1 flex flex-col items-center text-center min-w-fit">
              <p className="text-[8px] font-black text-slate-400 capitalize tracking-widest mb-1.5">ATTENDANCE</p>
              <p className={`text-2xl font-black ${currentTheme.icon} tracking-tight leading-none capitalize transition-colors`}>{student.yearlyAttendance?.rate || 0}%</p>
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-white/10 w-full my-8" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-y-6">
          <div className="space-y-1.5">
            <p className="text-[9px] font-black text-slate-400 capitalize tracking-widest">EMAIL ADDRESS</p>
            <p className="text-sm font-black text-slate-800 dark:text-white lowercase tracking-tight">{student.email}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-[9px] font-black text-slate-400 capitalize tracking-widest">GRADE LEVEL</p>
            <p className="text-sm font-black text-slate-800 dark:text-white capitalize tracking-tight">{student.grade} {student.section}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-[9px] font-black text-slate-400 capitalize tracking-widest">DATE OF BIRTH</p>
            <p className="text-sm font-black text-slate-800 dark:text-white capitalize tracking-tight">
              {student.dateOfBirth || '---'}
              {student.dateOfBirth && calculateAge(student.dateOfBirth) !== null && (
                <span className="text-emerald-500"> ({calculateAge(student.dateOfBirth)})</span>
              )}
            </p>
          </div>
          <div className="space-y-1.5">
            <p className="text-[9px] font-black text-slate-400 capitalize tracking-widest">CLASS TEACHER</p>
            <p className="text-sm font-black text-slate-800 dark:text-white capitalize tracking-tight">{student.classTeacher}</p>
          </div>

          {/* Action Buttons */}
          {!readOnly && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsChangePasswordOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black rounded-xl transition-all shadow-sm border border-slate-700 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              >
                <Lock size={12} className="text-emerald-500" />
                Change Password
              </button>
            </div>
          )}
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        initialEmail={student.email}
      />

      <ConfirmDialog
        isOpen={isAvatarConfirmOpen}
        onClose={() => { setIsAvatarConfirmOpen(false); setPendingAvatar(null); setSelectedFile(null); }}
        onConfirm={handleAvatarConfirm}
        title="Update Profile Picture?"
        message="Are you sure you want to change your current profile picture with the selected one?"
      />

      <PhotoCropModal
        isOpen={isCropModalOpen}
        image={selectedFile}
        onClose={() => { setIsCropModalOpen(false); setSelectedFile(null); }}
        onDone={handleCropDone}
        onChange={() => { setIsCropModalOpen(false); fileInputRef.current?.click(); }}
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

            {/* Theory arc — green, 75% region */}
            <circle
              cx="55" cy="55" r={radius}
              fill="none" stroke="#10b981" strokeWidth="5"
              strokeDasharray={`${theoryDash} ${circumference}`}
              strokeLinecap="round"
              style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.5))' }}
            />

            {/* Practical arc — indigo, 25% region, starts after theory zone */}
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
        {/* Grade Rank Card */}
        <div className="bg-slate-50 dark:bg-[#0b1220] rounded-[40px] px-8 py-5 border border-slate-200 dark:border-slate-800/60 shadow-lg flex items-center gap-6 relative overflow-hidden group">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
            <Medal size={24} />
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 capitalize tracking-[0.25em]">RANK OUTCOME</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              {marksheet.gradeRank} <span className="text-[10px] text-slate-400 font-bold ml-1 capitalize tracking-tight">GRADE</span>
            </h4>
          </div>
        </div>

        {/* Class Rank Card */}
        <div className="bg-slate-50 dark:bg-[#0b1220] rounded-[40px] px-8 py-5 border border-slate-200 dark:border-slate-800/60 shadow-lg flex items-center gap-6 relative overflow-hidden group">
          <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
            <Trophy size={24} />
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 capitalize tracking-[0.25em]">RANK OF CLASS</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              {marksheet.classRank} <span className="text-[10px] text-slate-400 font-bold ml-1 capitalize tracking-tight">SECTION</span>
            </h4>
          </div>
        </div>

        {/* Unified Results Summary Card - Matching Screenshot */}
        <div className="bg-slate-50 dark:bg-[#0b1220] rounded-[40px] px-10 py-5 border border-slate-200 dark:border-slate-800/60 shadow-lg flex items-center justify-between overflow-hidden relative group/summary">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/[0.03] blur-[80px] rounded-full pointer-events-none group-hover/summary:bg-indigo-500/[0.05] transition-colors duration-700" />

          {/* Percentage (Left) */}
          <div className="flex-1 flex flex-col items-start gap-0.5 relative z-10">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 capitalize tracking-[0.2em] leading-none">Percentage</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">{marksheet.percentage}</p>
          </div>

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800/60 mx-4" />

          {/* Grade Point (Center) */}
          <div className="flex-1 flex flex-col items-center text-center gap-0.5 relative z-10">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 capitalize tracking-[0.2em] leading-none">GPA</p>
            <p className="text-3xl font-black text-indigo-500 dark:text-indigo-400 tracking-tighter tabular-nums leading-none">{marksheet.gradePoint}</p>
          </div>

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800/60 mx-4" />

          {/* Overall Grade (Right) */}
          <div className="flex-1 flex flex-col items-center text-center gap-0.5 relative z-10">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 capitalize tracking-[0.2em] leading-none">Grade</p>
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
      <span className="text-[10px] font-black text-slate-400 capitalize tracking-widest">{label}</span>
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
      <span className="text-[10px] font-black text-slate-400 capitalize tracking-widest">{label}</span>
    </div>
    <div className="relative group/input">
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || `Enter ${label}`} maxLength={maxLength} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-base font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/40 outline-none transition-all shadow-inner" />
      {maxLength && <span className="absolute right-4 bottom-2 text-[8px] font-black text-slate-300 dark:text-slate-700 capitalize tracking-tighter">{value.length}/{maxLength}</span>}
    </div>
  </div>
);

const StudentMePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const passedStudent = location.state?.studentData;
  const isTeacherView = location.pathname.includes('/teacher/');

  const [student, setStudent] = useState(STUDENT_ME_INITIAL);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState('First Term');
  const [availableTerms, setAvailableTerms] = useState(['First Term', 'Second Term', 'Third Term']);
  const [examConfig, setExamConfig] = useState(null);
  const [isTermDropdownOpen, setIsTermDropdownOpen] = useState(false);

  const fetchStudentData = async () => {
    try {
      let studentId = localStorage.getItem("studentId");

      // Deep sync: try to extract from JWT if missing
      if (!studentId || studentId === "undefined" || studentId === "null") {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.studentId) {
              studentId = payload.studentId;
              localStorage.setItem("studentId", studentId);
            }
          } catch (e) {
            console.error("Token parse error", e);
          }
        }
      }

      if (!studentId || studentId === "undefined" || studentId === "null") {
        toast({ type: 'error', message: "Student ID not found. Please log in again." });
        setIsLoaded(true);
        return;
      }

      const data = await studentService.getStudentById(studentId);

      // Fetch Attendance Yearly Stats
      let yearlyStats = STUDENT_ME_INITIAL.yearlyAttendance;
      try {
        const todayBS = convertADtoBS(new Date().toISOString().split('T')[0]);
        const [currentBSYear] = todayBS.split('-').map(Number);
        const yearlyData = await attendanceService.getStudentYearlyAttendance(data._id, currentBSYear || 2081);
        if (yearlyData) {
          yearlyStats = {
            present: yearlyData.present,
            absent: yearlyData.absent,
            rate: yearlyData.rate
          };
        }
      } catch (e) {
        console.warn("Failed to fetch yearly attendance stats", e);
      }

      const teacherName = data.sectionId?.classTeacherId
        ? `${data.sectionId.classTeacherId.firstName} ${data.sectionId.classTeacherId.lastName || ''}`.trim()
        : STUDENT_ME_INITIAL.classTeacher;

      const studentData = {
        ...STUDENT_ME_INITIAL,
        ...data,
        name: `${data.firstName} ${data.lastName}`,
        studentId: data.studentId,
        rollNo: data.rollNumber || data.studentId?.split('-').pop(),
        email: data.email,
        phone: data.phoneNumber,
        avatarUrl: data.profilePhoto || STUDENT_ME_INITIAL.avatarUrl,
        grade: data.gradeId?.gradeName || data.studentClass,
        section: data.sectionId?.sectionName || data.section,
        classTeacher: teacherName,
        address: data.Address || STUDENT_ME_INITIAL.address,
        fatherName: data.fatherName || STUDENT_ME_INITIAL.fatherName,
        fatherPhone: data.fatherPhone || STUDENT_ME_INITIAL.fatherPhone,
        motherName: data.motherName || STUDENT_ME_INITIAL.motherName,
        motherPhone: data.motherPhone || STUDENT_ME_INITIAL.motherPhone,
        yearlyAttendance: yearlyStats
      };

      try {
        const feeData = await feeService.getFeeSummary(data._id);
        if (feeData) {
          studentData.feeStatus = {
            upcomingMonth: feeData.upcomingMonth || "N/A",
            upcomingAmount: feeData.upcomingAmount || 0,
            pendingMonthsCount: feeData.unpaidCount || 0,
            totalDueAmount: feeData.totalDue || 0
          };
        }
      } catch (fe) {
        console.warn("Failed to fetch fee summary", fe);
      }

      // Calculate total working days in academic year so far
      try {
        const todayBS = convertADtoBS(new Date().toISOString().split('T')[0]);
        const [curY] = todayBS.split('-').map(Number);
        const startAD = convertBStoAD(`${curY}-01-01`);
        const endAD = new Date().toISOString().split('T')[0];

        const holidaysList = await calendarService.getEvents(startAD, endAD);
        const holidayDates = new Set(
          holidaysList
            .filter(e => e.type === 'HOLIDAY')
            .map(e => new Date(e.startDate).toISOString().split('T')[0])
        );

        let workingDaysCount = 0;
        let cur = new Date(startAD);
        const end = new Date(endAD);
        while (cur <= end) {
          const dayOfWeek = cur.getDay(); // 6 is Saturday
          const dateStr = cur.toISOString().split('T')[0];
          if (dayOfWeek !== 6 && !holidayDates.has(dateStr)) {
            workingDaysCount++;
          }
          cur.setDate(cur.getDate() + 1);
        }
        studentData.yearlyAttendance.totalDays = workingDaysCount;

        // Recalculate rate based on actual working days
        if (workingDaysCount > 0) {
          studentData.yearlyAttendance.rate = Math.round((studentData.yearlyAttendance.present / workingDaysCount) * 100);
        }
      } catch (e) {
        console.warn("Failed to calculate yearly working days", e);
      }

      setStudent(studentData);

      // Update localStorage for consistency across pages (Navbar, etc.)
      localStorage.setItem("userName", studentData.name);

      setIsLoaded(true);
    } catch (err) {
      console.error("Failed to fetch student profile:", err);
      toast({ type: 'error', message: "Failed to load profile details" });
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    const initPassedStudent = async () => {
      if (passedStudent) {
        const teacher = passedStudent.sectionId?.classTeacherId;
        const teacherName = teacher ? (teacher.firstName + " " + (teacher.lastName || "")) : STUDENT_ME_INITIAL.classTeacher;

        let yearlyStats = STUDENT_ME_INITIAL.yearlyAttendance;
        try {
          const todayBS = convertADtoBS(new Date().toISOString().split('T')[0]);
          const [currentBSYear] = todayBS.split('-').map(Number);
          const yearlyData = await attendanceService.getStudentYearlyAttendance(passedStudent._id, currentBSYear || 2081);
          if (yearlyData) {
            yearlyStats = {
              present: yearlyData.present,
              absent: yearlyData.absent,
              rate: yearlyData.rate
            };
          }
        } catch (e) {
          console.warn("Failed to fetch yearly attendance stats for passed student", e);
        }

        setStudent({
          ...STUDENT_ME_INITIAL,
          ...passedStudent,
          name: `${passedStudent.firstName} ${passedStudent.lastName}`,
          studentId: passedStudent.studentId,
          avatarUrl: passedStudent.profilePhoto || STUDENT_ME_INITIAL.avatarUrl,
          grade: passedStudent.gradeId?.gradeName || passedStudent.studentClass || passedStudent.grade || STUDENT_ME_INITIAL.grade,
          section: passedStudent.sectionId?.sectionName || passedStudent.section || STUDENT_ME_INITIAL.section,
          classTeacher: teacherName,
          address: passedStudent.Address || STUDENT_ME_INITIAL.address,
          phone: passedStudent.phone || passedStudent.phoneNumber || STUDENT_ME_INITIAL.phone,
          email: passedStudent.email || STUDENT_ME_INITIAL.email,
          fatherName: passedStudent.fatherName || STUDENT_ME_INITIAL.fatherName,
          fatherPhone: passedStudent.fatherPhone || STUDENT_ME_INITIAL.fatherPhone,
          motherName: passedStudent.motherName || STUDENT_ME_INITIAL.motherName,
          motherPhone: passedStudent.motherPhone || STUDENT_ME_INITIAL.motherPhone,
          yearlyAttendance: yearlyStats
        });
        setIsLoaded(true);
      } else {
        fetchStudentData();
      }
    };
    initPassedStudent();
  }, [passedStudent]);

  const fetchResults = async () => {
    if (!student._id) return;
    try {
      const results = await resultService.getStudentResults(student._id);
      const grades = await gradeService.getGrades();
      const examConfigData = await examService.getExamData();
      setExamConfig(examConfigData);

      if (examConfigData && examConfigData.termStatuses) {
        const terms = examConfigData.termStatuses.map(t => t.term);
        setAvailableTerms(terms);
        // If current selectedTerm is not in the new list, pick the first available
        if (terms.length > 0 && !terms.includes(selectedTerm)) {
          setSelectedTerm(terms[0]);
        }
      }

      // Check published status
      const termStatus = examConfigData?.termStatuses?.find(
        t => t.term.toLowerCase().trim() === selectedTerm.toLowerCase().trim()
      );
      const published = termStatus?.isPublished === true;

      // Find current result for selected term (only if published)
      const currentResult = published ? results.find(r =>
        r.term.toLowerCase().trim() === selectedTerm.toLowerCase().trim()
      ) : null;

      // Find grade config for the student's class
      const studentGradeNum = student.studentClass || student.grade;
      const currentGradeConfig = grades.find(g =>
        g.gradeNumber.toString() === studentGradeNum?.toString()
      );

      const calculateSubjectGrade = (total) => {
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
          const subjectDoc = gs.subjectId;
          const subName = subjectDoc?.subjectName || 'Unknown';
          const subId = subjectDoc?._id?.toString();
          const markEntry = currentResult?.marks?.find(m =>
            (m.subjectId?._id || m.subjectId)?.toString() === subId
          );
          return {
            code: subId,
            name: subName,
            theory: markEntry ? (markEntry.theoryMarks ?? 0) : 0,
            maxTheory: gs.theoryFullMarks || gs.fullMarks || 100,
            practical: markEntry ? (markEntry.practicalMarks ?? 0) : 0,
            maxPractical: gs.practicalFullMarks || gs.practicalMarks || (markEntry?.practicalMarks > 0 ? markEntry.practicalMarks : 0),
            grade: markEntry ? calculateSubjectGrade((markEntry.theoryMarks + (markEntry.practicalMarks || 0))) : '—'
          };
        });
      }

      const overallGrade = currentResult?.summary?.percentage
        ? calculateSubjectGrade(currentResult.summary.percentage)
        : '—';

      const overallGpa = currentResult?.summary?.gpa
        ? Number(currentResult.summary.gpa).toFixed(2)
        : "0.00";

      setStudent(prev => ({
        ...prev,
        lastTermGPA: overallGpa,
        marksheet: {
          ...prev.marksheet,
          percentage: currentResult?.summary?.percentage ? `${currentResult.summary.percentage}%` : '0%',
          gradePoint: overallGpa,
          overallGrade: overallGrade,
          subjects: marksData
        }
      }));
    } catch (err) {
      console.warn("Failed to fetch exam results", err);
    }
  };

  useEffect(() => {
    if (student._id && isLoaded) {
      fetchResults();
    }
  }, [selectedTerm, student._id, isLoaded]);

  const handleUpdateStudent = (updatedFields) => {
    setStudent(prev => ({ ...prev, ...updatedFields }));
  };

  if (!isLoaded) {
    return (
      <div className="space-y-8 animate-pulse">
        <SkeletonBlock height="h-[340px]" />
        <SkeletonBlock height="h-[280px]" />
        <SkeletonBlock height="h-[450px]" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      {location.pathname.includes('/teacher/') && (
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-emerald-500 transition-all shadow-sm w-fit"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black capitalize tracking-[0.2em]">Back to Records</span>
        </button>
      )}



      <div className="flex flex-col gap-8">
        <StudentProfileHeader student={student} onUpdate={handleUpdateStudent} readOnly={isTeacherView} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GuardianInfoCard student={student} onUpdate={handleUpdateStudent} readOnly={isTeacherView} />
          <FeeStatusCard feeStatus={student.feeStatus} readOnly={isTeacherView} onNavigate={() => navigate('/student/fee')} />
        </div>

        <AttendanceSummaryCard yearly={student.yearlyAttendance} studentId={student._id} />

        <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm p-8 lg:p-12 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/10">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white capitalize tracking-tight leading-none">Latest Marksheet</h3>
                <p className="text-[10px] font-bold text-slate-400 capitalize tracking-widest mt-2">{selectedTerm} Examination 2081</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group/select">
                <label className="absolute -top-2 left-4 px-1.5 bg-white dark:bg-slate-900 text-[8px] font-black text-slate-400 capitalize tracking-widest z-10 transition-colors group-focus-within/select:text-emerald-500">
                  Academic Term
                </label>
                <div className="flex items-center relative">
                  <button
                    onClick={() => setIsTermDropdownOpen(!isTermDropdownOpen)}
                    className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm font-black text-slate-700 dark:text-slate-200 outline-none transition-all cursor-pointer shadow-inner min-w-[200px] capitalize tracking-wider group relative pr-14"
                  >
                    {selectedTerm}
                    <ChevronDown size={18} className={`absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-emerald-500 transition-all ${isTermDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                  </button>

                  {isTermDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[60]"
                        onClick={() => setIsTermDropdownOpen(false)}
                      />
                      <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-[70] animate-in fade-in zoom-in-95 duration-200 p-2">
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

              <button
                onClick={() => navigate('/exam')}
                className="flex items-center gap-3 px-8 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 rounded-2xl font-black text-[10px] capitalize tracking-widest transition-all hover:bg-white dark:hover:bg-slate-800 group active:scale-95"
              >
                <Layers size={16} className="group-hover:rotate-12 transition-transform" />
                See All Marksheets
              </button>
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
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest max-w-sm">
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
    </div>
  );
};

const GuardianInfoCard = ({ student, onUpdate, readOnly }) => {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [tempMotherName, setTempMotherName] = useState(student.motherName);
  const [tempMotherPhone, setTempMotherPhone] = useState(student.motherPhone);

  const handleMotherPhoneChange = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setTempMotherPhone(cleaned);
  };

  const hasChanges = (student.motherName === '' && tempMotherName !== '') ||
    (student.motherPhone === '' && tempMotherPhone !== '');

  const handleFinalSave = async () => {
    try {
      const studentId = localStorage.getItem("studentId");
      if (!studentId) {
        toast({ type: 'error', message: 'Student ID not found' });
        return;
      }

      await studentService.updateStudent(studentId, {
        motherName: tempMotherName,
        motherPhone: tempMotherPhone
      });

      onUpdate({
        motherName: tempMotherName,
        motherPhone: tempMotherPhone
      });
      toast({ type: 'success', message: 'Guardian information updated!' });
      setIsConfirmDialogOpen(false);
    } catch (err) {
      console.error("Failed to update guardian info:", err);
      toast({ type: 'error', message: 'Failed to update guardian information' });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm p-8 lg:p-10 transition-all hover:shadow-md relative">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
            <User size={20} />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white capitalize tracking-tight">Guardian Dets</h3>
        </div>
        {hasChanges && (
          <button onClick={() => setIsConfirmDialogOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-black text-[9px] capitalize tracking-widest shadow-lg shadow-emerald-500/20">
            <Save size={12} /> Save
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-8">
        <InfoItem label="Father Name" value={student.fatherName} icon={<User size={14} className="text-emerald-500" />} />
        <InfoItem label="Father Number" value={student.fatherPhone} icon={<Phone size={14} className="text-emerald-500" />} />
        {student.motherName || readOnly ? (
          <InfoItem label="Mother Name" value={student.motherName} icon={<User size={14} className="text-emerald-500" />} />
        ) : (
          <EditableInfoItem label="Mother Name" value={tempMotherName} onChange={setTempMotherName} icon={<User size={14} className="text-emerald-500" />} />
        )}
        {student.motherPhone || readOnly ? (
          <InfoItem label="Mother Number" value={student.motherPhone} icon={<Phone size={14} className="text-emerald-500" />} />
        ) : (
          <EditableInfoItem label="Mother Number" value={tempMotherPhone} onChange={handleMotherPhoneChange} icon={<Phone size={14} className="text-emerald-500" />} maxLength={10} />
        )}
        <div className="sm:col-span-2 pt-2 border-t border-slate-50 dark:border-white/5">
          <InfoItem label="Permanent Address" value={student.permanentAddress} icon={<MapPin size={14} className="text-emerald-500" />} />
        </div>
      </div>
      <ConfirmDialog isOpen={isConfirmDialogOpen} onClose={() => setIsConfirmDialogOpen(false)} onConfirm={handleFinalSave} title="Update Details?" message="Do you want to finalize and save these guardian details?" />
    </div>
  );
};

const SkeletonBlock = ({ height }) => (<div className={`w-full ${height} bg-slate-200 dark:bg-slate-800/50 rounded-[40px]`} />);

const FeeStatusCard = ({ feeStatus, readOnly, onNavigate }) => (
  <div className="bg-white dark:bg-[#0b1220] rounded-[40px] border border-slate-100 dark:border-white/5 shadow-xl p-6 lg:p-8 transition-all relative overflow-hidden group/card shadow-indigo-500/5 h-full flex flex-col justify-between">
    {/* Decorative background elements */}
    <div className="absolute top-[-80px] left-[-80px] w-64 h-64 bg-indigo-500/[0.05] blur-[100px] rounded-full pointer-events-none" />
    <div className="absolute bottom-[-40px] right-[-40px] w-64 h-64 bg-emerald-500/[0.03] blur-[100px] rounded-full pointer-events-none" />

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-inner">
            <CreditCard size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white capitalize tracking-tight">Finances</h3>
            <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 capitalize tracking-widest mt-0.5">Status Overview</p>
          </div>
        </div>
        {feeStatus.totalDueAmount > 0 && (
          <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-[9px] font-black capitalize tracking-widest shadow-lg shadow-red-500/5 animate-pulse">
            Due Balance
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white dark:bg-white/[0.03] p-4 lg:p-5 rounded-[28px] border border-slate-100 dark:border-white/[0.05] transition-all hover:border-indigo-500/30 group/item">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={12} className="text-indigo-400" />
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 capitalize tracking-widest">Upcoming ({feeStatus.upcomingMonth})</span>
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight tabular-nums">
            <span className="text-lg font-bold text-slate-400 dark:text-slate-500 mr-1">Rs.</span>
            {feeStatus.upcomingAmount.toLocaleString()}
          </p>

        </div>

        <div className="bg-red-500/[0.02] p-4 lg:p-5 rounded-[28px] border border-red-500/10 transition-all hover:bg-red-500/[0.04] group/item">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={12} className="text-red-500" />
            <span className="text-[9px] font-black text-red-500/60 capitalize tracking-widest">Total Dues</span>
          </div>
          <p className="text-3xl font-black text-red-500 leading-none tracking-tight tabular-nums">
            <span className="text-lg font-bold text-red-500/40 mr-1">Rs.</span>
            {feeStatus.totalDueAmount.toLocaleString()}
          </p>
          <p className="text-[8px] font-bold text-red-500/30 capitalize mt-2.5">Clear pending dues early</p>
        </div>
      </div>
    </div>

    {!readOnly && (
      <button
        onClick={onNavigate}
        className="w-full mt-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[24px] font-black text-[10px] capitalize tracking-[0.2em] shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
      >
        Make Payment
        <CreditCard size={14} />
      </button>
    )}
  </div>
);

export default StudentMePage;