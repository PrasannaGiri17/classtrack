import React, { useState, useMemo, useEffect } from 'react';
import {
  Bell,
  Megaphone,
  Plus,
  Search,
  Filter,
  Users,
  GraduationCap,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Send,
  Calendar,
  ChevronDown,
  Building,
  Target,
  User,
  Check,
  ArrowRight,
  Clock,
  Trash2
} from 'lucide-react';
import notificationService from '../Api/notificationService';
import NotificationModal from '../TeacherComponents/NotificationModal';
import PortalPopup from '../MainSystemComponents/PortalPopup';
import ConfirmDialog from '../MainSystemComponents/ConfirmDialog';
import { toast } from '../MainSystemComponents/Toast';
import gradeService from '../Api/gradeService';
import teacherService from '../Api/teacherService';
import { BookOpen } from 'lucide-react';



// --- Constants ---
const CURRENT_ADMIN_ID = localStorage.getItem('teacherId') || 'teacher_001';

const GRADES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const SECTIONS = ["A", "B", "C"];

const NotificationPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [grades, setGrades] = useState([]);
  const [teacherSubjects, setTeacherSubjects] = useState([]); // Teacher's own subject names
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState(new Set());


  // Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(null);


  // Top Filters
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterTarget, setFilterTarget] = useState(''); // Combined target
  const [targetOptions, setTargetOptions] = useState([]); // Combined grade + class options
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Creation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newPriority, setNewPriority] = useState('important');
  const [targetCategory, setTargetCategory] = useState('');
  const [targetDept, setTargetDept] = useState('');
  const [targetGrade, setTargetGrade] = useState('');
  const [targetSection, setTargetSection] = useState('');
  const [newSender, setNewSender] = useState('');
  const [newSenderType, setNewSenderType] = useState('teacher');


  // Preview State
  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => {
    fetchNotifications();
    fetchGrades();

    const handleEsc = (e) => {

      if (e.key === 'Escape') {
        setPreviewItem(null);
        setIsModalOpen(false);
        setIsDeleteDialogOpen(false);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setAnnouncements(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    try {
      const teacherId = localStorage.getItem('teacherId');
      if (teacherId && teacherId !== 'undefined') {
        const teacher = await teacherService.getTeacherById(teacherId);
        const classes = teacher.assignedClasses || [];

        const extractedGrades = [...new Set(classes.map(c => {
          const m = c.match(/(?:Grade\s+|G)(\d+)/i);
          return m ? m[1] : null;
        }).filter(Boolean))].map(g => `Grade ${g}`);

        setTargetOptions([...extractedGrades, ...classes]);
        setNewSender(teacher.teacherName || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || 'Teacher');
        setNewSenderType('teacher');

        // Collect this teacher's subjects for department notification filtering
        const subjects = [];
        if (teacher.primarySubject?.subjectName) subjects.push(teacher.primarySubject.subjectName.toLowerCase());
        else if (typeof teacher.primarySubject === 'string') subjects.push(teacher.primarySubject.toLowerCase());
        if (teacher.secondarySubject?.subjectName) subjects.push(teacher.secondarySubject.subjectName.toLowerCase());
        else if (typeof teacher.secondarySubject === 'string') subjects.push(teacher.secondarySubject.toLowerCase());
        setTeacherSubjects(subjects);
      }

      const data = await gradeService.getGrades();
      setGrades(data || []);
    } catch (error) {
      console.error("Error fetching context:", error);
    }
  };


  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(a => {
      const matchesPriority = filterPriority === 'all' || a.priority === filterPriority;
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.message.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMine = !showOnlyMine || a.senderId === CURRENT_ADMIN_ID;

      let matchesTarget = true;
      if (filterTarget) {
        matchesTarget = a.targetGroup.includes(filterTarget);
      }

      // Department filtering: if targetGroup is "Department: Science",
      // only show to teachers who have Science as primary or secondary subject.
      let matchesDept = true;
      const deptMatch = a.targetGroup?.match(/^Department:\s*(.+)$/i);
      if (deptMatch) {
        const targetSubject = deptMatch[1].trim().toLowerCase();
        // Show if teacher has that subject OR if targetSubjects not loaded yet (avoid hiding on load)
        if (teacherSubjects.length > 0) {
          matchesDept = teacherSubjects.some(s => s.includes(targetSubject) || targetSubject.includes(s));
        }
      }

      return matchesPriority && matchesSearch && matchesMine && matchesTarget && matchesDept;
    });
  }, [announcements, filterPriority, filterTarget, showOnlyMine, searchQuery, teacherSubjects]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newTitle || !newMessage) return;

    let finalTarget = targetCategory;
    if (targetCategory === 'Department') finalTarget = `${targetDept} Department`;
    if (targetCategory === 'Grade') {
      finalTarget = `Grade ${targetGrade}`;
      if (targetSection) finalTarget += ` - Section ${targetSection}`;
    }

    const notificationData = {
      title: newTitle,
      message: newMessage,
      priority: newPriority,
      targetGroup: finalTarget,
      sender: newSender,
      senderId: CURRENT_ADMIN_ID,
      senderType: newSenderType,
      schoolId: 1
    };


    try {
      await notificationService.createNotification(notificationData);
      setIsModalOpen(false);
      resetForm();
      fetchNotifications(); // Refresh list
      toast({ type: 'success', message: "Announcement dispatched successfully!" });
    } catch (error) {
      console.error("Error creating notification:", error);
      toast({ type: 'error', message: "Failed to send notification. Please try again." });
    }
  };


  const handleConfirmDelete = async () => {
    if (!selectedForDelete) return;
    try {
      await notificationService.deleteNotification(selectedForDelete._id);
      setIsDeleteDialogOpen(false);
      setSelectedForDelete(null);
      fetchNotifications(); // Refresh list
      toast({ type: 'success', message: "Notification deleted successfully." });
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast({ type: 'error', message: "Failed to delete notification. Please try again." });
    }
  };


  const handleDeleteClick = (e, item) => {
    e.stopPropagation(); // Prevent opening preview
    setSelectedForDelete(item);
    setIsDeleteDialogOpen(true);
  };


  const resetForm = () => {
    setNewTitle('');
    setNewMessage('');
    setNewPriority('important');
    setTargetCategory('');
    setTargetDept('');
    setTargetGrade('');
    setTargetSection('');
  };


  const handleOpenPreview = (item) => {
    setPreviewItem(item);
    setReadIds(prev => new Set(prev).add(item._id));
  };

  const getPriorityStyles = (p) => {
    switch (p) {
      case 'urgent': return 'bg-emerald-600 text-white border-emerald-500 shadow-sm';
      case 'warning': return 'bg-red-500 text-white border-red-400 shadow-sm';
      case 'important': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'syllabus': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getPriorityIcon = (p) => {
    switch (p) {
      case 'urgent': return <AlertCircle size={14} />;
      case 'warning': return <AlertTriangle size={14} />;
      case 'important': return <Info size={14} />;
      case 'syllabus': return <BookOpen size={14} />;
      default: return <Bell size={14} />;
    }
  };

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Megaphone className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Announcements</h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-2">Campus-wide Notification Dispatch</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-10 py-5 bg-emerald-600 text-white rounded-[28px] font-black text-xs tracking-[0.2em] shadow-2xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <Plus size={20} /> Create Announcement
        </button>
      </div>

      {/* Main Controls */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="xl:col-span-2 relative group">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border border-transparent focus:ring-4 focus:ring-emerald-500/10 text-xs font-black text-slate-600 dark:text-slate-300 rounded-2xl pl-5 pr-12 py-4 outline-none cursor-pointer transition-all"
          >
            <option value="all">All Priorities</option>
            <option value="important">Important</option>
            <option value="urgent">Urgent</option>
            <option value="warning">Warnings</option>
            <option value="syllabus">Syllabus</option>
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
        </div>

        <div className="xl:col-span-3 relative group">
          <select
            value={filterTarget}
            onChange={(e) => setFilterTarget(e.target.value)}
            className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border border-transparent focus:ring-4 focus:ring-emerald-500/10 text-xs font-black text-slate-600 dark:text-slate-300 rounded-2xl pl-5 pr-12 py-4 outline-none cursor-pointer transition-all"
          >
            <option value="">Select Target</option>
            {targetOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
        </div>

        <div className="xl:col-span-2">
          <button
            onClick={() => setShowOnlyMine(!showOnlyMine)}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black tracking-widest transition-all border ${showOnlyMine
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
          >
            <User size={14} /> My Dispatches
          </button>
        </div>

        <div className="xl:col-span-5 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all dark:text-slate-200"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-32 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[10px] font-black text-slate-400 tracking-[0.3em]">Loading announcements...</p>
          </div>
        ) : filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((a) => {
            const isRead = readIds.has(a._id);
            return (
              <div
                key={a._id}
                onClick={() => handleOpenPreview(a)}
                className={`bg-white dark:bg-slate-900 p-8 rounded-[40px] border shadow-sm hover:border-emerald-500/40 transition-all group cursor-pointer relative overflow-hidden ${isRead ? 'border-slate-100 dark:border-slate-800' : 'border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-900/5'
                  }`}
              >
                {!isRead && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                )}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl border text-[9px] font-black tracking-widest ${getPriorityStyles(a.priority)}`}>
                        {getPriorityIcon(a.priority)}
                        {a.priority}
                      </div>
                      <div className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-[9px] font-black text-slate-400 tracking-widest border border-transparent">
                        <Target size={10} className="text-emerald-500" />
                        {a.targetGroup}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-600 transition-colors leading-tight">{a.title}</h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2.5 max-w-4xl line-clamp-2">{a.message}</p>
                    </div>
                  </div>

                  <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between md:justify-start gap-4 text-[10px] font-bold text-slate-400 tracking-widest">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-emerald-500" />
                      {formatTimestamp(a.createdAt)}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-emerald-600/70 border border-emerald-500/10 flex items-center gap-2">
                        {a.senderId === CURRENT_ADMIN_ID ? 'Your Announcement' : `${a.sender} (${a.senderType})`}
                      </div>

                      <button
                        onClick={(e) => handleDeleteClick(e, a)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-32 text-center space-y-4 bg-white dark:bg-slate-900 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/10 rounded-[32px] flex items-center justify-center mx-auto">
              <Bell size={40} className="text-emerald-500/30" />
            </div>
            <p className="text-[10px] font-black text-slate-400 tracking-[0.3em]">System clear - no notifications</p>
          </div>
        )}
      </div>

      {/* Message Preview Mini Panel */}
      <PortalPopup isOpen={!!previewItem} onClose={() => setPreviewItem(null)}>
        {previewItem && (
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-8 duration-300 overflow-hidden flex flex-col max-h-[85vh]">

            <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl border text-[10px] font-black tracking-widest mb-4 ${getPriorityStyles(previewItem.priority)}`}>
                  {getPriorityIcon(previewItem.priority)}
                  {previewItem.priority}
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{previewItem.title}</h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all shrink-0"
              >
                <X size={28} />
              </button>
            </div>

            <div className="px-10 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-50 dark:border-slate-800 grid grid-cols-3 items-center text-center">
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Target size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 tracking-widest">Target Scope</p>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-300">{previewItem.targetGroup}</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 mx-auto">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <User size={16} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black text-slate-400 tracking-widest">Sender</p>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-300">
                    {previewItem.senderId === CURRENT_ADMIN_ID ? 'Your Announcement' : `${previewItem.sender} (${previewItem.senderType})`}
                  </p>

                </div>
              </div>

              <div className="flex items-center gap-3 justify-end text-right">
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 tracking-widest">Timestamp</p>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-300">{formatTimestamp(previewItem.createdAt)}</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Clock size={16} />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-base font-medium text-slate-600 dark:text-slate-300 leading-loose whitespace-pre-wrap">
                  {previewItem.message}
                </p>
              </div>
            </div>

            <div className="py-6 px-10 border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-center">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-8 py-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 rounded-2xl text-[10px] font-black tracking-widest transition-all"
              >
                Dismiss Preview
              </button>
            </div>
          </div>
        )}
      </PortalPopup>

      {/* Creation Modal Component */}
      <PortalPopup isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <NotificationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSend={handleSend}
          newTitle={newTitle} setNewTitle={setNewTitle}
          newMessage={newMessage} setNewMessage={setNewMessage}
          newPriority={newPriority} setNewPriority={setNewPriority}
          targetCategory={targetCategory} setTargetCategory={setTargetCategory}
          teacherTargets={targetOptions}
        />
      </PortalPopup>



      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Notification"
        message={`Are you sure you want to delete "${selectedForDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default NotificationPage;