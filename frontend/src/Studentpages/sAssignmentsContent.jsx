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
import studentService from '../Api/studentService';
import calendarService from '../Api/calendarService';
import { useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

// --- Mock Data ---
const CURRENT_STUDENT_NAME = "Cristiano Ronaldo";

const INITIAL_ASSIGNMENTS = [
  {
    id: 'a1',
    title: 'week 11 assignment',
    description: 'Explain the architecture of distributed systems with diagrams.',
    createdAt: 'May 11, 2025, 8:56 AM NPT',
    closeTime: '2025-06-20T23:59',
    isManuallyLocked: false,
    priority: 'Normal',
    grade: 'G6',
    section: 'A',
    subject: 'Math',
    fileName: 'assignment_questions.pdf'
  },
  {
    id: 'a3',
    title: 'Laboratory Experiment Report',
    description: 'Document the findings of the chemical titration experiment conducted on Monday.',
    createdAt: 'May 13, 2025, 10:30 AM NPT',
    closeTime: '2025-06-25T23:59',
    isManuallyLocked: false,
    priority: 'Urgent',
    grade: 'G6',
    section: 'A',
    subject: 'Science',
    fileName: 'lab_template.docx'
  },
  {
    id: 'a4',
    title: 'History Essay - World War II',
    description: 'Write a 1000-word essay on the impact of the Treaty of Versailles.',
    createdAt: 'May 14, 2025, 02:15 PM NPT',
    closeTime: '2025-06-30T23:59',
    isManuallyLocked: false,
    priority: 'Normal',
    grade: 'G6',
    section: 'A',
    subject: 'History'
  },
  {
    id: 'a2',
    title: 'week 10 assignment',
    description: 'Build a reusable button component with multiple variants.',
    createdAt: 'May 04, 2025, 9:12 AM NPT',
    closeTime: '2025-05-10T23:59',
    isManuallyLocked: true,
    priority: 'Normal',
    grade: 'G6',
    section: 'A',
    subject: 'Computer'
  }
];

const INITIAL_RESOURCES = [
  {
    id: 'r1',
    name: 'Distributed Systems and Cloud Computing',
    sharedOn: 'February 27, 2025',
    type: 'pdf',
    size: '2.4 MB',
    teacherName: 'Prof. Carlo Ancelotti',
    subject: 'Cloud Computing'
  },
  {
    id: 'r2',
    name: 'Full Stack Development Guide',
    sharedOn: 'November 17, 2025',
    type: 'folder',
    size: '-',
    teacherName: 'Zinedine Zidane',
    subject: 'Web Development'
  },
  {
    id: 'r3',
    name: 'UI/UX Best Practices',
    sharedOn: 'March 01, 2025',
    type: 'link',
    size: '-',
    teacherName: 'Raul Gonzalez',
    subject: 'Design Systems',
    url: 'https://example.com'
  },
  {
    id: 'r4',
    name: 'Lecture Notes - Week 5',
    sharedOn: 'February 20, 2025',
    type: 'docx',
    size: '1.1 MB',
    teacherName: 'Xabi Alonso',
    subject: 'Computer Architecture'
  },
];

const MOCK_SUBMISSIONS = {
  'a1': [
    { id: 's1', studentName: 'Cristiano Ronaldo', submittedAt: 'May 12, 2025, 10:30 AM', fileName: 'architecture_diag.pdf', fileUrl: '#', remark: 'Excellent depth in diagrams.', gradingStatus: 'pass' },
    { id: 's2', studentName: 'Luka Modric', submittedAt: 'May 12, 2025, 11:15 AM', fileName: 'dist_systems_luka.pdf', fileUrl: '#', remark: 'Very precise explanation.', gradingStatus: 'pass' },
    { id: 's3', studentName: 'Vinicius Junior', submittedAt: 'May 13, 2025, 09:20 AM', fileName: 'my_work.docx', fileUrl: '#', remark: '', gradingStatus: 'none' },
    { id: 's4', studentName: 'Jude Bellingham', submittedAt: 'May 14, 2025, 04:45 PM', fileName: 'bellingham_week11.pdf', fileUrl: '#', remark: 'Missing second section diagram.', gradingStatus: 'fail' },
  ],
  'a2': [
    { id: 's5', studentName: 'Federico Valverde', submittedAt: 'May 06, 2025, 08:00 AM', fileName: 'button_variants.zip', fileUrl: '#', remark: 'Good code quality.', gradingStatus: 'pass' },
  ]
};

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
      setStudentData(student);

      if (student) {
        const grade = student.studentClass;
        const sectionName = student.sectionId?.sectionName || student.sectionId || 'ALL';

        const [assignmentData, resourceData] = await Promise.all([
          assignmentService.getStudentAssignments(grade, sectionName, studentId),
          contentService.getStudentResources(grade, sectionName)
        ]);

        setAssignments(assignmentData);
        setResources(resourceData);

        const submissionsMap = {};
        assignmentData.forEach(a => {
          if (a.submissions) {
            submissionsMap[a._id || a.id] = a.submissions;
          }
        });
        setAllSubmissions(submissionsMap);
      }
    } catch (error) {
      console.error("Initialization error:", error);
      toast({ type: 'error', message: 'Failed to synchronize data.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudentBoard();
  }, [fetchStudentBoard]);

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
    assignments.filter(a => a.status === 'open' || a.status === 'late'),
    [assignments]);

  const closedAssignments = useMemo(() =>
    assignments.filter(a => a.status === 'closed'),
    [assignments]);

  // --- Sub-component: AssignmentCard ---
  const AssignmentCard = ({ a }) => {
    const isOpen = a.status === 'open' || a.status === 'late';
    const cardId = a._id || a.id;
    const mySubmission = (allSubmissions[cardId] || []).find(s => s.studentId?.toString() === studentData?._id?.toString());
    const hasSubmitted = !!mySubmission;

    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-all group">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-medium text-slate-800 dark:text-slate-100">{a.title}</h4>
            <span className={`px-3 py-1 text-[10px] font-medium rounded-lg ${a.priority === 'Urgent'
              ? 'bg-red-50 dark:bg-red-900/20 text-red-600'
              : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
              }`}>
              {a.priority || 'Normal'}
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
                        onClick={(e) => { if (!url) { e.preventDefault(); toast({ type: 'info', message: 'Attachment data is not available for download.' }); } }}
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

          <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
            {hasSubmitted ? (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800/50`}>
                <Check size={14} strokeWidth={3} />
                {(mySubmission?.submittedAt && new Date(mySubmission.submittedAt) > new Date(a.closeTime)) ? 'Submitted Late' : 'Submitted'}
              </div>
            ) : isOpen ? (
              <button
                onClick={() => handleOpenSubmit(cardId)}
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

            {hasSubmitted && mySubmission?.remark && (
              <div className="flex flex-col gap-1 max-w-[200px]">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Teacher's Remark</span>
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 italic truncate">
                  "{mySubmission.remark}"
                </p>
              </div>
            )}
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
        <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors h-auto">
          <div className="w-full overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[1000px] text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="pl-12 pr-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Name</th>
                  <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Teacher</th>
                  <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                  <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Shared On</th>
                  <th className="pr-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {resources.map((r) => (
                  <tr key={r._id || r.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all cursor-pointer">
                    <td className="pl-12 pr-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${r.type === 'folder' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                          {r.type === 'folder' ? <Folder size={18} /> : r.type === 'link' ? <LinkIcon size={18} /> : <FileText size={18} />}
                        </div>
                        <a href={r.fileUrl || r.url} download={r.name} className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 transition-colors">{r.name}</a>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-bold text-slate-500">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-500">{r.teacherName || 'Instructor'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/10">{r.subject}</span>
                    </td>
                    <td className="px-6 py-6 text-xs font-bold text-slate-500">{new Date(r.sharedOn).toLocaleDateString()}</td>
                    <td className="pr-12 py-6">
                      <div className="flex items-center justify-end">
                        <a href={r.fileUrl || r.url} download={r.name} className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-500 rounded-lg transition-all"><DownloadIcon size={16} /></a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    </div>
  );
};

export default SAssignmentsContent;