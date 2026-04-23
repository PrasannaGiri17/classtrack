import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    Plus,
    Calendar,
    Clock,
    Lock,
    Unlock,
    FileText,
    ChevronLeft,
    ChevronDown,
    FileSpreadsheet,
    Users,
    BookOpen,
    Paperclip,
    GraduationCap,
    Check,
    X,
    AlertCircle,
    Download,
    FileBox,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from '../../MainSystemComponents/Toast';
import PortalPopup from '../../MainSystemComponents/PortalPopup';
import teacherService from '../../Api/teacherService';
import calendarService from '../../Api/calendarService';
import assignmentService from '../../Api/assignmentService';
import CustomNepaliHolidayCalendar from '../../MainSystemComponents/CustomNepaliHolidayCalendar';

const Assignment = ({ activeTab, setActiveTab }) => {
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);
    const [allSubmissions, setAllSubmissions] = useState({});
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [teacherData, setTeacherData] = useState({ classes: [], subjects: [], classOptions: [] });
    const [holidays, setHolidays] = useState([]);
    const [showCalendar, setShowCalendar] = useState(false);
    const calendarRef = useRef(null);

    const [newAssignment, setNewAssignment] = useState({
        title: '',
        description: '',
        closeTime: null,
        classRef: '',
        subject: '',
        questionFiles: []
    });

    const fetchAssignments = async () => {
        const teacherId = localStorage.getItem('teacherId');
        if (teacherId) {
            const data = await assignmentService.getTeacherAssignments(teacherId);
            setAssignments(data);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const teacherId = localStorage.getItem('teacherId');
                if (!teacherId || teacherId === 'undefined' || teacherId === 'null') {
                    toast({ type: 'error', message: 'Session expired.' });
                    setLoading(false);
                    return;
                }

                const teacher = await teacherService.getTeacherById(teacherId);
                const classes = teacher.assignedClasses || [];

                // Derived options like Whole Grade X
                const uniqueGrades = [...new Set(classes.map(c => {
                    const m = c.match(/(?:Grade\s+|G)(\d+)/i);
                    return m ? m[1] : null;
                }).filter(Boolean))];

                const wholeGradeOptions = uniqueGrades.map(g => `Grade ${g}`);
                const classOptions = [...wholeGradeOptions, ...classes];

                const subjects = [];
                if (teacher.primarySubject) {
                    const name = typeof teacher.primarySubject === 'object' ? (teacher.primarySubject.subjectName || teacher.primarySubject.title) : teacher.primarySubject;
                    if (name) subjects.push(name);
                }
                if (teacher.secondarySubject) {
                    const name = typeof teacher.secondarySubject === 'object' ? (teacher.secondarySubject.subjectName || teacher.secondarySubject.title) : teacher.secondarySubject;
                    if (name && !subjects.includes(name)) subjects.push(name);
                }

                setTeacherData({ classes, subjects, classOptions });

                // Fetch real assignments
                const assignmentData = await assignmentService.getTeacherAssignments(teacherId);
                setAssignments(assignmentData);

                setNewAssignment(prev => ({
                    ...prev,
                    classRef: classOptions[0] || '',
                    subject: subjects[0] || ''
                }));

                const events = await calendarService.getEvents();
                const holidayMapped = (events || []).filter(e => e && (e.type?.toUpperCase() === 'HOLIDAY' || e.isPublicHoliday));
                setHolidays(holidayMapped);

            } catch (err) {
                console.error('Initialization error:', err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    useEffect(() => {
        const fetchSubmissions = async () => {
            if (activeTab === 'report' && selectedAssignmentId) {
                try {
                    setLoadingSubmissions(true);
                    const submissions = await assignmentService.getReport(selectedAssignmentId);
                    setAllSubmissions(prev => ({ ...prev, [selectedAssignmentId]: submissions }));
                } catch (error) {
                    console.error("Failed to fetch submissions:", error);
                } finally {
                    setLoadingSubmissions(false);
                }
            }
        };
        fetchSubmissions();
    }, [activeTab, selectedAssignmentId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setShowCalendar(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isPastDeadline = (closeTime) => {
        return new Date() > new Date(closeTime);
    };

    const filteredAssignments = useMemo(() =>
        assignments.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase())),
        [assignments, searchQuery]);

    const toggleLock = async (id) => {
        try {
            const updated = await assignmentService.toggleLock(id);
            setAssignments(prev => prev.map(a => a._id === id ? updated : a));
            toast({ type: 'success', message: 'Homework portal access updated.' });
        } catch (error) {
            toast({ type: 'error', message: 'Failed to update access.' });
        }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        if (!newAssignment.closeTime) {
            toast({ type: 'error', message: 'Please select a submission deadline.' });
            return;
        }

        const teacherId = localStorage.getItem('teacherId');

        const filePromises = newAssignment.questionFiles.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        });

        try {
            const questionFileUrls = await Promise.all(filePromises);

            let grade, section;
            const classRef = newAssignment.classRef.trim();
            // Supports: "Grade 4 - A", "Grade 4-A", "Grade 4 A", "G4-A", "4-A", "4 - A"
            const classMatch = classRef.match(/^(?:Grade\s+|G)?\s*(\d+)(?:\s*-\s*|\s+)([A-Za-z]+)$/i);

            if (classMatch) {
                grade = classMatch[1];
                section = classMatch[2].trim().toUpperCase();
            } else {
                // Supports: "Grade 4", "G4", "4"
                const gradeOnlyMatch = classRef.match(/^(?:Grade\s+|G)?\s*(\d+)$/i);
                if (gradeOnlyMatch) {
                    grade = gradeOnlyMatch[1];
                    section = 'ALL';
                } else {
                    grade = classRef;
                    section = 'ALL';
                }
            }

            const entry = {
                title: newAssignment.title,
                description: newAssignment.description,
                closeTime: newAssignment.closeTime.toISOString(),
                grade: grade,
                section: section,
                subject: newAssignment.subject,
                teacherId: teacherId,
                fileName: newAssignment.questionFiles.map(f => f.name).join(', '),
                questionFileUrls: questionFileUrls
            };

            const saved = await assignmentService.createAssignment(entry);
            setAssignments([saved, ...assignments]);
            setIsAssignmentModalOpen(false);
            setNewAssignment(prev => ({
                title: '',
                description: '',
                closeTime: null,
                classRef: teacherData.classOptions[0] || '',
                subject: teacherData.subjects[0] || '',
                questionFiles: []
            }));
            toast({ type: 'success', message: 'Homework portal created.' });
        } catch (error) {
            toast({ type: 'error', message: 'Failed to create assignment.' });
        }
    };

    const viewFullReport = (id) => {
        setSelectedAssignmentId(id);
        setActiveTab('report');
    };

    const updateSubmissionGrading = async (submissionId, status) => {
        if (!selectedAssignmentId) return;

        try {
            await assignmentService.gradeSubmission(selectedAssignmentId, submissionId, status);
            setAllSubmissions(prev => ({
                ...prev,
                [selectedAssignmentId]: prev[selectedAssignmentId].map(sub =>
                    sub._id === submissionId ? { ...sub, gradingStatus: status } : sub
                )
            }));
            const msg = status === 'pass' ? 'Marked as Completed' : status === 'fail' ? 'Marked as Incomplete' : 'Grading reset';
            toast({ type: 'success', message: msg });
        } catch (error) {
            toast({ type: 'error', message: 'Failed to update grade.' });
        }
    };

    const updateSubmissionRemark = async (submissionId, remark) => {
        if (!selectedAssignmentId) return;

        try {
            await assignmentService.updateRemark(selectedAssignmentId, submissionId, remark);
            setAllSubmissions(prev => ({
                ...prev,
                [selectedAssignmentId]: prev[selectedAssignmentId].map(sub =>
                    sub._id === submissionId ? { ...sub, remark } : sub
                )
            }));
        } catch (error) {
            console.error("Failed to update remark");
        }
    };

    const removeFile = (index) => {
        setNewAssignment(prev => ({
            ...prev,
            questionFiles: prev.questionFiles.filter((_, i) => i !== index)
        }));
    };

    // --- Sub-component: RemarkInput (to fix typing lag) ---
    const RemarkInput = ({ initialValue, onSave }) => {
        const [localValue, setLocalValue] = useState(initialValue || "");
        const timerRef = useRef(null);

        useEffect(() => {
            setLocalValue(initialValue || "");
        }, [initialValue]);

        const handleChange = (e) => {
            const val = e.target.value;
            setLocalValue(val);

            // Debounce the save call
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                onSave(val);
            }, 800);
        };

        const handleBlur = () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            onSave(localValue);
        };

        return (
            <input
                type="text"
                placeholder="Teacher's Remark..."
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full min-w-[200px] px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-inner"
            />
        );
    };

    const AssignmentCard = ({ a }) => {
        const past = isPastDeadline(a.closeTime);
        const statusText = a.isManuallyLocked ? (past ? 'Open (Late)' : 'Closed') : (past ? 'Closed' : 'Open');
        const cardId = a._id || a.id;

        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-base font-medium text-slate-800 dark:text-slate-100">{a.title}</h4>
                        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[10px] font-medium rounded-lg">
                            {a.priority || 'Normal'}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 text-[11px] text-slate-400 font-medium mb-6">
                        <div className="flex items-center gap-2">
                            <FileText size={14} className="text-slate-300" />
                            {new Date(a.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="text-slate-300" />
                            {new Date(a.closeTime).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                        </div>
                        <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                            <Users size={12} />
                            <span className="font-black uppercase tracking-widest">{a.grade || 'G6'} - {a.section || 'A'}</span>
                        </div>
                        <div className="flex items-center gap-2 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                            <BookOpen size={12} />
                            <span className="font-black uppercase tracking-widest">{a.subject || 'Math'}</span>
                        </div>
                        {a.fileName && (
                            <div className="flex items-center gap-2">
                                {(() => {
                                    const names = a.fileName.split(', ').filter(Boolean);
                                    const visibleNames = names.slice(0, 2);
                                    const remaining = names.length - 2;

                                    return (
                                        <>
                                            {visibleNames.map((name, idx) => (
                                                <div key={idx} className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-500 rounded-lg border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
                                                    <Paperclip size={12} />
                                                    <span className="font-bold tracking-tight truncate max-w-[120px]">{name}</span>
                                                </div>
                                            ))}
                                            {remaining > 0 && (
                                                <div className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-[10px] font-black rounded-lg border border-slate-100 dark:border-slate-800 uppercase tracking-widest animate-in fade-in slide-in-from-left-2">
                                                    +{remaining}
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-tight ${statusText === 'Open' ? 'bg-emerald-50 text-emerald-500' :
                                statusText === 'Closed' ? 'bg-red-50 text-red-400' :
                                    'bg-amber-50 text-amber-500'
                                }`}>
                                {statusText}
                            </span>

                            <button
                                onClick={() => toggleLock(cardId)}
                                disabled={!past}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!past ? 'opacity-20 cursor-not-allowed bg-slate-50 text-slate-400' :
                                    statusText === 'Closed' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'
                                    }`}
                            >
                                {statusText === 'Closed' ? <Unlock size={12} /> : <Lock size={12} />}
                                {statusText === 'Closed' ? 'Unlock Portal' : 'Lock Portal'}
                            </button>
                        </div>

                        <button
                            onClick={() => viewFullReport(cardId)}
                            className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors"
                        >
                            <FileSpreadsheet size={14} />
                            <span className="text-[11px] font-medium">Full Report</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const activeAssignment = assignments.find(a => (a._id || a.id) === selectedAssignmentId);
    const submissions = selectedAssignmentId ? (allSubmissions[selectedAssignmentId] || []) : [];

    if (activeTab === 'report') {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <button
                                onClick={() => setActiveTab('assignments')}
                                className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer group mb-6"
                            >
                                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-all">
                                    <ChevronLeft className="w-4 h-4" />
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-widest">Back to Assignments</span>
                            </button>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                                {activeAssignment?.title}
                            </h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                                Submission Tracking & Grading Report
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/50">
                                {activeAssignment?.grade} - {activeAssignment?.section}
                            </div>
                            <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/50">
                                {activeAssignment?.subject}
                            </div>
                        </div>
                    </div>

                    <div className="w-full overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                                    <th className="pl-12 pr-4 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[80px]">No.</th>
                                    <th className="px-4 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</th>
                                    <th className="px-4 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time of Submission</th>
                                    <th className="px-4 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">File Submitted</th>
                                    <th className="px-4 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Remark</th>
                                    <th className="pr-12 pl-4 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Result</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {submissions.map((sub, index) => (
                                    <tr key={sub._id || sub.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all">
                                        <td className="pl-12 pr-4 py-5">
                                            <span className="text-xs font-bold text-slate-400">{(index + 1).toString().padStart(2, '0')}</span>
                                        </td>
                                        <td className="px-4 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black text-xs">
                                                    {sub.studentName[0]}
                                                </div>
                                                <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{sub.studentName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                <Clock size={14} className="text-slate-300" />
                                                {new Date(sub.submittedAt).toLocaleString('en-US', { 
                                                    month: 'short', 
                                                    day: 'numeric', 
                                                    year: 'numeric', 
                                                    hour: 'numeric', 
                                                    minute: '2-digit',
                                                    hour12: true 
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-5">
                                            <a
                                                href={sub.fileUrl}
                                                download={sub.fileName}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-500 hover:text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all group/file"
                                            >
                                                <Paperclip size={12} className="group-hover/file:scale-110 transition-transform" />
                                                {sub.fileName}
                                            </a>
                                        </td>
                                        <td className="px-4 py-5">
                                            <RemarkInput
                                                initialValue={sub.remark}
                                                onSave={(val) => updateSubmissionRemark(sub._id || sub.id, val)}
                                            />
                                        </td>
                                        <td className="pr-12 pl-4 py-5">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => updateSubmissionGrading(sub._id || sub.id, sub.gradingStatus === 'pass' ? 'none' : 'pass')}
                                                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${sub.gradingStatus === 'pass'
                                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-emerald-500'
                                                        }`}
                                                    title="Mark as Completed"
                                                >
                                                    <Check size={18} strokeWidth={3} />
                                                </button>

                                                {sub.gradingStatus !== 'pass' && (
                                                    <button
                                                        onClick={() => updateSubmissionGrading(sub._id || sub.id, sub.gradingStatus === 'fail' ? 'none' : 'fail')}
                                                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all animate-in fade-in zoom-in-90 ${sub.gradingStatus === 'fail'
                                                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500'
                                                            }`}
                                                        title="Mark as Incomplete"
                                                    >
                                                        <X size={18} strokeWidth={3} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {submissions.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-4 text-slate-300 opacity-30">
                                                <GraduationCap size={48} />
                                                <p className="text-[10px] font-black uppercase tracking-[0.4em]">No submissions recorded yet</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Synchronizing Assignment Data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
                <div className="flex items-center gap-3 w-fit">
                    <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">
                        Assignments ({filteredAssignments.length})
                    </h3>
                </div>
                <button
                    onClick={() => setIsAssignmentModalOpen(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={18} /> Create New Homework Portal
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-top-2 duration-300">
                {filteredAssignments.length > 0 ? (
                    filteredAssignments.map(a => <AssignmentCard key={a.id} a={a} />)
                ) : (
                    <div className="py-12 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                        <FileText size={32} className="opacity-10 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Currently, there is no assignment.</p>
                    </div>
                )}
            </div>

            <PortalPopup isOpen={isAssignmentModalOpen} onClose={() => setIsAssignmentModalOpen(false)}>
                <div className="bg-white dark:bg-slate-900 w-[95vw] max-w-5xl rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col pointer-events-auto">
                    <div className="px-8 py-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                                <Plus size={20} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Create Homework Portal</h3>
                        </div>
                        <button onClick={() => setIsAssignmentModalOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><X size={22} /></button>
                    </div>

                    <form onSubmit={handleCreateAssignment} className="p-8 lg:p-8 space-y-6 overflow-y-auto max-h-[85vh] scrollbar-hide">
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Grade / Section</label>
                                    <div className="relative group">
                                        <select
                                            required
                                            value={newAssignment.classRef}
                                            onChange={(e) => setNewAssignment({ ...newAssignment, classRef: e.target.value })}
                                            className="appearance-none w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-black dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-inner cursor-pointer uppercase tracking-[0.1em]"
                                        >
                                            {teacherData.classOptions.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                                    </div>
                                </div>

                                {teacherData.subjects.length > 1 ? (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teaching Subject</label>
                                        <div className="relative group">
                                            <select
                                                required
                                                value={newAssignment.subject}
                                                onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
                                                className="appearance-none w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-black dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-inner cursor-pointer uppercase tracking-[0.1em]"
                                            >
                                                {teacherData.subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                                        <div className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em] border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                            {teacherData.subjects[0] || 'Unassigned'}
                                            <BookOpen size={14} className="opacity-30" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Homework Title</label>
                                <input
                                    required
                                    type="text"
                                    value={newAssignment.title}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                                    placeholder="e.g. week 11 assignment"
                                    className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[24px] text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-inner"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instruction / Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={newAssignment.description}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                                    placeholder="Provide detailed instructions for the students..."
                                    className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[32px] text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all dark:text-white resize-none leading-relaxed"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                    Question Resources (Max 5 Files)
                                </label>
                                <div className="min-h-[140px] p-4 bg-slate-50 dark:bg-slate-950/40 border-2 border-slate-100 dark:border-slate-800 border-dashed rounded-[32px] shadow-inner relative overflow-hidden">
                                    {newAssignment.questionFiles.length === 0 ? (
                                        <label className="flex flex-col items-center justify-center w-full h-[108px] cursor-pointer group">
                                            <Download className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 transition-colors mb-2" />
                                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-emerald-500 transition-colors">
                                                Click to upload or drag & drop
                                            </span>
                                            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                                PDF, DOCX, Images, Excel, PPT
                                            </p>
                                            <input
                                                type="file"
                                                multiple
                                                className="hidden"
                                                accept=".pdf,.docx,.doc,image/*,.xlsx,.xls,.pptx,.ppt"
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files);
                                                    if (files.length > 5) {
                                                        toast({ type: 'warning', message: 'Only first 5 files were added.' });
                                                        setNewAssignment({ ...newAssignment, questionFiles: files.slice(0, 5) });
                                                    } else {
                                                        setNewAssignment({ ...newAssignment, questionFiles: files });
                                                    }
                                                }}
                                            />
                                        </label>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {newAssignment.questionFiles.map((file, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl group/item shadow-sm">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-8 h-8 shrink-0 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-emerald-500">
                                                                <Paperclip size={14} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate uppercase tracking-tight">
                                                                    {file.name}
                                                                </p>
                                                                <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile(idx)}
                                                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                                {newAssignment.questionFiles.length < 5 && (
                                                    <label className="flex items-center justify-center p-2.5 border border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl cursor-pointer hover:bg-emerald-500/5 transition-all group/add">
                                                        <Plus size={16} className="text-slate-500 group-hover:text-emerald-500" />
                                                        <span className="ml-2 text-[9px] font-black text-slate-500 group-hover:text-emerald-500 uppercase tracking-widest">Add more</span>
                                                        <input
                                                            type="file"
                                                            multiple
                                                            className="hidden"
                                                            accept=".pdf,.docx,.doc,image/*,.xlsx,.xls,.pptx,.ppt"
                                                            onChange={(e) => {
                                                                const files = Array.from(e.target.files);
                                                                const remaining = 5 - newAssignment.questionFiles.length;
                                                                if (files.length > remaining) {
                                                                    toast({ type: 'warning', message: `Only ${remaining} more files could be added.` });
                                                                    setNewAssignment({
                                                                        ...newAssignment,
                                                                        questionFiles: [...newAssignment.questionFiles, ...files.slice(0, remaining)]
                                                                    });
                                                                } else {
                                                                    setNewAssignment({
                                                                        ...newAssignment,
                                                                        questionFiles: [...newAssignment.questionFiles, ...files]
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Submission Deadline</label>
                                    <div className="relative group" ref={calendarRef}>
                                        <button
                                            type="button"
                                            onClick={() => setShowCalendar(!showCalendar)}
                                            className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-emerald-50 dark:border-slate-800 rounded-[28px] text-sm font-black dark:text-white outline-none focus:border-emerald-400 transition-all shadow-sm flex items-center justify-between group"
                                        >
                                            <span className={newAssignment.closeTime ? "text-slate-900 dark:text-white" : "text-slate-400"}>
                                                {newAssignment.closeTime
                                                    ? new Date(newAssignment.closeTime).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    })
                                                    : "Select Deadline"}
                                            </span>
                                            <Calendar className="text-emerald-500 group-hover:scale-110 transition-transform" size={20} />
                                        </button>

                                        <AnimatePresence>
                                            {showCalendar && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute bottom-full left-0 mb-4 z-[9999] w-[480px]"
                                                >
                                                    <CustomNepaliHolidayCalendar
                                                        selectedDate={newAssignment.closeTime || new Date()}
                                                        onChange={(date) => {
                                                            setNewAssignment({ ...newAssignment, closeTime: date });
                                                            // Keep open to allow time selection if needed, or close on date select
                                                            // setShowCalendar(false); 
                                                        }}
                                                        holidays={holidays}
                                                        showTime={true}
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                                <div className="p-5 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[32px] border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-4 h-full">
                                    <AlertCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                                    <p className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 leading-relaxed uppercase tracking-wider">
                                        Portal Policy: Only PDF, DOCX, and common image formats (JPG, PNG) are accepted for student submissions.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-6 pt-4 pb-2">
                            <button
                                type="button"
                                onClick={() => setIsAssignmentModalOpen(false)}
                                className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-[24px] transition-all"
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                onClick={handleCreateAssignment}
                                className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[24px] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl shadow-emerald-500/20 active:scale-95"
                            >
                                Publish Portal
                            </button>
                        </div>
                    </form>
                </div>
            </PortalPopup>
        </div>
    );
};

export default Assignment;
