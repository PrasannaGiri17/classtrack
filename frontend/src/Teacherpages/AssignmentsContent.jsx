import React, { useState, useMemo } from 'react';
import {
  FileBox,
  Plus,
  Search,
  Calendar,
  Clock,
  Lock,
  Unlock,
  FileText,
  Link as LinkIcon,
  Folder,
  X,
  AlertCircle,
  Download,
  ChevronLeft,
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  FileSpreadsheet,
  Users,
  BookOpen,
  Paperclip,
  GraduationCap,
  Check
} from 'lucide-react';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from 'react-datepicker';
import { toast } from '../MainSystemComponents/Toast';
import PortalPopup from '../MainSystemComponents/PortalPopup';

// --- Types ---
const INITIAL_ASSIGNMENTS = [
  {
    id: 'a1',
    title: 'week 11 assignment',
    description: 'Explain the architecture of distributed systems with diagrams.',
    createdAt: 'May 11, 2025, 8:56 AM NPT',
    closeTime: '2025-05-17T23:59',
    isManuallyLocked: false,
    priority: 'Normal',
    grade: 'G6',
    section: 'A',
    subject: 'Math',
    fileName: 'assignment_questions.pdf'
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
  { id: 'r1', name: 'Distributed Systems and Cloud Computing', sharedOn: 'February 27, 2025', type: 'pdf', size: '2.4 MB' },
  { id: 'r2', name: 'Full Stack Development Guide', sharedOn: 'November 17, 2025', type: 'folder', size: '-' },
  { id: 'r3', name: 'UI/UX Best Practices', sharedOn: 'March 01, 2025', type: 'link', size: '-', url: 'https://example.com' },
  { id: 'r4', name: 'Lecture Notes - Week 5', sharedOn: 'February 20, 2025', type: 'docx', size: '1.1 MB' },
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

const TEACHER_CLASSES = ["G6 - A", "G6 - B", "G7 - A", "G8 - C"];
const TEACHER_SUBJECTS = ["Math", "Science", "Computer"];

const AssignmentsContent = () => {
  const [activeTab, setActiveTab] = useState('assignments');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);

  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [allSubmissions, setAllSubmissions] = useState(MOCK_SUBMISSIONS);

  // Accordion/Layout State
  const [isOpenSectionExpanded, setIsOpenSectionExpanded] = useState(true);
  const [isClosedSectionExpanded, setIsClosedSectionExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    closeTime: null,
    classRef: TEACHER_CLASSES[0],
    subject: TEACHER_SUBJECTS[0],
    questionFile: null
  });
  const [newResource, setNewResource] = useState({ name: '', type: 'pdf', url: '', file: null });

  // --- Logic Helpers ---
  const isPastDeadline = (closeTime) => {
    return new Date() > new Date(closeTime);
  };

  const openAssignments = useMemo(() =>
    assignments.filter(a => !isPastDeadline(a.closeTime) && a.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [assignments, searchQuery]);

  const closedAssignments = useMemo(() =>
    assignments.filter(a => isPastDeadline(a.closeTime) && a.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [assignments, searchQuery]);

  const toggleLock = (id) => {
    setAssignments(prev => prev.map(a => {
      if (a.id === id && isPastDeadline(a.closeTime)) {
        return { ...a, isManuallyLocked: !a.isManuallyLocked };
      }
      return a;
    }));
    toast({ type: 'success', message: 'Homework portal access updated.' });
  };

  const handleCreateAssignment = (e) => {
    e.preventDefault();
    if (!newAssignment.closeTime) {
      toast({ type: 'error', message: 'Please select a submission deadline.' });
      return;
    }

    const [grade, section] = newAssignment.classRef.split(' - ');

    const entry = {
      id: Date.now().toString(),
      title: newAssignment.title,
      description: newAssignment.description,
      createdAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) + " NPT",
      closeTime: newAssignment.closeTime.toISOString(),
      isManuallyLocked: false,
      priority: 'Normal',
      grade: grade,
      section: section,
      subject: newAssignment.subject,
      fileName: newAssignment.questionFile?.name
    };
    setAssignments([entry, ...assignments]);
    setIsAssignmentModalOpen(false);
    setNewAssignment({
      title: '',
      description: '',
      closeTime: null,
      classRef: TEACHER_CLASSES[0],
      subject: TEACHER_SUBJECTS[0],
      questionFile: null
    });
    toast({ type: 'success', message: 'Homework portal created.' });
  };

  const handleAddResource = (e) => {
    e.preventDefault();
    const entry = {
      id: Date.now().toString(),
      name: newResource.name,
      sharedOn: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      type: newResource.type,
      size: newResource.type === 'link' || newResource.type === 'folder' ? '-' : 'Unknown'
    };
    setResources([entry, ...resources]);
    setIsResourceModalOpen(false);
    setNewResource({ name: '', type: 'pdf', url: '', file: null });
    toast({ type: 'success', message: 'Resource shared successfully.' });
  };

  const viewFullReport = (id) => {
    setSelectedAssignmentId(id);
    setActiveTab('report');
  };

  const updateSubmissionGrading = (submissionId, status) => {
    if (!selectedAssignmentId) return;

    setAllSubmissions(prev => ({
      ...prev,
      [selectedAssignmentId]: prev[selectedAssignmentId].map(sub =>
        sub.id === submissionId ? { ...sub, gradingStatus: status } : sub
      )
    }));

    const msg = status === 'pass' ? 'Marked as Completed' : status === 'fail' ? 'Marked as Incomplete' : 'Grading reset';
    toast({ type: 'success', message: msg });
  };

  const updateSubmissionRemark = (submissionId, remark) => {
    if (!selectedAssignmentId) return;

    setAllSubmissions(prev => ({
      ...prev,
      [selectedAssignmentId]: prev[selectedAssignmentId].map(sub =>
        sub.id === submissionId ? { ...sub, remark } : sub
      )
    }));
  };

  // --- Card Component ---
  const AssignmentCard = ({ a }) => {
    const past = isPastDeadline(a.closeTime);
    const statusText = past ? (a.isManuallyLocked ? 'Closed' : 'Open (Late)') : 'Open';

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
              {a.createdAt}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-slate-300" />
              {new Date(a.closeTime).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })} NPT
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
              <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-500 rounded-lg border border-slate-100 dark:border-slate-800">
                <Paperclip size={12} />
                <span className="font-bold tracking-tight truncate max-w-[120px]">{a.fileName}</span>
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
                onClick={() => toggleLock(a.id)}
                disabled={!past}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!past ? 'opacity-20 cursor-not-allowed bg-slate-50 text-slate-400' :
                  a.isManuallyLocked ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  }`}
              >
                {a.isManuallyLocked ? <Lock size={12} /> : <Unlock size={12} />}
                {a.isManuallyLocked ? 'Unlock Portal' : 'Lock Portal'}
              </button>
            </div>

            <button
              onClick={() => viewFullReport(a.id)}
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

  const activeAssignment = assignments.find(a => a.id === selectedAssignmentId);
  const submissions = selectedAssignmentId ? (allSubmissions[selectedAssignmentId] || []) : [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      {/* Header & Tabs */}
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

          <div className="flex items-center gap-3">
            <button
              onClick={() => activeTab === 'assignments' ? setIsAssignmentModalOpen(true) : setIsResourceModalOpen(true)}
              className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={18} /> {activeTab === 'assignments' ? 'Create New Homework Portal' : 'Add New Resource'}
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'assignments' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            <span className="flex items-center gap-2">
              <FileText size={16} /> Assignments
            </span>
            {activeTab === 'assignments' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'content' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            <span className="flex items-center gap-2">
              <Folder size={16} /> Teacher's Content
            </span>
            {activeTab === 'content' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full" />
            )}
          </button>
          {activeTab === 'report' && (
            <button
              className="px-8 py-4 text-xs font-black uppercase tracking-widest transition-all relative text-emerald-600"
            >
              <span className="flex items-center gap-2">
                <FileSpreadsheet size={16} /> Submission Report
              </span>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full" />
            </button>
          )}
        </div>
      </div>

      {activeTab === 'assignments' ? (
        <div className="space-y-8">
          {/* Top Control Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="relative w-full max-w-lg">
              <input
                type="text"
                placeholder="Search Assignments"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-6 pr-12 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-sm"
              />
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            </div>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-slate-400">View as :</span>
                <div className="flex items-center bg-slate-50 dark:bg-slate-800 p-1 rounded-lg">
                  <button className="p-1.5 text-emerald-600"><LayoutGrid size={16} /></button>
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                  <button className="p-1.5 text-slate-400 hover:text-emerald-600"><ListIcon size={16} /></button>
                </div>
              </div>

              <button className="flex items-center gap-2 px-6 py-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all">
                <Calendar size={16} /> View All Upcoming Deadlines
              </button>
            </div>
          </div>

          {/* Assignments Sections */}
          <div className="space-y-6">
            <div className="space-y-4">
              <button
                onClick={() => setIsOpenSectionExpanded(!isOpenSectionExpanded)}
                className="flex items-center gap-3 w-fit group"
              >
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
                  Open Assignments ({openAssignments.length})
                </h3>
                <ChevronDown className={`text-slate-400 group-hover:text-emerald-600 transition-all ${isOpenSectionExpanded ? '' : '-rotate-90'}`} size={18} />
              </button>

              {isOpenSectionExpanded && (
                <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-top-2 duration-300">
                  {openAssignments.length > 0 ? (
                    openAssignments.map(a => <AssignmentCard key={a.id} a={a} />)
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
              <button
                onClick={() => setIsClosedSectionExpanded(!isClosedSectionExpanded)}
                className="flex items-center gap-3 w-fit group"
              >
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
                  Closed Assignment ({closedAssignments.length})
                </h3>
                <ChevronDown className={`text-slate-400 group-hover:text-emerald-600 transition-all ${isClosedSectionExpanded ? '' : '-rotate-90'}`} size={18} />
              </button>

              {isClosedSectionExpanded && (
                <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-top-2 duration-300">
                  {closedAssignments.length > 0 ? (
                    closedAssignments.map(a => <AssignmentCard key={a.id} a={a} />)
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
      ) : activeTab === 'content' ? (
        <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors h-auto">
          <div className="w-full overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[800px] text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="pl-12 pr-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Name</th>
                  <th className="px-6 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Shared On</th>
                  <th className="pr-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {resources.map((r) => (
                  <tr key={r.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all cursor-pointer">
                    <td className="pl-12 pr-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${r.type === 'folder' ? 'bg-amber-50 text-amber-500' :
                          r.type === 'link' ? 'bg-emerald-50 text-emerald-500' :
                            'bg-emerald-50 text-emerald-500'
                          }`}>
                          {r.type === 'folder' ? <Folder size={18} /> :
                            r.type === 'link' ? <LinkIcon size={18} /> :
                              <FileText size={18} />}
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 transition-colors">
                          {r.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-xs font-bold text-slate-500">{r.sharedOn}</td>
                    <td className="pr-12 py-6 text-xs font-bold text-slate-500">{r.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Submission Report View */
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
                    <tr key={sub.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all">
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
                          {sub.submittedAt}
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <a
                          href={sub.fileUrl}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-500 hover:text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all group/file"
                        >
                          <Paperclip size={12} className="group-hover/file:scale-110 transition-transform" />
                          {sub.fileName}
                        </a>
                      </td>
                      <td className="px-4 py-5">
                        <input
                          type="text"
                          placeholder="Teacher's Remark..."
                          value={sub.remark}
                          onChange={(e) => updateSubmissionRemark(sub.id, e.target.value)}
                          className="w-full min-w-[200px] px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-inner"
                        />
                      </td>
                      <td className="pr-12 pl-4 py-5">
                        <div className="flex items-center justify-center gap-3">
                          {/* PASS BUTTON (TICK) */}
                          <button
                            onClick={() => updateSubmissionGrading(sub.id, sub.gradingStatus === 'pass' ? 'none' : 'pass')}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${sub.gradingStatus === 'pass'
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-emerald-500'
                              }`}
                            title="Mark as Completed"
                          >
                            <Check size={18} strokeWidth={3} />
                          </button>

                          {/* FAIL BUTTON (CROSS) - Hidden if Pass is chosen as requested, but visible otherwise */}
                          {sub.gradingStatus !== 'pass' && (
                            <button
                              onClick={() => updateSubmissionGrading(sub.id, sub.gradingStatus === 'fail' ? 'none' : 'fail')}
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
      )}

      {/* --- Modals --- */}
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

          <form id="create-assignment-form" onSubmit={handleCreateAssignment} className="p-8 lg:p-8 space-y-6 overflow-y-auto max-h-[85vh] scrollbar-hide">
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
                      {TEACHER_CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>

                {TEACHER_SUBJECTS.length > 1 ? (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teaching Subject</label>
                    <div className="relative group">
                      <select
                        required
                        value={newAssignment.subject}
                        onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
                        className="appearance-none w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-black dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-inner cursor-pointer uppercase tracking-[0.1em]"
                      >
                        {TEACHER_SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                    <div className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em] border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      {TEACHER_SUBJECTS[0] || 'Unassigned'}
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Question File</label>
                <label className="flex items-center justify-center w-full h-28 px-4 transition bg-slate-900/60 dark:bg-slate-950/60 border-2 border-slate-700/50 dark:border-slate-800 border-dashed rounded-[32px] cursor-pointer hover:border-emerald-500/50 focus:outline-none group shadow-inner">
                  <div className="flex flex-col items-center space-y-2">
                    <Download className={`w-8 h-8 ${newAssignment.questionFile ? 'text-emerald-500' : 'text-slate-500'}`} />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-emerald-500 transition-colors">
                      {newAssignment.questionFile ? newAssignment.questionFile.name : 'Click to upload or drag & drop'}
                    </span>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setNewAssignment({ ...newAssignment, questionFile: e.target.files?.[0] || null })}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Submission Deadline</label>
                  <div className="relative group">
                    <DatePicker
                      required
                      selected={newAssignment.closeTime}
                      onChange={(date) => setNewAssignment({ ...newAssignment, closeTime: date })}
                      showTimeSelect
                      timeIntervals={15}
                      dateFormat="MM/dd/yyyy h:mm aa"
                      placeholderText="MM/DD/YYYY --:-- --"
                      className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-emerald-50 dark:border-slate-800 rounded-[28px] text-sm font-black dark:text-white outline-none focus:border-emerald-400 transition-all shadow-sm pr-14"
                      wrapperClassName="w-full"
                      popperPlacement="bottom-start"
                      portalId="root"
                    />
                    <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-200 pointer-events-none group-focus-within:text-emerald-500 transition-colors" size={20} />
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
                className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[24px] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl shadow-emerald-500/20 active:scale-95"
              >
                Publish Portal
              </button>
            </div>
          </form>
        </div>
      </PortalPopup>

      <PortalPopup isOpen={isResourceModalOpen} onClose={() => setIsResourceModalOpen(false)}>
        <div className="bg-white dark:bg-slate-900 w-[95vw] max-w-3xl rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col pointer-events-auto">
          <div className="px-8 py-5 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Download size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Add New Resource</h3>
            </div>
            <button onClick={() => setIsResourceModalOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><X size={22} /></button>
          </div>

          <form id="add-resource-form" onSubmit={handleAddResource} className="p-8 lg:p-10 space-y-10 overflow-y-auto max-h-[90vh] scrollbar-hide">
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resource Name</label>
                <input
                  required
                  type="text"
                  value={newResource.name}
                  onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                  placeholder="e.g. Distributed Systems Syllabus"
                  className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[20px] text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-inner"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Content Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'pdf', icon: FileText, label: 'PDF' },
                    { id: 'docx', icon: FileText, label: 'DOCX' },
                    { id: 'link', icon: LinkIcon, label: 'Link' },
                    { id: 'folder', icon: Folder, label: 'Folder' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setNewResource({ ...newResource, type: type.id })}
                      className={`flex flex-col items-center justify-center gap-3 p-5 rounded-[24px] border-2 transition-all ${newResource.type === type.id
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                        : 'border-slate-50 dark:border-slate-800 text-slate-400 hover:border-slate-200'
                        }`}
                    >
                      <type.icon size={24} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {newResource.type === 'link' ? (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">External URL</label>
                  <input
                    required
                    type="url"
                    value={newResource.url}
                    onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                    placeholder="https://example.com/lecture-notes"
                    className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[20px] text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-inner"
                  />
                </div>
              ) : newResource.type !== 'folder' && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select File</label>
                  <label className="flex items-center justify-center w-full h-44 px-4 transition bg-slate-900/60 dark:bg-slate-950/60 border-2 border-slate-700/50 dark:border-slate-800 border-dashed rounded-[32px] cursor-pointer hover:border-emerald-500/50 focus:outline-none group shadow-inner">
                    <div className="flex flex-col items-center space-y-4">
                      <Download className="w-10 h-10 text-slate-500" />
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-emerald-500 transition-colors">Click to upload or drag & drop</span>
                    </div>
                    <input type="file" className="hidden" onChange={(e) => setNewResource({ ...newResource, file: e.target.files?.[0] || null })} />
                  </label>
                </div>
              )}
            </div>

            <div className="flex gap-6 pt-6 pb-2">
              <button
                type="button"
                onClick={() => setIsResourceModalOpen(false)}
                className="flex-1 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-[24px] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[24px] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl shadow-emerald-500/20 active:scale-95"
              >
                Share Resource
              </button>
            </div>
          </form>
        </div>
      </PortalPopup>
    </div>
  );
};

export default AssignmentsContent;