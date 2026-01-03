import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  GraduationCap, 
  Store, 
  ChevronDown, 
  Trash2, 
  Plus, 
  UserCheck, 
  AlertCircle,
  Search,
  CheckCircle2,
  X,
  Check
} from 'lucide-react';

// --- Dummy Data ---
const ACADEMIC_YEARS = ["2025", "2026", "2027"];
const GRADES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const SECTIONS = ["A", "B", "C"];

const ALL_TEACHERS = [
  { id: 't1', name: 'John Smith', subject: 'Science' },
  { id: 't2', name: 'Emma Johnson', subject: 'Mathematics' },
  { id: 't3', name: 'Michael Brown', subject: 'English' },
  { id: 't4', name: 'Sarah Davis', subject: 'Physics' },
  { id: 't5', name: 'Robert Wilson', subject: 'Chemistry' },
];

const INITIAL_ENROLLED_STUDENTS = [
  { id: 's1', name: 'Cristiano Ronaldo', studentId: '2024001' },
  { id: 's2', name: 'Luka Modric', studentId: '2024002' },
  { id: 's3', name: 'Vinicius Junior', studentId: '2024003' },
  { id: 's4', name: 'Jude Bellingham', studentId: '2024004' },
  { id: 's5', name: 'Federico Valverde', studentId: '2024005' },
];

// Mock data for the "Add Student" popup pool
const GLOBAL_STUDENT_POOL = [
  { id: 's1', name: 'Cristiano Ronaldo', studentId: '2024001', flag: '🇵🇹', gpa: 3.9 },
  { id: 's2', name: 'Luka Modric', studentId: '2024002', flag: '🇭🇷', gpa: 4.0 },
  { id: 's3', name: 'Vinicius Junior', studentId: '2024003', flag: '🇧🇷', gpa: 3.5 },
  { id: 's4', name: 'Jude Bellingham', studentId: '2024004', flag: '🇬🇧', gpa: 3.8 },
  { id: 's5', name: 'Federico Valverde', studentId: '2024005', flag: '🇺🇾', gpa: 3.7 },
  { id: 's6', name: 'Kylian Mbappe', studentId: '2024006', flag: '🇫🇷', gpa: 3.9 },
  { id: 's7', name: 'Thibaut Courtois', studentId: '2024007', flag: '🇧🇪', gpa: 3.6 },
  { id: 's8', name: 'Eduardo Camavinga', studentId: '2024008', flag: '🇫🇷', gpa: 3.4 },
  { id: 's9', name: 'Rodrygo Goes', studentId: '2024009', flag: '🇧🇷', gpa: 3.2 },
  { id: 's10', name: 'Antonio Rudiger', studentId: '2024010', flag: '🇩🇪', gpa: 3.1 },
  { id: 's11', name: 'Dani Carvajal', studentId: '2024011', flag: '🇪🇸', gpa: 3.0 },
  { id: 's12', name: 'Eder Militao', studentId: '2024012', flag: '🇧🇷', gpa: 3.3 },
  { id: 's13', name: 'Arda Guler', studentId: '2024013', flag: '🇹🇷', gpa: 3.9 },
  { id: 's14', name: 'Brahim Diaz', studentId: '2024014', flag: '🇲🇦', gpa: 3.5 },
];

