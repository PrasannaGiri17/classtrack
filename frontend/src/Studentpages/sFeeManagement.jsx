import React, { useState, useMemo } from 'react';
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
  Plus
} from 'lucide-react';
import { toast } from '../MainSystemComponents/Toast';
import PortalPopup from '../MainSystemComponents/PortalPopup';

// --- Nepali Months ---
const NEPALI_MONTHS = [
  "Baisakh", "Jestha", "Ashad", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangshir", "Poush", "Magh", "Falgun", "Chaitra"
];

// --- Mock Data ---
const MOCK_STUDENT = {
  id: 's1',
  name: 'Cristiano Ronaldo',
  class: 'Grade 10',
  section: 'A',
  roll: '07',
  academicYear: '2081/82',
  totalDue: 0
};

const INITIAL_FEES = NEPALI_MONTHS.map((name, index) => {
  let status = 'DUE';
  if (index < 3) status = 'PAID';
  else if (index === 3 || index === 4) status = 'OVERDUE';

  // Custom breakdown for Shrawan as requested
  const breakdown = [
    { label: 'Monthly Tuition Fee', amount: 2500 }
  ];

  if (name === 'Shrawan') {
    breakdown.push({ label: 'Haircut Service', amount: 100 });
    breakdown.push({ label: 'Property Damage Fine', amount: 1000 });
  }

  const totalAmount = breakdown.reduce((sum, item) => sum + item.amount, 0);

  return {
    monthIndex: index,
    monthName: name,
    amount: totalAmount,
    status,
    breakdown
  };
});

