import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Lock,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  GraduationCap,
  User,
  ShieldCheck,
  Hash,
  ChevronRight,
  Info,
  X,
  CreditCard as CardIcon,
  Search,
  Wallet
} from 'lucide-react';
import { toast } from '../MainSystemComponents/Toast';
import PortalPopup from '../MainSystemComponents/PortalPopup';
import feeService from '../Api/feeService';
import studentService from '../Api/studentService';
import { getNepaliDateInfo } from '../Utils/nepaliDateHelpers';

const NEPALI_MONTHS = [
  "Baishakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

const SFeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [detailFee, setDetailFee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(10); // Default Falgun
  const [studentInfo, setStudentInfo] = useState({
    name: localStorage.getItem("userName") || "Student",
    class: "Grade",
    studentId: localStorage.getItem("studentId") || "STU-000",
    academicYear: "2081/82",
    avatarUrl: localStorage.getItem("userPhoto") || null
  });

  useEffect(() => {
    fetchMyFees();
    try {
      const today = new Date();
      const { month } = getNepaliDateInfo(today);
      if (month) setCurrentMonthIndex(month - 1);
    } catch (e) {
      console.log("Failed to parse Date:", e);
    }
  }, []);

  const fetchMyFees = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Student Details first for the header
      const studentId = localStorage.getItem("studentId");
      if (studentId) {
        try {
          const sData = await studentService.getStudentById(studentId);
          setStudentInfo(prev => ({
            ...prev,
            name: `${sData.firstName} ${sData.lastName}`,
            class: sData.classId?.gradeName || `Grade ${sData.studentClass || ''}`,
            studentId: sData.studentId || prev.studentId,
            avatarUrl: sData.profilePhoto || prev.avatarUrl
          }));
        } catch (sErr) {
          console.error("Failed to fetch student profile", sErr);
        }
      }

      // 2. Fetch Fees
      const data = await feeService.getMyFees();
      setFees(data);

      if (data.length > 0) {
        setStudentInfo(prev => ({
          ...prev,
          academicYear: data[0].academicYear
        }));
      }
    } catch (error) {
      toast({ type: 'error', message: 'Failed to fetch your fee records.' });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Derived State ---
  const selectedFees = useMemo(() =>
    fees.filter((f, idx) => selectedIndexes.includes(idx)),
    [fees, selectedIndexes]);

  const subTotal = useMemo(() =>
    selectedFees.reduce((sum, f) => sum + f.dueAmount, 0),
    [selectedFees]);

  const totalDueSummary = useMemo(() =>
    fees.filter(f => f.status !== 'PAID').reduce((sum, f) => sum + f.dueAmount, 0),
    [fees]);

  const getFeeTagDetails = (feeMonthStr, isPaid, isSelected) => {
    if (isPaid) return { label: 'Paid', styling: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };

    let label = 'Due';
    let styling = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';

    const feeMonthIndex = NEPALI_MONTHS.indexOf(feeMonthStr);
    if (feeMonthIndex !== -1) {
      const diff = feeMonthIndex - currentMonthIndex;
      if (diff === 1) {
        label = 'Next Due';
      } else if (diff === -1 || diff === -2) {
        label = 'Overdue';
        styling = 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-sm shadow-amber-500/10';
      } else if (diff <= -3) {
        label = 'Past Due';
        styling = 'bg-red-500/10 text-red-500 border-red-500/20 shadow-sm shadow-red-500/10';
      }
    }

    if (isSelected) {
      styling = 'bg-white/20 text-white border-white/30 shadow-none text-white';
    }

    return { label, styling };
  };

  // --- Handlers ---
  const toggleSelection = (index) => {
    const fee = fees[index];
    if (fee.status === 'PAID') return;

    setSelectedIndexes(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handlePay = () => {
    if (selectedIndexes.length === 0) return;
    setIsConfirmModalOpen(true);
  };

  const confirmPayment = async () => {
    try {
      toast({ type: 'info', message: 'Processing payment simulation...' });

      // In a real MERN app, this would redirect to E-Sewa or Khalti
      // For this task, we'll simulate successful bulk payment

      // Since we don't have a bulk-pay endpoint yet, we'll pay one by one (demo only)
      // In reality, one request would handle all selected months

      for (const idx of selectedIndexes) {
        const f = fees[idx];
        await feeService.markAsPaid(f._id, {
          paidAmount: f.dueAmount,
          paymentMethod: "ONLINE",
          paymentDate: new Date()
        });
      }

      setSelectedIndexes([]);
      setIsConfirmModalOpen(false);
      toast({ type: 'success', message: 'Digital payment settled successfully.' });
      fetchMyFees();
    } catch (error) {
      toast({ type: 'error', message: error.response?.data?.message || 'Payment settlement failed.' });
    }
  };

  const downloadMockReceipt = (fee) => {
    const target = fee || selectedFees[0];
    if (!target) return;

    toast({ type: 'info', message: `Generating receipt for ${target.monthName}...` });
    setTimeout(() => {
      toast({ type: 'success', message: `Receipt downloaded: REC-${target.monthName.tocapitalize()}.pdf` });
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32 pt-2">



      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 items-start">

        {/* 12 Month Grid */}
        <div className="xl:col-span-2 space-y-10">

          {fees.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {fees.map((fee, idx) => {
                const isSelected = selectedIndexes.includes(idx);
                const isPaid = fee.status === 'PAID';
                const isOverdue = fee.status === 'OVERDUE';

                return (
                  <div
                    key={fee._id}
                    onClick={() => !isPaid && toggleSelection(idx)}
                    className={`
                      group relative p-6 rounded-[32px] border transition-all duration-300 select-none cursor-pointer
                      ${isPaid ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 opacity-60' : ''}
                      ${isSelected ? 'bg-emerald-600 shadow-2xl shadow-emerald-600/30 border-emerald-400 scale-[1.03] text-white' : ''}
                      ${!isPaid && !isSelected ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-emerald-500/40 hover:translate-y-[-4px]' : ''}
                    `}
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-lg font-black tracking-tighter capitalize ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                          {fee.monthName}
                        </h4>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailFee(fee);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-500'}`}
                          >
                            <Info size={16} />
                          </button>
                          {isPaid && <CheckCircle2 size={16} className="text-emerald-500" />}
                        </div>
                      </div>

                      <div>
                        <p className={`text-[10px] font-black tracking-widest mb-1 ${isSelected ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500 capitalize'}`}>DUE AMOUNT</p>
                        <p className={`text-2xl font-black tabular-nums ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                          Rs. {fee.dueAmount.toLocaleString()}
                        </p>
                      </div>

                      {(() => {
                        const tag = getFeeTagDetails(fee.monthName, isPaid, isSelected);
                        if (!tag) return null;
                        return (
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black tracking-widest w-fit capitalize transition-colors ${tag.styling}`}>
                            {tag.label}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-24 bg-white dark:bg-slate-900 rounded-[48px] border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center px-10">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6">
                <Wallet size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">No Fee Records Found</h3>
              <p className="max-w-md text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                We couldn't find any digital fee records for the current academic year. Please contact the accounts department to generate your ledger.
              </p>
            </div>
          )}
        </div>

        {/* Checkout Panel */}
        <div className="sticky top-28 space-y-8">
          {/* Student Mini Card */}
          <div className="bg-white dark:bg-slate-900 px-6 py-5 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-xl flex items-center justify-between gap-4 transition-colors overflow-hidden">
            <div className="flex items-center gap-4 border-r border-slate-100 dark:border-slate-800 pr-5 min-w-fit">
              <div className="w-11 h-11 rounded-xl flex-shrink-0 bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner overflow-hidden">
                {studentInfo.avatarUrl ? (
                  <img src={studentInfo.avatarUrl} alt={studentInfo.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div className="min-w-fit">
                <p className="text-[10px] font-black text-slate-500 tracking-widest leading-none mb-1.5 whitespace-nowrap">Authenticated</p>
                <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none capitalize tracking-widest whitespace-nowrap">{studentInfo.name}</h3>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center">
              <div className="flex flex-col gap-2 justify-center items-start">
                <div className="flex items-center gap-2">
                  <GraduationCap size={14} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest capitalize whitespace-nowrap">{studentInfo.class}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash size={14} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest capitalize whitespace-nowrap">{studentInfo.studentId}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[44px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden p-10 flex flex-col gap-6 transition-colors">

            <div className="flex-1 space-y-6 flex flex-col min-h-0">
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 shadow-inner">
                  <ShieldCheck size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight capitalize leading-none">Invoice</h4>
                  <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-1">Select Months To Pay</p>
                </div>
              </div>

              <div className="h-[220px] flex flex-col">
                {selectedFees.length > 0 ? (
                  <div className="space-y-2 overflow-y-auto pr-2 scrollbar-hide flex-1">
                    {selectedFees.map(f => (
                      <div key={f._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group animate-in slide-in-from-right-2">
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 tracking-widest capitalize">{f.monthName}</span>
                          {(() => {
                            const tag = getFeeTagDetails(f.monthName, false, false);
                            if (!tag) return null;
                            return (
                              <span className={`px-2 py-0.5 rounded-lg border text-[8px] font-black tracking-widest capitalize transition-colors ${tag.styling}`}>
                                {tag.label}
                              </span>
                            );
                          })()}
                        </div>
                        <span className="text-xs font-black text-slate-900 dark:text-white">Rs. {f.dueAmount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800/40 rounded-[32px] gap-4 opacity-40">
                    <CardIcon size={32} />
                    <p className="text-[9px] font-black text-slate-400 tracking-widest capitalize">Cart Is Empty</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-400 tracking-widest capitalize opacity-70">Subtotal</span>
                <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">Rs. {subTotal.toLocaleString()}</span>
              </div>
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between">
                <div>
                  <p className="text-[11px] font-black text-emerald-500 tracking-widest capitalize mb-1">Total Payable</p>
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums text-right">Rs. {subTotal.toLocaleString()}</h2>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handlePay}
                disabled={selectedIndexes.length === 0}
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white rounded-[24px] font-black text-xs tracking-widest shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 capitalize"
              >
                Checkout Now <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Pending Banner */}
          <div className="p-8 bg-white dark:bg-emerald-600 rounded-[36px] flex items-center justify-between shadow-xl border border-slate-100 dark:border-emerald-500 relative overflow-hidden group transition-colors">
            <div className="relative z-10">
              <p className="text-[9px] font-black text-slate-400 dark:text-emerald-100/80 tracking-widest capitalize mb-1.5">Academic Year Total Dues</p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">Rs. {totalDueSummary.toLocaleString()}</h4>
            </div>
            <div className="w-12 h-12 bg-slate-50 dark:bg-white/10 rounded-2xl flex items-center justify-center text-slate-400 dark:text-white relative z-10 border border-slate-100 dark:border-white/10 shadow-inner">
              <AlertCircle size={24} />
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] dark:opacity-[0.08] pointer-events-none group-hover:scale-110 transition-transform duration-700 text-slate-900 dark:text-white">
              <CardIcon size={120} />
            </div>
          </div>
        </div>
      </div>

      {/* Fee Detail Modal */}
      <PortalPopup isOpen={!!detailFee} onClose={() => setDetailFee(null)}>
        <div className="bg-white dark:bg-slate-900 w-[95vw] max-w-lg rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col pointer-events-auto">
          <div className="p-8 lg:p-10 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                <Info size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter capitalize">{detailFee?.monthName} Invoice</h3>
            </div>
            <button onClick={() => setDetailFee(null)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors"><X /></button>
          </div>

          <div className="p-10 space-y-4">
            <div className="flex justify-between p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 tracking-widest capitalize">Tuition Fee</span>
              <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">Rs. {detailFee?.baseFee}</span>
            </div>
            {detailFee?.admissionFee > 0 && (
              <div className="flex justify-between p-5 bg-emerald-50/40 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/20">
                <span className="text-xs font-bold text-emerald-600 tracking-widest capitalize">Admission</span>
                <span className="text-xs font-black text-emerald-600 tabular-nums">+ Rs. {detailFee.admissionFee}</span>
              </div>
            )}
            {detailFee?.extraFees?.map((ex, i) => (
              <div key={i} className="flex justify-between p-5 bg-blue-50/40 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/20 group">
                <span className="text-xs font-bold text-blue-500 tracking-widest capitalize">{ex.title}</span>
                <span className="text-xs font-black text-blue-500 tabular-nums">+ Rs. {ex.amount}</span>
              </div>
            ))}

            <div className="pt-8 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 tracking-widest capitalize mb-1.5 opacity-60">Grand Total Month</p>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">Rs. {detailFee?.totalAmount.toLocaleString()}</h2>
              </div>
              {detailFee?.status === 'PAID' && (
                <button onClick={() => downloadMockReceipt(detailFee)} className="px-6 py-3 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl text-[10px] font-black tracking-widest capitalize shadow-lg active:scale-95 transition-all">Receipt</button>
              )}
            </div>
          </div>

          <div className="p-10 pt-0">
            <button onClick={() => setDetailFee(null)} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 font-black text-[11px] capitalize tracking-widest rounded-2xl">Return To Ledger</button>
          </div>
        </div>
      </PortalPopup>

      {/* Payment Confirmation Modal */}
      <PortalPopup isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)}>
        <div className="bg-white dark:bg-slate-900 w-[95vw] max-w-xl rounded-[44px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden pointer-events-auto">
          <div className="p-10 space-y-8 text-center">
            <div className="w-20 h-20 bg-emerald-600 rounded-[30px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-emerald-500/40 animate-bounce">
              <ShieldCheck size={36} />
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Confirm Transaction</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed px-10">
                You are about to pay <span className="text-slate-900 dark:text-white font-black">Rs.{subTotal.toLocaleString()}</span> for <span className="text-emerald-500 font-black">{selectedIndexes.length} Months</span>.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="py-5 text-[11px] font-black tracking-widest text-slate-400 hover:bg-slate-50 rounded-3xl transition-all capitalize"
              >
                Cancel
              </button>
              <button
                onClick={confirmPayment}
                className="py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-3xl font-black text-xs tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 capitalize"
              >
                Confirm & Pay
              </button>
            </div>
          </div>
        </div>
      </PortalPopup>
    </div>
  );
};

export default SFeeManagement;