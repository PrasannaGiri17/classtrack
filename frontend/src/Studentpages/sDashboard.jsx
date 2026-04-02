import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  ListTodo,
  BookOpen,
  NotebookPen,
  ClipboardList,
  Clock
} from 'lucide-react';
import GMainC from '../AdminComponents/Dashboard/GMainC';
import attendanceService from '../Api/attendanceService';
import calendarService from '../Api/calendarService';
import { convertADtoBS, convertBStoAD } from "@adhikarisaroj795/nepali-calendar-react";

// --- Helpers ---
const RadialGauge = ({ title, subtitle, value, label, percent, color }) => {
  const radius = 80;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="bg-white dark:bg-[#0b1220] p-5 lg:p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-lg transition-all relative overflow-hidden group/gauge">
      {/* Decorative background pulse */}
      <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none group-hover/gauge:bg-emerald-500/10 transition-colors duration-700" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-full text-left mb-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">{title}</h3>
          <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2">{subtitle}</p>
        </div>

        <div className="relative w-[240px] h-[140px] flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 140">
            {/* Background Track */}
            <path
              d="M 20 120 A 100 100 0 0 1 220 120"
              fill="none"
              stroke="#f1f5f9"
              className="dark:stroke-slate-800/40"
              strokeWidth="20"
              strokeLinecap="round"
            />
            {/* Progress Track */}
            <path
              d="M 20 120 A 100 100 0 0 1 220 120"
              fill="none"
              stroke={color}
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray={Math.PI * 100}
              strokeDashoffset={Math.PI * 100 - (percent / 100) * (Math.PI * 100)}
              className="transition-all duration-[1500ms] ease-out"
              style={{ filter: `drop-shadow(0 0 12px ${color}40)` }}
            />
          </svg>
          <div className="relative z-10 text-center mt-14">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">{value}</div>
          </div>
        </div>
      </div>
    </div>
  );
};



const homeworkData = [
  { subject: 'MATHEMATICS', task: 'Solve Exercise 4.2 (Arithmetic Progression). Please show all steps for the sum of first n terms and verify with the formula. Prepare for a short test on this topic in the next period.' },
  { subject: 'CALCULUS', task: 'Limits & Continuity Worksheet #5 - Focus on epsilon-delta proofs and vertical asymptotes. Complete all odd-numbered problems and the challenge section at the end.' },
  { subject: 'GEOMETRY', task: 'Triangle Congruence Proofs (10th Edition). Complete the proofs for SSS, SAS, and ASA postulates using the two-column format as discussed in class.' },
  { subject: 'ADVANCED ALGEBRA', task: 'Read Chapter 4: Quadratic Equations. Summarize the discriminant rules and solve the word problems on page 112 involving projectile motion.' },
  { subject: 'PHYSICS', task: 'Numerical Problems: Newton\'s Laws' },
  { subject: 'CHEMISTRY', task: 'Lab Report: Titration Analysis' },
  { subject: 'ENGLISH', task: 'Essay: The Industrial Revolution Impact' },
  { subject: 'COMPUTER SCIENCE', task: 'Implement Bubble Sort in Python' },
];



