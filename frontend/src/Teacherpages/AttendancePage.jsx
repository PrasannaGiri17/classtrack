import React, { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  Calendar as CalendarIcon,
  Search,
  ChevronDown,
  Check,
  Circle,
  Save,
  Users,
  Info,
  Trophy
} from 'lucide-react';
import { toast } from '../MainSystemComponents/Toast';

const STUDENTS = [
  { id: 's1', name: 'Cristiano Ronaldo', studentId: '2024001' },
  { id: 's2', name: 'Luka Modric', studentId: '2024002' },
  { id: 's3', name: 'Vinicius Junior', studentId: '2024003' },
  { id: 's4', name: 'Jude Bellingham', studentId: '2024004' },
  { id: 's5', name: 'Federico Valverde', studentId: '2024005' },
  { id: 's6', name: 'Kylian Mbappe', studentId: '2024006' },
  { id: 's7', name: 'Thibaut Courtois', studentId: '2024007' },
  { id: 's8', name: 'Dani Carvajal', studentId: '2024008' },
  { id: 's9', name: 'Antonio Rudiger', studentId: '2024009' },
  { id: 's10', name: 'Eduardo Camavinga', studentId: '2024010' },
  { id: 's11', name: 'Rodrygo Goes', studentId: '2024011' },
  { id: 's12', name: 'David Alaba', studentId: '2024012' },
  { id: 's13', name: 'Eder Militao', studentId: '2024013' },
  { id: 's14', name: 'Arda Guler', studentId: '2024014' },
  { id: 's15', name: 'Brahim Diaz', studentId: '2024015' },
  { id: 's16', name: 'Ferland Mendy', studentId: '2024016' },
  { id: 's17', name: 'Lucas Vazquez', studentId: '2024017' },
  { id: 's18', name: 'Aurelien Tchouameni', studentId: '2024018' },
  { id: 's19', name: 'Fran Garcia', studentId: '2024019' },
  { id: 's20', name: 'Andriy Lunin', studentId: '2024020' },
  { id: 's21', name: 'Endrick Felipe', studentId: '2024021' },
  { id: 's22', name: 'Nico Paz', studentId: '2024022' },
  { id: 's23', name: 'Reinier Jesus', studentId: '2024023' },
  { id: 's24', name: 'Alvaro Rodriguez', studentId: '2024024' },
  { id: 's25', name: 'Mario Martin', studentId: '2024025' },
  { id: 's26', name: 'Rafael Obrador', studentId: '2024026' },
  { id: 's27', name: 'Jacob Ramón', studentId: '2024027' },
  { id: 's28', name: 'Fran Gonzalez', studentId: '2024028' },
  { id: 's29', name: 'Jeremy de León', studentId: '2024029' },
  { id: 's30', name: 'Gonzalo García', studentId: '2024030' },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const AttendancePage = () => {
  const realToday = new Date();
  const [selectedMonth, setSelectedMonth] = useState(realToday.getMonth());
  const [selectedYear, setSelectedYear] = useState(realToday.getFullYear());
  const [searchQuery, setSearchQuery] = useState("");

  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedMonth, selectedYear]);

  const daysArray = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  const isHoliday = (day) => {
    if (day === 4) return true;
    const date = new Date(selectedYear, selectedMonth, day);
    return date.getDay() === 6;
  };

  const [attendance, setAttendance] = useState(() => {
    const initial = {};
    STUDENTS.forEach(s => {
      initial[s.id] = {};
      for (let d = 1; d <= 31; d++) {
        initial[s.id][d] = null;
      }
    });
    return initial;
  });

  const filteredStudents = STUDENTS.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentId.includes(searchQuery)
  );

  const toggleAttendance = (studentId, day) => {
    if (isHoliday(day)) return;

    setAttendance(prev => {
      const currentStatus = prev[studentId][day];
      let nextStatus = (currentStatus === 'P') ? null : 'P';

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
    if (isHoliday(day)) return;

    setAttendance(prev => {
      const nextAttendance = { ...prev };
      STUDENTS.forEach(student => {
        nextAttendance[student.id] = {
          ...nextAttendance[student.id],
          [day]: 'P'
        };
      });
      return nextAttendance;
    });

    toast({
      type: 'success',
      message: `All students marked Present for Day ${day}.`,
      duration: 2000
    });
  };

  const calculateTotalPresent = (studentId) => {
    const record = attendance[studentId];
    if (!record) return 0;
    return daysArray.filter(day => record[day] === 'P').length;
  };

  const handleSave = () => {
    const todayDate = new Date();
    const isViewingCurrentMonth =
      todayDate.getMonth() === selectedMonth &&
      todayDate.getFullYear() === selectedYear;

    setAttendance(prev => {
      const nextAttendance = { ...prev };

      if (isViewingCurrentMonth) {
        const todayDay = todayDate.getDate();

        STUDENTS.forEach(student => {
          const studentRecord = { ...nextAttendance[student.id] };
          if (!isHoliday(todayDay) && studentRecord[todayDay] === null) {
            studentRecord[todayDay] = 'A';
          }
          nextAttendance[student.id] = studentRecord;
        });
      }

      return nextAttendance;
    });

    toast({
      type: 'success',
      message: isViewingCurrentMonth
        ? `Attendance saved. Unmarked students for today (${todayDate.getDate()} ${MONTHS[selectedMonth]}) set to absent.`
        : `Attendance logs synchronized for the month.`,
      duration: 3000
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <ClipboardCheck className="text-emerald-500 w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Class Attendance</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Grade 10 - Section A • Full Monthly Registry</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="appearance-none bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl pl-5 pr-12 py-4 text-xs font-black text-slate-600 dark:text-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-sm cursor-pointer"
            >
              {MONTHS.map((m, i) => <option key={m} value={i}>{m.toUpperCase()}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Save size={18} /> Save Records
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <Users className="text-emerald-500" size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Students</p>
                <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{STUDENTS.length}</p>
              </div>
            </div>
            <div className="h-10 w-px bg-slate-100 dark:bg-slate-800" />
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

          <div className="relative w-full max-w-sm">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Find student by ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all dark:text-slate-200 shadow-inner"
            />
          </div>
        </div>

        {/* Horizontal Scroll Table - Full month registry */}
        <div className="relative overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-[32px] scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[2200px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                <th className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-800 pl-8 pr-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 dark:border-slate-800 min-w-[260px]">
                  Student Identity
                </th>
                {daysArray.map(day => {
                  const isToday =
                    realToday.getDate() === day &&
                    realToday.getMonth() === selectedMonth &&
                    realToday.getFullYear() === selectedYear;
                  return (
                    <th
                      key={day}
                      onDoubleClick={() => bulkMarkPresent(day)}
                      title="Double click to mark all as Present"
                      className={`px-3 py-8 text-center text-[10px] font-black border-r border-slate-100/50 dark:border-slate-800/50 min-w-[60px] transition-colors cursor-help select-none
                        ${isHoliday(day)
                          ? 'bg-red-50/30 dark:bg-red-900/10 text-red-500 dark:text-red-400'
                          : isToday
                            ? 'bg-emerald-50/30 dark:bg-emerald-900/10 text-emerald-600 font-black'
                            : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'}
                      `}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-base">{day}</span>
                        {isToday && <span className="text-[7px] text-emerald-500 font-black animate-pulse">TODAY</span>}
                      </div>
                    </th>
                  );
                })}
                <th className="sticky right-0 z-20 bg-slate-50 dark:bg-slate-800 px-8 py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-l border-slate-100 dark:border-slate-800">
                  Summary
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filteredStudents.map((s) => (
                <tr key={s.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all">
                  <td className="sticky left-0 z-20 bg-white dark:bg-slate-900 pl-8 pr-6 py-5 border-r border-slate-100 dark:border-slate-800 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[11px] font-black text-slate-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        {s.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-black text-slate-900 dark:text-white leading-tight truncate">{s.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{s.studentId}</p>
                      </div>
                    </div>
                  </td>
                  {daysArray.map(day => {
                    const status = attendance[s.id][day];
                    const holiday = isHoliday(day);
                    return (
                      <td
                        key={day}
                        onClick={() => toggleAttendance(s.id, day)}
                        className={`px-0 py-0 text-center border-r border-slate-100/50 dark:border-slate-800/50 transition-colors
                          ${holiday ? 'bg-slate-50/50 dark:bg-slate-800/40 cursor-default' : 'cursor-pointer group/cell'}
                        `}
                      >
                        <div className={`flex items-center justify-center w-full h-[80px] transition-all ${holiday ? '' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                          {holiday ? (
                            <div className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded-full opacity-30" />
                          ) : status === 'P' ? (
                            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover/cell:scale-110 transition-transform">
                              <Check size={24} strokeWidth={4} />
                            </div>
                          ) : status === 'A' ? (
                            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-500/20 group-hover/cell:scale-110 transition-transform">
                              <Circle size={12} fill="currentColor" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl border-2 border-slate-100 dark:border-slate-800/50" />
                          )}
                        </div>
                      </td>
                    );
                  })}
                  {/* Summary Column */}
                  <td className="sticky right-0 z-20 bg-white dark:bg-slate-900 px-8 py-5 text-center border-l border-slate-100 dark:border-slate-800 transition-colors">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <Trophy size={16} className="opacity-50" />
                        <span className="text-lg font-black tracking-tight">{calculateTotalPresent(s.id)}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none text-center">Monthly<br />Present</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[28px] border border-slate-100 dark:border-slate-800 max-w-xl">
            <Info className="text-emerald-500 shrink-0" size={24} />
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-wider">
              Instruction: Use horizontal scroll to view all days. Double-click a day header to mark all students Present. Unmarked students for TODAY will be marked Absent upon saving.
            </p>
          </div>

          <div className="flex flex-col items-end">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Session Active</p>
            <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{realToday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;