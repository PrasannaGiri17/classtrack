import React, { useState, useEffect } from 'react';
import {
  Settings,
  BookOpen,
  Layers,
  Clock,
  ChevronLeft,
  ArrowRight
} from 'lucide-react';

// Sub-components
import InstitutionalView from '../AdminComponents/SchoolManagement/InstitutionalView';
import GradeView from '../AdminComponents/SchoolManagement/GradeView';
import CurriculumView from '../AdminComponents/SchoolManagement/CurriculumView';
import RoutineView from '../AdminComponents/SchoolManagement/RoutineView';
import schoolService from '../Api/schoolService';
import gradeService from '../Api/gradeService';
import subjectService from '../Api/subjectService';
import routineService from '../Api/routineService';
import { toast } from '../MainSystemComponents/Toast';


const SchoolManagement = () => {
  const [activeView, setActiveView] = useState('menu');
  const [isLoading, setIsLoading] = useState(false);

  // --- Shared Global State ---
  const [schoolConfig, setSchoolConfig] = useState({
    name: "Real Madrid Academy",
    address: "Santiago Bernabéu, Madrid, Spain",
    logo: "https://picsum.photos/seed/school/200/200",
    schoolEmail: "contact@realmadrid-academy.edu",
    phoneNumbers: ["+34 91 398 43 00"],
    socialLinks: {
      tiktok: "",
      facebook: "https://facebook.com/realmadrid",
      instagram: "https://instagram.com/realmadrid",
    },
    gradeSpan: { start: 1, end: 10 }
  });

  const [range, setRange] = useState({ from: 1, to: 10 });
  const [sectionMap, setSectionMap] = useState({});
  const [curriculumMap, setCurriculumMap] = useState({});

  // Routine State
  const [schoolHours, setSchoolHours] = useState({ start: "09:00", end: "16:00" });
  const [classRoutines, setClassRoutines] = useState({}); // { "1": [slots] }

  // Fetch School & Grades Info on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch School config
        const schoolData = await schoolService.getSchool();
        if (schoolData) {
          const transformedData = {
            // ... existing transforms
            ...schoolData,
            logo: schoolData.logo || schoolConfig.logo,
            phoneNumbers: schoolData.phoneNumbers && Array.isArray(schoolData.phoneNumbers)
              ? schoolData.phoneNumbers.map(p => p.phoneNumber)
              : [],
            socialLinks: schoolData.socialLinks && Array.isArray(schoolData.socialLinks)
              ? schoolData.socialLinks.reduce((acc, curr) => ({ ...acc, [curr.platform]: curr.url }), {})
              : {}
          };
          setSchoolConfig(prev => ({ ...prev, ...transformedData }));
          if (schoolData.gradeSpan) {
            setRange({ from: schoolData.gradeSpan.start || 1, to: schoolData.gradeSpan.end || 10 });
          }
        }

        // 2. Fetch Grades
        const gradesData = await gradeService.getGrades();
        if (gradesData && Array.isArray(gradesData)) {
          // ... (existing grade logic)
          const sMap = {};
          const cMap = {};
          gradesData.forEach(g => {
            const gNum = String(g.gradeNumber);
            sMap[gNum] = g.sections ? g.sections.length : 1;

            // Process Subjects
            const cores = [];
            const extras = [];
            if (g.subjects) {
              g.subjects.forEach(sub => {
                const name = sub.subjectId ? sub.subjectId.subjectName : "Unknown";
                if (sub.isMandatory) cores.push(name);
                else extras.push({ subjectName: name, gradeNum: gNum });
              });
            }
            cMap[gNum] = { core: cores, extra: extras };
          });
          setSectionMap(sMap);
          setCurriculumMap(cMap);
        }

        // 3. Fetch Routines
        const routineData = await routineService.getRoutineMatrix();
        if (routineData) {
          if (routineData.operatingHours) {
            setSchoolHours(routineData.operatingHours);
          }
          if (routineData.classRoutines) {
            setClassRoutines(routineData.classRoutines);
          }
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  // ... (handlers) ...

  // --- Routine Handlers ---
  const handleUpdateHours = async (newHours) => {
    try {
      await routineService.updateOperatingHours(newHours.start, newHours.end);
      setSchoolHours(newHours);
      toast({ type: 'success', message: "Operating hours updated.", duration: 2000 });
    } catch (e) {
      console.error(e);
      toast({ type: 'error', message: "Failed to update hours.", duration: 3000 });
    }
  };

  const handleUpdateRoutines = async (grade, routines, isLocked) => {
    try {
      await routineService.updateGradeRoutine(grade, routines, isLocked);
      setClassRoutines(prev => ({
        ...prev,
        [grade]: { slots: routines, isLocked }
      }));
      toast({ type: 'success', message: `Routine for Grade ${grade} updated.`, duration: 2000 });
    } catch (e) {
      console.error(e);
      toast({ type: 'error', message: "Failed to save routine.", duration: 3000 });
    }
  };


  const handleSaveSchool = async () => {
    setIsLoading(true);
    try {
      // 1. Transform Social Links
      const socialArray = Object.entries(schoolConfig.socialLinks || {}).map(([key, val]) => ({
        platform: key,
        url: val
      })).filter(item => item.url);

      const phoneArray = (schoolConfig.phoneNumbers || [])
        .filter(p => p && p.trim() !== "")
        .map(p => ({
          phoneNumber: p,
          type: 'main',
          isPrimary: false
        }));

      const payload = {
        ...schoolConfig,
        socialLinks: socialArray,
        phoneNumbers: phoneArray
      };

      try {
        await schoolService.updateSchool(payload);
        toast({ type: 'success', message: "School information updated successfully!", duration: 3000 });
      } catch (updateError) {
        await schoolService.addSchool(payload);
        toast({ type: 'success', message: "School information created successfully!", duration: 3000 });
      }

    } catch (error) {
      console.error("Error saving school info:", error);
      toast({ type: 'error', message: `Failed to save changes. ${error.response?.data?.message || error.message}`, duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRange = async (from, to) => {
    try {
      const socialArray = Object.entries(schoolConfig.socialLinks || {}).map(([key, val]) => ({ platform: key, url: val })).filter(item => item.url);
      const phoneArray = (schoolConfig.phoneNumbers || []).filter(p => p && p.trim() !== "").map(p => ({ phoneNumber: p, type: 'main', isPrimary: false }));
      const finalPayload = { ...schoolConfig, gradeSpan: { start: from, end: to }, socialLinks: socialArray, phoneNumbers: phoneArray };

      await schoolService.updateSchool(finalPayload);
      setRange({ from, to });
      setSchoolConfig(prev => ({ ...prev, gradeSpan: { start: from, end: to } }));
      toast({ type: 'success', message: "Grade range updated successfully!", duration: 3000 });
    } catch (error) {
      toast({ type: 'error', message: "Failed to update range.", duration: 3000 });
    }
  };

  const handleUpdateSections = async (grade, count) => {
    try {
      await gradeService.updateGradeSections(grade, count);
      setSectionMap(prev => ({ ...prev, [grade]: count }));
      toast({ type: 'success', message: `Grade ${grade} sections updated to ${count}.`, duration: 3000 });
    } catch (error) {
      toast({ type: 'error', message: "Failed to update section.", duration: 3000 });
    }
  };

  const handleSyncSections = async (count) => {
    try {
      const gradesToSync = Array.from({ length: range.to - range.from + 1 }, (_, i) => (range.from + i).toString());
      await gradeService.syncSections(count, gradesToSync);
      const newMap = { ...sectionMap };
      gradesToSync.forEach(g => newMap[g] = count);
      setSectionMap(newMap);
      toast({ type: 'success', message: `All visible grades synced to ${count} sections.`, duration: 3000 });
    } catch (error) {
      toast({ type: 'error', message: "Failed to sync sections.", duration: 3000 });
    }
  };

  // --- Curriculum Handlers ---
  const handleAddCore = async (grade, name) => {
    try {
      await subjectService.addSubjectGlobal(name, 'core');
      setCurriculumMap(prev => {
        const newMap = { ...prev };
        Object.keys(newMap).forEach(gKey => {
          const gData = newMap[gKey] || { core: [], extra: [] };
          if (!gData.core.includes(name)) newMap[gKey] = { ...gData, core: [...gData.core, name] };
        });
        return newMap;
      });
      toast({ type: 'success', message: `Core subject '${name}' added to all grades.`, duration: 3000 });
    } catch (e) {
      toast({ type: 'error', message: "Failed to add global core subject.", duration: 3000 });
    }
  };

  const handleRemoveCore = async (grade, name) => {
    try {
      await subjectService.removeSubjectGlobal(name);
      setCurriculumMap(prev => {
        const newMap = { ...prev };
        Object.keys(newMap).forEach(gKey => {
          const gData = newMap[gKey] || { core: [], extra: [] };
          newMap[gKey] = { ...gData, core: gData.core.filter(c => c !== name) };
        });
        return newMap;
      });
      toast({ type: 'success', message: "Core subject removed from all grades.", duration: 3000 });
    } catch (e) {
      toast({ type: 'error', message: "Failed to remove subject.", duration: 3000 });
    }
  };

  const handleAddExtra = async (grade, name) => {
    try {
      await subjectService.addSubject(grade, name, 'elective');
      setCurriculumMap(prev => {
        const gData = prev[grade] || { core: [], extra: [] };
        return { ...prev, [grade]: { ...gData, extra: [...gData.extra, { subjectName: name, gradeNum: grade }] } };
      });
      toast({ type: 'success', message: "Elective added successfully.", duration: 3000 });
    } catch (e) {
      toast({ type: 'error', message: "Failed to add elective.", duration: 3000 });
    }
  };

  const handleRemoveExtra = async (grade, name) => {
    try {
      await subjectService.removeSubject(grade, name);
      setCurriculumMap(prev => {
        const gData = prev[grade] || { core: [], extra: [] };
        return { ...prev, [grade]: { ...gData, extra: gData.extra.filter(e => e.subjectName !== name) } };
      });
      toast({ type: 'success', message: "Elective removed.", duration: 3000 });
    } catch (e) {
      toast({ type: 'error', message: "Failed to remove elective.", duration: 3000 });
    }
  };

  const getCoreForGrade = (grade) => curriculumMap[grade]?.core || [];
  const allExtras = Object.entries(curriculumMap).flatMap(([gNum, data]) => data.extra || []);
  const gradeList = Array.from({ length: range.to - range.from + 1 }, (_, i) => (range.from + i).toString());

  // --- Render Switcher ---
  const renderView = () => {
    switch (activeView) {
      case 'institutional':
        return <InstitutionalView
          config={schoolConfig}
          onUpdate={(updates) => setSchoolConfig({ ...schoolConfig, ...updates })}
          onSave={handleSaveSchool}
          isLoading={isLoading}
        />;
      case 'grades':
        return <GradeView
          range={range}
          sectionMap={sectionMap}
          gradeList={gradeList}
          onUpdateRange={handleUpdateRange}
          onUpdateSections={handleUpdateSections}
          onSyncSections={handleSyncSections}
        />;
      case 'curriculum':
        return <CurriculumView
          gradeList={gradeList}
          getCoreForGrade={getCoreForGrade}
          extraSubjects={allExtras}
          onAddCore={handleAddCore}
          onRemoveCore={handleRemoveCore}
          onAddExtra={handleAddExtra}
          onRemoveExtra={handleRemoveExtra}
        />;
      case 'routine':
        return <RoutineView
          schoolHours={schoolHours}
          onUpdateHours={handleUpdateHours}
          classRoutines={classRoutines}
          onUpdateRoutines={handleUpdateRoutines}
          gradeList={gradeList}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-full animate-in fade-in duration-500 pb-20">
      {activeView === 'menu' ? (
        <div className="space-y-12">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">School Hub</h1>
            <p className="text-[12px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-3.5">Administrative Configuration Module</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HubCard icon={Settings} color="bg-emerald-500" title="Institutional Settings" desc="Configure school identity, addresses, and global metadata." onClick={() => setActiveView('institutional')} />
            <HubCard icon={Layers} color="bg-blue-500" title="Grade & Sections" desc="Define class hierarchies and active learning sections." onClick={() => setActiveView('grades')} />
            <HubCard icon={BookOpen} color="bg-amber-500" title="Curriculum Builder" desc="Manage core mandatory subjects and specialized electives." onClick={() => setActiveView('curriculum')} />
            <HubCard icon={Clock} color="bg-indigo-600" title="Routine Structure" desc="Set universal school day frameworks and period skeletons." onClick={() => setActiveView('routine')} />
          </div>
        </div>
      ) : (
        <div className="max-w-full mx-auto animate-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={() => setActiveView('menu')}
            className="flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-emerald-600 uppercase tracking-wider transition-colors mb-8 group"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Hub
          </button>
          {renderView()}
        </div>
      )}
    </div>
  );
};

const HubCard = ({ icon: Icon, color, title, desc, onClick }) => (
  <button onClick={onClick} className="group relative flex items-start gap-6 p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-xl transition-all text-left overflow-hidden h-full">
    <div className={`shrink-0 w-12 h-12 ${color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
      <Icon className="text-white w-6 h-6" />
    </div>
    <div className="flex-1 space-y-1.5">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">{title}</h3>
      <p className="text-sm font-medium text-slate-500 leading-relaxed line-clamp-2">{desc}</p>
    </div>
    <div className="absolute top-8 right-8 text-slate-200 group-hover:text-emerald-500 transition-colors"><ArrowRight size={20} /></div>
  </button>
);

export default SchoolManagement;