const HomeworkCard = ({ hw }) => {
  const [isCompleted, setIsCompleted] = useState(false);

  return (
    <div className={`p-4 rounded-2xl transition-all duration-500 group relative z-0 hover:z-10 h-fit cursor-default border ${isCompleted
      ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70'
      : 'bg-white dark:bg-slate-900/60 border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 shadow-sm hover:shadow-xl hover:scale-[1.03] hover:-translate-y-1'
      }`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest transition-colors ${isCompleted ? 'text-emerald-600 bg-emerald-600/10' : 'text-emerald-500 bg-emerald-500/10'
          }`}>{hw.subject}</span>

        <button
          onClick={() => setIsCompleted(!isCompleted)}
          className={`group/check p-1 rounded-lg transition-all ${isCompleted ? 'bg-emerald-500 text-white' : 'hover:bg-emerald-500/10 text-slate-400 dark:text-slate-500 hover:text-emerald-500'
            }`}
        >
          {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
        </button>
      </div>
      <p className={`text-sm font-bold leading-snug transition-all duration-300 line-clamp-2 group-hover:line-clamp-none italic ${isCompleted
        ? 'text-emerald-600/50 line-through decoration-2'
        : 'text-slate-700 dark:text-slate-300 group-hover:text-emerald-500'
        }`}>
        "{hw.task}"
      </p>
    </div>
  );
};

const SDashboard = () => {
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedHomeworkDate, setSelectedHomeworkDate] = useState('Today');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "Student");
  const [attendanceRate, setAttendanceRate] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const role = localStorage.getItem("role");
      const studentId = localStorage.getItem("studentId");

      if (role !== "student" || !studentId) return;

      // 1. Fetch User Data if missing
      if (userName === "Student" || userName === "User") {
        try {
          const res = await fetch(`http://localhost:7000/api/students/${studentId}`);
          const data = await res.json();
          if (data) {
            const name = `${data.firstName} ${data.lastName || ''}`.trim();
            setUserName(name);
            localStorage.setItem("userName", name);
          }
        } catch (err) {
          console.error("Failed to fetch student profile", err);
        }
      }

      // 2. Fetch Attendance Track
      try {
        const todayBS = convertADtoBS(new Date().toISOString().split('T')[0]);
        const [currentBSYear] = todayBS.split('-').map(Number);
        
        // Fetch Present/Absent count for the BS Year
        const attendanceData = await attendanceService.getStudentYearlyAttendance(studentId, currentBSYear || 2081);
        
        if (attendanceData) {
          const present = attendanceData.present || 0;
          
          // Calculate total working days in academic year so far (matching StudentMePage.jsx)
          try {
            const startYear = currentBSYear || 2081;
            const startAD = convertBStoAD(`${startYear}-01-01`);
            const endAD = new Date().toISOString().split('T')[0];

            const holidaysList = await calendarService.getEvents(startAD, endAD);
            const holidayDates = new Set(
              holidaysList
                .filter(e => e.type === 'HOLIDAY')
                .map(e => new Date(e.startDate).toISOString().split('T')[0])
            );

            let workingDaysCount = 0;
            let curDate = new Date(startAD);
            const todayDate = new Date(endAD);
            while (curDate <= todayDate) {
              const dayOfWeek = curDate.getDay(); // 6 is Saturday
              const dateStr = curDate.toISOString().split('T')[0];
              if (dayOfWeek !== 6 && !holidayDates.has(dateStr)) {
                workingDaysCount++;
              }
              curDate.setDate(curDate.getDate() + 1);
            }

            if (workingDaysCount > 0) {
              setAttendanceRate(Math.round((present / workingDaysCount) * 100));
            } else if (typeof attendanceData.rate === 'number') {
              setAttendanceRate(attendanceData.rate);
            }
          } catch (calcErr) {
            console.warn("Failed to calculate detailed rate, using simple rate", calcErr);
            if (typeof attendanceData.rate === 'number') {
              setAttendanceRate(attendanceData.rate);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch attendance track", err);
      }
    };

    fetchData();
  }, []);

  // Pagination Logic
  const totalPages = Math.ceil(homeworkData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentHomework = homeworkData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
          Welcome back, <span className="text-emerald-500">{userName.split(' ')[0] || "Student"}</span>!
        </h1>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
          Here's what's happening in your classes today.
        </p>
      </div>

      {/* Stats Grid - 3 Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RadialGauge
          title="Overall Performance"
          subtitle="Term Academic GPA"
          value="3.85"
          percent={96.25}
          color="#10b981"
        />
        <RadialGauge
          title="Attendance Track"
          subtitle="Academic Year Presence"
          value={`${attendanceRate}%`}
          percent={attendanceRate}
          color="#10b981"
        />
        <RadialGauge
          title="Nothing for now"
          subtitle=" working on it "
          value="20%"
          percent={20}
          color="#10b981"
        />
      </div>

      {/* Main Routine & Homework Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Homework Diary - Expanded */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0b1220] p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-xl transition-all h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                <NotebookPen size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Homework Diary</h3>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2 italic shadow-emerald-500/5">Pending Subject Tasks</p>
              </div>
            </div>

            {/* Date Filter Dropdown */}
            <div className="relative group min-w-[140px]">
              <select
                value={selectedHomeworkDate}
                onChange={(e) => setSelectedHomeworkDate(e.target.value)}
                className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:border-emerald-500/50 text-[10px] font-black text-slate-600 dark:text-slate-300 rounded-xl pl-4 pr-10 py-2.5 outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm shadow-emerald-500/5"
              >
                <option value="Today">Today</option>
                <option value="Yesterday">Yesterday</option>
                <option value="31st July">31st July</option>
                <option value="30th July">30th July</option>
                <option value="29th July">29th July</option>
                <option value="28th July">28th July</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 flex-1">
            {currentHomework.map((hw, idx) => (
              <HomeworkCard key={idx} hw={hw} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/50">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {startIndex + 1}-{Math.min(startIndex + itemsPerPage, homeworkData.length)} of {homeworkData.length} Subjects
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-all border border-slate-100 dark:border-slate-700"
                >
                  <ChevronLeft size={14} />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-[9px] font-black transition-all ${currentPage === i + 1
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-all border border-slate-100 dark:border-slate-700"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Unified Calendar Component */}
        <div className="h-full min-h-[400px]">
          <GMainC />
        </div>
      </div>

      {/* Bottom Section: Recent Events & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
            <button className="text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <Bell className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Registry Updated</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">New student enrollment records have been synchronized with the main database.</p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-2 block uppercase tracking-widest">2 hours ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 p-8 rounded-[40px] border border-slate-100 dark:border-emerald-500/20 shadow-xl dark:shadow-2xl transition-all h-full flex flex-col relative overflow-hidden group">
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-[20px] flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <ClipboardList size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">School Reminder</h3>
                <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-[0.2em] mt-2 italic shadow-emerald-500/5">Common Guidelines</p>
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {[
                "Proper Uniform & ID Card Mandatory",
                "Arrive 10 Minutes Before Bell",
                "Maintain Lesson Diary Daily",
                "Keep Campus & Classroom Clean",
                "Respect Teachers & Fellow Students",
                "Zero Tolerance for Bullying"
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-emerald-500/40 transition-all duration-300 group/item">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors leading-tight tracking-tight">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subtle Decorative Elements */}
          <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-40px] left-[-20px] w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default SDashboard;