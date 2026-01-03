import React, { useState } from "react";
import { 
  Search, 
  Trash2, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  GraduationCap
} from "lucide-react";
import AddPopupTeacher from "../AdminComponents/Admin/AddPopupTeacher";

const initialTeachers = [
  { teacher_id: "T001", teacherName: "John Smith", class: "10, 9, 8", subject: "Science", secondarySubject: "English" },
  { teacher_id: "T002", teacherName: "Emma Johnson", class: "12, 11", subject: "Mathematics", secondarySubject: "Physics" },
  { teacher_id: "T003", teacherName: "Michael Brown", class: "9, 8, 7", subject: "English", secondarySubject: "History" },
  { teacher_id: "T004", teacherName: "Sarah Davis", class: "11, 10", subject: "Physics", secondarySubject: "Chemistry" },
  { teacher_id: "T005", teacherName: "Robert Wilson", class: "12", subject: "Chemistry", secondarySubject: "Biology" },
  { teacher_id: "T006", teacherName: "Lisa Anderson", class: "10, 9", subject: "History", secondarySubject: "Geography" },
  { teacher_id: "T007", teacherName: "David Martinez", class: "8, 7", subject: "Biology", secondarySubject: "Science" },
  { teacher_id: "T008", teacherName: "Jennifer Garcia", class: "11, 10, 9", subject: "Geography", secondarySubject: "History" },
  { teacher_id: "T009", teacherName: "James Rodriguez", class: "12, 11", subject: "Computer Science", secondarySubject: "Mathematics" },
  { teacher_id: "T010", teacherName: "Maria Lopez", class: "9, 8", subject: "Art", secondarySubject: "Music" },
  { teacher_id: "T011", teacherName: "William Taylor", class: "10", subject: "Physical Education", secondarySubject: "Health" },
  { teacher_id: "T012", teacherName: "Patricia Thomas", class: "11, 10", subject: "Music", secondarySubject: "Art" },
];

const TeacherRecord = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [teachers, setTeachers] = useState(initialTeachers);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.teacher_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.secondarySubject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTeachers = filteredTeachers.slice(startIndex, startIndex + itemsPerPage);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete teacher record?")) return;
    setTeachers(prev => prev.filter(t => t.teacher_id !== id));
    if (currentTeachers.length === 1 && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-0 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header Stats & Tools */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="bg-white dark:bg-slate-900 px-8 py-5 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-5 transition-colors">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center">
            <GraduationCap className="text-emerald-500 w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Teachers</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-none">{teachers.length}</h2>
          </div>
        </div>

        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by ID, name, class, or subject..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px] text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm dark:text-slate-200"
          />
        </div>

        <button 
          onClick={() => setIsPopupOpen(true)}
          className="px-10 py-5 bg-emerald-500 text-white rounded-[28px] font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 whitespace-nowrap"
        >
          <Plus size={22} /> ADD TEACHER
        </button>
      </div>

      {/* Main Table Card - h-auto ensures content-based height */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors h-auto">
        <div className="w-full overflow-x-auto scrollbar-hide">
          <table className="w-full min-w-[800px] table-auto text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                <th className="pl-12 pr-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Teacher ID</th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Faculty Details</th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Grades</th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Subject</th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Elective</th>
                <th className="pr-12 pl-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {currentTeachers.length > 0 ? (
                currentTeachers.map((teacher) => (
                  <tr key={teacher.teacher_id} className="group hover:bg-emerald-50/30 dark:hover:bg-emerald-900/5 transition-all">
                    <td className="pl-12 pr-6 py-6 font-bold text-slate-400 text-xs">{teacher.teacher_id}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/20 flex items-center justify-center text-emerald-600 font-black text-xs shadow-inner shrink-0">
                          {getInitials(teacher.teacherName)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 dark:text-white leading-tight truncate">{teacher.teacherName}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider truncate">Academic Staff</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700 whitespace-nowrap">
                        Class {teacher.class}
                      </span>
                    </td>
                    <td className="px-6 py-6 font-bold text-sm text-slate-700 dark:text-slate-300">
                      {teacher.subject}
                    </td>
                    <td className="px-6 py-6 font-medium text-xs text-slate-400">
                      {teacher.secondarySubject}
                    </td>
                    <td className="pr-12 pl-6 py-6 text-center">
                      <div className="flex items-center justify-center transition-all">
                        <button 
                          onClick={() => handleDelete(teacher.teacher_id)} 
                          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                          title="Delete Faculty Record"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-32 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No faculty records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination - Compact flow */}
        <div className="w-full px-8 py-5 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-50 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredTeachers.length)} of {filteredTeachers.length}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p-1))}
              disabled={currentPage === 1}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500 transition-all shadow-sm active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2 flex-wrap justify-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-[10px] font-black transition-all ${
                    currentPage === page 
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500 transition-all shadow-sm active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <AddPopupTeacher isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </div>
  );
};

export default TeacherRecord;