import React, { useState } from "react";
import api from '../Utils/axiosInstance';
import { useSchoolFetch } from '../Utils/useSchoolFetch';
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Users, Search, Trash2, Plus, ChevronLeft, ChevronRight, 
  Loader2, AlertCircle, Pencil, List, Filter, ChevronDown, 
  ArrowUpAZ, ArrowDownZA, Flag 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CiGrid32 } from "react-icons/ci";
import { AddPopupStudent } from "../AdminComponents/Admin/AddPopupStudent";
import ConfirmDialog from "../MainSystemComponents/ConfirmDialog";
import { toast } from "../MainSystemComponents/Toast";
import Loading from "../MainSystemComponents/Loading";

const StudentRecord = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: fetchedData, loading, error, setData: setStudentsList, refetch: fetchStudents } = useSchoolFetch('/students');
  const [viewMode, setViewMode] = useState('grid'); // Default view mode
  const students = fetchedData || [];

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMode, setPopupMode] = useState("add");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, studentId: null, studentName: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const itemsPerPage = 8;
  const location = useLocation();

  // Listen for search state from Navbar
  React.useEffect(() => {
    if (location.state?.searchName) {
      setSearchQuery(location.state.searchName);
      setCurrentPage(1);
    }
  }, [location.state]);

  const setStudents = (action) => {
    if (typeof action === 'function') {
      setStudentsList(action(students));
    } else {
      setStudentsList(action);
    }
  };

  const getFlagColor = (flag) => {
    switch (flag) {
      case "red": return "bg-red-500 shadow-red-500/20 ring-red-500/10";
      case "amber":
      case "yellow": return "bg-amber-500 shadow-amber-500/20 ring-amber-500/10";
      case "green": return "bg-emerald-500 shadow-emerald-500/20 ring-emerald-500/10";
      default: return "bg-slate-300 dark:bg-slate-700 shadow-slate-500/10 ring-slate-500/5";
    }
  };

  const filtered = Array.isArray(students) ? [...students]
    .filter(s => {
      const matchesSearch = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(s.studentId || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFlag = activeFilter === "red" || activeFilter === "amber" || activeFilter === "green" 
        ? s.flag === activeFilter 
        : true;

      return matchesSearch && matchesFlag;
    })
    .sort((a, b) => {
      // Apply active filter sorting
      if (activeFilter === "grade-asc") return Number(a.studentClass) - Number(b.studentClass);
      if (activeFilter === "grade-desc") return Number(b.studentClass) - Number(a.studentClass);

      // Default sorting: graduated students to the bottom
      if (a.status === 'graduated' && b.status !== 'graduated') return 1;
      if (a.status !== 'graduated' && b.status === 'graduated') return -1;
      return 0;
    }) : [];

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDeleteClick = (student) => {
    setDeleteDialog({
      isOpen: true,
      studentId: student._id,
      studentName: `${student.firstName} ${student.lastName}`
    });
  };

  const handleConfirmDelete = async () => {
    const { studentId } = deleteDialog;
    try {
      await api.delete(`/students/${studentId}`);
      setStudents(prev => prev.filter(s => s._id !== studentId));
      toast({ type: 'success', message: "Student record and account deleted.", duration: 3000 });
      if (currentItems.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (err) {
      toast({ type: 'error', message: "Failed to delete student record.", duration: 3000 });
      console.error(err);
    } finally {
      setDeleteDialog({ isOpen: false, studentId: null, studentName: "" });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-0 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-2">
        <div className="bg-white dark:bg-[#1e293b]/60 px-5 py-2.5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm dark:shadow-inner flex items-center gap-4 transition-all hover:bg-slate-50 dark:hover:bg-[#1e293b]/80 shrink-0">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <Users className="text-emerald-500 dark:text-emerald-400 w-5 h-5 shadow-[0_0_15px_rgba(52,211,153,0.3)]" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 tracking-widest mb-0.5 uppercase">Students</p>
            <h2 className="text-xl font-black text-slate-900 dark:text-white leading-none">{students.length}</h2>
          </div>
        </div>

        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search student records..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
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
              className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl border transition-all duration-300 font-bold text-sm ${
                isFilterOpen || activeFilter !== "all"
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
                      { id: "all", label: "All Students", icon: Users, color: "text-slate-400" },
                      { id: "grade-asc", label: "Grade Ascending", icon: ArrowUpAZ, color: "text-emerald-400" },
                      { id: "grade-desc", label: "Grade Descending", icon: ArrowDownZA, color: "text-emerald-400" },
                      { id: "red", label: "Red Flag", color: "bg-red-500" },
                      { id: "amber", label: "Yellow Flag", color: "bg-amber-500" },
                      { id: "green", label: "Green Flag", color: "bg-emerald-500" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setActiveFilter(opt.id);
                          setIsFilterOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          activeFilter === opt.id
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {opt.icon ? (
                          <opt.icon size={16} className={opt.color} />
                        ) : (
                          <div className={`w-3.5 h-3.5 rounded-[4px] ${opt.color} shadow-lg ring-2 ring-white/5`} />
                        )}
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Grid / List Toggle Button */}
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
              setPopupMode("add");
              setSelectedStudent(null);
              setIsPopupOpen(true);
            }}
            className="px-6 py-3.5 bg-gradient-to-r from-emerald-500/90 to-emerald-600/90 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap shrink-0 uppercase tracking-wider"
          >
            <Plus size={18} /> <span className="hidden sm:inline">Add Student</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Data View */}
      {loading ? (
        <div className="py-24 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <Loading text="Accessing Student Vault..." fullScreen={false} />
        </div>
      ) : error ? (
        <div className="py-32 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-red-500">
          <AlertCircle className="w-10 h-10 mb-4" />
          <p className="text-sm font-bold tracking-widest">{error}</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentItems.length > 0 ? (
            currentItems.map((s, index) => (
              <div
                key={s._id}
                className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 group relative flex flex-col"
                onClick={() => navigate(`/admin/student/${s._id}`)}
              >
                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(s);
                  }}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:bg-red-500 rounded-xl z-10 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>

                {/* Top: Profile */}
                <div className="p-6 pb-5 flex flex-col items-center text-center border-b border-slate-50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-800/10">
                  <div className="w-20 h-20 mb-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-2xl shadow-inner ring-4 ring-white dark:ring-slate-900 overflow-hidden">
                    {s.profilePhoto ? (
                      <img src={s.profilePhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <>{s.firstName?.[0]}{s.lastName?.[0]}</>
                    )}
                  </div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight mb-1">{s.firstName} {s.lastName}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">ID: {s.studentId}</p>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="truncate">{s.email || 'No email provided'}</span>
                  </div>
                </div>

                {/* Bottom: Details */}
                <div className="p-6 flex-1 flex flex-col gap-5 bg-white dark:bg-slate-900">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Assigned Grade</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${s.status === 'graduated'
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-700 shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/50 dark:border-slate-700"
                        }`}>
                        {s.status === 'graduated' ? 'GRADUATED' : `Class ${s.studentClass}`}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 mt-auto pt-4 border-t border-slate-50 dark:border-slate-800/50">
                    <div className="text-center flex flex-col items-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status Flag</p>
                      <div className={`w-4 h-4 rounded-md ring-4 shadow-lg ${getFlagColor(s.flag)}`} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center text-slate-400 font-bold tracking-widest text-xs">No Student Records Found</div>
          )}
        </div>
      ) : (
        /* List View (Table) */
        <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors h-auto">
          <div className="w-full overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[800px] table-auto text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="pl-12 pr-6 py-8 text-[10px] font-black text-slate-400 tracking-widest">Id</th>
                  <th className="px-6 py-8 text-[10px] font-black text-slate-400 tracking-widest">Student Details</th>
                  <th className="px-6 py-8 text-[10px] font-black text-slate-400 tracking-widest">Grade</th>
                  <th className="px-6 py-8 text-[10px] font-black text-slate-400 tracking-widest text-center">Flag</th>
                  <th className="pr-12 pl-6 py-8 text-[10px] font-black text-slate-400 tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {currentItems.length > 0 ? (
                  currentItems.map((s) => (
                    <tr
                      key={s._id}
                      className="group hover:bg-emerald-50/30 dark:hover:bg-emerald-900/5 transition-all cursor-pointer"
                      onClick={() => navigate(`/admin/student/${s._id}`)}
                    >
                      <td className="pl-12 pr-6 py-6 font-bold text-slate-400 text-xs">{s.studentId}</td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/20 flex items-center justify-center text-emerald-600 font-black text-xs shadow-inner shrink-0 overflow-hidden">
                            {s.profilePhoto ? (
                              <img src={s.profilePhoto} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <>{s.firstName?.[0]}{s.lastName?.[0]}</>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 dark:text-white leading-tight truncate">{s.firstName} {s.lastName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest border whitespace-nowrap ${s.status === 'graduated'
                          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-700"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/50 dark:border-slate-700"
                          }`}>
                          {s.status === 'graduated' ? 'GRADUATED' : `Grade ${s.studentClass}`}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className={`mx-auto w-4 h-4 rounded-md ring-4 shadow-lg transition-transform hover:scale-110 ${getFlagColor(s.flag)}`} />
                      </td>
                      <td className="pr-12 pl-6 py-6 text-center">
                        <div className="flex items-center justify-center transition-all">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPopupMode("edit");
                              setSelectedStudent(s);
                              setIsPopupOpen(true);
                            }}
                            className="relative z-10 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl mr-1"
                            title="Edit Record"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(s);
                            }}
                            className="relative z-10 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                            title="Delete Record"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-32 text-center text-slate-400 font-bold tracking-widest text-xs">No Student Records Found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && !error && filtered.length > 0 && (
        <div className="w-full px-8 py-5 bg-slate-50/50 dark:bg-slate-800/30 rounded-[28px] border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em]">Record {currentPage} of {totalPages}</p>
          <div className="flex items-center gap-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500 transition-all shadow-sm active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500 transition-all shadow-sm active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      <AddPopupStudent
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          setSelectedStudent(null);
        }}
        onSuccess={fetchStudents}
        mode={popupMode}
        studentData={selectedStudent}
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ ...deleteDialog, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title="Delete Student Record?"
        message={`Are you sure you want to permanently delete the record for ${deleteDialog.studentName}? This action will also remove their linked user account and cannot be undone.`}
      />
    </div>
  );
};

export default StudentRecord;