import React from 'react';
import { X, CheckCircle2, GraduationCap, Users, Info } from 'lucide-react';

const SaveClassroomModal = ({ isOpen, onClose, onConfirm, classroomData }) => {
    if (!isOpen) return null;

    const { grade, section, students } = classroomData;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-white dark:bg-slate-950 w-full max-w-2xl rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300 overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <CheckCircle2 size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Save Classroom</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Confirm Enrollment</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    {/* Summary Row */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Grade</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{grade}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Section</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{section}</p>
                        </div>
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/20">
                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Students</p>
                            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{students.length}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Users size={14} className="text-emerald-500" /> Enrolled Students
                        </p>
                        <div className="max-h-[200px] overflow-y-auto pr-2 space-y-2 scrollbar-hide">
                            {students.map((s, idx) => (
                                <div key={s._id || s.id || idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl">
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{s.firstName} {s.lastName}</span>
                                    <span className="text-[9px] font-black text-slate-400">{s.studentId}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100/50 dark:border-amber-800/30">
                        <Info className="text-amber-500 shrink-0" size={18} />
                        <p className="text-[9px] font-bold text-amber-800 dark:text-amber-400 leading-relaxed uppercase tracking-wider">
                            Saving will update all selected students' grade and section in the database.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 rounded-2xl transition-all"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        Confirm & Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaveClassroomModal;
