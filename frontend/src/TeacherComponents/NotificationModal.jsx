import React from 'react';
import {
    Megaphone,
    X,
    ChevronDown,
    Send,
    AlertCircle
} from 'lucide-react';

const DEPARTMENTS = ["Science", "Math", "English", "Arts", "Sports", "Social Studies"];



const NotificationModal = ({
    isOpen,
    onClose,
    onSend,
    newTitle, setNewTitle,
    newMessage, setNewMessage,
    newPriority, setNewPriority,
    targetCategory, setTargetCategory,
    teacherTargets = [] // These are the specific classes/grades assigned to the teacher
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300" >
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

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
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Group</label>
                            <div className="relative group">
                                <select
                                    value={targetCategory}
                                    onChange={(e) => setTargetCategory(e.target.value)}
                                    className="appearance-none w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all dark:text-white cursor-pointer uppercase"
                                >
                                    <option value="">SELECT TARGET RECIPIENTS</option>
                                    <option value="All School">ALL SCHOOL</option>
                                    {teacherTargets.map(target => (
                                        <option key={target} value={target}>{target}</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500" />
                            </div>
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

                    <div className="p-6 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[32px] border border-emerald-500/10 flex items-start gap-4">
                        <AlertCircle className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                        <p className="text-[10px] font-bold text-emerald-800/70 dark:text-emerald-400/70 leading-relaxed uppercase tracking-widest">
                            Dispatched notifications are stored in the <span className="underline">Permanent Log</span> and delivered to user dashboards in real-time.
                        </p>
                    </div>
                </form>

                <div className="py-5 px-10 border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-950 grid grid-cols-3 items-center">
                    <div className="text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Dispatch</p>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <p className="text-sm font-black text-emerald-600 leading-none">Admin Clearance Verified</p>
                        </div>
                    </div>

                    <div className="text-center">
                        <button
                            onClick={onClose}
                            className="px-8 py-3.5 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                        >
                            Cancel
                        </button>
                    </div>

                    <div className="text-right">
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            className="px-12 py-4 bg-emerald-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:grayscale ml-auto w-fit"
                            disabled={!newTitle || !newMessage || !targetCategory}
                        >
                            <Send size={18} /> Send Dispatch
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default NotificationModal;