const SFeeManagement = () => {
  const [fees, setFees] = useState(INITIAL_FEES);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [detailFee, setDetailFee] = useState(null);

  // --- Derived State ---
  const selectedFees = useMemo(() =>
    fees.filter(f => selectedIndexes.includes(f.monthIndex)),
    [fees, selectedIndexes]);

  const subTotal = useMemo(() =>
    selectedFees.reduce((sum, f) => sum + f.amount, 0),
    [selectedFees]);

  const totalDueSummary = useMemo(() =>
    fees.filter(f => f.status !== 'PAID').reduce((sum, f) => sum + f.amount, 0),
    [fees]);

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

  const confirmPayment = () => {
    setFees(prev => prev.map(f =>
      selectedIndexes.includes(f.monthIndex)
        ? { ...f, status: 'PAID' }
        : f
    ));
    setSelectedIndexes([]);
    setIsConfirmModalOpen(false);
    toast({ type: 'success', message: 'Payment processed successfully. Your records have been updated.' });
  };

  const generateBill = (fee) => {
    const target = fee || selectedFees[0];
    if (!target) {
      toast({ type: 'error', message: 'Please select a single month to generate a bill.' });
      return;
    }

    toast({ type: 'info', message: `Generating Bill PDF for ${target.monthName}...` });

    // Simulation: creating a simple fake download
    setTimeout(() => {
      const filename = `Bill-${target.monthName}-${MOCK_STUDENT.name.replace(' ', '_')}.pdf`;
      toast({ type: 'success', message: `Download complete: ${filename}` });
    }, 1500);
  };

  // --- Component Parts ---
  const StatusLegend = () => (
    <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800/40">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-slate-500 shadow-[0_0_10px_rgba(148,163,184,0.3)]" />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Paid / Settled</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]" />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Overdue</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Outstanding (Due)</span>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32 pt-2">

      {/* Header Section - Compacted */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/10 shadow-lg">
            <CreditCard size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">Fee Payment</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.25em] mt-1.5 leading-none">View monthly fee status and pay securely</p>
          </div>
        </div>

        {/* Student Mini Card - Compacted */}
        <div className="bg-white dark:bg-[#0b1220] px-6 py-4 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-6 min-w-[360px] transition-colors">
          <div className="flex items-center gap-3 border-r border-slate-100 dark:border-slate-800 pr-6">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <User size={18} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Student</p>
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{MOCK_STUDENT.name}</h3>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <GraduationCap size={12} className="text-emerald-500" />
                <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{MOCK_STUDENT.class} - {MOCK_STUDENT.section}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Hash size={10} className="text-emerald-500" />
                <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Roll: {MOCK_STUDENT.roll}</span>
              </div>
            </div>
            <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded-md w-fit border border-emerald-500/10">
              AY: {MOCK_STUDENT.academicYear}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 items-start">

        {/* Left Column: 12 Month Grid */}
        <div className="xl:col-span-2 space-y-10">
          <StatusLegend />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {fees.map((fee, idx) => {
              const isSelected = selectedIndexes.includes(fee.monthIndex);
              const isPaid = fee.status === 'PAID';
              const isOverdue = fee.status === 'OVERDUE';

              return (
                <div
                  key={fee.monthIndex}
                  className={`
                    group relative p-6 rounded-[32px] border transition-all duration-300 select-none
                    ${isPaid ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/60 grayscale opacity-60' : ''}
                    ${isSelected ? 'bg-emerald-500 shadow-2xl shadow-emerald-600/30 border-emerald-400 scale-[1.03] z-10' : ''}
                    ${!isPaid && !isSelected ? 'bg-white dark:bg-[#0b1220] border-slate-100 dark:border-slate-800 hover:border-emerald-500/40 hover:translate-y-[-4px]' : ''}
                  `}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-lg font-black uppercase tracking-tighter transition-colors ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {fee.monthName}
                      </h4>
                      <div className="flex items-center gap-2">
                        {/* Info Icon to see details */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailFee(fee);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-500'}`}
                        >
                          <Info size={16} />
                        </button>
                        {isPaid ? <Lock size={14} className="text-slate-400 dark:text-slate-500" /> : isSelected && <CheckCircle2 size={18} className="text-white" />}
                      </div>
                    </div>

                    <div
                      className="cursor-pointer"
                      onClick={() => toggleSelection(fee.monthIndex)}
                    >
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'}`}>Amount Due</p>
                      <p className={`text-xl font-black tabular-nums transition-colors ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        Rs. {fee.amount.toLocaleString()}
                      </p>
                    </div>

                    <div className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest w-fit
                      ${isPaid ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700' :
                        isOverdue ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}
                      ${isSelected ? 'bg-white/20 text-white border-white/30' : ''}
                    `}>
                      {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Due'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Checkout Panel */}
        <div className="sticky top-28 space-y-8">
          <div className="bg-white dark:bg-[#0b1220] rounded-[44px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden p-10 flex flex-col gap-10 transition-colors">

            {/* Summary Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Checkout Summary</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select months to proceed</p>
                </div>
              </div>

              <div className="space-y-4">
                {selectedFees.length > 0 ? (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-hide">
                    {selectedFees.map(f => (
                      <div key={f.monthIndex} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-black text-slate-700 dark:text-white uppercase tracking-widest">{f.monthName}</span>
                        <span className="text-xs font-black text-slate-600 dark:text-slate-300">Rs. {f.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800/40 rounded-[32px] flex flex-col items-center gap-4">
                    <Clock size={24} className="text-slate-300 dark:text-slate-700" />
                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">No months selected</p>
                  </div>
                )}
              </div>
            </div>

            {/* Calculations */}
            <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800/40">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Selected Months Total</span>
                <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">Rs. {subTotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Discounts / Fines</span>
                <span className="text-xs font-black text-emerald-500">Rs. 0</span>
              </div>
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total Payable</p>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">Rs. {subTotal.toLocaleString()}</h2>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={handlePay}
                disabled={selectedIndexes.length === 0}
                className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 disabled:hover:bg-emerald-600 text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.25em] shadow-xl shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Pay Selected <ChevronRight size={18} />
              </button>

              <button
                onClick={() => generateBill()}
                disabled={selectedIndexes.length === 0}
                className="w-full py-5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
              >
                <Download size={16} /> Download Selected Bill
              </button>
            </div>
          </div>

          {/* Outstanding Banner */}
          <div className="p-8 bg-red-500/5 rounded-[36px] border border-red-500/10 flex items-center justify-between group overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-red-500/60 uppercase tracking-[0.2em] mb-1">Total Academic Year Due</p>
              <h4 className="text-2xl font-black text-red-500 tracking-tight">Rs. {totalDueSummary.toLocaleString()}</h4>
            </div>
            <div className="relative z-10 w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
              <AlertCircle size={24} />
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <CreditCard size={120} />
            </div>
          </div>
        </div>
      </div>

      {/* Fee Detail Modal */}
      <PortalPopup isOpen={!!detailFee} onClose={() => setDetailFee(null)}>
        <div className="bg-white dark:bg-slate-900 w-[95vw] max-w-lg rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col pointer-events-auto">
          <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                <Info size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{detailFee?.monthName} Fee Detail</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Itemized Breakdown</p>
              </div>
            </div>
            <button onClick={() => setDetailFee(null)} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <X size={24} />
            </button>
          </div>

          <div className="p-10 space-y-6">
            <div className="space-y-4">
              {detailFee?.breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all hover:border-emerald-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{item.label}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">Rs. {item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Total Month Fee</p>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">Rs. {detailFee?.amount.toLocaleString()}</h2>
              </div>
              <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${detailFee?.status === 'PAID' ? 'bg-emerald-500 text-white border-emerald-400' :
                detailFee?.status === 'OVERDUE' ? 'bg-red-500 text-white border-red-400' :
                  'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                {detailFee?.status}
              </div>
            </div>
          </div>

          <div className="px-10 py-8 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              onClick={() => setDetailFee(null)}
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[20px] font-black text-[11px] uppercase tracking-widest transition-all active:scale-95"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      </PortalPopup>

      {/* Confirmation Modal */}
      <PortalPopup isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)}>
        <div className="bg-white dark:bg-slate-900 w-[95vw] max-w-xl rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col pointer-events-auto">
          <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                <CreditCard size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Confirm Payment</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Secure Academic Transaction</p>
              </div>
            </div>
            <button onClick={() => setIsConfirmModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><X size={24} /></button>
          </div>

          <div className="p-10 space-y-8 text-center">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-500 mx-auto shadow-inner">
              <Info size={32} />
            </div>

            <div className="space-y-3">
              <p className="text-base font-medium text-slate-600 dark:text-slate-300 leading-relaxed px-6 uppercase tracking-tight">
                You are about to pay the fees for <span className="font-black text-emerald-500">{selectedIndexes.length} months</span> amounting to a total of
              </p>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">Rs. {subTotal.toLocaleString()}</h2>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-[28px] border border-slate-100 dark:border-slate-800 text-left">
              <div className="flex items-center gap-3 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Security Detail</span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-widest">
                By confirming, you authorize the academy to settle the selected outstanding dues. A digital receipt will be generated and logged in your history.
              </p>
            </div>

            <div className="flex gap-6 pt-4">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all"
              >
                No, Review
              </button>
              <button
                onClick={confirmPayment}
                className="flex-1 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3"
              >
                <ShieldCheck size={18} /> Confirm Pay
              </button>
            </div>
          </div>
        </div>
      </PortalPopup>
    </div>
  );
};

export default SFeeManagement;