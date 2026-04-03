import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ClipboardCheck,
  Search,
  ChevronDown,
  Check,
  Circle,
  ShieldAlert,
  Save,
  Users,
  Info,
  Trophy
} from 'lucide-react';
import { toast } from '../MainSystemComponents/Toast';
import attendanceService from '../Api/attendanceService';
import studentService from '../Api/studentService';
import gradeService from '../Api/gradeService';
import calendarService from '../Api/calendarService';
import Loading from '../MainSystemComponents/Loading';
import { convertBStoAD, convertADtoBS } from "@adhikarisaroj795/nepali-calendar-react";
import "@adhikarisaroj795/nepali-calendar-react/styles/nepalicalender.css";

const NEPALI_MONTHS = [
  "Baisakh", "Jestha", "Ashad", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

const AttendancePage = () => {
  // Initialize with current BS date
  const todayAD = new Date().toISOString().split('T')[0];
  const todayBS = convertADtoBS(todayAD);
  const [currentBSYear, currentBSMonth, todayDayNum] = todayBS.split('-').map(Number);

  const [selectedMonth, setSelectedMonth] = useState(NEPALI_MONTHS[currentBSMonth - 1] || "Falgun");
  const [selectedYear, setSelectedYear] = useState(currentBSYear || 2082);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [sectionInfo, setSectionInfo] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [holidays, setHolidays] = useState([]); // Array of day numbers that are holidays

  const teacherId = localStorage.getItem("teacherId");
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Dynamically calculate days in the selected Nepali Month
  const daysInMonth = useMemo(() => {
    const mIndex = NEPALI_MONTHS.indexOf(selectedMonth) + 1;
    let dayCount = 28;
    while (dayCount < 32) {
      try {
        const dateStr = `${selectedYear}-${String(mIndex).padStart(2, '0')}-${String(dayCount + 1).padStart(2, '0')}`;
        // convertBStoAD returns null or throws if date is invalid in BS
        const ad = convertBStoAD(dateStr);
        if (!ad) break;
        dayCount++;
      } catch (e) {
        break;
      }
    }
    return dayCount;
  }, [selectedMonth, selectedYear]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!teacherId) return;
      setIsLoading(true);
      try {
        // 1. Get Section Info
        const secData = await gradeService.getSectionByTeacherId(teacherId);
        setSectionInfo(secData);

        if (secData?.sectionId) {
          // 2. Get Students for this section
          const studentList = await studentService.getStudentsByClassTeacher(teacherId);
          setStudents(studentList || []);

          // 3. Get Attendance Records
          const attData = await attendanceService.getAttendance(secData.sectionId, selectedYear, selectedMonth);

          // 4. Get Holidays from Calendar
          const events = await calendarService.getEvents();
          const monthIndex = NEPALI_MONTHS.indexOf(selectedMonth) + 1;
          const monthlyHolidays = (events || [])
            .filter(e => e.type?.toUpperCase() === 'HOLIDAY' || e.isPublicHoliday)
            .filter(e => {
              let nDate = e.nepali_date;
              if (!nDate && e.startDate) {
                try {
                  nDate = convertADtoBS(new Date(e.startDate).toISOString().split('T')[0]).replace(/-/g, '/');
                } catch (err) { return false; }
              }
              if (!nDate) return false;
              const parts = nDate.includes('/') ? nDate.split('/') : nDate.split('-');
              return parseInt(parts[0]) === selectedYear && parseInt(parts[1]) === monthIndex;
            })
            .map(e => {
              const nDate = e.nepali_date || convertADtoBS(new Date(e.startDate).toISOString().split('T')[0]).replace(/-/g, '/');
              return parseInt(nDate.includes('/') ? nDate.split('/')[2] : nDate.split('-')[2]);
            });

          // Add Saturdays as holidays automatically
          for (let d = 1; d <= daysInMonth; d++) {
            try {
              const dateStr = `${selectedYear}-${String(monthIndex).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const ad = convertBStoAD(dateStr);
              // getDay() 6 is Saturday
              if (ad && new Date(ad).getDay() === 6) {
                if (!monthlyHolidays.includes(d)) {
                  monthlyHolidays.push(d);
                }
              }
            } catch (e) { /* ignore invalid dates */ }
          }

          setHolidays(monthlyHolidays);

          // Map backend attendance to local state
          const initial = {};
          studentList.forEach(s => {
            initial[s._id] = {};
            const record = attData?.attendanceData?.find(a => a.studentId?._id === s._id || a.studentId === s._id);
            if (record && record.dailyStatus) {
              const dailyStatus = record.dailyStatus;
              for (let d = 1; d <= daysInMonth; d++) {
                initial[s._id][d] = dailyStatus[d] || null;
              }
            } else {
              for (let d = 1; d <= daysInMonth; d++) {
                initial[s._id][d] = null;
              }
            }
          });
          setAttendanceRecords(initial);
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        // Only show generic error if it wasn't a 404/empty state handled by the view guard
        if (error.response?.status !== 404) {
          toast({ type: 'error', message: 'Failed to load attendance records.' });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [teacherId, selectedMonth, selectedYear, daysInMonth]);



  const daysArray = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  const filteredStudents = students.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentId.includes(searchQuery)
  );

  const isFutureDate = (day) => {
    const monthIndex = NEPALI_MONTHS.indexOf(selectedMonth) + 1;
    if (selectedYear > currentBSYear) return true;
    if (selectedYear === currentBSYear && monthIndex > currentBSMonth) return true;
    if (selectedYear === currentBSYear && monthIndex === currentBSMonth && day > todayDayNum) return true;
    return false;
  };

  const toggleAttendance = (studentId, day) => {
    if (holidays.includes(day) || isFutureDate(day)) return; // No attendance on holidays or future dates

    setAttendanceRecords(prev => {
      const currentStatus = prev[studentId][day];
      let nextStatus = (currentStatus === 'P') ? 'A' : (currentStatus === 'A' ? null : 'P');

      return {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [day]: nextStatus
        }
      };
    });
  };

  const bulkMarkPresent = (day) => {
    if (holidays.includes(day) || isFutureDate(day)) return; // Skip holidays and future dates for bulk marking

    setAttendanceRecords(prev => {
      const nextAttendance = { ...prev };
      students.forEach(s => {
        nextAttendance[s._id] = {
          ...nextAttendance[s._id],
          [day]: 'P'
        };
      });
      return nextAttendance;
    });

    toast({
      type: 'success',
      message: `All marked Present for Day ${day}.`,
      duration: 2000
    });
  };

  const calculateTotalPresent = (studentId) => {
    const record = attendanceRecords[studentId];
    if (!record) return 0;
    return Object.values(record).filter(v => v === 'P').length;
  };

  const handleSave = async () => {
    if (!sectionInfo || !teacherId) return;

    try {
      const payloadData = students.map(s => {
        // Filter out null/undefined statuses to avoid Map validation errors on backend
        const cleanStatus = {};
        const records = attendanceRecords[s._id] || {};
        Object.keys(records).forEach(day => {
          if (records[day]) cleanStatus[day] = records[day];
        });

        return {
          studentId: s._id,
          dailyStatus: cleanStatus
        };
      });

      await attendanceService.saveAttendance({
        gradeId: sectionInfo.gradeId,
        sectionId: sectionInfo.sectionId,
        teacherId: teacherId,
        year: selectedYear,
        month: selectedMonth,
        attendanceData: payloadData
      });

      toast({
        type: 'success',
        message: `Attendance logs saved for ${selectedMonth} ${selectedYear}.`,
        duration: 3000
      });
    } catch (err) {
      console.error("Save failed:", err);
      toast({ type: 'error', message: err?.response?.data?.error || err?.response?.data?.message || err.message || 'Failed to save records.' });
    }
  };

  if (isLoading) return <Loading fullScreen={true} text="Initializing monthly registry..." />;

  if (!isLoading && !sectionInfo?.sectionId) {
    return (
      <div className="flex flex-col items-center justify-center py-40 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-red-500/10 rounded-[32px] flex items-center justify-center text-red-500 mb-8 border border-red-500/20 shadow-2xl shadow-red-500/10">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 text-center uppercase">Access Denied</h2>
        <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center max-w-md leading-relaxed bg-slate-50 dark:bg-slate-800/40 px-8 py-4 rounded-[24px] border border-slate-100 dark:border-slate-800/50">
          This registry is exclusively for <span className="text-red-500">Class Teachers</span>. You are not currently assigned to any classroom management profile.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10 transition-colors">
            <ClipboardCheck className="text-emerald-500 w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Class Attendance</h1>
              <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                Today: {todayBS}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Grade {sectionInfo?.gradeNumber} - {sectionInfo?.sectionName} • {selectedMonth} {selectedYear} Registry
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl pl-5 pr-12 py-4 text-xs font-black text-slate-600 dark:text-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-sm transition-all cursor-pointer"
            >
              {NEPALI_MONTHS.map((m) => <option key={m} value={m}>{m.toUpperCase()}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Save size={18} /> Save Records
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center transition-colors">
                <Users className="text-emerald-500" size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Students</p>
                <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{students.length}</p>
              </div>
            </div>
            <div className="h-10 w-px bg-slate-100 dark:bg-slate-800 transition-colors" />
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Absent</span>
              </div>
            </div>
          </div>

          <div className="relative w-full max-sm mb-4">

          </div>

          <div className="relative w-full max-w-sm">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Find student by ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all dark:text-slate-200 shadow-inner placeholder:text-slate-400"
            />
          </div>
        </div>

        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`relative overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-[32px] scrollbar-show transition-colors ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
        >
          <table className="w-full text-left border-collapse min-w-[3000px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                <th className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-800 pl-8 pr-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 dark:border-slate-800 min-w-[260px] transition-colors">
                  Student Identity
                </th>
                {daysArray.map(day => {
                  const isHoliday = holidays.includes(day);
                  const isToday = (selectedMonth === NEPALI_MONTHS[currentBSMonth - 1] && selectedYear === currentBSYear && day === todayDayNum);
                  const isFuture = isFutureDate(day);

                  // Calculate weekday name
                  let dayName = "";
                  try {
                    const monthIndex = NEPALI_MONTHS.indexOf(selectedMonth) + 1;
                    const dateStr = `${selectedYear}-${String(monthIndex).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const ad = convertBStoAD(dateStr);
                    if (ad) {
                      dayName = new Date(ad).toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
                    }
                  } catch (e) { }

                  return (
                    <th
                      key={day}
                      onDoubleClick={() => !isFuture && bulkMarkPresent(day)}
                      title={isHoliday ? "Holiday" : isFuture ? "Future Date" : isToday ? "Today" : "Double click to mark all as Present"}
                      className={`px-3 py-6 text-center border-r border-slate-100/50 dark:border-slate-800/50 min-w-[100px] transition-all cursor-help select-none ${isHoliday
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                        : isToday
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 shadow-[inset_0_2px_10px_rgba(16,185,129,0.05)]'
                          : isFuture
                            ? 'bg-slate-50/30 dark:bg-slate-800/10 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-40'
                            : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                        }`}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span className={`text-base font-black ${isToday ? 'text-emerald-500' : ''}`}>{day}</span>
                        <span className={`text-[9px] font-bold lowercase opacity-70 ${isHoliday ? 'text-red-400' : isToday ? 'text-emerald-400' : isFuture ? 'text-slate-500' : 'text-slate-400'}`}>
                          {dayName}
                        </span>
                      </div>
                    </th>
                  );
                })}
                <th className="sticky right-0 z-20 bg-slate-50 dark:bg-slate-800 px-8 py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-l border-slate-100 dark:border-slate-800 transition-colors">
                  Summary
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filteredStudents.map((s) => (
                <tr key={s._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all">
                  <td className="sticky left-0 z-20 bg-white dark:bg-slate-900 pl-8 pr-6 py-5 border-r border-slate-100 dark:border-slate-800 transition-colors">
                    <div className="flex items-center gap-4">
                      {s.profilePhoto ? (
                        <img src={s.profilePhoto} alt={s.firstName} className="w-10 h-10 rounded-xl object-cover shadow-sm" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[11px] font-black text-slate-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                          {s.firstName[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-base font-black text-slate-900 dark:text-white leading-tight truncate">{s.firstName} {s.lastName}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{s.studentId}</p>
                      </div>
                    </div>
                  </td>
                  {daysArray.map(day => {
                    const status = attendanceRecords[s._id]?.[day];
                    const isHoliday = holidays.includes(day);
                    const isFuture = isFutureDate(day);
                    return (
                      <td
                        key={day}
                        onClick={() => toggleAttendance(s._id, day)}
                        className={`px-0 py-0 text-center border-r border-slate-100/50 dark:border-slate-800/50 transition-colors ${isHoliday || isFuture ? 'cursor-not-allowed bg-slate-50/10 dark:bg-slate-800/5' : 'cursor-pointer group/cell'
                          }`}
                      >
                        <div className={`flex items-center justify-center w-full h-[80px] transition-all ${(!isHoliday && !isFuture) && 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                          {isHoliday ? (
                            <div className="w-2 h-2 bg-red-300 dark:bg-red-700 rounded-full opacity-60" />
                          ) : isFuture ? (
                            <div className="w-1 h-3 bg-slate-200 dark:bg-slate-800 rounded-full opacity-30" />
                          ) : status === 'P' ? (
                            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover/cell:scale-110 transition-transform">
                              <Check size={24} strokeWidth={4} />
                            </div>
                          ) : status === 'A' ? (
                            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-500/20 group-hover/cell:scale-110 transition-transform">
                              <Circle size={12} fill="currentColor" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl border-2 border-slate-100 dark:border-slate-800/50 group-hover/cell:border-emerald-500/40 transition-colors" />
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td className="sticky right-0 z-20 bg-white dark:bg-slate-900 px-8 py-5 text-center border-l border-slate-100 dark:border-slate-800 transition-colors">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <Trophy size={16} className="opacity-50" />
                        <span className="text-lg font-black tracking-tight">{calculateTotalPresent(s._id)}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none text-center">Monthly<br />Present</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-50 dark:border-slate-800 transition-colors">
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;