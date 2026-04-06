import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronLeft, Calendar, Settings2 } from 'lucide-react';
import axios from 'axios';
import { toast } from '../MainSystemComponents/Toast';

import ModuleCard from '../AdminComponents/Exam/ModuleCard';
import SchedulingView from '../AdminComponents/Exam/SchedulingView'
import ControlView from '../AdminComponents/Exam/ControlView';
import examService from '../Api/examService';
import gradeService from '../Api/gradeService';
import studentService from '../Api/studentService';
import resultService from '../Api/resultService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const [resYear, setResYear] = useState(localStorage.getItem('resYear') || '2025');
  const [resPhase, setResPhase] = useState(localStorage.getItem('resPhase') || 'First Mid Term');
  const [resGrade, setResGrade] = useState(localStorage.getItem('resGrade') || '10');
  const [resSection, setResSection] = useState(localStorage.getItem('resSection') || 'A');
  const [resultSearch, setResultSearch] = useState('');
  const [activeResultIndex, setActiveResultIndex] = useState(0);

  // Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examData, gradesData] = await Promise.all([
          examService.getExamData(),
          gradeService.getGrades()
        ]);
        setExamData({ ...examData, allGrades: gradesData });
        setGrades(gradesData.map(g => g.gradeNumber.toString()));
        if (!localStorage.getItem('resGrade')) {
          if (gradesData.length > 0) {
            const firstGrade = gradesData[0];
            const firstGradeNum = firstGrade.gradeNumber.toString();
            setAnalyticsGrade(firstGradeNum);
            setResGrade(firstGradeNum);
            if (firstGrade.sections && firstGrade.sections.length > 0) {
              setResSection(firstGrade.sections[0].sectionName);
            }
          }
        }
        setAnalyticsGrade(localStorage.getItem('resGrade') || gradesData[0]?.gradeNumber?.toString() || '10');

        // Initialize resPhase from exam data config if not in storage
        if (!localStorage.getItem('resPhase')) {
          const { includeMidTerm } = examData.config || { termsCount: 3, includeMidTerm: true };
          const initialPhase = includeMidTerm ? 'First Mid Term' : 'First Term';
          setResPhase(initialPhase);
        }
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
          name: midName,
          status: statusObj?.isOpen ? 'Open' : 'Closed',
          publishStatus: statusObj?.isPublished ? 'Published' : 'Hidden'
        });
      }
      const termName = `${ord} Term`;
      const statusObj = examData.termStatuses?.find(s => s.term === termName);
      generatedPhases.push({
        id: termName,
        name: termName,
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
      const isAll = resSection === 'All';
      const sectionDoc = isAll ? null : gradeDoc?.sections?.find(s => s.sectionName === resSection);

      if (!gradeDoc || (!isAll && !sectionDoc)) return;

      try {
        const [studentsData, resultsData] = await Promise.all([
          isAll 
            ? studentService.getStudents(resGrade)
            : studentService.getStudentsBySection(resGrade, sectionDoc._id),
          resultService.getResultsByGradeSectionTerm(gradeDoc._id, isAll ? '' : resSection, resPhase)
        ]);
        setRealStudents(studentsData);
        setRealResults(resultsData);
      } catch (error) {
        console.error("Failed to fetch students/results:", error);
      }
    };

    if (examData) fetchStudentsAndResults();
  }, [resGrade, resSection, resPhase, examData]);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('resYear', resYear);
    localStorage.setItem('resPhase', resPhase);
    localStorage.setItem('resGrade', resGrade);
    localStorage.setItem('resSection', resSection);
  }, [resYear, resPhase, resGrade, resSection]);

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
            marksObj[subName.toUpperCase()] = {
              total: (m.theoryMarks || 0) + (m.practicalMarks || 0),
              theory: m.theoryMarks || 0,
              practical: m.practicalMarks || 0
            };
          }
        });
      }

      return {
        id: student._id,
        studentId: student.studentId,
        name: `${student.firstName} ${student.lastName}`,
        image: student.profilePhoto,
        phase: resPhase,
        grade: resGrade,
        section: resSection,
        marks: marksObj,
        total: result?.summary?.total || 0,
        percentage: parseFloat(result?.summary?.percentage || 0).toFixed(2),
        gpa: parseFloat(result?.summary?.gpa || 0).toFixed(2),
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
      await examService.updateTermStatus(termName, newStatus);


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
      await examService.updatePublishStatus(termName, newStatus);


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

  const calculateGrade = (total) => {
    if (total >= 90) return 'A+';
    if (total >= 80) return 'A';
    if (total >= 70) return 'B+';
    if (total >= 60) return 'B';
    if (total >= 50) return 'C+';
    if (total >= 40) return 'C';
    return 'D';
  };

  const handleDownloadPDF = (result) => {
    if (!result) return;

    toast({
      type: 'info',
      message: `Generating official transcript for ${result.name}...`
    });

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const primaryColor = [16, 185, 129]; // Emerald Green
    const accentColor = [15, 23, 42]; // Slate 900
    
    // --- 1. HEADER SECTION ---
    doc.setFillColor(...accentColor);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    const schoolName = localStorage.getItem("schoolName") || "CLASS TRACK SCHOOL";
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(schoolName.toUpperCase(), pageWidth / 2, 18, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Official Academic Performance Report", pageWidth / 2, 26, { align: 'center' });
    
    doc.setFillColor(...primaryColor);
    doc.roundedRect(pageWidth / 2 - 35, 32, 70, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(result.phase.toUpperCase(), pageWidth / 2, 37.5, { align: 'center' });

    // --- 2. STUDENT INFORMATION ---
    const infoY = 55;
    doc.setTextColor(...accentColor);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("STUDENT PROFILE", 14, infoY);
    
    doc.setDrawColor(226, 232, 240);
    doc.line(14, infoY + 2, pageWidth - 14, infoY + 2);
    
    doc.setFont("helvetica", "normal");
    const labelX1 = 14, valX1 = 45;
    const labelX2 = 110, valX2 = 140;
    
    doc.setTextColor(100, 116, 139);
    doc.text("Student Name:", labelX1, infoY + 10);
    doc.setTextColor(...accentColor);
    doc.setFont("helvetica", "bold");
    doc.text(result.name.toUpperCase(), valX1, infoY + 10);
    
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text("Student ID:", labelX2, infoY + 10);
    doc.setTextColor(...accentColor);
    doc.text(result.studentId || 'N/A', valX2, infoY + 10);
    
    doc.setTextColor(100, 116, 139);
    doc.text("Grade / Class:", labelX1, infoY + 18);
    doc.setTextColor(...accentColor);
    doc.text(`Grade ${result.grade} - ${result.section}`, valX1, infoY + 18);
    
    doc.setTextColor(100, 116, 139);
    doc.text("Academic Year:", labelX1, infoY + 26);
    doc.setTextColor(...accentColor);
    doc.text("2082", valX1, infoY + 26);
    
    doc.setTextColor(100, 116, 139);
    doc.text("Issue Date:", labelX2, infoY + 26);
    doc.setTextColor(...accentColor);
    doc.text(new Date().toLocaleDateString(), valX2, infoY + 26);

    // --- 3. ACADEMIC SCORES TABLE ---
    const tableData = Object.entries(result.marks).map(([subject, data]) => [
      subject,
      data ? data.theory : '—',
      data ? data.practical : '—',
      data ? data.total : '—',
      data ? calculateGrade(data.total) : '—'
    ]);
    
    autoTable(doc, {
      startY: infoY + 35,
      head: [['Subject Name', 'Theory', 'Practical', 'Total', 'Grade']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      columnStyles: { 0: { halign: 'left', fontStyle: 'bold' }, 1: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center', fontStyle: 'bold' }, 4: { halign: 'center', fontStyle: 'bold' } },
      styles: { fontSize: 9, cellPadding: 5 }
    });

    // --- 4. SUMMARY SECTION ---
    const finalY = (doc).lastAutoTable.finalY + 15;
    doc.setFillColor(248, 250, 252);
    doc.rect(14, finalY, pageWidth - 28, 30, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, finalY, pageWidth - 28, 30, 'D');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...accentColor);
    doc.text("OVERALL PERFORMANCE", 20, finalY + 8);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Average Percentage:", 20, finalY + 18);
    doc.text("Grade Point Average (GPA):", 20, finalY + 25);
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.setFontSize(14);
    doc.text(`${result.percentage}%`, 75, finalY + 18);
    doc.text(result.gpa, 75, finalY + 25);
    
    const finalGrade = calculateGrade(parseFloat(result.percentage));
    doc.setFillColor(...primaryColor);
    doc.circle(pageWidth - 35, finalY + 15, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(finalGrade, pageWidth - 35, finalY + 16.5, { align: 'center' });
    doc.setFontSize(7);
    doc.text("FINAL GRADE", pageWidth - 35, finalY + 22, { align: 'center' });

    // --- 5. GRADING SCALE ---
    const scaleY = finalY + 45;
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("GRADING SYSTEM:", 14, scaleY);
    doc.setFont("helvetica", "normal");
    doc.text("A+: 90-100 | A: 80-89 | B+: 70-79 | B: 60-69 | C+: 50-59 | C: 40-49 | D: Below 40", 14, scaleY + 5);

    // --- 6. SIGNATURE SECTION ---
    const sigY = scaleY + 30;
    const sigWidth = 40;
    const sigX1 = 14, sigX2 = pageWidth / 2 - sigWidth / 2, sigX3 = pageWidth - 14 - sigWidth;
    doc.setDrawColor(200, 200, 200);
    doc.line(sigX1, sigY, sigX1 + sigWidth, sigY);
    doc.line(sigX2, sigY, sigX2 + sigWidth, sigY);
    doc.line(sigX3, sigY, sigX3 + sigWidth, sigY);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Class Teacher", sigX1 + sigWidth / 2, sigY + 5, { align: 'center' });
    doc.text("Exam Controller", sigX2 + sigWidth / 2, sigY + 5, { align: 'center' });
    doc.text("Principal", sigX3 + sigWidth / 2, sigY + 5, { align: 'center' });

    doc.save(`Transcript_${result.name.replace(/\s+/g, '_')}_${result.phase}.pdf`);
    toast({ type: 'success', message: 'Examination Report successfully exported to PDF.' });
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
              onDownloadPDF={handleDownloadPDF}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ExamManagement;