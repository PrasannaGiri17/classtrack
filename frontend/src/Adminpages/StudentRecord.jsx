import React, { useState } from "react";
import api from '../Utils/axiosInstance';
import { useSchoolFetch } from '../Utils/useSchoolFetch';
import { useLocation, useNavigate } from "react-router-dom";
import { Users, Search, Trash2, Plus, ChevronLeft, ChevronRight, Loader2, AlertCircle, Pencil } from "lucide-react";
import { AddPopupStudent } from "../AdminComponents/Admin/AddPopupStudent";
import ConfirmDialog from "../MainSystemComponents/ConfirmDialog";
import { toast } from "../MainSystemComponents/Toast";
import Loading from "../MainSystemComponents/Loading";

const StudentRecord = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: fetchedData, loading, error, setData: setStudentsList, refetch: fetchStudents } = useSchoolFetch('/students');
  const students = fetchedData || [];

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMode, setPopupMode] = useState("add");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, studentId: null, studentName: "" });
  const [currentPage, setCurrentPage] = useState(1);
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
      case "yellow": return "bg-yellow-500 shadow-yellow-500/20 ring-yellow-500/10";
      case "green": return "bg-[#22c55e] shadow-emerald-500/20 ring-emerald-500/10";
      default: return "bg-gray-400 shadow-gray-400/20 ring-gray-400/10";
    }
  };

  const filtered = Array.isArray(students) ? students.filter(s =>
    `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(s.studentId || "").toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="bg-white dark:bg-slate-900 px-8 py-5 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-5 transition-colors">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center">
            <Users className="text-emerald-500 w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 tracking-widest mb-0.5">Total Students</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-none">{students.length}</h2>
          </div>
        </div>

        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search student records..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[28px] text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm dark:text-slate-200"
          />
        </div>

        <button
          onClick={() => {
            setPopupMode("add");
            setSelectedStudent(null);
            setIsPopupOpen(true);
          }}
          className="px-10 py-5 bg-emerald-500 text-white rounded-[28px] font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 whitespace-nowrap"
        >
          <Plus size={22} /> Add Student
        </button>
      </div>

      {/* Table Card */}
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
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-24">
                    <Loading text="Accessing Student Vault..." fullScreen={false} />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-32">
                    <div className="flex flex-col items-center justify-center text-red-500">
                      <AlertCircle className="w-10 h-10 mb-4" />
                      <p className="text-sm font-bold tracking-widest">{error}</p>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
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
                      <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black tracking-widest text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700 whitespace-nowrap">
                        Grade {s.studentClass}
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

        {/* Footer Section - Compact sizing */}
        <div className="w-full px-8 py-5 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-50 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
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
      </div>

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