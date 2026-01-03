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
  Clock
} from 'lucide-react';

// --- Dummy Data ---
const CURRENT_ADMIN_ID = 'admin_001';

const INITIAL_ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Final Term Examination Schedule',
    message: 'The final term examination for grades 8-12 will commence from March 15th. Please download the routine from the downloads section. All students are required to carry their ID cards and report to the exam hall 30 minutes before the commencement of the exam. The detailed subject-wise routine has been attached to the school portal.',
    priority: 'urgent',
    target: 'All School',
    sender: 'Academic Office',
    senderId: 'office_01',
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    title: 'Science Department Meeting',
    message: 'Urgent meeting for all science faculty in the staff room at 3 PM today to discuss lab equipment upgrades and the upcoming regional science fair preparations. Your presence is mandatory as we will be finalizing the budget allocations.',
    priority: 'important',
    target: 'Science Department',
    sender: 'Admin User',
    senderId: CURRENT_ADMIN_ID,
    timestamp: '4 hours ago'
  },
  {
    id: '3',
    title: 'Safety Protocol: Heavy Rain Warning',
    message: 'A heavy rain warning has been issued by the meteorological department for the next 48 hours. Schools will operate with modified hours tomorrow. Classes will conclude at 12:30 PM. Parents are requested to pick up their wards on time. Extra-curricular activities stand cancelled for the day.',
    priority: 'warning',
    target: 'All School',
    sender: 'Administration',
    senderId: 'admin_sys',
    timestamp: 'Yesterday'
  }
];

const DEPARTMENTS = ["Science", "Math", "English", "Arts", "Sports", "Social Studies"];
const GRADES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const SECTIONS = ["A", "B", "C"];

