import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  Save,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  X,
  Tag,
  RefreshCcw,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../MainSystemComponents/Toast';
import schoolService from '../Api/schoolService';
import gradeService from '../Api/gradeService';
import feeService from '../Api/feeService';
import studentService from '../Api/studentService';
import PortalPopup from '../MainSystemComponents/PortalPopup';

const NEPALI_MONTHS = [
  'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

const Fee = () => {
  const navigate = useNavigate();
  const [feeConfig, setFeeConfig] = useState({});
  const [grades, setGrades] = useState([]);
  const [admissionFee, setAdmissionFee] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const [feesData, setFeesData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [isExtraFeeModalOpen, setIsExtraFeeModalOpen] = useState(false);
  const [selectedFeeRecord, setSelectedFeeRecord] = useState(null);
  const [extraFees, setExtraFees] = useState([{ title: '', amount: '' }]);

  const itemsPerPage = 8;
  const currentAcademicYear = "2081/82"; // Should be dynamic in real app

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchFeeStatus();
  }, [currentPage, filterStatus, searchQuery]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [schoolData, gradesData] = await Promise.all([
        schoolService.getSchool(),
        gradeService.getGrades()
      ]);

      setAdmissionFee(String(schoolData.admissionFee || 0));
      setGrades(gradesData);

      const config = {};
      gradesData.forEach(grade => {
        config[`Grade ${grade.gradeNumber}`] = String(grade.monthlyFee || 0);
      });
      setFeeConfig(config);
    } catch (error) {
      console.error(error);
      toast({ type: 'error', message: 'Failed to fetch school fee structure.' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeeStatus = async () => {
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        academicYear: currentAcademicYear,
        search: searchQuery
      };

      if (filterStatus !== 'All') params.status = filterStatus.toUpperCase();

      const response = await feeService.getAdminFeeStatus(params);
      setFeesData(response.fees);
      setTotalPages(response.pages);
      setTotalRecords(response.total);

    } catch (error) {
      console.error(error);
    }
  };

  const handleFeeChange = (key, value) => {
    const sanitizedValue = value.replace(/^0+(?!$)/, '');
    if (key === 'Admission') {
      setAdmissionFee(sanitizedValue);
    } else {
      setFeeConfig(prev => ({ ...prev, [key]: sanitizedValue }));
    }
  };

  const handleSaveFees = async () => {
    try {
      setIsLoading(true);
      await schoolService.updateSchool({ admissionFee: parseFloat(admissionFee) || 0 });
      const updatePromises = grades.map(grade => {
        const fee = parseFloat(feeConfig[`Grade ${grade.gradeNumber}`]) || 0;
        return gradeService.updateGradeFee(grade.gradeNumber, fee);
      });
      await Promise.all(updatePromises);
      toast({ type: 'success', message: 'Fee structure updated successfully.' });
      fetchInitialData();
    } catch (error) {
      toast({ type: 'error', message: 'Failed to update fee structure.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFees = async () => {
    try {
      setIsSyncing(true);
      toast({ type: 'info', message: 'Bulk generation is not yet available for all students. Redirecting to student ledger is recommended.' });
      await fetchFeeStatus();
    } catch (error) {
      toast({ type: 'error', message: 'Sync failed.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenExtraFeeModal = (feeRecord) => {
    if (!feeRecord.recordId) {
      toast({ type: 'error', message: 'No fee record found for this student. Please generate it from their profile first.' });
      return;
    }
    setSelectedFeeRecord({ ...feeRecord, _id: feeRecord.recordId }); // Use recordId for backend API
    setExtraFees([{ title: '', amount: '' }]);
    setIsExtraFeeModalOpen(true);
  };

  const handleAddExtraFeeRow = () => {
    setExtraFees([...extraFees, { title: '', amount: '' }]);
  };

  const handleRemoveExtraFeeRow = (index) => {
    if (extraFees.length > 1) {
      setExtraFees(extraFees.filter((_, i) => i !== index));
    } else {
      setExtraFees([{ title: '', amount: '' }]);
    }
  };

  const handleExtraFeeChange = (index, field, value) => {
    const updatedFees = [...extraFees];
    updatedFees[index][field] = value;
    setExtraFees(updatedFees);
  };

  const handleSaveExtraFees = async () => {
    try {
      const validFees = extraFees.filter(f => f.title.trim() && f.amount);
      if (validFees.length === 0) {
        toast({ type: 'error', message: 'Please add at least one fee item.' });
        return;
      }

      for (const fee of validFees) {
        await feeService.addExtraFee(selectedFeeRecord._id, fee.title, fee.amount);
      }

      toast({ type: 'success', message: `Extra fees added successfully.` });
      setIsExtraFeeModalOpen(false);
      fetchFeeStatus();
    } catch (error) {
      toast({ type: 'error', message: 'Failed to add extra fees.' });
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PAID: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100",
      PARTIAL: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-100",
      UNPAID: "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200",
      OVERDUE: "bg-red-50 dark:bg-red-900/20 text-red-600 border-red-100",
      NO_RECORD: "bg-slate-200 dark:bg-slate-700 text-slate-400 border-slate-300"
    };

    const Icon = status === 'PAID' ? CheckCircle2 : status === 'OVERDUE' ? AlertCircle : XCircle;

    return (
      <div className={`flex items-center gap-2 w-fit px-4 py-1.5 rounded-xl border ${styles[status] || styles.UNPAID}`}>
        <Icon size={12} />
        <span className="text-[10px] font-black uppercase tracking-widest leading-none">{status === 'NO_RECORD' ? 'No Ledger' : status}</span>
      </div>
    );
  };

  const displayFees = feesData;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-8 lg:p-10 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <CreditCard size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Fee Configuration</h2>
              <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] mt-3 opacity-60">Global Admission & Grade Fees</p>
            </div>
          </div>

          <button
            onClick={handleGenerateFees}
            disabled={isSyncing}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-[10px] tracking-widest hover:scale-105 transition-all disabled:opacity-50"
          >
            {isSyncing ? <RefreshCcw size={14} className="animate-spin" /> : <Zap size={14} />}
            GENERATE STUDENT RECORDS
          </button>
        </div>

        <div className="p-10 space-y-10">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 tracking-[0.2em] ml-1 opacity-70">Admission Fee</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rs.</span>
                  <input
                    type="number"
                    value={admissionFee}
                    onChange={(e) => handleFeeChange('Admission', e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-base font-bold dark:text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {grades.map((grade) => (
                <div key={grade._id} className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 tracking-[0.2em] ml-1 opacity-70">Grade {grade.gradeNumber} Fee</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rs.</span>
                    <input
                      type="number"
                      value={feeConfig[`Grade ${grade.gradeNumber}`] || 0}
                      onChange={(e) => handleFeeChange(`Grade ${grade.gradeNumber}`, e.target.value)}
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-6 border-t border-slate-50 dark:border-slate-800">
            <button
              onClick={handleSaveFees}
              className="flex items-center gap-3 px-12 py-5 bg-emerald-600 text-white rounded-[24px] font-black text-xs  tracking-[0.2em] shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Save size={18} /> Update Fee Structure
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4 px-4">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Fee Status Tracking</h3>
          <div className="px-4 py-1.5 bg-emerald-500/10 rounded-xl text-[10px] font-black text-emerald-500 tracking-[0.2em]">
            {totalRecords} Total Records
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="lg:col-span-8 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search Student By Name Or Id..."
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
              className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border border-transparent focus:ring-4 focus:ring-emerald-500/10 text-[11px] font-black text-slate-600 dark:text-slate-300 rounded-[24px] pl-16 pr-12 py-5 outline-none cursor-pointer transition-all shadow-inner tracking-[0.2em]"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Overdue">Overdue</option>
            </select>
            <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[1000px] text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="pl-12 pr-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">STUDENT</th>
                  <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">FEE MONTHS</th>
                  <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">DUE AMOUNT</th>
                  <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">STATUS</th>
                  <th className="pr-12 pl-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {displayFees.map((record) => (
                  <tr
                    key={record._id?.toString() || record.student?._id}
                    onClick={() => navigate(`/admin/fee/student/${record.student?._id}`)}
                    className="group hover:bg-emerald-50/20 dark:hover:bg-emerald-900/10 transition-colors cursor-pointer"
                  >
                    <td className="pl-12 pr-6 py-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={record.student?.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${record.student?.firstName}`}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover shadow-sm bg-slate-100 dark:bg-slate-700"
                        />
                        <div>
                          <span className="text-sm font-black text-slate-900 dark:text-white block">{record.student?.firstName} {record.student?.lastName}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{record.student?.studentId}</span>
                            {record.grade && (
                              <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">Grade {record.grade?.gradeNumber}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      {record.totalMonths > 0 ? (
                        <>
                          <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                            {record.unpaidCount > 0 ? `${record.unpaidCount} month${record.unpaidCount > 1 ? 's' : ''} unpaid` : 'All paid'}
                          </span>
                          <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mt-1">{record.totalMonths}/12 months generated</p>
                        </>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 italic">No ledger yet</span>
                      )}
                    </td>
                    <td className="px-6 py-6">
                      {record.status === 'NO_RECORD' ? (
                        <span className="text-xs text-slate-400 italic">—</span>
                      ) : (
                        <>
                          <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">Rs. {record.dueAmount?.toLocaleString()}</span>
                          {record.paidAmount > 0 && (
                            <p className="text-[10px] font-bold text-emerald-500 mt-1">Paid: Rs. {record.paidAmount?.toLocaleString()}</p>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex justify-center">
                        {getStatusBadge(record.status)}
                      </div>
                    </td>
                    <td className="pr-12 pl-6 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenExtraFeeModal(record);
                          }}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm group/btn"
                          title="Add Extra Fee"
                        >
                          <Plus size={18} className="group-hover/btn:rotate-90 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {displayFees.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <CreditCard size={48} />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No students found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="w-full px-8 py-5 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-50 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
              Showing {displayFees.length} of {totalRecords} Records
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500 transition-all shadow-sm active:scale-90 disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="w-10 h-10 flex items-center justify-center rounded-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-emerald-500 transition-all shadow-sm active:scale-90 disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Extra Fee Modal */}
      <PortalPopup isOpen={isExtraFeeModalOpen} onClose={() => setIsExtraFeeModalOpen(false)}>
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 pointer-events-auto">
          <div className="p-6 lg:p-7 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Plus size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Add Extra Fees</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
                  {selectedFeeRecord?.monthName} - {selectedFeeRecord?.student?.firstName}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsExtraFeeModalOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-red-500 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-10 space-y-6 max-h-[50vh] overflow-y-auto scrollbar-hide">
            {extraFees.map((fee, index) => (
              <div key={index} className="flex items-end gap-3 group animate-in slide-in-from-top-2 duration-300">
                <div className="flex-1 space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fee Description</label>
                  <input
                    type="text"
                    placeholder="Exam Fee, Library Fine, etc."
                    value={fee.title}
                    onChange={(e) => handleExtraFeeChange(index, 'title', e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold dark:text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>
                <div className="w-28 space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={fee.amount}
                    onChange={(e) => handleExtraFeeChange(index, 'amount', e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold dark:text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  />
                </div>
                <button
                  onClick={() => handleRemoveExtraFeeRow(index)}
                  className="mb-1 w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}

            <button
              onClick={handleAddExtraFeeRow}
              className="w-full py-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-3 text-slate-400 hover:text-emerald-500 hover:border-emerald-500/30 transition-all"
            >
              <Plus size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Add Another Row</span>
            </button>
          </div>

          <div className="p-10 border-t border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex gap-4">
            <button
              onClick={() => setIsExtraFeeModalOpen(false)}
              className="px-8 py-5 text-[10px] font-black tracking-widest text-slate-400 hover:text-slate-600 uppercase"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveExtraFees}
              className="flex-1 py-5 bg-emerald-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Add Fees To Record
            </button>
          </div>
        </div>
      </PortalPopup>
    </div>
  );
};

export default Fee;