const ClassroomPage = () => {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedGrade, setSelectedGrade] = useState("5");
  const [selectedSection, setSelectedSection] = useState("A");
  
  const [enrolledStudents, setEnrolledStudents] = useState(INITIAL_ENROLLED_STUDENTS);
  const [assignedTeacherId, setAssignedTeacherId] = useState("t1");
  const [capacity] = useState(30);
  
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [selectedForEnrollment, setSelectedForEnrollment] = useState([]);

  const enrolledCount = enrolledStudents.length;
  const isFull = enrolledCount >= capacity;
  const remainingSlots = capacity - enrolledCount;
  const currentTeacher = ALL_TEACHERS.find(t => t.id === assignedTeacherId);

  // Filter existing students by search
  const filteredStudents = enrolledStudents.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.studentId.includes(searchQuery)
  );

  // Filter pool students for the modal
  const filteredModalPool = useMemo(() => {
    return GLOBAL_STUDENT_POOL.filter(s => 
      s.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) || 
      s.studentId.includes(modalSearchQuery)
    );
  }, [modalSearchQuery]);

  const handleRemoveStudent = (id) => {
    if (window.confirm("Remove student from this section?")) {
      setEnrolledStudents(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleAssignTeacher = (teacherId) => {
    setAssignedTeacherId(teacherId);
    setIsTeacherModalOpen(false);
  };

  const toggleStudentSelection = (id) => {
    if (selectedForEnrollment.includes(id)) {
      setSelectedForEnrollment(prev => prev.filter(item => item !== id));
    } else {
      if (selectedForEnrollment.length < remainingSlots) {
        setSelectedForEnrollment(prev => [...prev, id]);
      }
    }
  };

  const handleAddSelectedStudents = () => {
    const studentsToAdd = GLOBAL_STUDENT_POOL.filter(s => selectedForEnrollment.includes(s.id));
    setEnrolledStudents(prev => [...prev, ...studentsToAdd]);
    setIsAddStudentModalOpen(false);
    setSelectedForEnrollment([]);
    setModalSearchQuery("");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Top Header & Year Control */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Store className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Classroom Management</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Year</span>
              <div className="relative inline-block">
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="appearance-none bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-black text-[11px] uppercase tracking-widest px-4 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800/50 outline-none cursor-pointer pr-10"
                >
                  {ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Grade & Section Filters */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <select 
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="appearance-none bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl pl-5 pr-12 py-4 text-xs font-black text-slate-600 dark:text-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-sm cursor-pointer"
            >
              {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
          </div>

          <div className="relative group">
            <select 
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="appearance-none bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl pl-5 pr-12 py-4 text-xs font-black text-slate-600 dark:text-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-sm cursor-pointer"
            >
              {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Student Enrollment */}
        <div className="xl:col-span-8 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-8 border-b border-slate-50 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Student Enrollment</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage Class Roster</p>
              </div>

              <div className="flex items-center gap-4">
                {/* Capacity Indicator */}
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs font-black ${isFull ? 'text-red-500' : 'text-emerald-500'}`}>{enrolledCount} / {capacity}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enrolled</span>
                  </div>
                  <div className="w-32 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${(enrolledCount / capacity) * 100}%` }}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => setIsAddStudentModalOpen(true)}
                  disabled={isFull}
                  className="w-12 h-12 flex items-center justify-center bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-110 active:scale-90 disabled:opacity-30 disabled:grayscale"
                  title="Add Student"
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>

            {/* Sub-search */}
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Find in current section..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all dark:text-slate-200"
              />
            </div>
          </div>

          <div className="flex-1 min-h-[400px]">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/30 dark:bg-slate-800/20">
                  <th className="pl-10 pr-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student ID</th>
                  <th className="px-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</th>
                  <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="group hover:bg-emerald-50/20 dark:hover:bg-emerald-900/5 transition-colors">
                      <td className="pl-10 pr-4 py-5 text-xs font-bold text-slate-400">{s.studentId}</td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[10px] font-black text-emerald-600">
                            {s.name[0]}
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center">
                          <button 
                            onClick={() => handleRemoveStudent(s.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <Users size={40} className="opacity-10" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No matching students</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Class Teacher Assignment - Auto Height */}
        <div className="xl:col-span-4 space-y-8 h-auto">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="relative z-10 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Class Teacher</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Management Assigned</p>
                </div>
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center">
                  <GraduationCap className="text-indigo-500" size={24} />
                </div>
              </div>

              {currentTeacher ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-indigo-500/20">
                      {currentTeacher.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{currentTeacher.name}</h4>
                      <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1">{currentTeacher.subject} Dept.</p>
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Currently Assigned</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsTeacherModalOpen(true)}
                    className="w-full py-5 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-[24px] text-[11px] font-black uppercase tracking-widest border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800/50 transition-all flex items-center justify-center gap-2"
                  >
                    <UserCheck size={18} /> Change Assignment
                  </button>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <UserPlus size={32} className="text-slate-300" />
                  </div>
                  <div className="max-w-[200px]">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">No class teacher assigned to this section yet.</p>
                  </div>
                  <button 
                    onClick={() => setIsTeacherModalOpen(true)}
                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    Assign Now
                  </button>
                </div>
              )}
            </div>

            {/* Background Accent */}
            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Quick Notice Card */}
          <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-[32px] border border-amber-100 dark:border-amber-900/30 flex gap-4">
            <AlertCircle className="text-amber-500 shrink-0" size={20} />
            <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400 leading-relaxed uppercase tracking-wider">
              Year Specific Rule: Changes made to this section apply ONLY to the <span className="underline decoration-2">{selectedYear}</span> session. Student histories are maintained separately.
            </p>
          </div>
        </div>
      </div>

      {/* Teacher Selection Modal */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsTeacherModalOpen(false)} />
          
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Assign Class Teacher</h3>
              <button onClick={() => setIsTeacherModalOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={24} /></button>
            </div>
            
            <div className="p-4 max-h-[400px] overflow-y-auto space-y-2 scrollbar-hide">
              {ALL_TEACHERS.map(t => (
                <button 
                  key={t.id}
                  onClick={() => handleAssignTeacher(t.id)}
                  className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all ${
                    assignedTeacherId === t.id 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500' 
                    : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center font-black text-indigo-600">
                      {t.name[0]}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black text-slate-900 dark:text-white">{t.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.subject} Specialist</p>
                    </div>
                  </div>
                  {assignedTeacherId === t.id && <CheckCircle2 className="text-emerald-500" size={20} />}
                </button>
              ))}
            </div>
            
            <div className="p-8 bg-slate-50/50 dark:bg-slate-800/50 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Showing Available Faculty for {selectedYear}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal (Enrollment) */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => setIsAddStudentModalOpen(false)} />
          
          <div className="relative bg-white dark:bg-slate-950 w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                  <UserPlus className="text-white w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Add Students to Section</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedYear} SESSION</span>
                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">GRADE {selectedGrade} - {selectedSection}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsAddStudentModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <X size={28} />
              </button>
            </div>

            {/* Modal Search & Stats */}
            <div className="px-10 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by Student ID or Name..." 
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all dark:text-slate-200"
                />
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Available Slots</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-black ${remainingSlots <= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {remainingSlots - selectedForEnrollment.length}
                    </span>
                    <span className="text-sm font-black text-slate-400">/ {capacity}</span>
                  </div>
                </div>
                <div className="h-10 w-px bg-slate-200 dark:bg-slate-800" />
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Selected</p>
                  <span className="text-xl font-black text-indigo-500">{selectedForEnrollment.length}</span>
                </div>
              </div>
            </div>

            {/* Modal Table Container */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-20 bg-white dark:bg-slate-950 shadow-sm">
                  <tr className="border-b border-slate-50 dark:border-slate-800">
                    <th className="pl-10 pr-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[80px]">Select</th>
                    <th className="px-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student ID</th>
                    <th className="px-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</th>
                    <th className="px-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Flag</th>
                    <th className="pr-10 pl-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">GPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                  {filteredModalPool.map((s) => {
                    const isAlreadyInThisSection = enrolledStudents.some(item => item.id === s.id);
                    const isSelected = selectedForEnrollment.includes(s.id);
                    const isDisabled = isAlreadyInThisSection || (!isSelected && selectedForEnrollment.length >= remainingSlots);

                    return (
                      <tr 
                        key={s.id} 
                        onClick={() => !isDisabled && toggleStudentSelection(s.id)}
                        className={`group transition-colors cursor-pointer ${
                          isSelected ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : 
                          isAlreadyInThisSection ? 'opacity-40 cursor-not-allowed bg-slate-50/50 dark:bg-slate-900/20' : 
                          'hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        <td className="pl-10 pr-4 py-5">
                          <div className={`
                            w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                            ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200 dark:border-slate-700'}
                          `}>
                            {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          <span className={`text-xs font-bold ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                            {s.studentId}
                          </span>
                        </td>
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                              isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                              {s.name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{s.name}</p>
                              {isAlreadyInThisSection && (
                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">Already Enrolled</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-5 text-center text-xl">{s.flag}</td>
                        <td className="pr-10 pl-4 py-5 text-center">
                          <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            {s.gpa?.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="px-10 py-8 bg-white dark:bg-slate-950 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30">
                <AlertCircle className="text-emerald-500 shrink-0" size={18} />
                <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 leading-relaxed uppercase tracking-wider">
                  Students will be automatically linked to the <span className="underline">{selectedYear} Academic Profile</span> upon confirmation.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="px-8 py-4 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                >
                  Cancel
                </button>
                <button 
                  disabled={selectedForEnrollment.length === 0}
                  onClick={handleAddSelectedStudents}
                  className="px-12 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all flex items-center gap-3"
                >
                  <CheckCircle2 size={18} />
                  Add {selectedForEnrollment.length} Students
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomPage;