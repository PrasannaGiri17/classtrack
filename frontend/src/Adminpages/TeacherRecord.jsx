import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Loader2,
  AlertCircle,
  Pencil
} from "lucide-react";
import AddPopupTeacher from "../AdminComponents/Admin/AddPopupTeacher";
import { toast } from "../MainSystemComponents/Toast";
import Loading from "../MainSystemComponents/Loading";

const TeacherRecord = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const schoolId = localStorage.getItem("schoolId");
      const url = schoolId
        ? `http://localhost:7000/api/teachers?schoolId=${schoolId}`
        : "http://localhost:7000/api/teachers";
      const response = await axios.get(url);
      setTeachers(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch teacher records. Please ensure backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter((t) => {
    const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
    const code = (t.teacherCode || "").toLowerCase();
    const subject = (t.primarySubject?.subjectName || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    return fullName.includes(search) || code.includes(search) || subject.includes(search);
  });

  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTeachers = filteredTeachers.slice(startIndex, startIndex + itemsPerPage);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const handleDelete = async (teacher) => {
    if (!window.confirm(`Are you sure you want to delete ${teacher.firstName} ${teacher.lastName}?`)) return;
    try {
      await axios.delete(`http://localhost:7000/api/teachers/${teacher._id}`);
      setTeachers(prev => prev.filter(t => t._id !== teacher._id));
      toast({ type: 'success', message: "Teacher record deleted successfully.", duration: 3000 });
      if (currentTeachers.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (err) {
      toast({ type: 'error', message: "Failed to delete teacher record.", duration: 3000 });
      console.error(err);
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
            <p className="text-[10px] font-black text-slate-400 tracking-widest mb-0.5">Total Teachers</p>
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
          onClick={() => {
            setEditingTeacher(null);
            setIsPopupOpen(true);
          }}
          className="px-10 py-5 bg-emerald-500 text-white rounded-[28px] font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 whitespace-nowrap"
        >
          <Plus size={22} /> Add Teacher
        </button>
      </div>

      {/* Main Table Card - h-auto ensures content-based height */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors h-auto">
        <div className="w-full overflow-x-auto scrollbar-hide">
          <table className="w-full min-w-[800px] table-auto text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                <th className="pl-12 pr-6 py-8 text-[10px] font-black text-slate-400 tracking-widest">Teacher Id</th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 tracking-widest">Faculty Details</th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 tracking-widest text-center">Grades</th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 tracking-widest">Core Subject</th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 tracking-widest">Elective</th>
                <th className="pr-12 pl-6 py-8 text-[10px] font-black text-slate-400 tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-24">
                    <Loading text="Accessing Teacher Vault..." fullScreen={false} />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="py-32">
                    <div className="flex flex-col items-center justify-center text-red-500">
                      <AlertCircle className="w-10 h-10 mb-4" />
                      <p className="text-sm font-bold tracking-widest">{error}</p>
                    </div>
                  </td>
                </tr>
              ) : currentTeachers.length > 0 ? (
                currentTeachers.map((teacher) => (
                  <tr
                    key={teacher._id}
                    onClick={() => navigate(`/admin/teacher/${teacher._id}`)}
                    className="group hover:bg-emerald-50/30 dark:hover:bg-emerald-900/5 transition-all cursor-pointer"
                  >
                    <td className="pl-12 pr-6 py-6 font-bold text-slate-400 text-xs">{teacher.teacherCode}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/20 flex items-center justify-center text-emerald-600 font-black text-xs shadow-inner shrink-0 overflow-hidden">
                          {teacher.profilePhoto ? (
                            <img src={teacher.profilePhoto} alt="" className="w-full h-full object-cover" />
                          ) : (
                            getInitials(teacher.firstName, teacher.lastName)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 dark:text-white leading-tight truncate">{teacher.firstName} {teacher.lastName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black tracking-widest text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700 whitespace-nowrap">
                        {teacher.assignedGrades?.map(g => g.gradeNumber).join(", ") || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-6 font-bold text-sm text-slate-700 dark:text-slate-300">
                      {teacher.primarySubject?.subjectName || "N/A"}
                    </td>
                    <td className="px-6 py-6 font-medium text-xs text-slate-400">
                      {teacher.secondarySubject?.subjectName || "—"}
                    </td>
                    <td className="pr-12 pl-6 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTeacher(teacher);
                            setIsPopupOpen(true);
                          }}
                          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl"
                          title="Edit Faculty Record"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(teacher);
                          }}
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
                  <td colSpan={6} className="py-32 text-center text-slate-400 font-bold tracking-widest text-xs">No Faculty Records Found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination - Compact flow */}
        <div className="w-full px-8 py-5 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-50 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em]">Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredTeachers.length)} of {filteredTeachers.length}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-[10px] font-black transition-all ${currentPage === page
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500"
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500 transition-all shadow-sm active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <AddPopupTeacher
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          setEditingTeacher(null);
        }}
        onSuccess={fetchTeachers}
        teacherToEdit={editingTeacher}
      />
    </div>
  );
};

export default TeacherRecord;