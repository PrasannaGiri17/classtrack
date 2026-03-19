import React, { useState, useEffect } from 'react';
import {
  Settings,
  BookOpen,
  Layers,
  Clock,
  ChevronLeft,
  ArrowRight,
  ChevronDown
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
import adminService from '../Api/adminService';
import { toast } from '../MainSystemComponents/Toast';


const SchoolManagement = () => {
  const [activeView, setActiveView] = useState('menu');
  const [isLoading, setIsLoading] = useState(false);
  const [adminSchoolId, setAdminSchoolId] = useState(localStorage.getItem("schoolId") ? Number(localStorage.getItem("schoolId")) : null);

  // --- Shared Global State ---
  const [schoolConfig, setSchoolConfig] = useState({
    name: "",
    address: "",
    logo: "",
    schoolEmail: "",
    motto: "",
    establishedYear: "",
    affiliation: "",
    principalName: "",
    website: "",
    phoneNumbers: [],
    socialLinks: {},
    gradeSpan: { start: 1, end: 10 }
  });

  const [selectedGrade, setSelectedGrade] = useState("1");

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
        // 0. Get Admin Profile to find schoolId
        const adminId = localStorage.getItem("adminId");
        if (!adminId) return;

        const adminProfile = await adminService.getAdminById(adminId);
        const schoolId = adminProfile?.schoolId;
        if (schoolId) {
          setAdminSchoolId(schoolId);
          localStorage.setItem("schoolId", schoolId);
        }

        const effectiveSchoolId = schoolId || adminSchoolId;
        if (!effectiveSchoolId) return;

        // 1. Fetch School config by ID
        try {
          const schoolData = await schoolService.getSchoolById(effectiveSchoolId);
          if (schoolData) {
            const transformedData = {
              name: schoolData.name || "",
              address: schoolData.address || "",
              logo: schoolData.logo || "",
              schoolEmail: schoolData.email || "",
              motto: schoolData.motto || "",
              establishedYear: schoolData.establishedYear || "",
              affiliation: schoolData.affiliation || "",
              principalName: schoolData.principalName || "",
              website: schoolData.website || "",
              gradeSpan: schoolData.gradeSpan || { start: 1, end: 10 },
              phoneNumbers: schoolData.phoneNumbers && Array.isArray(schoolData.phoneNumbers)
                ? schoolData.phoneNumbers.map(p => ({ number: p.phoneNumber, label: p.type || "Phone" }))
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
        } catch (schoolError) {
          if (schoolError.response?.status === 404) {
            console.log("New school admin - showing empty profile to add details.");
          } else {
            console.error("Error fetching school:", schoolError);
          }
        }

        // 2. Fetch Grades (only if school exists)
        try {
          const gradesData = await gradeService.getGrades(effectiveSchoolId);
          if (gradesData && Array.isArray(gradesData)) {
            const sMap = {};
            const cMap = {};
            gradesData.forEach(g => {
              const gNum = String(g.gradeNumber);
              sMap[gNum] = g.sections ? g.sections.length : 1;
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
        } catch (gradeErr) {
          console.warn("No grade data for this school yet.", gradeErr.message);
        }

        // 3. Fetch Routines
        try {
          const routineData = await routineService.getRoutineMatrix(effectiveSchoolId);
          if (routineData) {
            if (routineData.operatingHours) setSchoolHours(routineData.operatingHours);
            if (routineData.classRoutines) setClassRoutines(routineData.classRoutines);
          }
        } catch (routineErr) {
          console.warn("No routine data for this school yet.", routineErr.message);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [adminSchoolId]);

  // ... (handlers) ...

  // --- Routine Handlers ---
  const handleUpdateHours = async (newHours) => {
    try {
      await routineService.updateOperatingHours(newHours.start, newHours.end, adminSchoolId);
      setSchoolHours(newHours);
      toast({ type: 'success', message: "Operating hours updated.", duration: 2000 });
    } catch (e) {
      console.error(e);
      toast({ type: 'error', message: "Failed to update hours.", duration: 3000 });
    }
  };

  const handleUpdateRoutines = (grade, routines, isLocked) => {
    setClassRoutines(prev => ({
      ...prev,
      [grade]: { slots: routines, isLocked }
    }));
  };

  const handleFinalizeRoutine = async (grade) => {
    try {
      const routineData = classRoutines[grade];
      if (!routineData) return;

      await routineService.updateGradeRoutine(grade, routineData.slots, true, adminSchoolId);

      setClassRoutines(prev => ({
        ...prev,
        [grade]: { ...prev[grade], isLocked: true }
      }));

      toast({ type: 'success', message: `Routine for Grade ${grade} finalized and locked.`, duration: 2000 });
    } catch (e) {
      console.error(e);
      toast({ type: 'error', message: "Failed to finalize routine.", duration: 3000 });
    }
  };

  const preparePayload = (config = schoolConfig) => {
    const socialArray = Object.entries(config.socialLinks || {}).map(([key, val]) => ({
      platform: key,
      url: val
    })).filter(item => item.url);

    const phoneArray = (config.phoneNumbers || [])
      .filter(p => p.number && p.number.trim() !== "")
      .map(p => ({
        phoneNumber: p.number,
        type: p.label || 'Phone',
        isPrimary: false
      }));

    const payload = {
      ...config,
      email: config.schoolEmail,
      socialLinks: socialArray,
      phoneNumbers: phoneArray
    };

    // Remove frontend-only state fields that backend doesn't expect
    delete payload.schoolEmail;

    return payload;
  };

  const saveConfig = async (payload, manualId) => {
    try {
      const activeId = manualId || adminSchoolId;
      if (!activeId) return false;
      
      // Add schoolId to payload
      const finalPayload = { ...payload, schoolId: activeId };
      
      await schoolService.updateSchool(activeId, finalPayload);
      return true;
    } catch (e) {
      const activeId = manualId || adminSchoolId;
      if (e.response?.status === 404 && activeId) {
        // Add schoolId for new record
        const finalPayload = { ...payload, _id: activeId, schoolId: activeId };
        await schoolService.addSchool(finalPayload);
        return true;
      }
      throw e;
    }
  };

  const handleSaveSchool = async () => {
    setIsLoading(true);
    try {
      const payload = preparePayload();
      await saveConfig(payload);
      toast({ type: 'success', message: "School information saved successfully!", duration: 3000 });
    } catch (error) {
      console.error("Error saving school info:", error);
      toast({ type: 'error', message: `Failed to save changes. ${error.response?.data?.message || error.message}`, duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRange = async (from, to, manualId) => {
    try {
      const newConfig = { ...schoolConfig, gradeSpan: { start: from, end: to } };
      const payload = preparePayload(newConfig);
      await saveConfig(payload, manualId);

      setRange({ from, to });
      setSchoolConfig(newConfig);
      toast({ type: 'success', message: "Grade range updated successfully!", duration: 3000 });
    } catch (error) {
      console.error("Error updating range:", error);
      toast({ type: 'error', message: "Failed to update range.", duration: 3000 });
    }
  };

  const handleUpdateSections = async (grade, count, manualId) => {
    try {
      const activeId = manualId || adminSchoolId;
      await gradeService.updateGradeSections(grade, count, activeId);
      setSectionMap(prev => ({ ...prev, [grade]: count }));
      toast({ type: 'success', message: `Grade ${grade} sections updated to ${count}.`, duration: 3000 });
    } catch (error) {
      toast({ type: 'error', message: "Failed to update section.", duration: 3000 });
    }
  };

  const handleSyncSections = async (count, manualId) => {
    try {
      const activeId = manualId || adminSchoolId;
      const gradesToSync = Array.from({ length: range.to - range.from + 1 }, (_, i) => (range.from + i).toString());
      await gradeService.syncSections(count, gradesToSync, activeId);
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
      await subjectService.addSubjectGlobal(name, 'core', adminSchoolId);
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
      await subjectService.removeSubjectGlobal(name, adminSchoolId);
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

  const handleAddExtra = async (grades, name) => {
    setIsLoading(true);
    try {
      for (const grade of grades) {
        await subjectService.addSubject(grade, name, 'elective', adminSchoolId);
      }
      setCurriculumMap(prev => {
        const newMap = { ...prev };
        grades.forEach(grade => {
          const gData = newMap[grade] || { core: [], extra: [] };
          newMap[grade] = { ...gData, extra: [...gData.extra, { subjectName: name, gradeNum: grade }] };
        });
        return newMap;
      });
      toast({ type: 'success', message: `Specialized subject '${name}' added to selected grades.`, duration: 3000 });
    } catch (e) {
      toast({ type: 'error', message: "Failed to add specialized subject.", duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveExtra = async (grades, name) => {
    setIsLoading(true);
    try {
      for (const grade of grades) {
        await subjectService.removeSubject(grade, name, adminSchoolId);
      }
      setCurriculumMap(prev => {
        const newMap = { ...prev };
        grades.forEach(grade => {
          const gData = newMap[grade] || { core: [], extra: [] };
          newMap[grade] = { ...gData, extra: gData.extra.filter(e => e.subjectName !== name) };
        });
        return newMap;
      });
      toast({ type: 'success', message: "Specialized subject removed successfully.", duration: 3000 });
    } catch (e) {
      toast({ type: 'error', message: "Failed to remove specialized subject.", duration: 3000 });
    } finally {
      setIsLoading(false);
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
          schoolName={schoolConfig.name}
          schoolId={adminSchoolId}
          onUpdateRange={handleUpdateRange}
          onUpdateSections={handleUpdateSections}
          onSyncSections={handleSyncSections}
        />;
      case 'curriculum':
        return <CurriculumView
          gradeList={gradeList}
          getCoreForGrade={getCoreForGrade}
          extraSubjects={allExtras}
          schoolName={schoolConfig.name}
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
          onFinalize={handleFinalizeRoutine}
          gradeList={gradeList}
          schoolName={schoolConfig.name}
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
            <HubCard icon={Settings} color="bg-emerald-500" title="School Setup" desc="Configure school identity, addresses, and global metadata." onClick={() => setActiveView('institutional')} />
            <HubCard icon={Layers} color="bg-blue-500" title="Grade & Sections" desc="Define class hierarchies and active learning sections." onClick={() => setActiveView('grades')} />
            <HubCard icon={BookOpen} color="bg-amber-500" title="School Subjects" desc="Manage core mandatory subjects and specialized electives." onClick={() => setActiveView('curriculum')} />
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