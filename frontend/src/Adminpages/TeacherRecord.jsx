import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  AlertCircle,
  Pencil,
  List,
  Filter,
  ChevronDown,
  ArrowUpAZ,
  ArrowDownZA,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CiGrid32 } from "react-icons/ci";
import AddPopupTeacher from "../AdminComponents/Admin/AddPopupTeacher";
import { toast } from "../MainSystemComponents/Toast";
import Loading from "../MainSystemComponents/Loading";
import ConfirmDialog from "../MainSystemComponents/ConfirmDialog";

const TeacherRecord = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [viewMode, setViewMode] = useState('grid');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const location = useLocation();

  // Listen for search state from Navbar
  useEffect(() => {
    if (location.state?.searchName) {
      setSearchTerm(location.state.searchName);
      setCurrentPage(1);
    }
  }, [location.state]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const schoolId = localStorage.getItem("adminSchoolId") || localStorage.getItem("schoolId") || 1;
      const response = await axios.get(`http://localhost:7000/api/teachers?schoolId=${schoolId}`);
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
    const firstName = t.firstName || "";
    const lastName = t.lastName || "";
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    const code = (t.teacherCode || "").toLowerCase();
    const subject = (t.primarySubject?.subjectName || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    return fullName.includes(search) || code.includes(search) || subject.includes(search);
  }).sort((a, b) => {
    if (activeFilter === "grade-high") {
      const aMax = Math.max(...(a.assignedGrades?.map(g => Number(g.gradeNumber)) || [0]));
      const bMax = Math.max(...(b.assignedGrades?.map(g => Number(g.gradeNumber)) || [0]));
      return bMax - aMax;
    }
    if (activeFilter === "grade-low") {
      const aMin = Math.min(...(a.assignedGrades?.map(g => Number(g.gradeNumber)) || [100]));
      const bMin = Math.min(...(b.assignedGrades?.map(g => Number(g.gradeNumber)) || [100]));
      return aMin - bMin;
    }
    return 0;
  });

  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTeachers = filteredTeachers.slice(startIndex, startIndex + itemsPerPage);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const handleDeleteClick = (teacher) => {
    setTeacherToDelete(teacher);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!teacherToDelete) return;
    try {
      await axios.delete(`http://localhost:7000/api/teachers/${teacherToDelete._id}`);
      setTeachers(prev => prev.filter(t => t._id !== teacherToDelete._id));
      toast({ type: 'success', message: "Teacher record deleted successfully.", duration: 3000 });
      if (currentTeachers.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (err) {
      toast({ type: 'error', message: "Failed to delete teacher record.", duration: 3000 });
      console.error(err);
    } finally {
      setIsConfirmOpen(false);
      setTeacherToDelete(null);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-0 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-2">
        <div className="bg-white dark:bg-[#1e293b]/60 px-5 py-2.5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm dark:shadow-inner flex items-center gap-4 transition-all hover:bg-slate-50 dark:hover:bg-[#1e293b]/80 shrink-0">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <GraduationCap className="text-emerald-500 dark:text-emerald-400 w-5 h-5 shadow-[0_0_15px_rgba(52,211,153,0.3)]" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 tracking-widest mb-0.5 uppercase">Teachers</p>
            <h2 className="text-xl font-black text-slate-900 dark:text-white leading-none">{teachers.length}</h2>
          </div>
        </div>

        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by ID, name, or subject..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-6 py-3.5 bg-white dark:bg-[#1e293b]/40 border border-slate-100 dark:border-white/5 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm dark:shadow-inner text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* New Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl border transition-all duration-300 font-bold text-sm ${isFilterOpen || activeFilter !== "all"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.1)]"
                : "bg-white dark:bg-[#1e293b]/60 border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1e293b]/80 shadow-sm"
                }`}
            >
              <Filter size={18} />
              <span className="hidden sm:inline">Filter</span>
              <ChevronDown size={16} className={`transition-transform duration-300 ${isFilterOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0f172a]/95 backdrop-blur-2xl border border-slate-100 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden"
                  >
                    {[
                      { id: "all", label: "All Faculty", icon: Users, color: "text-slate-400" },
                      { id: "grade-high", label: "Grade Asscending", icon: ArrowUpAZ, color: "text-emerald-400" },
                      { id: "grade-low", label: "Grade Descending", icon: ArrowDownZA, color: "text-emerald-400" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setActiveFilter(opt.id);
                          setIsFilterOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${activeFilter === opt.id
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                          }`}
                      >
                        <opt.icon size={16} className={opt.color} />
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-[#1e293b]/60 p-1 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm dark:shadow-inner shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid'
                ? 'bg-emerald-500/20 text-emerald-400 shadow-lg'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
            >
              <CiGrid32 size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'list'
                ? 'bg-emerald-500/20 text-emerald-400 shadow-lg'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
            >
              <List size={20} />
            </button>
          </div>

          <button
            onClick={() => {
              setEditingTeacher(null);
              setIsPopupOpen(true);
            }}
            className="px-6 py-3.5 bg-gradient-to-r from-emerald-500/90 to-emerald-600/90 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap shrink-0 uppercase tracking-wider"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Add Teacher</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Data View */}
      {loading ? (
        <div className="py-24 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <Loading text="Accessing Teacher Vault..." fullScreen={false} />
        </div>
      ) : error ? (
        <div className="py-32 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-red-500">
          <AlertCircle className="w-10 h-10 mb-4" />
          <p className="text-sm font-bold tracking-widest uppercase">{error}</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentTeachers.length > 0 ? (
            currentTeachers.map((teacher) => (
              <div
                key={teacher._id}
                className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 group relative flex flex-col"
                onClick={() => navigate(`/admin/teacher/${teacher._id}`)}
              >
                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(teacher);
                  }}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:bg-red-500 rounded-xl z-10 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>

                {/* Top: Profile */}
                <div className="p-6 pb-5 flex flex-col items-center text-center border-b border-slate-50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-800/10">
                  <div className="w-20 h-20 mb-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-2xl shadow-inner ring-4 ring-white dark:ring-slate-900 overflow-hidden">
                    {teacher.profilePhoto ? (
                      <img src={teacher.profilePhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      getInitials(teacher.firstName, teacher.lastName)
                    )}
                  </div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight mb-1">{teacher.firstName} {teacher.lastName}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">ID: {teacher.teacherCode}</p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-800">
                      {teacher.primarySubject?.subjectName || "General"}
                    </span>
                  </div>
                </div>

                {/* Bottom: Details */}
                <div className="p-6 flex-1 flex flex-col gap-4 bg-white dark:bg-slate-900">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Assigned Grades</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {teacher.assignedGrades?.length > 0 ? (
                        teacher.assignedGrades.map(g => (
                          <span key={g._id} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700">
                            Class {g.gradeNumber}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-400">None</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800/50 flex justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTeacher(teacher);
                        setIsPopupOpen(true);
                      }}
                      className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-emerald-500 transition-colors uppercase tracking-widest"
                    >
                      <Pencil size={12} /> Edit Record
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center text-slate-400 font-bold tracking-widest text-xs uppercase">No Faculty Records Found</div>
          )}
        </div>
      ) : (
        /* List View (Table) */
        <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors h-auto">
          <div className="w-full overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[800px] table-auto text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="pl-12 pr-6 py-8 text-[10px] font-black text-slate-400 tracking-widest uppercase">ID</th>
                  <th className="px-6 py-8 text-[10px] font-black text-slate-400 tracking-widest uppercase">Faculty Details</th>
                  <th className="px-6 py-8 text-[10px] font-black text-slate-400 tracking-widest text-center uppercase">Grades</th>
                  <th className="px-6 py-8 text-[10px] font-black text-slate-400 tracking-widest uppercase">Core Subject</th>
                  <th className="px-6 py-8 text-[10px] font-black text-slate-400 tracking-widest uppercase">Elective</th>
                  <th className="pr-12 pl-6 py-8 text-[10px] font-black text-slate-400 tracking-widest text-center uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {currentTeachers.length > 0 ? (
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
                              handleDeleteClick(teacher);
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
                    <td colSpan={6} className="py-32 text-center text-slate-400 font-bold tracking-widest text-xs uppercase">No Faculty Records Found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && !error && filteredTeachers.length > 0 && (
        <div className="w-full px-8 py-5 bg-slate-50/50 dark:bg-slate-800/30 rounded-[28px] border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase">Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredTeachers.length)} of {filteredTeachers.length}</p>
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
      )}

      <AddPopupTeacher
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          setEditingTeacher(null);
        }}
        onSuccess={fetchTeachers}
        teacherToEdit={editingTeacher}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Teacher Record"
        message={`Are you sure you want to delete ${teacherToDelete?.firstName} ${teacherToDelete?.lastName}? This action cannot be undone.`}
      />
    </div>
  );
};

export default TeacherRecord;