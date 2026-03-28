import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Plus,
  Brain,
  Trophy,
  BarChart3,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Trash2,
  ChevronRight,
  ChevronDown,
  Users,
  Target,
  Hash,
  Sparkles,
  User,
  Loader2,
  Edit2,
  Pencil
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { toast } from '../MainSystemComponents/Toast';
import PortalPopup from '../MainSystemComponents/PortalPopup';
import quizService from '../Api/quizService';
import teacherService from '../Api/teacherService';
import calendarService from '../Api/calendarService';
import CustomNepaliHolidayCalendar from '../MainSystemComponents/CustomNepaliHolidayCalendar';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

const INITIAL_QUIZZES = [];

const QuizPage = () => {
  const [loading, setLoading] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedQuizForStats, setSelectedQuizForStats] = useState(null);
  const [selectedAnalyticsQuizId, setSelectedAnalyticsQuizId] = useState('');
  const [editingQuizId, setEditingQuizId] = useState(null);

  const [teacherData, setTeacherData] = useState({ classes: [], subjects: [] });
  const [holidays, setHolidays] = useState([]);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const startCalendarRef = useRef(null);
  const endCalendarRef = useRef(null);

  const [newQuiz, setNewQuiz] = useState({
    title: '',
    subject: '',
    classRef: '',
    startDate: null,
    endDate: null,
    timeLimitMinutes: 30, // Default duration
    questions: []
  });

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const teacherId = localStorage.getItem('teacherId');
        if (!teacherId || teacherId === 'undefined' || teacherId === 'null') {
          toast({ type: 'error', message: 'Evaluation session expired.' });
          setLoading(false);
          return;
        }

        // Fetch teacher profile
        const teacher = await teacherService.getTeacherById(teacherId);
        const classes = teacher.assignedClasses || [];

        // Advanced: Derive "Whole Grade" options for multi-section teachers
        const uniqueGrades = [...new Set(classes.map(c => {
          const m = c.match(/(?:Grade\s+|G)(\d+)/i);
          return m ? m[1] : null;
        }).filter(Boolean))];

        const wholeGradeOptions = uniqueGrades.map(g => `Whole Grade ${g}`);
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

        // Load draft assessment if exists
        const draft = localStorage.getItem('quiz_draft');
        if (draft) {
          try {
            const parsed = JSON.parse(draft);
            setNewQuiz({
              ...parsed,
              startDate: parsed.startDate ? new Date(parsed.startDate) : null,
              endDate: parsed.endDate ? new Date(parsed.endDate) : null
            });
          } catch (e) {
            console.error("Draft recovery failed:", e);
          }
        } else {
          // Initialize default assessment identity
          setNewQuiz(prev => ({
            ...prev,
            classRef: classOptions[0] || '',
            subject: subjects[0] || ''
          }));
        }

        await fetchQuizzes();
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Persistent assessment draft protocol
  useEffect(() => {
    if (!editingQuizId && isModalOpen) {
      localStorage.setItem('quiz_draft', JSON.stringify(newQuiz));
    }
  }, [newQuiz, editingQuizId, isModalOpen]);

  const fetchQuizzes = async () => {
    try {
      setLoadingQuizzes(true);
      const teacherId = localStorage.getItem('teacherId');
      const data = await quizService.getAllQuizzes(teacherId);
      setQuizzes(data);
      if (data.length > 0 && !selectedAnalyticsQuizId) {
        setSelectedAnalyticsQuizId(data[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const events = await calendarService.getEvents();
        const holidayMapped = (events || []).filter(e => e && (e.type?.toUpperCase() === 'HOLIDAY' || e.isPublicHoliday));
        setHolidays(holidayMapped);
      } catch (error) {
        console.error("Failed to fetch holidays:", error);
      }
    };
    fetchHolidays();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (startCalendarRef.current && !startCalendarRef.current.contains(event.target)) setShowStartCalendar(false);
      if (endCalendarRef.current && !endCalendarRef.current.contains(event.target)) setShowEndCalendar(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleQuestionCountChange = (count) => {
    const safeCount = Math.max(0, Math.min(50, count));
    const currentQuestions = [...newQuiz.questions];

    if (safeCount > currentQuestions.length) {
      const additionalCount = safeCount - currentQuestions.length;
      const newEntries = Array.from({ length: additionalCount }, (_, i) => ({
        id: (Date.now() + i).toString(),
        text: '',
        options: ['', '', '', ''],
        correctIndex: 0
      }));
      setNewQuiz({ ...newQuiz, questions: [...currentQuestions, ...newEntries] });
    } else {
      setNewQuiz({ ...newQuiz, questions: currentQuestions.slice(0, safeCount) });
    }
  };

  const updateQuestion = (index, text) => {
    const qs = [...newQuiz.questions];
    qs[index].text = text;
    setNewQuiz({ ...newQuiz, questions: qs });
  };

  const updateOption = (qIndex, oIndex, val) => {
    const qs = [...newQuiz.questions];
    qs[qIndex].options[oIndex] = val;
    setNewQuiz({ ...newQuiz, questions: qs });
  };

  const setCorrect = (qIndex, oIndex) => {
    const qs = [...newQuiz.questions];
    qs[qIndex].correctIndex = oIndex;
    setNewQuiz({ ...newQuiz, questions: qs });
  };

  const removeQuestion = (index) => {
    const updated = newQuiz.questions.filter((_, i) => i !== index);
    setNewQuiz({ ...newQuiz, questions: updated });
  };

  const openEditModal = (quiz) => {
    setEditingQuizId(quiz._id);
    const classRef = quiz.section === 'ALL' ? `Whole Grade ${quiz.grade}` : `Grade ${quiz.grade}-${quiz.section}`;
    setNewQuiz({
      title: quiz.title,
      subject: quiz.subject,
      classRef: classRef,
      startDate: new Date(quiz.startTime),
      endDate: new Date(quiz.endTime),
      timeLimitMinutes: quiz.timeLimitMinutes || 30,
      questions: quiz.questions.map(q => ({ ...q, id: q._id || Date.now().toString() }))
    });
    setIsModalOpen(true);
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    const teacherId = localStorage.getItem('teacherId');
    if (!newQuiz.title.trim()) {
      toast({ type: 'warning', message: 'Evaluation identity (title) required.' });
      return;
    }
    if (!newQuiz.startDate || !newQuiz.endDate) {
      toast({ type: 'error', message: 'Please define the availability window.' });
      return;
    }
    if (newQuiz.questions.length === 0) {
      toast({ type: 'error', message: 'At least one question is required.' });
      return;
    }

    // Robust parsing for "Grade 6-A" or "Whole Grade 1"
    let grade, section;
    const wholeMatch = newQuiz.classRef.match(/Whole Grade\s+(\d+)/i);

    if (wholeMatch) {
      grade = wholeMatch[1];
      section = 'ALL'; // Special signal for whole-grade broadcasting
    } else {
      const classMatch = newQuiz.classRef.match(/(?:Grade\s+|G)(\d+)(?:\s*-\s*|\s*)([A-Za-z]+)/i);
      if (!classMatch) {
        toast({ type: 'error', message: 'Invalid class format detected.' });
        return;
      }
      grade = classMatch[1];
      section = classMatch[2].toUpperCase();
    }

    const now = new Date();
    let initialStatus = 'Upcoming';
    if (now >= newQuiz.startDate && now <= newQuiz.endDate) initialStatus = 'Active';
    else if (now > newQuiz.endDate) initialStatus = 'Completed';

    const entryData = {
      teacherId,
      title: newQuiz.title,
      subject: newQuiz.subject,
      grade,
      section,
      startTime: newQuiz.startDate.toISOString(),
      endTime: newQuiz.endDate.toISOString(),
      timeLimitMinutes: Number(newQuiz.timeLimitMinutes),
      questions: newQuiz.questions.map(({ text, options, correctIndex }) => ({
        text,
        options,
        correctIndex
      })),
      status: initialStatus
    };

    try {
      if (editingQuizId) {
        const updated = await quizService.updateQuiz(editingQuizId, entryData);
        setQuizzes(quizzes.map(q => q._id === editingQuizId ? updated : q));
        toast({ type: 'success', message: 'Evaluation identity updated successfully.' });
      } else {
        const saved = await quizService.createQuiz(entryData);
        setQuizzes([saved, ...quizzes]);
        toast({ type: 'success', message: 'Quiz created and auto-grading enabled.' });
        localStorage.removeItem('quiz_draft');
      }
      setIsModalOpen(false);
      setEditingQuizId(null);
      setNewQuiz({
        title: '',
        subject: teacherData.subjects[0] || '',
        classRef: teacherData.classOptions?.[0] || '',
        startDate: null,
        endDate: null,
        timeLimitMinutes: 30,
        questions: []
      });
    } catch (err) {
      console.error('Save error:', err);
      const msg = err.response?.data?.message || 'Publication protocol failed.';
      toast({ type: 'error', message: msg });
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm('Are you sure you want to permanently remove this assessment?')) return;
    try {
      await quizService.deleteQuiz(id);
      setQuizzes(quizzes.filter(q => q._id !== id));
      toast({ type: 'success', message: 'Evaluation successfully archived.' });
    } catch (err) {
      console.error('Delete error:', err);
      toast({ type: 'error', message: 'Failed to delete record.' });
    }
  };

  const selectedAnalyticsQuiz = useMemo(() => {
    return quizzes.find(q => q._id === selectedAnalyticsQuizId);
  }, [quizzes, selectedAnalyticsQuizId]);

  const analyticsData = useMemo(() => {
    return selectedAnalyticsQuiz?.stats?.contestants || [];
  }, [selectedAnalyticsQuiz]);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 size={40} className="animate-spin text-emerald-500" />
          <p className="text-[10px] font-black uppercase tracking-widest">Initialising Quiz Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Brain className="text-emerald-500 w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Quiz Management</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Create assessments & track performance</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-10 py-5 bg-emerald-600 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <Plus size={20} /> Create New Quiz
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'all' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <span className="flex items-center gap-2"><HelpCircle size={16} /> All Quizzes</span>
          {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'analytics' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <span className="flex items-center gap-2"><BarChart3 size={16} /> Quiz Contestants Graph</span>
          {activeTab === 'analytics' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full" />}
        </button>
      </div>

      {activeTab === 'all' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {loadingQuizzes ? (
            <div className="xl:col-span-2 py-32 flex flex-col items-center justify-center gap-4 text-slate-400">
              <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-[10px] font-black tracking-widest uppercase">Fetching Evaluation Data...</p>
            </div>
          ) : quizzes.map((q) => (
            <div key={q._id} className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex items-center justify-between mb-8">
                {(() => {
                  const now = new Date();
                  const start = new Date(q.startTime);
                  const end = new Date(q.endTime);
                  let label = 'Upcoming';
                  let style = 'bg-blue-50 text-blue-600 border-blue-100';

                  if (now > end) {
                    label = 'Completed';
                    style = 'bg-slate-50 text-slate-400 border-slate-100';
                  } else if (now >= start) {
                    label = 'Active';
                    style = 'bg-emerald-50 text-emerald-600 border-emerald-100';
                  }

                  return (
                    <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${style}`}>
                      {label}
                    </span>
                  );
                })()}
                <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{q.grade} - {q.section}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-3 uppercase tracking-tight truncate">{q.title}</h3>
              <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-10">{q.subject}</p>

              <div className="space-y-6 mb-12">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <Clock size={16} className="text-emerald-500/50" />
                  Ends {new Date(q.endTime).toLocaleDateString()}
                </div>
                {q.stats && (
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[28px] grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Pass Rate</p>
                      <p className="text-2xl font-black text-emerald-600 leading-none">{q.stats.passRate}%</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Avg Score</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{q.stats.avgScore}%</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={() => setSelectedQuizForStats(q)}
                  className="flex-1 py-5 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-600 rounded-[24px] text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
                >
                  <Trophy size={16} /> View Results
                </button>
                <button
                  onClick={() => openEditModal(q)}
                  className="w-16 h-[60px] flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-400 hover:text-blue-600 rounded-[24px] transition-all group-hover:scale-105"
                  title="Edit Quiz"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDeleteQuiz(q._id)}
                  className="w-16 h-[60px] flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 rounded-[24px] transition-all group-hover:scale-105"
                  title="Delete Quiz"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Global Analytics View */
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-slate-900 p-10 lg:p-12 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                  <Sparkles className="text-emerald-500" size={24} />
                  Contestant performance
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Individual score comparison for selected assessment</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative group min-w-[280px]">
                  <select
                    value={selectedAnalyticsQuizId}
                    onChange={(e) => setSelectedAnalyticsQuizId(e.target.value)}
                    className="appearance-none w-full bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 font-bold text-xs uppercase tracking-widest px-6 py-4 rounded-2xl border border-transparent focus:border-emerald-500/30 outline-none cursor-pointer pr-12 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 shadow-inner"
                  >
                    {quizzes.length === 0 && <option value="">No quizzes available</option>}
                    {quizzes.map(q => (
                      <option key={q._id} value={q._id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold py-2">
                        {q.title.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </div>

            {analyticsData.length > 0 ? (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.1} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      dy={20}
                    />
                    <YAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                      contentStyle={{
                        borderRadius: '24px',
                        border: 'none',
                        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                        backgroundColor: '#fff',
                        padding: '20px'
                      }}
                      itemStyle={{ fontSize: '12px', fontWeight: '900', color: '#059669' }}
                      labelStyle={{ marginBottom: '10px', color: '#64748b', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                      formatter={(value) => [`${value}% Score`, 'Result']}
                    />
                    <Bar dataKey="score" radius={[12, 12, 0, 0]} barSize={48}>
                      {analyticsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score >= 40 ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-24 text-center">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                  <BarChart3 size={40} className="text-slate-200" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No contestant results for this quiz yet.</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 mb-4"><Users size={24} /></div>
              <p className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">
                {selectedAnalyticsQuiz?.stats?.attempted || 0}
              </p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Attempts</p>
            </div>
            <div className="p-8 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 mb-4"><Target size={24} /></div>
              <p className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">
                {selectedAnalyticsQuiz?.stats?.avgScore || 0}%
              </p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Average Success</p>
            </div>
            <div className="p-8 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600 mb-4"><Trophy size={24} /></div>
              <p className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-1">
                {selectedAnalyticsQuiz?.stats?.topScore || 0}%
              </p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Highest Performer</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      <PortalPopup isOpen={selectedQuizForStats !== null} onClose={() => setSelectedQuizForStats(null)}>
        <div className="bg-white dark:bg-slate-900 w-[95vw] max-w-4xl rounded-[48px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col">
          <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white"><Trophy size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-none">{selectedQuizForStats?.title}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Automatic Performance Report</p>
              </div>
            </div>
            <button onClick={() => setSelectedQuizForStats(null)} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50"><X size={24} /></button>
          </div>
          <div className="p-10 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-8 bg-emerald-50 dark:bg-emerald-900/10 rounded-[32px] text-center space-y-2">
              <Users size={24} className="text-emerald-500 mx-auto" />
              <p className="text-4xl font-black text-emerald-600">{selectedQuizForStats?.stats?.attempted}</p>
              <p className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest">Total Students</p>
            </div>
            <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] text-center space-y-2">
              <Target size={24} className="text-emerald-500 mx-auto" />
              <p className="text-4xl font-black text-slate-900 dark:text-white">{selectedQuizForStats?.stats?.avgScore}%</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accuracy Rate</p>
            </div>
            <div className="p-8 bg-indigo-50 dark:bg-indigo-900/10 rounded-[32px] text-center space-y-2">
              <CheckCircle2 size={24} className="text-indigo-500 mx-auto" />
              <p className="text-4xl font-black text-indigo-600">{selectedQuizForStats?.stats?.passRate}%</p>
              <p className="text-[10px] font-black text-indigo-800/40 uppercase tracking-widest">Qualified</p>
            </div>
            <div className="p-8 bg-amber-50 dark:bg-amber-900/10 rounded-[32px] text-center space-y-2">
              <Trophy size={24} className="text-amber-500 mx-auto" />
              <p className="text-4xl font-black text-amber-600">{selectedQuizForStats?.stats?.topScore}%</p>
              <p className="text-[10px] font-black text-amber-800/40 uppercase tracking-widest">Top Score</p>
            </div>
          </div>
        </div>
      </PortalPopup>

      {/* Create Modal */}
      <PortalPopup isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="bg-white dark:bg-slate-900 w-[95vw] max-w-5xl max-h-[90vh] rounded-[48px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col pointer-events-auto">
          <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white">
                {editingQuizId ? <Edit2 size={24} /> : <Plus size={24} />}
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
                  {editingQuizId ? 'Edit Evaluation' : 'New Quiz Portal'}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                  {editingQuizId ? 'Modify Questions & Timing' : 'Define Questions & Parameters'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingQuizId(null);
                localStorage.removeItem('quiz_draft');
                setNewQuiz({
                  title: '',
                  subject: teacherData.subjects[0] || '',
                  classRef: teacherData.classOptions?.[0] || '',
                  startDate: null,
                  endDate: null,
                  timeLimitMinutes: 30,
                  questions: []
                });
              }}
              className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <X size={28} />
            </button>
          </div>

          <form onSubmit={handleCreateQuiz} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
            {/* Header Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-2.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quiz Title</label>
                    <input required value={newQuiz.title} onChange={e => setNewQuiz({ ...newQuiz, title: e.target.value })} type="text" placeholder="Subjective or Chapter title..." className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-inner" />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time Limit (Min)</label>
                    <input required value={newQuiz.timeLimitMinutes} onChange={e => setNewQuiz({ ...newQuiz, timeLimitMinutes: e.target.value })} type="number" min="1" max="300" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-inner" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade Assignment</label>
                    {teacherData.classOptions?.length <= 1 ? (
                      <div className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[11px] font-black text-slate-700 dark:text-white shadow-inner">
                        {teacherData.classOptions?.[0] || '—'}
                      </div>
                    ) : (
                      <div className="relative group">
                        <select
                          value={newQuiz.classRef}
                          onChange={e => setNewQuiz({ ...newQuiz, classRef: e.target.value })}
                          className="appearance-none w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold dark:text-white cursor-pointer shadow-inner pr-10"
                        >
                          {teacherData.classOptions?.map(c => <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{c}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                    {teacherData.subjects.length <= 1 ? (
                      <div className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[11px] font-black text-slate-700 dark:text-white shadow-inner">
                        {teacherData.subjects[0] || '—'}
                      </div>
                    ) : (
                      <div className="relative group">
                        <select
                          value={newQuiz.subject}
                          onChange={e => setNewQuiz({ ...newQuiz, subject: e.target.value })}
                          className="appearance-none w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold dark:text-white cursor-pointer shadow-inner pr-10"
                        >
                          {teacherData.subjects.map(s => <option key={s} value={s} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{s}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Availability Window</p>
                <div className="grid grid-cols-2 gap-4">
                  {/* Start Date & Time */}
                  <div className="relative" ref={startCalendarRef}>
                    <button
                      type="button"
                      onClick={() => setShowStartCalendar(!showStartCalendar)}
                      className="w-full flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[11px] font-black text-slate-700 dark:text-white outline-none shadow-inner transition-all hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <Calendar size={16} className="text-emerald-500" />
                      <span className="truncate">
                        {newQuiz.startDate
                          ? newQuiz.startDate.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
                          : "Start Date & Time"}
                      </span>
                    </button>
                    <AnimatePresence>
                      {showStartCalendar && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute top-full left-0 mt-4 z-[100] origin-top-left"
                        >
                          <CustomNepaliHolidayCalendar
                            selectedDate={newQuiz.startDate || new Date()}
                            onChange={(date) => {
                              const updates = { startDate: date };
                              // If end date is null or before start date, auto-set it to 1 hour later
                              if (!newQuiz.endDate || date >= newQuiz.endDate) {
                                const defaultEnd = new Date(date);
                                defaultEnd.setHours(defaultEnd.getHours() + 1);
                                updates.endDate = defaultEnd;
                              }
                              setNewQuiz({ ...newQuiz, ...updates });
                            }}
                            holidays={holidays}
                            showTime={true}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* End Date & Time */}
                  <div className="relative" ref={endCalendarRef}>
                    <button
                      type="button"
                      onClick={() => setShowEndCalendar(!showEndCalendar)}
                      className="w-full flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[11px] font-black text-slate-700 dark:text-white outline-none shadow-inner transition-all hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <Clock size={16} className="text-emerald-500" />
                      <span className="truncate">
                        {newQuiz.endDate
                          ? newQuiz.endDate.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
                          : "End Date & Time"}
                      </span>
                    </button>
                    <AnimatePresence>
                      {showEndCalendar && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute top-full right-0 mt-4 z-[100] origin-top-right"
                        >
                          <CustomNepaliHolidayCalendar
                            selectedDate={newQuiz.endDate || new Date()}
                            onChange={(date) => {
                              if (newQuiz.startDate && date <= newQuiz.startDate) {
                                toast({ type: 'warning', message: 'Termination must succeed initiation.' });
                                return;
                              }
                              setNewQuiz({ ...newQuiz, endDate: date });
                            }}
                            holidays={holidays}
                            showTime={true}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions Builder */}
            <div className="space-y-8">
              <div className="flex items-center gap-8 px-2 border-b border-slate-100 dark:border-slate-800 pb-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Configure Total Questions</span>
                  <div className="relative group">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={newQuiz.questions.length === 0 ? '' : newQuiz.questions.length}
                      onChange={(e) => handleQuestionCountChange(parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-40 pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-emerald-500/10 focus:border-emerald-500/30 rounded-xl text-lg font-black text-slate-900 dark:text-white outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {newQuiz.questions.map((q, qIdx) => (
                  <div key={q.id} className="p-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Question {qIdx + 1}</label>
                        <input required value={q.text} onChange={e => updateQuestion(qIdx, e.target.value)} type="text" placeholder="Type your question here..." className="w-full bg-white dark:bg-slate-900 border-none px-6 py-4 rounded-xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
                      </div>
                      <button type="button" onClick={() => removeQuestion(qIdx)} className="mt-8 p-3 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="relative group/opt">
                          <input required value={opt} onChange={e => updateOption(qIdx, oIdx, e.target.value)} type="text" placeholder={`Option ${oIdx + 1}`} className={`w-full pl-14 pr-6 py-4 rounded-xl text-xs font-bold transition-all outline-none border-2 ${q.correctIndex === oIdx ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400' : 'bg-white dark:bg-slate-900 border-transparent dark:text-white focus:border-emerald-500/30'}`} />
                          <button type="button" onClick={() => setCorrect(qIdx, oIdx)} className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${q.correctIndex === oIdx ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 hover:text-emerald-500'}`}>
                            <CheckCircle2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {newQuiz.questions.length === 0 && (
                  <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[32px] space-y-4">
                    <HelpCircle size={40} className="text-slate-200 mx-auto" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enter a question count above to start building</p>
                  </div>
                )}
              </div>
            </div>
          </form>

          <div className="px-10 py-5 border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-end gap-4 shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingQuizId(null);
                localStorage.removeItem('quiz_draft');
                setNewQuiz({
                  title: '',
                  subject: teacherData.subjects[0] || '',
                  classRef: teacherData.classOptions?.[0] || '',
                  startDate: null,
                  endDate: null,
                  questions: []
                });
              }}
              className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all rounded-2xl"
            >
              Discard
            </button>
            <button
              type="submit"
              onClick={handleCreateQuiz}
              className="px-14 py-4 bg-emerald-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              <Save size={18} /> {editingQuizId ? 'Update Info' : 'Publish Quiz'}
            </button>
          </div>
        </div>
      </PortalPopup>
    </div>
  );
};

export default QuizPage;