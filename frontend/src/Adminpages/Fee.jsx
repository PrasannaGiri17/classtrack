import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Save,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MoreVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../MainSystemComponents/Toast';
import schoolService from '../Api/schoolService';
import gradeService from '../Api/gradeService';

const INITIAL_FEES = {
  'Admission': 500,
  'Grade 1': 150,
  'Grade 2': 160,
  'Grade 3': 170,
  'Grade 4': 180,
  'Grade 5': 190,
  'Grade 6': 200,
  'Grade 7': 210,
  'Grade 8': 220,
  'Grade 9': 230,
  'Grade 10': 250,
};

const INITIAL_STUDENTS = [
  { id: '1', studentId: 'RM2024-001', name: 'Cristiano Ronaldo', contact: '+34 600 000 001', status: 'Paid', amount: 250 },
  { id: '2', studentId: 'RM2024-002', name: 'Luka Modric', contact: '+34 600 000 002', status: 'Overdue', amount: 250 },
  { id: '3', studentId: 'RM2024-003', name: 'Vinicius Junior', contact: '+34 600 000 003', status: 'Unpaid', amount: 230 },
  { id: '4', studentId: 'RM2024-004', name: 'Jude Bellingham', contact: '+34 600 000 004', status: 'Paid', amount: 250 },
  { id: '5', studentId: 'RM2024-005', name: 'Federico Valverde', contact: '+34 600 000 005', status: 'Paid', amount: 250 },
  { id: '6', studentId: 'RM2024-006', name: 'Dani Carvajal', contact: '+34 600 000 006', status: 'Overdue', amount: 250 },
  { id: '7', studentId: 'RM2024-007', name: 'Rodrygo Goes', contact: '+34 600 000 007', status: 'Unpaid', amount: 230 },
  { id: '8', studentId: 'RM2024-008', name: 'Kylian Mbappe', contact: '+34 600 000 008', status: 'Paid', amount: 250 },
  { id: '9', studentId: 'RM2024-009', name: 'Eduardo Camavinga', contact: '+34 600 000 009', status: 'Unpaid', amount: 210 },
  { id: '10', studentId: 'RM2024-010', name: 'Arda Guler', contact: '+34 600 000 010', status: 'Paid', amount: 190 },
];

const Fee = () => {
  const navigate = useNavigate();
  const [feeConfig, setFeeConfig] = useState({});
  const [grades, setGrades] = useState([]);
  const [admissionFee, setAdmissionFee] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setIsLoading(true);
      const schoolData = await schoolService.getSchool();
      const gradesData = await gradeService.getGrades();

      setAdmissionFee(String(schoolData.admissionFee || 0));
      setGrades(gradesData);

      const config = {};
      gradesData.forEach(grade => {
        config[`Grade ${grade.gradeNumber}`] = String(grade.monthlyFee || 0);
      });
      setFeeConfig(config);
    } catch (error) {
      toast({
        type: 'error',
        message: 'Failed to fetch fee structure.',
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeeChange = (key, value) => {
    // Remove leading zeros but allow "0"
    const sanitizedValue = value.replace(/^0+(?!$)/, '');

    if (key === 'Admission') {
      setAdmissionFee(sanitizedValue);
    } else {
      setFeeConfig(prev => ({ ...prev, [key]: sanitizedValue }));
    }
  };

  const handleSaveFees = async () => {
    try {
      // 1. Save Admission Fee
      await schoolService.updateSchool({ admissionFee: parseFloat(admissionFee) || 0 });

      // 2. Save Grade Fees
      const updatePromises = grades.map(grade => {
        const fee = parseFloat(feeConfig[`Grade ${grade.gradeNumber}`]) || 0;
        return gradeService.updateGradeFee(grade.gradeNumber, fee);
      });

      await Promise.all(updatePromises);

      toast({
        type: 'success',
        message: 'School fee structure updated successfully.',
        duration: 3000
      });

      fetchFees(); // Refresh data
    } catch (error) {
      toast({
        type: 'error',
        message: 'Failed to update fee structure.',
        duration: 3000
      });
    }
  };

  const filteredStudents = INITIAL_STUDENTS.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || student.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const currentItems = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <div className="flex items-center gap-2 w-fit px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
            <CheckCircle2 size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">Paid</span>
          </div>
        );
      case 'Overdue':
        return (
          <div className="flex items-center gap-2 w-fit px-4 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-800/50">
            <AlertCircle size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">Overdue</span>
          </div>
        );
      case 'Unpaid':
        return (
          <div className="flex items-center gap-2 w-fit px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700">
            <XCircle size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">Unpaid</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-8 lg:p-10 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <CreditCard size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Set School Fees</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Configure universal pricing structure</p>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-10">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Admission Fee </label>
                <input
                  type="number"
                  value={admissionFee}
                  onChange={(e) => handleFeeChange('Admission', e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-base font-bold dark:text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner"
                />
              </div>

              {grades.map((grade) => (
                <div key={grade._id} className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade {grade.gradeNumber} Fee</label>
                  <input
                    type="number"
                    value={feeConfig[`Grade ${grade.gradeNumber}`] || 0}
                    onChange={(e) => handleFeeChange(`Grade ${grade.gradeNumber}`, e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-6 border-t border-slate-50 dark:border-slate-800">
            <button
              onClick={handleSaveFees}
              className="flex items-center gap-3 px-12 py-4 bg-emerald-600 text-white rounded-[20px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Save size={18} /> Save Fee Structure
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Student Fee Status</h3>
            <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {filteredStudents.length} Records Found
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="lg:col-span-8 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search student by name or ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-800 border border-transparent focus:ring-4 focus:ring-emerald-500/10 text-sm font-bold text-slate-900 dark:text-white rounded-[24px] outline-none transition-all shadow-inner"
            />
          </div>

          <div className="lg:col-span-4 relative group">
            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border border-transparent focus:ring-4 focus:ring-emerald-500/10 text-[11px] font-black text-slate-600 dark:text-slate-300 rounded-[24px] pl-16 pr-12 py-5 outline-none cursor-pointer transition-all shadow-inner uppercase tracking-widest"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid Only</option>
              <option value="Unpaid">Unpaid Only</option>
              <option value="Overdue">Overdue Only</option>
            </select>
            <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="pl-12 pr-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student ID</th>
                  <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                  <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</th>
                  <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Fee Status</th>
                  <th className="pr-12 pl-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {currentItems.map((student) => (
                  <tr key={student.id} className="group hover:bg-emerald-50/20 dark:hover:bg-emerald-900/10 transition-colors">
                    <td className="pl-12 pr-6 py-6">
                      <span className="text-xs font-black text-slate-400">{student.studentId}</span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-black text-xs">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{student.contact}</span>
                    </td>
                    <td className="px-6 py-6 flex justify-center">
                      {getStatusBadge(student.status)}
                    </td>
                    <td className="pr-12 pl-6 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/fee/student/${student.studentId}`)}
                          className="px-4 py-2 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                        >
                          <Eye size={14} /> View Fee
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-500 transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <CreditCard size={48} />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No fee records found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="w-full px-8 py-5 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-50 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
              Record {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500 transition-all shadow-sm active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="w-10 h-10 flex items-center justify-center rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500 transition-all shadow-sm active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fee;