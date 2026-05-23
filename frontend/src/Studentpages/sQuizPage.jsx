import React, { useState, useMemo, useEffect } from 'react';
import {
  HelpCircle,
  Brain,
  Trophy,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Users,
  Target,
  Sparkles,
  ArrowRight,
  Timer,
  FileText,
  TrendingUp,
  BarChart as BarChartIcon,
  Percent
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import axios from '../Api/axiosConfig';
import { toast } from '../MainSystemComponents/Toast';
import ConfirmDialog from '../MainSystemComponents/ConfirmDialog';
import PortalPopup from '../MainSystemComponents/PortalPopup';

const BASE_URL = 'http://localhost:7000/api';

const QuizResultModal = ({ isOpen, onClose, quiz, analytics }) => {
  if (!quiz) return null;

  const comparisonData = [
    { name: 'Your Score', score: quiz.myScore || 0 },
    { name: 'Class Avg', score: analytics?.averageScore || 0 },
  ];

  return (
    <PortalPopup isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-slate-900 w-[95vw] max-w-5xl rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col pointer-events-auto max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
              <Trophy size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{quiz.title}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">{quiz.subject} • Result Analytics</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-400 active:scale-90">
            <X size={28} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide">
          {/* Section 1: Personal Performance */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Your Performance</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Percent size={12} className="text-emerald-500" /> Final Score</p>
                <p className="text-4xl font-black text-emerald-600 leading-none">{quiz.myScore}%</p>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Clock size={12} className="text-emerald-500" /> Time Spent</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{quiz.timeSpentMinutes || '--'} Min</p>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Calendar size={12} className="text-emerald-500" /> Submitted On</p>
                <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                  {quiz.submittedAt ? new Date(quiz.submittedAt).toLocaleDateString() : '--'}
                </p>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Target size={12} className="text-emerald-500" /> Outcome</p>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${(quiz.myScore || 0) >= 40 ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                  {(quiz.myScore || 0) >= 40 ? 'Passed' : 'Failed'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Comparison & Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Class Comparison Chart */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Class Comparison</h4>
              </div>
              <div className="h-72 w-full bg-slate-50 dark:bg-slate-800/30 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800/50">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} layout="vertical">
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#64748b' }} width={80} />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: '900', fontSize: '12px' }}
                    />
                    <Bar dataKey="score" radius={[0, 20, 20, 0]} barSize={40}>
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#64748b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribution Chart */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Grade Distribution</h4>
              </div>
              <div className="h-72 w-full bg-slate-50 dark:bg-slate-800/30 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800/50">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.distribution || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.1} />
                    <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', fontWeight: '900', fontSize: '11px' }}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="p-8 bg-emerald-600 dark:bg-emerald-700 rounded-[32px] text-white flex items-center justify-between relative overflow-hidden group">
            <div className="relative z-10 flex items-center gap-8">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Brain size={32} />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-100 mb-1">Peer Insights</p>
                <h4 className="text-2xl font-black tracking-tight">You scored <span className="underline decoration-2 underline-offset-4 decoration-emerald-300">{Math.max(0, (quiz.myScore || 0) - (analytics?.averageScore || 0))}% higher</span> than class average.</h4>
              </div>
            </div>
            <div className="relative z-10 text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100 mb-1">Total Attempts</p>
              <p className="text-3xl font-black">{analytics?.totalAttempts || 0}</p>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none transform rotate-12 transition-transform group-hover:rotate-0">
              <Brain size={200} />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-10 py-8 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[28px] text-[11px] font-black uppercase tracking-[0.25em] shadow-xl transition-all active:scale-95 hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-white"
          >
            Close Analytics View
          </button>
        </div>
      </div>
    </PortalPopup>
  );
};

const SQuizPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [studentProfile, setStudentProfile] = useState(null);

  const studentId = localStorage.getItem('studentId');

  // Quiz Playing State
  const [playingQuiz, setPlayingQuiz] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Result Analytics State
  const [selectedResultQuiz, setSelectedResultQuiz] = useState(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [currentAnalytics, setCurrentAnalytics] = useState(null);

  // Fetch quizzes from backend
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const sId = localStorage.getItem('studentId');
      if (!sId) {
        toast({ type: 'error', message: 'Session expired. Please log in again.' });
        setLoading(false);
        return;
      }

      // 1. Fetch Student Profile to get Grade and Section
      let currentGrade, currentSection;
      try {
        const studentRes = await axios.get(`${BASE_URL}/students/${sId}`);
        const profile = studentRes.data;
        setStudentProfile(profile);
        currentGrade = profile.grade;
        currentSection = profile.section;
      } catch (err) {
        console.error('Profile fetch error:', err);
        toast({ type: 'error', message: 'Failed to sync student preferences.' });
        setLoading(false);
        return;
      }

      // 2. Fetch quizzes and attempts in parallel using grade filters
      const [quizzesRes, attemptsRes] = await Promise.all([
        axios.get(`${BASE_URL}/quizzes`, { 
          params: { grade: currentGrade, section: currentSection } 
        }),
        axios.get(`${BASE_URL}/student/quiz/attempts/${sId}`)
      ]);

      const attemptsMap = {};
      (attemptsRes.data || []).forEach(a => {
        if (a && a.quizId) {
          attemptsMap[a.quizId._id || a.quizId] = a;
        }
      });

      const processedQuizzes = (quizzesRes.data || []).map(q => {
        const attempt = attemptsMap[q._id];
        const now = new Date();
        const start = new Date(q.startTime);
        const end = new Date(q.endTime);

        let status = q.status;
        if (attempt) {
          status = 'Completed';
        } else if (now < start) {
          status = 'Upcoming';
        } else if (now > end) {
          status = 'Expired';
        } else if (status === 'Upcoming' || status === 'Active') {
          status = 'Available';
        }

        return {
          ...q,
          status,
          myScore: attempt?.percentage,
          submittedAt: attempt?.submittedAt,
          timeSpentMinutes: attempt?.timeSpentMinutes
        };
      });

      setQuizzes(processedQuizzes);
    } catch (error) {
      console.error('Fetch quizzes error:', error);
      toast({ type: 'error', message: 'Failed to load quizzes' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Filter quizzes based on tab
  const displayQuizzes = useMemo(() => {
    if (activeTab === 'available') {
      return quizzes.filter(q => q.status === 'Available' || q.status === 'Upcoming' || q.status === 'Active');
    }
    return quizzes.filter(q => q.status === 'Completed' || q.status === 'Expired' || q.status === 'Closed');
  }, [quizzes, activeTab]);

  // Timer Logic
  useEffect(() => {
    if (!playingQuiz || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [playingQuiz, timeLeft]);

  useEffect(() => {
    if (playingQuiz && timeLeft === 0 && !quizResult) {
      handleFinalSubmit();
      toast({ type: 'warning', message: 'Time up! Quiz submitted automatically.' });
    }
  }, [timeLeft]);

  const startQuiz = async (quiz) => {
    try {
      const res = await axios.get(`${BASE_URL}/student/quiz/${quiz._id}?studentId=${studentId}`);
      const fullQuiz = res.data;

      setPlayingQuiz(fullQuiz);
      setCurrentQuestionIdx(0);
      setSelectedAnswers({});
      setQuizResult(null);
      setTimeLeft(fullQuiz.timeLimitMinutes * 60);
      toast({ type: 'info', message: 'Quiz started. Good luck!' });
    } catch (error) {
      toast({
        type: 'error',
        message: error.response?.data?.message || 'Cannot start quiz'
      });
    }
  };

  const openResultAnalytics = (quiz) => {
    if (quiz.status !== 'Completed') {
      toast({ type: 'info', message: 'Analytics only available for completed attempts.' });
      return;
    }
    setSelectedResultQuiz(quiz);
    // Transform quiz stats for the analytics view
    setCurrentAnalytics({
      averageScore: quiz.stats.avgScore,
      totalAttempts: quiz.stats.attempted,
      distribution: [
        { range: '0-20', count: Math.round(quiz.stats.attempted * 0.1) },
        { range: '21-40', count: Math.round(quiz.stats.attempted * 0.15) },
        { range: '41-60', count: Math.round(quiz.stats.attempted * 0.25) },
        { range: '61-80', count: Math.round(quiz.stats.attempted * 0.3) },
        { range: '81-100', count: Math.round(quiz.stats.attempted * 0.2) }
      ]
    });
    setIsResultModalOpen(true);
  };

  const handleOptionSelect = (optIdx) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQuestionIdx]: optIdx }));
  };

  const handleFinalSubmit = async () => {
    if (!playingQuiz) return;

    try {
      const answersArray = playingQuiz.questions.map((q, idx) => ({
        questionId: q._id,
        selectedIndex: selectedAnswers[idx] ?? -1
      }));

      const finalTimeSpent = Math.max(1, playingQuiz.timeLimitMinutes - Math.floor(timeLeft / 60));

      const payload = {
        studentId,
        quizId: playingQuiz._id,
        answers: answersArray,
        timeSpentMinutes: finalTimeSpent
      };

      const res = await axios.post(`${BASE_URL}/student/quiz/submit`, payload);
      const { result } = res.data;

      setQuizResult({ score: result.score, total: result.totalQuestions });
      setIsConfirmSubmitOpen(false);
      toast({ type: 'success', message: 'Quiz submitted successfully!' });

      // Refresh quizzes to update status
      fetchQuizzes();
    } catch (error) {
      console.error('Submit quiz error:', error);
      toast({ type: 'error', message: error.response?.data?.message || 'Failed to submit quiz' });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- RENDERING ---

  // Loading state
  if (loading && !playingQuiz && !quizResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Assessments...</p>
      </div>
    );
  }

  // 1. Result Screen
  if (quizResult && playingQuiz) {
    const scorePercent = Math.round((quizResult.score / quizResult.total) * 100);
    return (
      <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-500 py-12">
        <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-2xl p-12 text-center flex flex-col items-center">
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 mb-8 animate-bounce">
            <Trophy size={48} />
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Quiz Completed!</h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] mb-10">{playingQuiz.title}</p>

          <div className="grid grid-cols-2 gap-8 w-full max-w-sm mb-12">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Score</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{scorePercent}%</p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Correct</p>
              <p className="text-3xl font-black text-emerald-500">{quizResult.score}/{quizResult.total}</p>
            </div>
          </div>

          <button
            onClick={() => { setPlayingQuiz(null); setQuizResult(null); setActiveTab('completed'); }}
            className="px-12 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-3"
          >
            Back to Quiz Dashboard <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // 2. Quiz Playing View
  if (playingQuiz) {
    const currentQuestion = playingQuiz.questions[currentQuestionIdx];
    const progress = ((currentQuestionIdx + 1) / playingQuiz.questions.length) * 100;
    const isLast = currentQuestionIdx === playingQuiz.questions.length - 1;

    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 py-6">
        {/* Playing Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <Brain size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{playingQuiz.title}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Question {currentQuestionIdx + 1} of {playingQuiz.questions.length}</p>
            </div>
          </div>

          <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all ${timeLeft < 60 ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white dark:bg-slate-900 border-emerald-500/20 text-emerald-600'}`}>
            <Timer size={20} className={timeLeft < 60 ? 'animate-pulse' : ''} />
            <span className="text-xl font-black tabular-nums tracking-tight">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(16,185,129,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question Area */}
        <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl p-10 lg:p-14 space-y-10">
          <div className="space-y-4">
            <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">Question {currentQuestionIdx + 1}</span>
            <h4 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white leading-snug tracking-tight">
              {currentQuestion.text}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                className={`group relative flex items-center gap-6 p-6 rounded-[28px] border-2 text-left transition-all duration-300 ${selectedAnswers[currentQuestionIdx] === idx
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-all ${selectedAnswers[currentQuestionIdx] === idx
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'
                  }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-base font-bold leading-tight">{opt}</span>
                {selectedAnswers[currentQuestionIdx] === idx && (
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in-50 duration-200">
                    <CheckCircle2 size={24} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between gap-6 pt-4">
          <button
            onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIdx === 0}
            className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-all disabled:opacity-30 active:scale-95"
          >
            <ChevronLeft size={18} /> Previous Question
          </button>

          {isLast ? (
            <button
              onClick={() => setIsConfirmSubmitOpen(true)}
              className="px-12 py-5 bg-emerald-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              Finish & Submit <CheckCircle2 size={18} />
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIdx(prev => Math.min(playingQuiz.questions.length - 1, prev + 1))}
              className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-white transition-all active:scale-95 flex items-center gap-3"
            >
              Next Question <ChevronRight size={18} />
            </button>
          )}
        </div>

        <ConfirmDialog
          isOpen={isConfirmSubmitOpen}
          onClose={() => setIsConfirmSubmitOpen(false)}
          onConfirm={handleFinalSubmit}
          title="Submit Quiz Attempt?"
          message="Once submitted, you cannot change your answers. Are you sure you want to finish your assessment?"
        />
      </div>
    );
  }

  // 3. Main Dashboard View
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-24">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-[28px] flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Brain className="text-emerald-500 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Play Quiz</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Available Quizzes & Results History</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'available' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <span className="flex items-center gap-3"><HelpCircle size={16} /> Available Assessments</span>
          {activeTab === 'available' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'completed' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <span className="flex items-center gap-3"><Trophy size={16} /> History & Results</span>
          {activeTab === 'completed' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full" />}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {displayQuizzes.length > 0 ? (
          displayQuizzes.map((q) => (
            <div
              key={q._id}
              onClick={() => q.status === 'Completed' && openResultAnalytics(q)}
              className={`bg-white dark:bg-slate-900 p-10 rounded-[44px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-emerald-500/20 transition-all group overflow-hidden relative ${q.status === 'Completed' ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${q.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  q.status === 'Completed' ? 'bg-emerald-500 text-white border-emerald-400' :
                    'bg-slate-50 text-slate-400 border-slate-100'
                  }`}>
                  {q.status}
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100/50 dark:border-slate-800">
                  <Clock size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{q.timeLimitMinutes} Mins</span>
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-3 uppercase tracking-tight relative z-10">{q.title}</h3>
              <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-10 relative z-10">{q.subject}</p>

              <div className="space-y-6 mb-12 relative z-10">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Calendar size={14} className="text-emerald-500" />
                    Due: {new Date(q.endTime).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <FileText size={14} className="text-emerald-500" />
                    {q.questions?.length || 0} Items
                  </div>
                </div>

                {q.status === 'Completed' && (
                  <div className="p-6 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100/50 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-emerald-800/40 uppercase tracking-widest mb-1">Your Score</p>
                      <p className="text-3xl font-black text-emerald-600 leading-none">{q.myScore}%</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <Trophy className="text-emerald-500 opacity-20 mb-2" size={32} />
                      <span className="text-[8px] font-black text-emerald-600/60 uppercase tracking-widest">Click to View Analytics</span>
                    </div>
                  </div>
                )}
              </div>

              {q.status === 'Available' ? (
                <button
                  onClick={(e) => { e.stopPropagation(); startQuiz(q); }}
                  className="w-full py-5 bg-emerald-600 dark:bg-emerald-500 text-white rounded-[28px] text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-600/10 dark:shadow-none hover:bg-emerald-700 dark:hover:bg-emerald-400 flex items-center justify-center gap-3 active:scale-95 group-hover:translate-y-[-4px]"
                >
                  Start Assessment <ChevronRight size={18} />
                </button>
              ) : q.status === 'Completed' ? (
                <div className="w-full py-5 bg-slate-50 dark:bg-slate-800/50 text-slate-400 rounded-[28px] text-[10px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-3 cursor-default group-hover:bg-emerald-500/10 transition-colors">
                  <BarChartIcon size={16} className="text-emerald-500" /> View Result Analytics
                </div>
              ) : (
                <div className="w-full py-5 bg-slate-100 dark:bg-slate-800/30 text-slate-300 rounded-[28px] text-[10px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-3 cursor-not-allowed">
                  <AlertCircle size={16} /> Portal Closed
                </div>
              )}

              {/* Decorative Background Icon */}
              <div className="absolute bottom-[-20px] right-[-20px] opacity-[0.03] dark:opacity-[0.05] pointer-events-none transform -rotate-12 transition-transform group-hover:rotate-0 duration-700">
                <Brain size={200} />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-40 text-center space-y-8 bg-slate-50 dark:bg-slate-900/10 rounded-[64px] border-4 border-dashed border-slate-100 dark:border-slate-800">
            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
              <HelpCircle size={40} className="text-slate-200" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">NO ASSESSMENTS FOUND</p>
              <p className="text-xs font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest mt-2">Check back later for new available sessions</p>
            </div>
          </div>
        )}
      </div>

      {/* Result Analytics Modal */}
      <QuizResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        quiz={selectedResultQuiz}
        analytics={currentAnalytics}
      />
    </div>
  );
};

export default SQuizPage;