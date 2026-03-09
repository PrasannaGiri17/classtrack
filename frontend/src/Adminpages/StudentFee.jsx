import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CreditCard,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Wallet,
    Receipt,
    AlertTriangle,
    Plus,
    Trash2,
    X,
    Tag,
    ChevronDown,
    Users,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { toast } from '../MainSystemComponents/Toast';
import PortalPopup from '../MainSystemComponents/PortalPopup';
import ConfirmDialog from '../MainSystemComponents/ConfirmDialog';
import feeService from '../Api/feeService';
import studentService from '../Api/studentService';

const NEPALI_MONTHS = [
    'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
    'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

const StudentFee = () => {
    const { id } = useParams(); // This is the student ObjectId in my implementation
    const navigate = useNavigate();

    const [studentInfo, setStudentInfo] = useState(null);
    const [feeRecords, setFeeRecords] = useState([]);
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isExtraFeeModalOpen, setIsExtraFeeModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [extraFees, setExtraFees] = useState([{ title: '', amount: '' }]);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ mode: '', record: null });

    const currentAcademicYear = "2081/82";

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // 1. Get student basic info
            const student = await studentService.getStudentById(id);
            setStudentInfo(student);

            // 2. Get student fee records
            const fees = await feeService.getStudentFees(id, currentAcademicYear);
            setFeeRecords(fees);

            // 3. Get student fee summary
            const summ = await feeService.getFeeSummary(id, currentAcademicYear);
            setSummary(summ);

        } catch (error) {
            console.error(error);
            toast({ type: 'error', message: 'Failed to load student fee data.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayAction = (record) => {
        setConfirmConfig({ mode: 'pay', record });
        setIsConfirmOpen(true);
    };

    const handleConfirmPayment = async () => {
        const { record } = confirmConfig;
        try {
            await feeService.markAsPaid(record._id, {
                paidAmount: record.totalAmount, // Full payment for simplicity in this flow
                paymentMethod: "Cash",
                paymentDate: new Date()
            });

            toast({ type: 'success', message: `${record.monthName} fee marked as PAID.` });
            loadData();
        } catch (error) {
            toast({ type: 'error', message: 'Payment update failed.' });
        } finally {
            setIsConfirmOpen(false);
        }
    };

    const handleOpenExtraFeeModal = (record) => {
        setSelectedRecord(record);
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
            if (validFees.length === 0) return;

            for (const fee of validFees) {
                await feeService.addExtraFee(selectedRecord._id, fee.title, fee.amount);
            }

            toast({ type: 'success', message: `Extra fees added to ${selectedRecord.monthName}.` });
            setIsExtraFeeModalOpen(false);
            loadData();
        } catch (error) {
            toast({ type: 'error', message: 'Failed to add extra fees.' });
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            PAID: { color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: CheckCircle2 },
            PARTIAL: { color: "text-blue-600 bg-blue-50 border-blue-100", icon: AlertCircle },
            UNPAID: { color: "text-slate-500 bg-slate-100 border-slate-200", icon: XCircle },
            OVERDUE: { color: "text-red-600 bg-red-50 border-red-100", icon: AlertTriangle }
        };
        const badge = badges[status] || badges.UNPAID;
        const Icon = badge.icon;

        return (
            <div className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border ${badge.color}`}>
                <Icon size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!studentInfo) return (
        <div className="text-center py-20 flex flex-col items-center gap-4">
            <XCircle size={48} className="text-slate-300" />
            <p className="font-black text-slate-400 uppercase tracking-widest">Student Not Found</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header Profile Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors relative">
                <div className="p-8 lg:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/admin/fee')}
                            className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 rounded-2xl transition-all shadow-sm active:scale-95"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <img
                            src={studentInfo.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${studentInfo.firstName}`}
                            alt=""
                            className="w-16 h-16 rounded-[20px] object-cover bg-emerald-500/10 shadow-inner"
                        />
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                                {studentInfo.firstName} {studentInfo.lastName}
                            </h2>
                            <div className="flex items-center gap-3 mt-2">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{studentInfo.studentId}</p>
                                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Class {studentInfo.studentClass}</p>
                            </div>
                        </div>
                    </div>

                    {/* Parents */}
                    <div className="flex flex-wrap gap-8 md:gap-12 lg:gap-16">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Father</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none">{studentInfo.fatherName || "N/A"}</p>
                            <p className="text-[11px] font-bold text-emerald-600 tabular-nums">{studentInfo.fatherPhone || "No Number"}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mother</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none">{studentInfo.motherName || "N/A"}</p>
                            <p className="text-[11px] font-bold text-pink-600 tabular-nums">{studentInfo.motherPhone || "No Number"}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 flex items-center gap-6 border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-emerald-500/20 transition-all">
                    <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 duration-500 transition-transform">
                        <Receipt size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Yearly Target</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">Rs. {summary?.yearlyTotal || 0}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 flex items-center gap-6 border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-emerald-500/20 transition-all">
                    <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 duration-500 transition-transform">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Collected</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums text-emerald-500">Rs. {summary?.totalPaid || 0}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 flex items-center gap-6 border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-red-500/20 transition-all">
                    <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 duration-500 transition-transform">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Outstanding</p>
                        <h3 className="text-2xl font-black text-red-500 tracking-tighter tabular-nums">Rs. {summary?.totalDue || 0}</h3>
                    </div>
                </div>
            </div>

            {/* Fee Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/20">
                    <div className="flex items-center gap-4">
                        <Calendar size={18} className="text-emerald-500" />
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-widest">Monthly Ledger</h3>
                    </div>
                    <div className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-lg shadow-slate-900/10">
                        AY {currentAcademicYear}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                                <th className="pl-12 pr-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">MONTH</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">BREAKDOWN</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">TOTAL FEE</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">STATUS</th>
                                <th className="pr-12 pl-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {feeRecords.map((record) => (
                                <tr key={record._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors duration-300">
                                    <td className="pl-12 pr-6 py-6">
                                        <span className="text-sm font-black text-slate-900 dark:text-white lowercase tracking-tight capitalize block">{record.monthName}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Nepali Month</span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 group/tip relative">
                                                <span className="text-[11px] font-bold text-slate-500 line-clamp-1 max-w-[150px]">
                                                    Base: Rs.{record.baseFee}
                                                    {record.admissionFee > 0 && ` + Adm: Rs.${record.admissionFee}`}
                                                    {record.extraFees?.length > 0 && ` + ${record.extraFees.length} Extras`}
                                                </span>
                                                <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ChevronDown size={12} />
                                                </div>

                                                {/* Tooltip Content */}
                                                <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-5 z-20 invisible group-hover/tip:visible opacity-0 group-hover/tip:opacity-100 transition-all">
                                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b pb-2 mb-3">Itemized Bill</p>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-xs font-bold"><span className="text-slate-500">Grade Fee</span><span>Rs.{record.baseFee}</span></div>
                                                        {record.admissionFee > 0 && <div className="flex justify-between text-xs font-bold text-emerald-600"><span>Admission</span><span>+Rs.{record.admissionFee}</span></div>}
                                                        {record.extraFees.map((ex, i) => (
                                                            <div key={i} className="flex justify-between text-xs font-bold text-blue-500"><span>{ex.title}</span><span>+Rs.{ex.amount}</span></div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-base font-black text-slate-900 dark:text-white tabular-nums tracking-tight">Rs. {record.totalAmount}</span>
                                            {record.paidAmount > 0 ? (
                                                <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1 mt-1">
                                                    <CheckCircle2 size={10} /> Paid {record.paidAmount}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest mt-1">Not Paid Yet</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex justify-center">
                                            {getStatusBadge(record.status)}
                                        </div>
                                    </td>
                                    <td className="pr-12 pl-6 py-6">
                                        <div className="flex gap-2 justify-center">
                                            {record.status !== 'PAID' ? (
                                                <>
                                                    <button
                                                        onClick={() => handlePayAction(record)}
                                                        className="flex-1 max-w-[120px] py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <CreditCard size={14} /> Mark Paid
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenExtraFeeModal(record)}
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 border border-slate-200 dark:border-slate-800 transition-all active:scale-95"
                                                    >
                                                        <Plus size={18} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button className="flex-1 max-w-[140px] py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-700 opacity-60 flex items-center justify-center gap-2">
                                                    <CheckCircle2 size={14} /> Settlement Done
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Extra Fee Modal */}
            <PortalPopup isOpen={isExtraFeeModalOpen} onClose={() => setIsExtraFeeModalOpen(false)}>
                <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 pointer-events-auto">
                    <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase tracking-widest mb-2 flex items-center gap-3">
                                <Plus className="text-emerald-500" /> Extras
                            </h2>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedRecord?.monthName} • {studentInfo?.firstName}</p>
                        </div>
                        <button onClick={() => setIsExtraFeeModalOpen(false)} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center hover:text-red-500 transition-colors"><X /></button>
                    </div>

                    <div className="p-10 space-y-6 max-h-[50vh] overflow-y-auto scrollbar-hide">
                        {extraFees.map((fee, index) => (
                            <div key={index} className="flex items-end gap-3 group animate-in slide-in-from-top-2 duration-300">
                                <div className="flex-1 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Tag size={10} /> Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Description..."
                                        value={fee.title}
                                        onChange={(e) => handleExtraFeeChange(index, 'title', e.target.value)}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[11px] font-bold dark:text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                                    />
                                </div>
                                <div className="w-28 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={fee.amount}
                                        onChange={(e) => handleExtraFeeChange(index, 'amount', e.target.value)}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[11px] font-bold dark:text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-emerald-600"
                                    />
                                </div>
                                <button
                                    onClick={() => handleRemoveExtraFeeRow(index)}
                                    className="mb-1 w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={handleAddExtraFeeRow}
                            className="w-full py-5 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-3 text-slate-400 hover:text-emerald-500 hover:border-emerald-500/40 transition-all group"
                        >
                            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Add Another Row</span>
                        </button>
                    </div>

                    <div className="p-10 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <button
                            onClick={handleSaveExtraFees}
                            className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                        >
                            <Plus size={20} /> Append To Invoice
                        </button>
                    </div>
                </div>
            </PortalPopup>

            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmPayment}
                title="Authorization Required"
                message={`You are about to record a payment of Rs.${confirmConfig.record?.totalAmount} for ${confirmConfig.record?.monthName}. This action is irreversible on the digital ledger.`}
            />
        </div>
    );
};

export default StudentFee;
