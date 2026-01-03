import React, { useState } from "react";
import { Users, Search, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { AddPopupStudent } from "../AdminComponents/Admin/AddPopupStudent";

const initialStudents = [
  { _id: "1", studentId: "2024001", firstName: "Cristiano", lastName: "Ronaldo", email: "cr7@madrid.edu", studentClass: "10", flag: "green" },
  { _id: "2", studentId: "2024002", firstName: "Luka", lastName: "Modric", email: "luka.m@madrid.edu", studentClass: "10", flag: "yellow" },
  { _id: "3", studentId: "2024003", firstName: "Vinicius", lastName: "Junior", email: "vini.jr@madrid.edu", studentClass: "9", flag: "red" },
  { _id: "4", studentId: "2024004", firstName: "Jude", lastName: "Bellingham", email: "jude.b@madrid.edu", studentClass: "11", flag: "green" },
  { _id: "5", studentId: "2024005", firstName: "Federico", lastName: "Valverde", email: "fede.v@madrid.edu", studentClass: "11", flag: "green" },
  { _id: "6", studentId: "2024006", firstName: "Thibaut", lastName: "Courtois", email: "thibaut.c@madrid.edu", studentClass: "12", flag: "yellow" },
  { _id: "7", studentId: "2024007", firstName: "Eduardo", lastName: "Camavinga", email: "edu.c@madrid.edu", studentClass: "9", flag: "red" },
  { _id: "8", studentId: "2024008", firstName: "Rodrygo", lastName: "Goes", email: "rodrygo.g@madrid.edu", studentClass: "10", flag: "green" },
  { _id: "9", studentId: "2024009", firstName: "Antonio", lastName: "Rudiger", email: "toni.r@madrid.edu", studentClass: "12", flag: "red" },
  { _id: "10", studentId: "2024010", firstName: "Dani", lastName: "Carvajal", email: "dani.c@madrid.edu", studentClass: "12", flag: "green" },
  { _id: "11", studentId: "2024011", firstName: "David", lastName: "Alaba", email: "david.a@madrid.edu", studentClass: "11", flag: "yellow" },
  { _id: "12", studentId: "2024012", firstName: "Eder", lastName: "Militao", email: "eder.m@madrid.edu", studentClass: "10", flag: "green" },
];

const StudentRecord = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState(initialStudents);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const getFlagColor = (flag) => {
    switch (flag) {
      case "red": return "bg-red-500 shadow-red-500/20 ring-red-500/10";
      case "yellow": return "bg-yellow-500 shadow-yellow-500/20 ring-yellow-500/10";
      case "green": return "bg-[#22c55e] shadow-emerald-500/20 ring-emerald-500/10";
      default: return "bg-gray-400 shadow-gray-400/20 ring-gray-400/10";
    }
  };

  const filtered = students.filter(s => 
    `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(s.studentId || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = (id) => {
    if (!window.confirm("Delete student record?")) return;
    setStudents(prev => prev.filter(s => s._id !== id));
    if (currentItems.length === 1 && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Students</p>
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
          onClick={() => setIsPopupOpen(true)}
          className="px-10 py-5 bg-emerald-500 text-white rounded-[28px] font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 whitespace-nowrap"
        >
          <Plus size={22} /> ADD STUDENT
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors h-auto">
        <div className="w-full overflow-x-auto scrollbar-hide">
          <table className="w-full min-w-[800px] table-auto text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                <th className="pl-12 pr-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Details</th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade</th>
                <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Flag</th>
                <th className="pr-12 pl-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {currentItems.length > 0 ? (
                currentItems.map((s) => (
                  <tr key={s._id} className="group hover:bg-emerald-50/30 dark:hover:bg-emerald-900/5 transition-all">
                    <td className="pl-12 pr-6 py-6 font-bold text-slate-400 text-xs">{s.studentId}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/20 flex items-center justify-center text-emerald-600 font-black text-xs shadow-inner shrink-0">
                          {s.firstName?.[0]}{s.lastName?.[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 dark:text-white leading-tight truncate">{s.firstName} {s.lastName}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider truncate">{s.email || 'Student Record'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700 whitespace-nowrap">
                        Grade {s.studentClass}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className={`mx-auto w-4 h-4 rounded-md ring-4 shadow-lg transition-transform hover:scale-110 ${getFlagColor(s.flag)}`} />
                    </td>
                    <td className="pr-12 pl-6 py-6 text-center">
                      <div className="flex items-center justify-center transition-all">
                        <button 
                          onClick={() => handleDelete(s._id)} 
                          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
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
                  <td colSpan={5} className="py-32 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No student records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Section - Compact sizing */}
        <div className="w-full px-8 py-5 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-50 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Record {currentPage} of {totalPages}</p>
          <div className="flex items-center gap-3">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p-1))}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500 transition-all shadow-sm active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500 transition-all shadow-sm active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <AddPopupStudent 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
        onSuccess={() => {}} 
      />
    </div>
  );
};

export default StudentRecord;