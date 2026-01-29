import React, { useState, useEffect, useMemo } from 'react';
import gradeService from '../Api/gradeService';
import teacherService from '../Api/teacherService';
import studentService from '../Api/studentService';
import ConfirmDialog from '../MainSystemComponents/ConfirmDialog';
import { toast } from '../MainSystemComponents/Toast';
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
  Check,
  Loader2
} from 'lucide-react';



// Mock data for initial loading/demonstration (can be removed if not needed)
const INITIAL_ENROLLED_STUDENTS = [];

const ClassroomPage = () => {
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [availableSections, setAvailableSections] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);

  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [globalStudentPool, setGlobalStudentPool] = useState([]);
  const [assignedTeacherId, setAssignedTeacherId] = useState("");
  const [capacity] = useState(30);

  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [selectedForEnrollment, setSelectedForEnrollment] = useState([]);

  // Fetch initial data (Grades)
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const data = await gradeService.getGrades();
        setGrades(data);
        if (data.length > 0) {
          setSelectedGrade(data[0].gradeNumber.toString());
        }
      } catch (error) {
        console.error("Error fetching grades:", error);
        toast({ type: 'error', message: "Failed to load grades." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchGrades();

    const fetchTeachers = async () => {
      try {
        const data = await teacherService.getAllTeachers();
        setTeachers(data || []);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };
    fetchTeachers();
  }, []);

  // Update sections when grade changes
  useEffect(() => {
    if (!selectedGrade) return;

    const grade = grades.find(g => g.gradeNumber.toString() === selectedGrade);
    if (grade) {
      setAvailableSections(grade.sections || []);
      if (grade.sections?.length > 0) {
        setSelectedSection(grade.sections[0].sectionName);
      }
    }

    const fetchGradeStudents = async () => {
      try {
        const data = await studentService.getStudents(selectedGrade);
        setGlobalStudentPool(data || []);
      } catch (error) {
        console.error("Error fetching grade students:", error);
      }
    };
    fetchGradeStudents();
  }, [selectedGrade, grades]);

  // Update classroom data when section changes
  useEffect(() => {
    if (!selectedGrade || !selectedSection) return;

    const grade = grades.find(g => g.gradeNumber.toString() === selectedGrade);
    const section = grade?.sections.find(s => s.sectionName === selectedSection);

    if (section) {
      setSelectedSectionId(section._id);
      setAssignedTeacherId(section.classTeacherId || "");

      const fetchEnrolledStudents = async () => {
        try {
          setIsLoading(true);
          const data = await studentService.getStudentsBySection(selectedGrade, section._id);
          setEnrolledStudents(data || []);
        } catch (error) {
          console.error("Error fetching enrolled students:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchEnrolledStudents();
    }
  }, [selectedGrade, selectedSection, grades]);

  useEffect(() => {
    console.log("Current Teachers:", teachers);
    console.log("Selected Grade:", selectedGrade);
  }, [teachers, selectedGrade]);

  const enrolledCount = enrolledStudents.length;
  const isFull = enrolledCount >= capacity;
  const remainingSlots = capacity - enrolledCount;

  const currentTeacher = teachers.find(t => t._id === assignedTeacherId);

  // Filter existing students by search
  const filteredStudents = enrolledStudents.filter(s => {
    const fullName = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();
    const sId = (s.studentId || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || sId.includes(query);
  });

  // Filter pool students for the modal
  const filteredModalPool = useMemo(() => {
    return globalStudentPool.filter(s => {
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      const sId = (s.studentId || "").toLowerCase();
      const query = modalSearchQuery.toLowerCase();
      return fullName.includes(query) || sId.includes(query);
    });
  }, [modalSearchQuery, globalStudentPool]);

  const handleRemoveStudent = (student) => {
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
  };

  const confirmRemoveStudent = () => {
    if (!studentToDelete) return;

    // Only remove from UI, not from database
    setEnrolledStudents(prev => prev.filter(s => s._id !== studentToDelete._id));
    toast({ type: 'success', message: "Student removed from classroom!" });
    setIsDeleteModalOpen(false);
    setStudentToDelete(null);
  };

  const handleAssignTeacher = async (teacherId) => {
    try {
      await gradeService.assignClassTeacher({
        gradeNumber: Number(selectedGrade),
        sectionName: selectedSection,
        teacherId: teacherId
      });
      setAssignedTeacherId(teacherId);
      setIsTeacherModalOpen(false);
      toast({ type: 'success', message: "Class teacher assigned successfully!" });
    } catch (error) {
      console.error("Error assigning teacher:", error);
      toast({ type: 'error', message: "Failed to assign teacher." });
    }
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
    const studentsToAdd = globalStudentPool.filter(s => selectedForEnrollment.includes(s._id));
    setEnrolledStudents(prev => {
      // Filter out duplicates just in case
      const existingIds = new Set(prev.map(p => p._id));
      const uniqueNew = studentsToAdd.filter(s => !existingIds.has(s._id));
      return [...prev, ...uniqueNew];
    });
    setIsAddStudentModalOpen(false);
    setSelectedForEnrollment([]);
    setModalSearchQuery("");
  };

  const handleSaveClassroom = async () => {
    try {
      setIsSaving(true);

      // Update Student Enrollments (Bulk)
      const studentIds = enrolledStudents.map(s => s._id);
      await studentService.bulkEnrollment(studentIds, selectedSectionId, Number(selectedGrade));

      toast({ type: 'success', message: "Classroom saved successfully!" });
      setIsSaveModalOpen(false);
    } catch (error) {
      console.error("Error saving classroom:", error);
      toast({ type: 'error', message: "Failed to save classroom." });
    } finally {
      setIsSaving(false);
    }
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
              <option value="" disabled>Select Grade</option>
              {grades.map(g => <option key={g.gradeNumber} value={g.gradeNumber}>Grade {g.gradeNumber}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
          </div>

          <div className="relative group">
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="appearance-none bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl pl-5 pr-12 py-4 text-xs font-black text-slate-600 dark:text-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-sm cursor-pointer"
            >
              <option value="" disabled>Select Section</option>
              {availableSections.map(s => <option key={s.sectionName} value={s.sectionName}>Section {s.sectionName}</option>)}
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
                    <tr key={s._id} className="group hover:bg-emerald-50/20 dark:hover:bg-emerald-900/5 transition-colors">
                      <td className="pl-10 pr-4 py-5 text-xs font-bold text-slate-400">{s.studentId}</td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[10px] font-black text-emerald-600">
                            {s.firstName?.[0]}
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{s.firstName} {s.lastName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleRemoveStudent(s)}
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
                        {isLoading ? (
                          <Loader2 size={40} className="animate-spin text-emerald-500 opacity-50" />
                        ) : (
                          <Users size={40} className="opacity-10" />
                        )}
                        <p className="text-[10px] font-black uppercase tracking-widest">
                          {isLoading ? "Loading students..." : "No matching students"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Save Button */}
          <div className="p-8 border-t border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10 flex justify-end">
            <button
              onClick={() => setIsSaveModalOpen(true)}
              disabled={enrolledStudents.length === 0 || !selectedSection}
              className="px-10 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all flex items-center gap-3"
            >
              <CheckCircle2 size={18} /> Save Classroom
            </button>
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
                      {currentTeacher.firstName[0]}{currentTeacher.lastName[0]}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                        {currentTeacher.firstName} {currentTeacher.lastName}
                      </h4>
                      <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1">
                        {currentTeacher.primarySubject?.subjectName || 'Faculty'} Dept.
                      </p>
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
              {teachers
                .filter(t => {
                  if (!selectedGrade) return true;
                  // Handle both populated grade objects and string IDs/numbers from assignedGrades
                  return t.assignedGrades?.some(g => {
                    const gNum = (g.gradeNumber || g).toString();
                    return gNum === selectedGrade;
                  });
                })
                .map(t => (
                  <button
                    key={t._id}
                    onClick={() => handleAssignTeacher(t._id)}
                    className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all ${assignedTeacherId === t._id
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500'
                      : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-transparent'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center font-black text-indigo-600">
                        {t.firstName?.[0] || 'T'}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-slate-900 dark:text-white">{t.firstName} {t.lastName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {t.primarySubject?.subjectName || 'Faculty'} Specialist
                        </p>
                      </div>
                    </div>
                    {assignedTeacherId === t._id && <CheckCircle2 className="text-emerald-500" size={20} />}
                  </button>
                ))}

              {teachers.length > 0 && teachers.filter(t => {
                if (!selectedGrade) return true;
                return t.assignedGrades?.some(g => (g.gradeNumber || g).toString() === selectedGrade);
              }).length === 0 && (
                  <div className="py-12 text-center">
                    <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No teachers assigned to Grade {selectedGrade}</p>
                    <p className="text-[10px] text-slate-400 mt-2">Assign grades to teachers in the Teacher Profile page first.</p>
                  </div>
                )}

              {teachers.length === 0 && !isLoading && (
                <div className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No teachers found in database</p>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-50/50 dark:bg-slate-800/50 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Showing Available Faculty</p>
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
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">SESSION</span>
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
                    const isAlreadyInThisSection = enrolledStudents.some(item => item._id === s._id);
                    const isSelected = selectedForEnrollment.includes(s._id);
                    const isDisabled = isAlreadyInThisSection || (!isSelected && selectedForEnrollment.length >= remainingSlots);

                    return (
                      <tr
                        key={s._id}
                        onClick={() => !isDisabled && toggleStudentSelection(s._id)}
                        className={`group transition-colors cursor-pointer ${isSelected ? 'bg-emerald-50/30 dark:bg-emerald-900/10' :
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
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                              }`}>
                              {s.firstName?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{s.firstName} {s.lastName}</p>
                              {isAlreadyInThisSection && (
                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">Already Enrolled</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-5 text-center text-xl">
                          {s.flag === 'red' ? '🔴' : s.flag === 'yellow' ? '🟡' : '🟢'}
                        </td>
                        <td className="pr-10 pl-4 py-5 text-center">
                          <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            {s.gpa || "N/A"}
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
                  Students will be automatically linked to the <span className="underline">Academic Profile</span> upon confirmation.
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

      {/* Save Classroom Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onConfirm={handleSaveClassroom}
        title="Save Classroom"
        message={`Are you sure you want to save the classroom for Grade ${selectedGrade} - Section ${selectedSection} with ${enrolledStudents.length} student${enrolledStudents.length !== 1 ? 's' : ''}? This will update all selected students' grade and section in the database.`}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setStudentToDelete(null);
        }}
        onConfirm={confirmRemoveStudent}
        title="Remove Student"
        message={`Are you sure you want to remove ${studentToDelete ? `${studentToDelete.firstName} ${studentToDelete.lastName}` : 'this student'} from the classroom?`}
      />
    </div>
  );
};

export default ClassroomPage;