const NotificationPage = () => {
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [readIds, setReadIds] = useState(new Set());
  
  // Top Filters
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Creation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newPriority, setNewPriority] = useState('important');
  const [targetCategory, setTargetCategory] = useState('All School');
  const [targetDept, setTargetDept] = useState('');
  const [targetGrade, setTargetGrade] = useState('');
  const [targetSection, setTargetSection] = useState('');

  // Preview State
  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setPreviewItem(null);
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(a => {
      const matchesPriority = filterPriority === 'all' || a.priority === filterPriority;
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           a.message.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMine = !showOnlyMine || a.senderId === CURRENT_ADMIN_ID;
      
      let matchesTarget = true;
      if (filterGrade) {
        matchesTarget = a.target.includes(`Grade ${filterGrade}`);
        if (filterSection) {
          matchesTarget = a.target.includes(`Grade ${filterGrade} - Section ${filterSection}`);
        }
      }

      return matchesPriority && matchesSearch && matchesMine && matchesTarget;
    });
  }, [announcements, filterPriority, filterGrade, filterSection, showOnlyMine, searchQuery]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newTitle || !newMessage) return;

    let finalTarget = targetCategory;
    if (targetCategory === 'Department') finalTarget = `${targetDept} Department`;
    if (targetCategory === 'Grade') {
      finalTarget = `Grade ${targetGrade}`;
      if (targetSection) finalTarget += ` - Section ${targetSection}`;
    }

    const newEntry = {
      id: Date.now().toString(),
      title: newTitle,
      message: newMessage,
      priority: newPriority,
      target: finalTarget,
      sender: 'Admin User',
      senderId: CURRENT_ADMIN_ID,
      timestamp: 'Just now'
    };

    setAnnouncements([newEntry, ...announcements]);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewTitle('');
    setNewMessage('');
    setNewPriority('important');
    setTargetCategory('All School');
    setTargetDept('');
    setTargetGrade('');
    setTargetSection('');
  };

  const handleOpenPreview = (item) => {
    setPreviewItem(item);
    setReadIds(prev => new Set(prev).add(item.id));
  };

  const getPriorityStyles = (p) => {
    switch(p) {
      case 'urgent': return 'bg-emerald-600 text-white border-emerald-500 shadow-sm';
      case 'warning': return 'bg-red-500 text-white border-red-400 shadow-sm';
      case 'important': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    }
  };

  const getPriorityIcon = (p) => {
    switch(p) {
      case 'urgent': return <AlertCircle size={14} />;
      case 'warning': return <AlertTriangle size={14} />;
      case 'important': return <Info size={14} />;
    }
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
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Campus-wide Notification Dispatch</p>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-10 py-5 bg-emerald-600 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
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
            <option value="all">ALL PRIORITIES</option>
            <option value="important">IMPORTANT</option>
            <option value="urgent">URGENT</option>
            <option value="warning">WARNINGS</option>
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
        </div>

        <div className="xl:col-span-2 relative group">
          <select 
            value={filterGrade}
            onChange={(e) => {
              setFilterGrade(e.target.value);
              setFilterSection('');
            }}
            className="appearance-none w-full bg-slate-50 dark:bg-slate-800 border border-transparent focus:ring-4 focus:ring-emerald-500/10 text-xs font-black text-slate-600 dark:text-slate-300 rounded-2xl pl-5 pr-12 py-4 outline-none cursor-pointer transition-all"
          >
            <option value="">WHOLE SCHOOL</option>
            {GRADES.map(g => <option key={g} value={g}>GRADE {g}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
        </div>

        <div className="xl:col-span-2 relative group">
          <select 
            disabled={!filterGrade}
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className={`appearance-none w-full bg-slate-50 dark:bg-slate-800 border border-transparent focus:ring-4 focus:ring-emerald-500/10 text-xs font-black text-slate-600 dark:text-slate-300 rounded-2xl pl-5 pr-12 py-4 outline-none cursor-pointer transition-all ${!filterGrade ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
          >
            <option value="">ALL SECTIONS</option>
            {SECTIONS.map(s => <option key={s} value={s}>SECTION {s}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
        </div>

        <div className="xl:col-span-2">
          <button 
            onClick={() => setShowOnlyMine(!showOnlyMine)}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              showOnlyMine 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20' 
                : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <User size={14} /> My Dispatches
          </button>
        </div>

        <div className="xl:col-span-4 relative">
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
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((a) => {
            const isRead = readIds.has(a.id);
            return (
              <div 
                key={a.id} 
                onClick={() => handleOpenPreview(a)}
                className={`bg-white dark:bg-slate-900 p-8 rounded-[40px] border shadow-sm hover:border-emerald-500/40 transition-all group cursor-pointer relative overflow-hidden ${
                  isRead ? 'border-slate-100 dark:border-slate-800' : 'border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-900/5'
                }`}
              >
                {!isRead && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                )}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${getPriorityStyles(a.priority)}`}>
                        {getPriorityIcon(a.priority)}
                        {a.priority}
                      </div>
                      <div className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest border border-transparent">
                        <Target size={10} className="text-emerald-500" />
                        {a.target}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-600 transition-colors leading-tight">{a.title}</h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2.5 max-w-4xl line-clamp-2">{a.message}</p>
                    </div>
                  </div>

                  <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between md:justify-start gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-emerald-500" />
                      {a.timestamp}
                    </div>
                    <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-emerald-600/70 border border-emerald-500/10 flex items-center gap-2">
                      <User size={10} />
                      By {a.sender}
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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">System clear - no notifications</p>
          </div>
        )}
      </div>

      {/* Message Preview Mini Panel - UPDATED STYLING & WIDTH */}
      {previewItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setPreviewItem(null)} />
          
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-8 duration-300 overflow-hidden flex flex-col max-h-[85vh]">
            
            <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest mb-4 ${getPriorityStyles(previewItem.priority)}`}>
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

            {/* Corrected Meta Row Alignment - 3 Column Layout */}
            <div className="px-10 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-50 dark:border-slate-800 grid grid-cols-3 items-center text-center">
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Target size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Scope</p>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-300">{previewItem.target}</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 mx-auto">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <User size={16} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sender</p>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-300">{previewItem.sender}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end text-right">
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Timestamp</p>
                  <p className="text-xs font-black text-slate-700 dark:text-slate-300">{previewItem.timestamp}</p>
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

            {/* Compact Bottom Action Area */}
            <div className="py-6 px-10 border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-center">
              <button 
                onClick={() => setPreviewItem(null)}
                className="px-8 py-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Dismiss Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          
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
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleSend} className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
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

                {targetCategory === 'Department' && (
                  <div className="space-y-3 animate-in slide-in-from-left-2 duration-300">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Department</label>
                    <div className="relative group">
                      <select 
                        value={targetDept}
                        onChange={(e) => setTargetDept(e.target.value)}
                        className="appearance-none w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all dark:text-white cursor-pointer"
                      >
                        <option value="">SELECT DEPT</option>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500" />
                    </div>
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
                          {GRADES.map(g => <option key={g} value={g}>GRADE {g}</option>)}
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
                            {SECTIONS.map(s => <option key={s} value={s}>SECTION {s}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500" />
                        </div>
                      </div>
                    )}
                  </>
                )}
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
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3.5 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                >
                  Cancel
                </button>
              </div>

              <div className="text-right">
                <button 
                  onClick={handleSend}
                  className="px-12 py-4 bg-emerald-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:grayscale ml-auto w-fit"
                  disabled={!newTitle || !newMessage || (targetCategory === 'Department' && !targetDept) || (targetCategory === 'Grade' && !targetGrade)}
                >
                  <Send size={18} /> Send Dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;