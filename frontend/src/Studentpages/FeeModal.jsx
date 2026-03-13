import React from 'react';
import {
    X,
    CreditCard,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    Clock,
    Hash,
    Building2,
    User,
    School,
    Calendar,
    Layers,
    ChevronRight,
    Wallet
} from 'lucide-react';

const FeeModal = ({
    isOpen,
    onClose,
    studentInfo,
    selectedFees,
    totalAmount,
    onConfirm
}) => {
    if (!isOpen) return null;

    return (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl w-[95vw] max-w-4xl rounded-[48px] shadow-2xl border border-white/20 dark:border-slate-800/50 animate-in zoom-in-95 duration-400 overflow-hidden flex flex-col pointer-events-auto">
            {/* Header */}
            <div className="p-8 lg:p-10 border-b border-slate-100/50 dark:border-slate-800/50 flex items-center justify-between bg-slate-50/10 backdrop-blur-md">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-600 rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 rotate-3 transform hover:rotate-0 transition-transform duration-500">
                        <CreditCard size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Digital Checkout</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase">Authorized Secure Payment</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-300 active:scale-90"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-5 h-full overflow-hidden">
                {/* Left Side: Summary & Student Info */}
                <div className="lg:col-span-2 p-8 lg:p-10 bg-slate-50/40 dark:bg-slate-800/20 border-r border-slate-100/50 dark:border-slate-800/50 space-y-8 overflow-y-auto scrollbar-hide">
                    {/* Student Profile Card */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner">
                                <User size={18} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Payer Identity</p>
                                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none capitalize">{studentInfo.name || "Student"}</h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-5 bg-white dark:bg-slate-900/60 rounded-[28px] border border-slate-100 dark:border-slate-800/50 group transition-all hover:border-emerald-500/30 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-emerald-500">
                                        <Hash size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Student ID</p>
                                        <p className="text-xs font-black text-slate-900 dark:text-white mt-1 tracking-wider uppercase">{studentInfo.studentId || "N/A"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-white dark:bg-slate-900/60 rounded-[28px] border border-slate-100 dark:border-slate-800/50 group transition-all hover:border-blue-500/30 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-blue-500">
                                        <Building2 size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">School ID</p>
                                        <p className="text-xs font-black text-slate-900 dark:text-white mt-1 tracking-wider">#{studentInfo.schoolId || "001"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-white dark:bg-slate-900/60 rounded-[28px] border border-slate-100 dark:border-slate-800/50 group transition-all hover:border-purple-500/30 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-purple-500">
                                        <Layers size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Class Reference</p>
                                        <p className="text-xs font-black text-slate-900 dark:text-white mt-1 tracking-wider">{studentInfo.class || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Stats */}
                    <div className="pt-6 border-t border-slate-100/50 dark:border-slate-800/50">
                        <div className="bg-slate-950 dark:bg-emerald-600 rounded-[36px] p-8 text-white relative overflow-hidden group shadow-2xl">
                            <div className="relative z-10">
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Total Payable Amount</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-lg font-black text-white/60">Rs.</span>
                                    <h2 className="text-4xl font-black tracking-tighter tabular-nums">{totalAmount.toLocaleString()}</h2>
                                </div>
                                <div className="flex items-center gap-2 mt-6 px-4 py-2 bg-white/10 rounded-xl w-fit backdrop-blur-md border border-white/10">
                                    <ShieldCheck size={14} className="text-emerald-400" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">SSL Secure</span>
                                </div>
                            </div>
                            <div className="absolute right-[-30px] bottom-[-30px] opacity-[0.05] group-hover:scale-110 transition-transform duration-1000 select-none pointer-events-none">
                                <CreditCard size={180} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Months & Breakdown */}
                <div className="lg:col-span-3 p-8 lg:p-10 space-y-10 overflow-y-auto max-h-[60vh] lg:max-h-[70vh] scrollbar-hide">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <Calendar size={16} />
                                </div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Selected Months</h4>
                            </div>
                            <div className="px-4 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                                    {selectedFees.length} Item{selectedFees.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {selectedFees.map((fee, idx) => (
                                <div
                                    key={fee._id}
                                    className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 rounded-[32px] group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-300 animate-in slide-in-from-right-8"
                                    style={{ animationDelay: `${idx * 80}ms` }}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-[18px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 rotate-3 group-hover:rotate-0">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">{fee.monthName}</h5>
                                            <p className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-[0.2em]">Academic Fee Record</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">Rs. {fee.dueAmount.toLocaleString()}</p>
                                        <div className="flex items-center gap-1 justify-end mt-1">
                                            <Clock size={10} className="text-emerald-500" />
                                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Instant Pay</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-10">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 text-center opacity-70">Payment Method Gateway</p>
                            <div className="flex items-center justify-center gap-8 lg:gap-12">
                                <div className="text-center group cursor-pointer">
                                    <div className="w-20 h-20 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-300 group-hover:border-emerald-500/40 group-hover:text-emerald-500 transition-all shadow-sm mb-3 hover:-translate-y-2 duration-300 relative overflow-hidden group/it">
                                        <CreditCard size={28} />
                                        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">eSewa</p>
                                </div>
                                <div className="text-center group cursor-pointer">
                                    <div className="w-20 h-20 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-300 group-hover:border-purple-500/40 group-hover:text-purple-500 transition-all shadow-sm mb-3 hover:-translate-y-2 duration-300 relative overflow-hidden">
                                        <Wallet size={28} />
                                        <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-purple-500 transition-colors">Khalti</p>
                                </div>
                                <div className="text-center group cursor-pointer">
                                    <div className="w-20 h-20 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-300 group-hover:border-blue-500/40 group-hover:text-blue-500 transition-all shadow-sm mb-3 hover:-translate-y-2 duration-300 relative overflow-hidden">
                                        <Building2 size={28} />
                                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">SCT/Debit</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onConfirm}
                            className="w-full py-7 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[32px] font-black text-sm uppercase tracking-[0.4em] shadow-2xl shadow-emerald-500/30 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-5 group relative overflow-hidden"
                        >
                            <span className="relative z-10">Confirm & Process Transaction</span>
                            <div className="relative z-10 w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                                <ChevronRight size={20} />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeeModal;
