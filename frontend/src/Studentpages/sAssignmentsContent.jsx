import React, { useState, useMemo } from 'react';
import {
  FileBox,
  Clock,
  FileText,
  Link as LinkIcon,
  Folder,
  X,
  ChevronLeft,
  ChevronDown,
  FileSpreadsheet,
  BookOpen,
  Paperclip,
  GraduationCap,
  Check,
  User,
  Upload,
  Send,
  AlertCircle,
  Download as DownloadIcon
} from 'lucide-react';
import { toast } from '../MainSystemComponents/Toast';
import PortalPopup from '../MainSystemComponents/PortalPopup';
import assignmentService from '../Api/assignmentService';
import contentService from '../Api/contentService';
import ConfirmDialog from '../MainSystemComponents/ConfirmDialog';
import studentService from '../Api/studentService';
import calendarService from '../Api/calendarService';
import { useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

// --- Data Synchronization ---

const SAssignmentsContent = () => {
  const [activeTab, setActiveTab] = useState('assignments');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submissionFile, setSubmissionFile] = useState(null);

  const [assignments, setAssignments] = useState([]);
  const [resources, setResources] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [isResubmitConfirmOpen, setIsResubmitConfirmOpen] = useState(false);
  const [resubmitTargetId, setResubmitTargetId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsAssignment, setDetailsAssignment] = useState(null);

  // Folder Navigation State
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]);

  // Accordion/Layout State
  const [isOpenSectionExpanded, setIsOpenSectionExpanded] = useState(true);
  const [isClosedSectionExpanded, setIsClosedSectionExpanded] = useState(true);

  const fetchStudentBoard = useCallback(async () => {
    const studentId = localStorage.getItem('studentId');
    if (!studentId || studentId === 'undefined' || studentId === 'null') {
      toast({ type: 'error', message: 'Session expired. Please login again.' });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const student = await studentService.getStudentById(studentId);
      console.log("Fetched student profile:", student);

      if (!student) {
        toast({ type: 'error', message: 'Student profile not found.' });
        setLoading(false);
        return;
      }

      setStudentData(student);

      // 1. Identify Grade (Number or string from populated gradeId or studentClass)
      let grade = student.gradeId?.gradeNumber || student.studentClass;

      // If grade is still not found, try to extract from studentId or fallback to a default
      if (!grade && student.studentId) {
        // Some systems use first digit as grade, but we should rely on studentClass
        console.warn("Grade not found in student profile, checking studentClass:", student.studentClass);
      }

      // 2. Identify Section Name robustly
      let sectionName = 'ALL';
      if (student.sectionId && typeof student.sectionId === 'object' && student.sectionId.sectionName) {
        sectionName = student.sectionId.sectionName;
      } else if (typeof student.sectionId === 'string' && student.sectionId.length < 5) {
        sectionName = student.sectionId;
      } else if (student.sectionName) {
        sectionName = student.sectionName;
      }

      sectionName = String(sectionName).trim().toUpperCase();
      const gradeStr = String(grade || "").trim();

      console.log(`Synchronizing assignments for Grade: ${gradeStr}, Section: ${sectionName}`);

      const [assignmentData, resourceData] = await Promise.all([
        assignmentService.getStudentAssignments(gradeStr, sectionName, studentId),
        contentService.getStudentResources(gradeStr, sectionName, currentFolder?._id || 'root')
      ]);

      setAssignments(Array.isArray(assignmentData) ? assignmentData : []);
      setResources(Array.isArray(resourceData) ? resourceData : []);

      const submissionsMap = {};
      if (Array.isArray(assignmentData)) {
        assignmentData.forEach(a => {
          if (a.submissions) {
            submissionsMap[a._id || a.id] = a.submissions;
          }
        });
      }
      setAllSubmissions(submissionsMap);
    } catch (error) {
      console.error("Initialization error:", error);
      toast({ type: 'error', message: 'Failed to synchronize academic data.' });
    } finally {
      setLoading(false);
    }
  }, [currentFolder]);

  useEffect(() => {
    fetchStudentBoard();
  }, [fetchStudentBoard, currentFolder]);

  const handleOpenSubmit = (id) => {
    setSelectedAssignmentId(id);
    setIsSubmitModalOpen(true);
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!submissionFile) {
      toast({ type: 'error', message: 'Please select a file to submit.' });
      return;
    }

    const studentId = localStorage.getItem('studentId');
    if (!studentId) {
      toast({ type: 'error', message: 'Session expired. Please login again.' });
      return;
    }

    try {
      setLoading(true);
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(submissionFile);
      });

      const submissionData = {
        studentId: studentId,
        studentName: `${studentData.firstName} ${studentData.lastName}`,
        fileName: submissionFile.name,
        fileUrl: base64
      };

      await assignmentService.submitAssignment(selectedAssignmentId, submissionData);
      await fetchStudentBoard();

      toast({ type: 'success', message: 'Assignment submitted successfully!' });
      setIsSubmitModalOpen(false);
      setSubmissionFile(null);
    } catch (error) {
      console.error("Submission error:", error);
      toast({ type: 'error', message: error.response?.data?.message || 'Failed to submit assignment.' });
    } finally {
      setLoading(false);
    }
  };

  const openAssignments = useMemo(() =>
    assignments.filter(a => !a.status || a.status === 'open' || a.status === 'late'),
    [assignments]);

  const closedAssignments = useMemo(() =>
    assignments.filter(a => a.status === 'closed'),
    [assignments]);

  // --- Sub-component: AssignmentCard ---
  const AssignmentCard = ({ a }) => {
    const isOpen = a.status === 'open' || a.status === 'late';
    const cardId = a._id || a.id;
    // Since backend already filters submissions to only include the current student's
    const mySubmission = a.submissions && a.submissions.length > 0 ? a.submissions[0] : null;
    const hasSubmitted = !!mySubmission;

    return (
      <div
        onClick={() => {
          setDetailsAssignment(a);
          setIsDetailsOpen(true);
        }}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-all group cursor-pointer"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-medium text-slate-800 dark:text-slate-100">{a.title}</h4>
            {a.priority && a.priority.toLowerCase() !== 'normal' && (
              <span className={`px-3 py-1 text-[10px] font-medium rounded-lg ${a.priority === 'Urgent'
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600'
                : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                }`}>
                {a.priority}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <User size={12} className="text-slate-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              {a.teacherId ? `${a.teacherId.firstName || ''} ${a.teacherId.lastName || ''}` : "Unknown Teacher"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px] text-slate-400 font-medium mb-6">
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-slate-300" />
              {new Date(a.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-300" />
              {new Date(a.closeTime).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })} NPT
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
              <BookOpen size={12} />
              <span className="font-black uppercase tracking-widest">{a.subject}</span>
            </div>

            {a.fileName && (
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const names = a.fileName.split(', ').filter(Boolean);
                  return names.map((name, idx) => {
                    const url = a.questionFileUrls?.[idx];
                    return (
                      <a
                        key={idx}
                        href={url || '#'}
                        download={name}
                        onClick={(e) => { e.stopPropagation(); if (!url) { e.preventDefault(); toast({ type: 'info', message: 'Attachment data is not available for download.' }); } }}
                        className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-500 hover:text-emerald-600 transition-all rounded-lg border border-slate-100 dark:border-slate-800 group/file"
                      >
                        <Paperclip size={12} className="group-hover/file:scale-110 transition-transform" />
                        <span className="font-bold tracking-tight truncate max-w-[150px]">{name}</span>
                        {url && <DownloadIcon size={10} className="opacity-0 group-hover/file:opacity-100 transition-opacity" />}
                      </a>
                    );
                  });
                })()}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-50 dark:border-slate-800">
            {hasSubmitted ? (
              <div className="flex-1 w-full flex flex-col md:flex-row items-center gap-4 bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-[28px] border border-slate-100 dark:border-slate-800/80">
                {/* Result Section */}
                <div className="flex items-center gap-4 px-4 py-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50 shrink-0">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${mySubmission.gradingStatus === 'pass' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                    mySubmission.gradingStatus === 'fail' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' :
                      'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                    }`}>
                    {mySubmission.gradingStatus === 'pass' ? <Check size={16} strokeWidth={3} /> :
                      mySubmission.gradingStatus === 'fail' ? <X size={16} strokeWidth={3} /> :
                        <Clock size={16} strokeWidth={3} />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Result</span>
                    <span className={`text-[10px] font-black uppercase tracking-[0.1em] mt-1 ${mySubmission.gradingStatus === 'pass' ? 'text-emerald-600' :
                      mySubmission.gradingStatus === 'fail' ? 'text-red-600' :
                        'text-amber-600'
                      }`}>
                      {mySubmission.gradingStatus === 'pass' ? 'Completed' :
                        mySubmission.gradingStatus === 'fail' ? 'Incomplete' :
                          'Pending'}
                    </span>
                  </div>
                </div>

                {/* Vertical Divider for desktop */}
                <div className="hidden md:block w-px h-10 bg-slate-200 dark:bg-slate-700/50 mx-2" />

                {/* Remark Section */}
                <div className="flex-1 px-4 pt-0 pb-2">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Teachers's Note</span>
                  <p className={`text-[11px] font-bold mt-1 leading-relaxed ${mySubmission.remark ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 italic'}`}>
                    {mySubmission.remark || "Your submission is awaiting teacher review."}
                  </p>
                </div>

                {/* My Submission (Download) Section */}
                <a
                  href={mySubmission.fileUrl}
                  download={mySubmission.fileName}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-3 px-3 py-2 bg-indigo-50/80 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 transition-all group/sub shrink-0"
                  title="Download your submission copy"
                >
                  <div className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <DownloadIcon size={14} className="group-hover/sub:-translate-y-0.5 transition-transform" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-tight leading-none truncate max-w-[100px]">{mySubmission.fileName}</span>
                    <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest mt-1">My Submission</span>
                  </div>
                </a>
              </div>
            ) : (
              <div className="flex-1" /> /* Spacer if not submitted */
            )}

            {/* Main Action Button */}
            <div className="shrink-0">
              {hasSubmitted ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isOpen) {
                      setResubmitTargetId(cardId);
                      setIsResubmitConfirmOpen(true);
                    }
                  }}
                  className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${isOpen
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800/50'
                    : 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed'}`}
                  title={isOpen ? "Click to resubmit your latest work" : "Homework portal is closed"}
                >
                  <Check size={14} strokeWidth={3} />
                  {(mySubmission?.submittedAt && new Date(mySubmission.submittedAt) > new Date(a.closeTime)) ? 'Submitted Late' : 'Submitted'}
                </button>
              ) : isOpen ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenSubmit(cardId);
                  }}
                  className="flex items-center gap-3 px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                  <Upload size={14} />
                  Submit Work {a.status === 'late' && '(Late)'}
                </button>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors bg-red-50 text-red-600 border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800/50">
                  <X size={14} strokeWidth={3} />
                  Not Submitted
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Synchronizing Academic Data...</p>
      </div>
    );
  }

  const activeAssignment = assignments.find(a => (a._id || a.id) === selectedAssignmentId);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <FileBox className="text-emerald-500 w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Assignments & Content</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Academic Resource Hub</p>
            </div>
          </div>
        </div>

        <div className="flex border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'assignments' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <span className="flex items-center gap-2"><FileText size={16} /> Assignments</span>
            {activeTab === 'assignments' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'content' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <span className="flex items-center gap-2"><Folder size={16} /> Teacher's Content</span>
            {activeTab === 'content' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full" />}
          </button>
        </div>
      </div>

      {activeTab === 'assignments' ? (
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <button onClick={() => setIsOpenSectionExpanded(!isOpenSectionExpanded)} className="flex items-center gap-3 w-fit group">
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Open Assignments ({openAssignments.length})</h3>
                <ChevronDown className={`text-slate-400 group-hover:text-emerald-600 transition-all ${isOpenSectionExpanded ? '' : '-rotate-90'}`} size={18} />
              </button>
              {isOpenSectionExpanded && (
                <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-top-2 duration-300">
                  {openAssignments.length > 0 ? (
                    openAssignments.map(a => <AssignmentCard key={a._id || a.id} a={a} />)
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                      <FileText size={40} className="opacity-10 mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Currently, there is no open assignment.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <button onClick={() => setIsClosedSectionExpanded(!isClosedSectionExpanded)} className="flex items-center gap-3 w-fit group">
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Closed Assignment ({closedAssignments.length})</h3>
                <ChevronDown className={`text-slate-400 group-hover:text-emerald-600 transition-all ${isClosedSectionExpanded ? '' : '-rotate-90'}`} size={18} />
              </button>
              {isClosedSectionExpanded && (
                <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-top-2 duration-300">
                  {closedAssignments.length > 0 ? (
                    closedAssignments.map(a => <AssignmentCard key={a._id || a.id} a={a} />)
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                      <FileText size={40} className="opacity-10 mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No closed assignments found.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              {currentFolder && (
                <button
                  onClick={() => {
                    const newPath = [...folderPath];
                    newPath.pop();
                    setFolderPath(newPath);
                    setCurrentFolder(newPath.length > 0 ? newPath[newPath.length - 1] : null);
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-slate-500 hover:text-emerald-600 border border-slate-100 dark:border-slate-800 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">
                {currentFolder ? currentFolder.name : `Learning Resources (${resources.length})`}
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors h-auto">
            <div className="w-full overflow-x-auto scrollbar-hide">
              <table className="w-full min-w-[1000px] text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="pl-12 pr-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Name</th>
                    <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Teacher</th>
                    <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                    <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Shared On</th>
                    <th className="pr-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {resources.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                          <Folder size={48} className="text-slate-400" />
                          <p className="text-[10px] font-black uppercase tracking-widest">This folder is empty</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    resources.map((r) => (
                      <tr
                        key={r._id || r.id}
                        onClick={() => {
                          if (r.type === 'folder') {
                            setFolderPath([...folderPath, r]);
                            setCurrentFolder(r);
                          }
                        }}
                        className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all cursor-pointer"
                      >
                        <td className="pl-12 pr-6 py-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${r.type === 'folder' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                              {r.type === 'folder' ? <Folder size={18} /> : r.type === 'link' ? <LinkIcon size={18} /> : <FileText size={18} />}
                            </div>
                            {r.type === 'folder' ? (
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 transition-colors">{r.name}</span>
                            ) : (
                              <a
                                href={r.fileUrl || r.url}
                                target={r.type === 'link' ? "_blank" : undefined}
                                rel={r.type === 'link' ? "noopener noreferrer" : undefined}
                                download={r.type !== 'link' ? r.name : undefined}
                                onClick={(e) => e.stopPropagation()}
                                className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 transition-colors"
                              >
                                {r.name}
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-6 font-bold text-slate-500">
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-500">
                              {r.teacherId ? `${r.teacherId.firstName || ''} ${r.teacherId.lastName || ''}` : (r.teacherName || 'Instructor')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/10">{r.subject}</span>
                        </td>
                        <td className="px-6 py-6 text-xs font-bold text-slate-500">{new Date(r.sharedOn).toLocaleDateString()}</td>
                        <td className="pr-12 py-6">
                          <div className="flex items-center justify-end">
                            {r.type === 'folder' ? (
                              <div className="p-2 text-slate-300 group-hover:text-emerald-500 transition-all">
                                <ChevronDown className="-rotate-90" size={16} />
                              </div>
                            ) : (
                              <a
                                href={r.fileUrl || r.url}
                                target={r.type === 'link' ? "_blank" : undefined}
                                rel={r.type === 'link' ? "noopener noreferrer" : undefined}
                                download={r.type !== 'link' ? r.name : undefined}
                                onClick={(e) => e.stopPropagation()}
                                className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-500 rounded-lg transition-all"
                              >
                                {r.type === 'link' ? <LinkIcon size={16} /> : <DownloadIcon size={16} />}
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- Submission Modal --- */}
      <PortalPopup isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)}>
        <div className="bg-white dark:bg-slate-900 w-[95vw] max-w-2xl rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col pointer-events-auto">
          <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20"><Upload size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Submit Work</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{activeAssignment?.title}</p>
              </div>
            </div>
            <button onClick={() => setIsSubmitModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><X size={24} /></button>
          </div>

          <form onSubmit={handleSubmitWork} className="p-10 space-y-8">
            <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Upload Submission File</label>
              <label className="flex flex-col items-center justify-center w-full h-56 px-6 transition bg-slate-50/50 dark:bg-slate-950/60 border-2 border-slate-200 dark:border-slate-800 border-dashed rounded-[32px] cursor-pointer hover:border-emerald-500/50 focus:outline-none group shadow-inner">
                <div className="flex flex-col items-center space-y-4">
                  <Upload className={`w-12 h-12 ${submissionFile ? 'text-emerald-500' : 'text-slate-300 group-hover:text-emerald-500/50'}`} />
                  <div className="text-center">
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{submissionFile ? submissionFile.name : 'Click to select or drag & drop'}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">PDF, DOCX or ZIP (Max 10MB)</p>
                  </div>
                </div>
                <input type="file" className="hidden" onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)} />
              </label>
            </div>

            <div className="p-5 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[28px] border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-4">
              <AlertCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 leading-relaxed uppercase tracking-wider">Important: Ensure your file is correctly named before submitting. You can only submit once per assignment unless re-opened by your teacher.</p>
            </div>

            <div className="flex gap-6 pt-4">
              <button type="button" onClick={() => setIsSubmitModalOpen(false)} className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all">Cancel</button>
              <button type="submit" className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3"><Send size={18} />Submit Now</button>
            </div>
          </form>
        </div>
      </PortalPopup>

      {/* --- Resubmit Confirmation --- */}
      <ConfirmDialog
        isOpen={isResubmitConfirmOpen}
        onClose={() => setIsResubmitConfirmOpen(false)}
        onConfirm={() => {
          setIsResubmitConfirmOpen(false);
          handleOpenSubmit(resubmitTargetId);
        }}
        title="Resubmit Assignment?"
        message="You have already submitted this assignment. Are you sure you want to submit a new version? This will update your previous entry."
      />

      {/* --- Details Modal --- */}
      {isDetailsOpen && detailsAssignment && (
        <PortalPopup isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)}>
          {(() => {
            const assignment = detailsAssignment;
            const mySubmission = assignment.submissions && assignment.submissions.length > 0 ? assignment.submissions[0] : null;
            const hasSubmitted = !!mySubmission;
            const onClose = () => setIsDetailsOpen(false);

            return (
              <div className="bg-white dark:bg-slate-900 w-[95vw] max-w-3xl max-h-[85vh] rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col pointer-events-auto">

                {/* Header */}
                <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-start justify-between relative">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-500/10">
                      <FileBox size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{assignment.title}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{assignment.subject || 'Assignment'} Details</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition-all active:scale-90">
                    <X size={20} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-10 space-y-8 flex-1 overflow-y-auto custom-scrollbar">

                  {/* Badges & Teacher Row */}
                  <div className="flex flex-row items-center justify-between gap-4 flex-wrap">
                    {/* Left: Badges */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                        <BookOpen size={14} />
                        <span className="font-black text-[10px] uppercase tracking-widest">{assignment.subject}</span>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${hasSubmitted
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800/50'
                          : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800/50'
                        }`}>
                        {hasSubmitted ? <Check size={14} strokeWidth={3} /> : <AlertCircle size={14} strokeWidth={3} />}
                        {hasSubmitted ? 'Submitted' : 'Pending'}
                      </div>
                    </div>

                    {/* Right: Teacher name card */}
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 w-fit shrink-0">
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                        <User size={14} className="text-slate-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Instructor</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1 uppercase tracking-tight">
                          {assignment.teacherId ? `${assignment.teacherId.firstName || ''} ${assignment.teacherId.lastName || ''}` : "Unknown Teacher"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex flex-col sm:flex-row gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[28px] border border-slate-100 dark:border-slate-800">
                    <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <FileText size={14} className="text-emerald-500" />
                        Created At
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{new Date(assignment.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
                    <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Clock size={14} className="text-emerald-500" />
                        Submission Deadline
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{new Date(assignment.closeTime).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })} NPT</p>
                    </div>
                  </div>

                  {/* Result & Instructor's note section */}
                  {hasSubmitted && mySubmission && (
                    <div className="space-y-4">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Submission Status & Review</div>
                      <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-[28px] border border-slate-100 dark:border-slate-800/80">
                        {/* Result Section */}
                        <div className="flex items-center gap-4 px-4 py-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50 shrink-0">
                          <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${mySubmission.gradingStatus === 'pass' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                            mySubmission.gradingStatus === 'fail' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' :
                              'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                            }`}>
                            {mySubmission.gradingStatus === 'pass' ? <Check size={16} strokeWidth={3} /> :
                              mySubmission.gradingStatus === 'fail' ? <X size={16} strokeWidth={3} /> :
                                <Clock size={16} strokeWidth={3} />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Result</span>
                            <span className={`text-[10px] font-black uppercase tracking-[0.1em] mt-1 ${mySubmission.gradingStatus === 'pass' ? 'text-emerald-600' :
                              mySubmission.gradingStatus === 'fail' ? 'text-red-600' :
                                'text-amber-600'
                              }`}>
                              {mySubmission.gradingStatus === 'pass' ? 'Completed' :
                                mySubmission.gradingStatus === 'fail' ? 'Incomplete' :
                                  'Pending'}
                            </span>
                          </div>
                        </div>

                        {/* Vertical Divider for desktop */}
                        <div className="hidden md:block w-px h-10 bg-slate-200 dark:bg-slate-700/50 mx-2" />

                        {/* Remark Section */}
                        <div className="flex-1 px-4 pt-0 pb-2">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Instructor's Note</span>
                          <p className={`text-[11px] font-bold mt-1 leading-relaxed ${mySubmission.remark ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 italic'}`}>
                            {mySubmission.remark || "Your submission is awaiting teacher review."}
                          </p>
                        </div>

                        {/* My Submission downloadable file */}
                        <a
                          href={mySubmission.fileUrl}
                          download={mySubmission.fileName}
                          className="flex items-center gap-3 px-3 py-2 bg-indigo-50/80 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 transition-all group/sub shrink-0"
                          title="Download your submission copy"
                        >
                          <div className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <DownloadIcon size={14} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-tight leading-none truncate max-w-[100px]">{mySubmission.fileName}</span>
                            <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest mt-1">My Submission</span>
                          </div>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="space-y-4">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instruction / Description</div>
                    <div className="p-6 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-inner min-h-[100px] max-h-[35vh] overflow-y-auto custom-scrollbar">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {assignment.description}
                      </p>
                    </div>
                  </div>

                  {/* Question Resources */}
                  {assignment.fileName && (
                    <div className="space-y-3">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Question Resources / Attachments</div>
                      <div className="flex flex-wrap gap-3">
                        {(() => {
                          const names = assignment.fileName.split(', ').filter(Boolean);
                          return names.map((name, idx) => {
                            const url = assignment.questionFileUrls?.[idx];
                            return (
                              <a
                                key={idx}
                                href={url || '#'}
                                download={name}
                                onClick={(e) => { e.stopPropagation(); if (!url) { e.preventDefault(); toast({ type: 'info', message: 'Attachment data is not available for download.' }); } }}
                                className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 text-slate-500 hover:text-emerald-600 transition-all rounded-xl border border-slate-100 dark:border-slate-800 group/popup-file"
                              >
                                <Paperclip size={14} className="group-hover/popup-file:scale-110 transition-transform text-slate-400" />
                                <span className="font-bold text-xs tracking-tight truncate max-w-[200px]">{name}</span>
                                {url && <DownloadIcon size={12} className="opacity-40 group-hover/popup-file:opacity-100 transition-opacity ml-1" />}
                              </a>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer Buttons */}
                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex gap-4 justify-end px-10 py-8 bg-slate-50/50 dark:bg-slate-800/30">
                  <button
                    onClick={onClose}
                    className="flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                  >
                    Close Details
                  </button>
                </div>

              </div>
            );
          })()}
        </PortalPopup>
      )}
    </div>
  );
};

export default SAssignmentsContent;