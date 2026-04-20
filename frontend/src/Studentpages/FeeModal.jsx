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
    ChevronRight
} from 'lucide-react';
import esewaLogo from '../Assests/esewa.jpg';
import khaltiLogo from '../Assests/khalti.jpg';
import PortalPopup from '../MainSystemComponents/PortalPopup';

const FeeModal = ({
    isOpen,
    onClose,
    studentInfo,
    selectedFees,
    totalAmount,
    onConfirm,
    paymentGateway,
    setPaymentGateway
}) => {
    return (
        <PortalPopup isOpen={isOpen} onClose={onClose}>
            <div className="bg-white dark:bg-slate-900 w-[95vw] max-w-4xl rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-400 overflow-hidden flex flex-col pointer-events-auto">
                {/* Header */}
                <div className="p-6 lg:p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-emerald-600 rounded-[20px] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 rotate-3 transform hover:rotate-0 transition-transform duration-500">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter capitalize">Digital Checkout</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-black text-slate-400 tracking-[0.3em] capitalize">Authorized Secure Payment</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-300 active:scale-90"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col lg:grid lg:grid-cols-5 h-full overflow-hidden">
                    {/* Left Side: Summary & Student Info */}
                    <div className="lg:col-span-2 p-6 lg:p-8 bg-white dark:bg-slate-900 border-r border-slate-50 dark:border-slate-800 space-y-6 overflow-y-auto scrollbar-hide">
                        {/* Student Profile Card */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner">
                                    <User size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 capitalize tracking-widest mb-0.5">Payer Identity</p>
                                    <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none capitalize">{studentInfo.name || "Student"}</h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[28px] border-none group transition-all hover:bg-slate-100 dark:hover:bg-slate-800 shadow-inner">
                                    <div className="flex items-center gap-4">
                                        <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-emerald-500">
                                            <Hash size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 capitalize tracking-widest">Student ID</p>
                                            <p className="text-xs font-black text-slate-900 dark:text-white mt-1 tracking-wider capitalize">{studentInfo.studentId || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[28px] border-none group transition-all hover:bg-slate-100 dark:hover:bg-slate-800 shadow-inner">
                                    <div className="flex items-center gap-4">
                                        <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-blue-500">
                                            <Building2 size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 capitalize tracking-widest">School Name</p>
                                            <p className="text-xs font-black text-slate-900 dark:text-white mt-1 tracking-wider capitalize">{studentInfo.schoolName || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[28px] border-none group transition-all hover:bg-slate-100 dark:hover:bg-slate-800 shadow-inner">
                                    <div className="flex items-center gap-4">
                                        <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-purple-500">
                                            <Layers size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 capitalize tracking-widest">Grade Fee</p>
                                            <p className="text-xs font-black text-slate-900 dark:text-white mt-1 tracking-wider">{studentInfo.class || "N/A"} - Rs. {studentInfo.monthlyFee || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary Details Breakdown */}
                        <div className="pt-6 border-t border-slate-100/50 dark:border-slate-800/50 space-y-3">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fee Breakdown</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[11px]">
                                    <span className="text-slate-500 font-bold">Total Base Fee:</span>
                                    <span className="text-slate-900 dark:text-white font-black">Rs. {selectedFees.reduce((s, f) => s + (f.baseFee || 0), 0).toLocaleString()}</span>
                                </div>
                                {selectedFees.some(f => f.admissionFee > 0) && (
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-500 font-bold">Admissions:</span>
                                        <span className="text-emerald-500 font-black">+ Rs. {selectedFees.reduce((s, f) => s + (f.admissionFee || 0), 0).toLocaleString()}</span>
                                    </div>
                                )}
                                {selectedFees.some(f => f.extraFees?.length > 0) && (
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-500 font-bold">Extra Fees:</span>
                                        <span className="text-blue-500 font-black">+ Rs. {selectedFees.reduce((s, f) => s + (f.extraFees?.reduce((es, e) => es + e.amount, 0) || 0), 0).toLocaleString()}</span>
                                    </div>
                                )}
                                {selectedFees.some(f => f.fine > 0) && (
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-500 font-bold">Late Fines:</span>
                                        <span className="text-red-500 font-black">+ Rs. {selectedFees.reduce((s, f) => s + (f.fine || 0), 0).toLocaleString()}</span>
                                    </div>
                                )}
                                {selectedFees.some(f => f.discount > 0) && (
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-500 font-bold">Discounts:</span>
                                        <span className="text-emerald-500 font-black">- Rs. {selectedFees.reduce((s, f) => s + (f.discount || 0), 0).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Stats */}
                        <div className="pt-6 border-t border-slate-100/50 dark:border-slate-800/50">
                            <div className="bg-slate-950 dark:bg-emerald-600 rounded-[30px] p-6 text-white relative overflow-hidden group shadow-2xl">
                                <div className="relative z-10">
                                    <p className="text-[9px] font-black text-white/40 capitalize tracking-[0.3em] mb-2">Total Combined Amount</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm font-black text-white/60">Rs.</span>
                                        <h2 className="text-2xl font-black tracking-tighter tabular-nums">{totalAmount.toLocaleString()}</h2>
                                    </div>

                                </div>
                                <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.05] group-hover:scale-110 transition-transform duration-1000 select-none pointer-events-none">
                                    <CreditCard size={100} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Months & Breakdown */}
                    <div className="lg:col-span-3 p-6 lg:p-8 flex flex-col h-full overflow-hidden">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <Calendar size={16} />
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white capitalize tracking-widest">Monthly Ledger</h4>
                                </div>
                                <div className="px-4 py-1.5 bg-transparent rounded-full border border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] font-black text-emerald-500 capitalize tracking-widest italic">
                                        {selectedFees.length} Month{selectedFees.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 max-h-[320px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                                {selectedFees.map((fee, idx) => (
                                    <div
                                        key={fee._id}
                                        className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl group hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 animate-in slide-in-from-right-8 shadow-inner"
                                        style={{ animationDelay: `${idx * 80}ms` }}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-[18px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 rotate-3 group-hover:rotate-0">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-black text-slate-900 dark:text-white capitalize tracking-tighter">{fee.monthName}</h5>
                                                <p className="text-[9px] font-black text-slate-400 capitalize mt-1 tracking-[0.2em]">{studentInfo.class} Fee Ledger</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">Rs. {fee.dueAmount.toLocaleString()}</p>
                                            <div className="flex items-center gap-1 justify-end mt-1">
                                                <div className="flex items-center gap-1">
                                                    {(fee.admissionFee > 0 || fee.extraFees?.length > 0 || fee.fine > 0 || fee.discount > 0) && (
                                                        <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded ml-1 tracking-widest uppercase">Inc. Extras</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-auto pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                                <div 
                                    onClick={() => setPaymentGateway && setPaymentGateway('khalti')}
                                    className={`text-center group cursor-pointer transition-all duration-300 ${paymentGateway === 'khalti' ? 'scale-105' : ''}`}
                                >
                                    <div className={`w-16 h-16 rounded-2xl border-none flex items-center justify-center transition-all duration-500 relative overflow-hidden 
                                        ${paymentGateway === 'khalti' ? 'shadow-[0_0_20px_rgba(168,85,247,0.4)] ring-2 ring-purple-500' : 'bg-slate-50 dark:bg-slate-800/50 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}>
                                        <img src={khaltiLogo} alt="Khalti" className="w-full h-full object-cover p-1" />
                                    </div>
                                    <p className={`text-[10px] font-bold capitalize tracking-widest mt-2 transition-colors ${paymentGateway === 'khalti' ? 'text-purple-600' : 'text-slate-500 dark:text-slate-400'}`}>Khalti</p>
                                </div>

                                <div 
                                    onClick={() => setPaymentGateway && setPaymentGateway('esewa')}
                                    className={`text-center group cursor-pointer transition-all duration-300 ${paymentGateway === 'esewa' ? 'scale-105' : ''}`}
                                >
                                    <div className={`w-16 h-16 rounded-2xl border-none flex items-center justify-center transition-all duration-500 relative overflow-hidden 
                                        ${paymentGateway === 'esewa' ? 'shadow-[0_0_20px_rgba(16,185,129,0.4)] ring-2 ring-emerald-500' : 'bg-slate-50 dark:bg-slate-800/50 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}>
                                        <img src={esewaLogo} alt="eSewa" className="w-full h-full object-cover p-1" />
                                    </div>
                                    <p className={`text-[10px] font-bold capitalize tracking-widest mt-2 transition-colors ${paymentGateway === 'esewa' ? 'text-emerald-600' : 'text-slate-500 dark:text-slate-400'}`}>eSewa</p>
                                </div>
                            </div>

                            <button
                                onClick={onConfirm}
                                className="px-10 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[20px] font-black text-xs capitalize tracking-[0.4em] shadow-2xl shadow-emerald-500/30 hover:scale-[1.01] active:scale-95 transition-all flex items-center gap-4 group relative overflow-hidden"
                            >
                                <span className="relative z-10 leading-tight">CONTINUE</span>
                                <ChevronRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PortalPopup>
    );
};

export default FeeModal;
