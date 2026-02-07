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
  User
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
import DatePicker from 'react-datepicker';

const TEACHER_CLASSES = ["G6 - A", "G6 - B", "G9 - A", "G10 - C"];
const SUBJECTS = ["Mathematics", "Science", "Computer", "English"];

const INITIAL_QUIZZES = [
  {
    id: 'q1',
    title: 'Algebraic Expressions Mid-Review',
    subject: 'Mathematics',
    grade: 'G9',
    section: 'A',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 86400000).toISOString(),
    status: 'Active',
    questions: [],
    stats: {
      attempted: 28,
      avgScore: 74,
      passRate: 85,
      topScore: 96,
      contestants: [
        { name: 'C. Ronaldo', score: 96 },
        { name: 'L. Messi', score: 92 },
        { name: 'K. Mbappe', score: 88 },
        { name: 'V. Junior', score: 85 },
        { name: 'J. Bellingham', score: 82 },
        { name: 'L. Modric', score: 78 },
        { name: 'F. Valverde', score: 75 },
        { name: 'E. Haaland', score: 70 },
      ]
    }
  },
  {
    id: 'q2',
    title: 'Introduction to React Hooks',
    subject: 'Computer',
    grade: 'G10',
    section: 'C',
    startTime: new Date(Date.now() - 172800000).toISOString(),
    endTime: new Date(Date.now() - 86400000).toISOString(),
    status: 'Completed',
    questions: [],
    stats: {
      attempted: 22,
      avgScore: 82,
      passRate: 92,
      topScore: 100,
      contestants: [
        { name: 'C. Ronaldo', score: 100 },
        { name: 'L. Messi', score: 98 },
        { name: 'V. Junior', score: 95 },
        { name: 'F. Valverde', score: 85 },
        { name: 'T. Courtois', score: 80 },
        { name: 'L. Modric', score: 75 },
      ]
    }
  },
  {
    id: 'q3',
    title: 'Cell Biology Fundamentals',
    subject: 'Science',
    grade: 'G6',
    section: 'B',
    startTime: new Date(Date.now() - 345600000).toISOString(),
    endTime: new Date(Date.now() - 259200000).toISOString(),
    status: 'Completed',
    questions: [],
    stats: {
      attempted: 30,
      avgScore: 68,
      passRate: 78,
      topScore: 92,
      contestants: [
        { name: 'A. Guler', score: 92 },
        { name: 'B. Diaz', score: 88 },
        { name: 'E. Militao', score: 85 },
        { name: 'D. Carvajal', score: 80 },
        { name: 'A. Rudiger', score: 75 },
        { name: 'F. Mendy', score: 60 },
      ]
    }
  }
];

const QuizPage = () => {
  const [quizzes, setQuizzes] = useState(INITIAL_QUIZZES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedQuizForStats, setSelectedQuizForStats] = useState(null);
  const [selectedAnalyticsQuizId, setSelectedAnalyticsQuizId] = useState(INITIAL_QUIZZES[0].id);

  const [newQuiz, setNewQuiz] = useState({
    title: '',
    subject: SUBJECTS[0],
    classRef: TEACHER_CLASSES[0],
    startDate: null,
    endDate: null,
    questions: []
  });

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

  const handleCreateQuiz = (e) => {
    e.preventDefault();
    if (!newQuiz.startDate || !newQuiz.endDate) {
      toast({ type: 'error', message: 'Please define the availability window.' });
      return;
    }
    if (newQuiz.questions.length === 0) {
      toast({ type: 'error', message: 'At least one question is required.' });
      return;
    }

    const [grade, section] = newQuiz.classRef.split(' - ');
    const entry = {
      id: Date.now().toString(),
      title: newQuiz.title,
      subject: newQuiz.subject,
      grade,
      section,
      startTime: newQuiz.startDate.toISOString(),
      endTime: newQuiz.endDate.toISOString(),
      questions: newQuiz.questions,
      status: 'Upcoming',
      stats: { attempted: 0, avgScore: 0, passRate: 0, topScore: 0, contestants: [] }
    };

    setQuizzes([entry, ...quizzes]);
    setIsModalOpen(false);
    setNewQuiz({ title: '', subject: SUBJECTS[0], classRef: TEACHER_CLASSES[0], startDate: null, endDate: null, questions: [] });
    toast({ type: 'success', message: 'Quiz created and auto-grading enabled.' });
  };

  const selectedAnalyticsQuiz = useMemo(() => {
    return quizzes.find(q => q.id === selectedAnalyticsQuizId);
  }, [quizzes, selectedAnalyticsQuizId]);

  const analyticsData = useMemo(() => {
    return selectedAnalyticsQuiz?.stats?.contestants || [];
  }, [selectedAnalyticsQuiz]);

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
          {quizzes.map((q) => (
            <div key={q.id} className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex items-center justify-between mb-8">
                <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${q.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  q.status === 'Completed' ? 'bg-slate-50 text-slate-400 border-slate-100' :
                    'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                  {q.status}
                </span>
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

              <button
                onClick={() => setSelectedQuizForStats(q)}
                className="w-full py-5 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-600 rounded-[24px] text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
              >
                <Trophy size={16} /> View Results
              </button>
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
                    {quizzes.map(q => (
                      <option key={q.id} value={q.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold py-2">
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
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white"><Plus size={24} /></div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">New Quiz Portal</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Define Questions & Parameters</p>
              </div>
            </div>
            <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"><X size={28} /></button>
          </div>

          <form onSubmit={handleCreateQuiz} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
            {/* Header Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quiz Title</label>
                  <input required value={newQuiz.title} onChange={e => setNewQuiz({ ...newQuiz, title: e.target.value })} type="text" placeholder="Subjective or Chapter title..." className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-inner" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade Assignment</label>
                    <select value={newQuiz.classRef} onChange={e => setNewQuiz({ ...newQuiz, classRef: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold dark:text-white cursor-pointer shadow-inner">
                      {TEACHER_CLASSES.map(c => <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                    <select value={newQuiz.subject} onChange={e => setNewQuiz({ ...newQuiz, subject: e.target.value })} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold dark:text-white cursor-pointer shadow-inner">
                      {SUBJECTS.map(s => <option key={s} value={s} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Availability Window</p>
                <div className="grid grid-cols-2 gap-4">
                  <DatePicker
                    selected={newQuiz.startDate}
                    onChange={date => setNewQuiz({ ...newQuiz, startDate: date })}
                    showTimeSelect
                    placeholderText="Start Date & Time"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold dark:text-white outline-none shadow-inner"
                  />
                  <DatePicker
                    selected={newQuiz.endDate}
                    onChange={date => setNewQuiz({ ...newQuiz, endDate: date })}
                    showTimeSelect
                    placeholderText="End Date & Time"
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold dark:text-white outline-none shadow-inner"
                  />
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
                      value={newQuiz.questions.length}
                      onChange={(e) => handleQuestionCountChange(parseInt(e.target.value) || 0)}
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

          <div className="px-10 py-8 border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-end gap-4 shrink-0">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all rounded-2xl">Discard</button>
            <button type="submit" onClick={handleCreateQuiz} className="px-14 py-4 bg-emerald-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
              <Save size={18} /> Publish Quiz
            </button>
          </div>
        </div>
      </PortalPopup>
    </div>
  );
};

export default QuizPage;