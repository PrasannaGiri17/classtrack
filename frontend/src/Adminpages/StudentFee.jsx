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
    AlertTriangle
} from 'lucide-react';
import { toast } from '../MainSystemComponents/Toast';

const NEPALI_MONTHS = [
    'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
    'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

// Mock backend fetch function
const fetchStudentFeeDetails = async (studentId) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate some realistic dummy data
    return {
        _id: 'db_id_123',
        studentId: studentId || 'RM2024-001',
        name: 'Cristiano Ronaldo',
        grade: 'Grade 10',
        section: 'A',
        yearlyTotal: 3000,
        totalPaid: 1500,
        totalDue: 1500,
        months: NEPALI_MONTHS.map((month, index) => {
            const isPaid = index < 6; // First 6 months paid
            return {
                monthKey: month.toLowerCase(),
                monthLabel: month,
                feeAmount: 250,
                isPaid: isPaid,
                paidAt: isPaid ? `2080-${String(index + 1).padStart(2, '0')}-05` : null,
                dueAmount: isPaid ? 0 : 250,
                isDue: index === 6 // The 7th month is currently due
            };
        })
    };
};

const StudentFee = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await fetchStudentFeeDetails(id);
                setStudentData(data);
            } catch (error) {
                toast({
                    type: 'error',
                    message: 'Failed to fetch student fee details',
                    duration: 3000
                });
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handlePayNow = (month) => {
        // In a real app, this would call POST /api/fees/student/:id/pay
        // For now, we just simulate success and update the UI locally
        toast({
            type: 'success',
            message: `Marked ${month.monthLabel} fee as Paid successfully.`,
            duration: 3000
        });

        setStudentData(prev => {
            const updatedMonths = prev.months.map(m => {
                if (m.monthKey === month.monthKey) {
                    return {
                        ...m,
                        isPaid: true,
                        paidAt: new Date().toISOString().split('T')[0],
                        dueAmount: 0,
                        isDue: false
                    };
                }
                return m;
            });

            // Find next unpaid month and mark it as due
            let nextDueFound = false;
            const finalMonths = updatedMonths.map(m => {
                if (!m.isPaid && !nextDueFound) {
                    nextDueFound = true;
                    return { ...m, isDue: true };
                }
                return m;
            });

            return {
                ...prev,
                totalPaid: prev.totalPaid + month.feeAmount,
                totalDue: prev.totalDue - month.feeAmount,
                months: finalMonths
            };
        });
    };

    const getPaidStatusBadge = (isPaid) => {
        if (isPaid) {
            return (
                <div className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                    <CheckCircle2 size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Paid</span>
                </div>
            );
        }
        return (
            <div className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700">
                <XCircle size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">Unpaid</span>
            </div>
        );
    };

    const getDueStatusBadge = (isDue, isPaid) => {
        if (isPaid) return null; // No due badge if already paid

        if (isDue) {
            return (
                <div className="flex items-center justify-center gap-1.5 w-fit px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-800/50">
                    <AlertCircle size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Due</span>
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center gap-1.5 w-fit px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-[9px] font-bold uppercase tracking-widest">Not Due</span>
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

    if (!studentData) return null;

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
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-[20px] flex items-center justify-center text-emerald-600 font-black text-2xl shadow-inner">
                            {studentData.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                                {studentData.name}
                            </h2>
                            <div className="flex items-center gap-3 mt-2">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{studentData.studentId}</p>
                                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{studentData.grade}</p>
                                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sec {studentData.section}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-8 flex items-center gap-5 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-emerald-500/30 group">
                    <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                        <Receipt size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Yearly Fee</p>
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">
                            Rs. {studentData.yearlyTotal.toLocaleString()}
                        </h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-8 flex items-center gap-5 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-emerald-500/30 group">
                    <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                        <Wallet size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">
                            Rs. {studentData.totalPaid.toLocaleString()}
                        </h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-8 flex items-center gap-5 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-red-500/30 group">
                    <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                        <AlertTriangle size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Due</p>
                        <h3 className="text-2xl md:text-3xl font-black text-red-500 tracking-tighter tabular-nums leading-none">
                            Rs. {studentData.totalDue.toLocaleString()}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">12-Month Fee Structure</h3>
                    <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Nepali Calendar
                    </div>
                </div>

                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full min-w-[900px] text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                                <th className="pl-12 pr-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/6">Month</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee Amount</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Paid Status</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Due Status</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Paid Date</th>
                                <th className="pr-12 pl-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {studentData.months.map((month) => (
                                <tr key={month.monthKey} className={`group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${month.isDue ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                                    <td className="pl-12 pr-6 py-5">
                                        <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                                            {month.monthLabel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-black text-slate-500 dark:text-slate-400 tabular-nums">
                                            Rs. {month.feeAmount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 w-32">
                                        {getPaidStatusBadge(month.isPaid)}
                                    </td>
                                    <td className="px-6 py-5 flex justify-center mt-0.5">
                                        {getDueStatusBadge(month.isDue, month.isPaid)}
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        {month.paidAt ? (
                                            <span className="text-xs font-bold text-slate-400 tabular-nums">{month.paidAt}</span>
                                        ) : (
                                            <span className="text-xs font-bold text-slate-300 dark:text-slate-600">-</span>
                                        )}
                                    </td>
                                    <td className="pr-12 pl-6 py-5">
                                        <div className="flex justify-center">
                                            {!month.isPaid ? (
                                                <button
                                                    onClick={() => handlePayNow(month)}
                                                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[14px] text-[11px] font-black uppercase tracking-widest shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all w-full flex items-center justify-center gap-2"
                                                >
                                                    <CreditCard size={14} /> Mark Paid
                                                </button>
                                            ) : (
                                                <div className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-[14px] text-[11px] font-black uppercase tracking-widest w-full text-center flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 opacity-70">
                                                    <CheckCircle2 size={14} /> Completed
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentFee;
