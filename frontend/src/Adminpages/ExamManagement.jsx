import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronLeft, Calendar, Settings2 } from 'lucide-react';
import axios from 'axios';
import { toast } from '../MainSystemComponents/Toast';

import ModuleCard from '../AdminComponents/Exam/ModuleCard';
import SchedulingView from '../AdminComponents/Exam/SchedulingView'
import ControlView from '../AdminComponents/Exam/ControlView';

// --- Constants & Dummy Data ---
const SECTIONS = ["A", "B", "C"];
const YEARS = ["2025", "2026"];

const ANALYTICS_GRADE_DATA = [
  { grade: 'G5', average: 72 }, { grade: 'G6', average: 85 }, { grade: 'G7', average: 68 },
  { grade: 'G8', average: 79 }, { grade: 'G9', average: 88 }, { grade: 'G10', average: 82 },
];

const ANALYTICS_SECTION_DATA = [
  { section: 'Sec A', average: 84 }, { section: 'Sec B', average: 79 }, { section: 'Sec C', average: 72 },
];

const ExamManagement = () => {
  const [activeView, setActiveView] = useState('menu');
  const [selectedYear, setSelectedYear] = useState('2025');

  const [examData, setExamData] = useState(null);
  const [grades, setGrades] = useState([]);

  const [analyticsGrade, setAnalyticsGrade] = useState('10');
  const [analyticsSection, setAnalyticsSection] = useState('A');

  const [resYear, setResYear] = useState('2025');
  const [resPhase, setResPhase] = useState('MID-TERM 1');
  const [resGrade, setResGrade] = useState('10');
  const [resSection, setResSection] = useState('A');
  const [resultSearch, setResultSearch] = useState('');
  const [activeResultIndex, setActiveResultIndex] = useState(0);

  // Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examRes, gradesRes] = await Promise.all([
          axios.get('http://localhost:7000/api/exams'),
          axios.get('http://localhost:7000/api/grades')
        ]);
        setExamData({ ...examRes.data, allGrades: gradesRes.data });
        setGrades(gradesRes.data.map(g => g.gradeNumber.toString()));
        if (gradesRes.data.length > 0) {
          const firstGrade = gradesRes.data[0];
          const firstGradeNum = firstGrade.gradeNumber.toString();
          setAnalyticsGrade(firstGradeNum);
          setResGrade(firstGradeNum);
          if (firstGrade.sections && firstGrade.sections.length > 0) {
            setResSection(firstGrade.sections[0].sectionName);
          }
        }
        // Initialize resPhase from exam data config
        const { termsCount, includeMidTerm } = examRes.data.config || { termsCount: 3, includeMidTerm: true };
        const initialPhase = includeMidTerm ? 'First Mid Term' : 'First Term';
        setResPhase(initialPhase);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const phases = useMemo(() => {
    if (!examData || !examData.config) return [];

    const { termsCount, includeMidTerm } = examData.config;
    const ordinals = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'];
    const generatedPhases = [];

    for (let i = 0; i < termsCount; i++) {
      const ord = ordinals[i] || `${i + 1}th`;
      if (includeMidTerm) {
        const midName = `${ord} Mid Term`;
        const statusObj = examData.termStatuses?.find(s => s.term === midName);
        generatedPhases.push({
          id: midName,
          name: midName.toUpperCase(),
          status: statusObj?.isOpen ? 'Open' : 'Closed',
          publishStatus: statusObj?.isPublished ? 'Published' : 'Hidden'
        });
      }
      const termName = `${ord} Term`;
      const statusObj = examData.termStatuses?.find(s => s.term === termName);
      generatedPhases.push({
        id: termName,
        name: termName.toUpperCase(),
        status: statusObj?.isOpen ? 'Open' : 'Closed',
        publishStatus: statusObj?.isPublished ? 'Published' : 'Hidden'
      });
    }

    return generatedPhases;
  }, [examData]);

  const [realStudents, setRealStudents] = useState([]);
  const [realResults, setRealResults] = useState([]);

  // Fetch Students & Results when filters change
  useEffect(() => {
    const fetchStudentsAndResults = async () => {
      // Find grade doc to get section details
      const gradeDoc = examData?.allGrades?.find(g => g.gradeNumber.toString() === resGrade);
      const sectionDoc = gradeDoc?.sections?.find(s => s.sectionName === resSection);

      if (!gradeDoc || !sectionDoc) return;

      try {
        const [studentsRes, resultsRes] = await Promise.all([
          axios.get(`http://localhost:7000/api/students?studentClass=${resGrade}&sectionId=${sectionDoc._id}`),
          axios.get(`http://localhost:7000/api/results?gradeId=${gradeDoc._id}&sectionName=${resSection}&term=${resPhase}`)
        ]);
        setRealStudents(studentsRes.data);
        setRealResults(resultsRes.data);
      } catch (error) {
        console.error("Failed to fetch students/results:", error);
      }
    };

    if (examData) fetchStudentsAndResults();
  }, [resGrade, resSection, resPhase, examData]);

  const filteredResults = useMemo(() => {
    // Find grade doc to get its subjects
    const gradeDoc = examData?.allGrades?.find(g => g.gradeNumber.toString() === resGrade);

    // Combine students with their results (if any)
    const combined = realStudents.map(student => {
      const result = realResults.find(r => (r.studentId?._id || r.studentId) === student._id);

      // Initialize marks with all grade subjects
      const marksObj = {};
      if (gradeDoc && gradeDoc.subjects) {
        gradeDoc.subjects.forEach(gs => {
          const subName = gs.subjectId?.subjectName || gs.subjectId?.title;
          if (subName) {
            marksObj[subName.toUpperCase()] = null;
          }
        });
      }

      // Fill in actual marks if result exists
      if (result && result.marks) {
        result.marks.forEach(m => {
          const subName = m.subjectId?.subjectName || m.subjectId?.title;
          if (subName) {
            marksObj[subName.toUpperCase()] = (m.theoryMarks || 0) + (m.practicalMarks || 0);
          }
        });
      }

      return {
        id: student._id,
        studentId: student.studentId,
        name: `${student.firstName} ${student.lastName}`,
        phase: resPhase,
        grade: resGrade,
        section: resSection,
        marks: marksObj,
        total: result?.summary?.total || 0,
        percentage: result?.summary?.percentage || 0,
        gpa: result?.summary?.gpa || '0.0',
        status: result?.summary?.status || 'Incomplete'
      };
    });

    // Apply search filter
    return combined.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(resultSearch.toLowerCase()) ||
        r.studentId.toLowerCase().includes(resultSearch.toLowerCase());
      return matchesSearch;
    });
  }, [realStudents, realResults, resultSearch, resGrade, resSection, resPhase, examData]);

  useEffect(() => {
    setActiveResultIndex(0);
  }, [filteredResults.length]);

  const currentResult = filteredResults[activeResultIndex];

  const handleNext = () => {
    if (activeResultIndex < filteredResults.length - 1) {
      setActiveResultIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeResultIndex > 0) {
      setActiveResultIndex(prev => prev - 1);
    }
  };

  const togglePhase = async (termName) => {
    const currentStatus = phases.find(p => p.id === termName)?.status === 'Open';
    const newStatus = !currentStatus;

    try {
      await axios.patch('http://localhost:7000/api/exams/term-status', {
        term: termName,
        isOpen: newStatus
      });

      // Optimistically update local state: flip the matching termStatus entry
      setExamData(prev => {
        if (!prev) return prev;
        const existingStatuses = prev.termStatuses || [];
        const idx = existingStatuses.findIndex(s => s.term === termName);
        let updatedStatuses;
        if (idx > -1) {
          updatedStatuses = existingStatuses.map((s, i) =>
            i === idx ? { ...s, isOpen: newStatus } : s
          );
        } else {
          updatedStatuses = [...existingStatuses, { term: termName, isOpen: newStatus }];
        }
        return { ...prev, termStatuses: updatedStatuses };
      });

      toast({
        type: 'success',
        message: `Marking portal for ${termName} is now ${newStatus ? 'OPEN' : 'CLOSED'}`
      });
    } catch (error) {
      console.error("Failed to update status:", error);
      toast({ type: 'error', message: "Failed to update portal status" });
    }
  };

  const togglePublish = async (termName) => {
    const currentStatus = phases.find(p => p.id === termName)?.publishStatus === 'Published';
    const newStatus = !currentStatus;

    try {
      await axios.patch('http://localhost:7000/api/exams/publish-status', {
        term: termName,
        isPublished: newStatus
      });

      setExamData(prev => {
        if (!prev) return prev;
        const existingStatuses = prev.termStatuses || [];
        const idx = existingStatuses.findIndex(s => s.term === termName);
        let updatedStatuses;
        if (idx > -1) {
          updatedStatuses = existingStatuses.map((s, i) =>
            i === idx ? { ...s, isPublished: newStatus } : s
          );
        } else {
          updatedStatuses = [...existingStatuses, { term: termName, isPublished: newStatus }];
        }
        return { ...prev, termStatuses: updatedStatuses };
      });

      toast({
        type: 'success',
        message: `Results for ${termName} are now ${newStatus ? 'PUBLISHED' : 'HIDDEN'}`
      });
    } catch (error) {
      console.error("Failed to update publish status:", error);
      toast({ type: 'error', message: "Failed to update publish status" });
    }
  };

  return (
    <div className="min-h-full animate-in fade-in duration-500 pb-20">
      {activeView === 'menu' ? (
        <div className="space-y-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">Exam Hub</h1>
              <p className="text-[12px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-3.5">Administrative Assessment Control Module</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <ModuleCard
              icon={Calendar}
              color="bg-emerald-500"
              title="Exam Schedule"
              description="Create and manage exam schedules by class and section. Define dates, times, and subject mapping for upcoming academic assessments."
              buttonLabel="MANAGE EXAM SCHEDULE"
              onClick={() => setActiveView('schedule')}
            />
            <ModuleCard
              icon={Settings2}
              color="bg-emerald-600"
              title="Examination Control"
              description="Oversee grading systems, manage marking portals for faculty, track academic outcomes, and verify official transcripts across all departments."
              buttonLabel="MANAGE CONTROL MODULE"
              onClick={() => setActiveView('control-module')}
            />
          </div>
        </div>
      ) : (
        <div className="max-w-full mx-auto animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <button
              onClick={() => setActiveView('menu')}
              className="flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-emerald-600 uppercase tracking-wider transition-colors group"
            >
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to Hub
            </button>
          </div>

          {activeView === 'schedule' ? (
            <SchedulingView />
          ) : (
            <ControlView
              phases={phases}
              togglePhase={togglePhase}
              togglePublish={togglePublish}
              analyticsGrade={analyticsGrade}
              setAnalyticsGrade={setAnalyticsGrade}
              analyticsSection={analyticsSection}
              setAnalyticsSection={setAnalyticsSection}
              analyticsGradeData={ANALYTICS_GRADE_DATA}
              analyticsSectionData={ANALYTICS_SECTION_DATA}
              resYear={resYear}
              setResYear={setResYear}
              resPhase={resPhase}
              setResPhase={setResPhase}
              resGrade={resGrade}
              setResGrade={setResGrade}
              resSection={resSection}
              setResSection={setResSection}
              resultSearch={resultSearch}
              setResultSearch={setResultSearch}
              activeResultIndex={activeResultIndex}
              handlePrev={handlePrev}
              handleNext={handleNext}
              filteredResults={filteredResults}
              currentResult={currentResult}
              grades={grades}
              sections={SECTIONS}
              years={YEARS}
              initialPhases={phases}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ExamManagement;