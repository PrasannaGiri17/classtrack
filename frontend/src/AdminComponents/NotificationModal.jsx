import React from 'react';
import {
    Megaphone,
    X,
    ChevronDown,
    Send
} from 'lucide-react';

// DEPARTMENTS is now loaded from backend (dbSubjects prop)



const NotificationModal = ({
    isOpen,
    onClose,
    onSend,
    newTitle, setNewTitle,
    newMessage, setNewMessage,
    newPriority, setNewPriority,
    targetCategory, setTargetCategory,
    targetDept, setTargetDept,
    targetGrade, setTargetGrade,
    targetSection, setTargetSection,
    newSender, setNewSender,
    newSenderType, setNewSenderType,
    dbGrades = [],
    dbSubjects = []
}) => {

    const modalSections = React.useMemo(() => {
        const grade = dbGrades.find(g => g.gradeNumber.toString() === targetGrade);
        return grade?.sections || [];
    }, [targetGrade, dbGrades]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {

        e.preventDefault();
        onSend(e);
    };

    return (
        <div className="relative bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-[48px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden">

            <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                        <Megaphone className="text-white w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Create Announcement</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Administrative Dispatch Portal</p>
                    </div>
                </div>
                <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    <X size={28} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Group</label>
                        <div className="relative group">
                            <select
                                value={targetCategory}
                                onChange={(e) => setTargetCategory(e.target.value)}
                                className="appearance-none w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all dark:text-white cursor-pointer"
                            >
                                <option value="All School">ALL SCHOOL</option>
                                <option value="All Teachers">ALL TEACHERS</option>
                                <option value="Department">BY DEPARTMENT</option>
                                <option value="Grade">BY GRADE / SECTION</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority Level</label>
                        <div className="relative group">
                            <select
                                value={newPriority}
                                onChange={(e) => setNewPriority(e.target.value)}
                                className="appearance-none w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all dark:text-white cursor-pointer"
                            >
                                <option value="important">IMPORTANT (GREEN)</option>
                                <option value="urgent">URGENT (DARK GREEN)</option>
                                <option value="warning">SERIOUS WARNING (RED)</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500" />
                        </div>
                    </div>

                    {targetCategory === 'Department' && (
                        <div className="space-y-3 animate-in slide-in-from-left-2 duration-300 col-span-1 sm:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Department (Subject)</label>
                            <div className="relative group">
                                <select
                                    value={targetDept}
                                    onChange={(e) => setTargetDept(e.target.value)}
                                    className="appearance-none w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all dark:text-white cursor-pointer"
                                >
                                    <option value="">SELECT SUBJECT / DEPT</option>
                                    {dbSubjects.length > 0 ? (
                                      dbSubjects.map(s => (
                                        <option key={s._id} value={s.title}>{s.title.toUpperCase()}</option>
                                      ))
                                    ) : (
                                      // Fallback if subjects not loaded yet
                                      ['Science', 'Math', 'English', 'Arts', 'Social Studies'].map(d => (
                                        <option key={d} value={d}>{d.toUpperCase()}</option>
                                      ))
                                    )}
                                </select>
                                <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500" />
                            </div>
                            {targetDept && (
                              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 ml-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>
                                Only teachers assigned to <strong>{targetDept}</strong> will receive this notification.
                              </p>
                            )}
                        </div>
                    )}

                    {targetCategory === 'Grade' && (
                        <>
                            <div className="space-y-3 animate-in slide-in-from-left-2 duration-300">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Grade</label>
                                <div className="relative group">
                                    <select
                                        value={targetGrade}
                                        onChange={(e) => {
                                            setTargetGrade(e.target.value);
                                            setTargetSection('');
                                        }}
                                        className="appearance-none w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all dark:text-white cursor-pointer"
                                    >
                                        <option value="">SELECT GRADE</option>
                                        {dbGrades.map(g => <option key={g._id} value={g.gradeNumber}>GRADE {g.gradeNumber}</option>)}
                                    </select>

                                    <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500" />
                                </div>
                            </div>
                            {targetGrade && (
                                <div className="space-y-3 animate-in slide-in-from-left-2 duration-300">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Section (Optional)</label>
                                    <div className="relative group">
                                        <select
                                            value={targetSection}
                                            onChange={(e) => setTargetSection(e.target.value)}
                                            className="appearance-none w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all dark:text-white cursor-pointer"
                                        >
                                            <option value="">WHOLE GRADE</option>
                                            {modalSections.map(s => <option key={s._id} value={s.sectionName}>SECTION {s.sectionName}</option>)}
                                        </select>

                                        <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500" />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>



                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Announcement Title</label>
                        <input
                            type="text"
                            required
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Subject line..."
                            className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[28px] text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:text-white"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Content</label>
                        <textarea
                            rows={6}
                            required
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Provide full details here..."
                            className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-800 border-none rounded-[32px] text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:text-white resize-none leading-relaxed"
                        />
                    </div>
                </div>

            </form>

            <div className="py-6 px-10 border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center gap-4">
                <button
                    onClick={onClose}
                    className="px-8 py-3.5 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    onClick={handleSubmit}
                    className="px-12 py-4 bg-emerald-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:grayscale w-fit"
                    disabled={!newTitle || !newMessage || (targetCategory === 'Department' && !targetDept) || (targetCategory === 'Grade' && !targetGrade)}
                >
                    <Send size={18} /> Send Dispatch
                </button>
            </div>
        </div>
    );
};

export default NotificationModal;
