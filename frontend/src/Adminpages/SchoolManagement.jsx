import React, { useState, useEffect } from 'react';
import {
  Settings,
  BookOpen,
  Layers,
  Clock,
  ChevronLeft,
  ArrowRight,
  ChevronDown,
  Calendar,
  ShieldCheck,
  Mail,
  X,
  RefreshCcw,
  Zap
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
import { Loader2 } from 'lucide-react';
import PortalPopup from '../MainSystemComponents/PortalPopup';
import YearSwitchPopup from '../AdminComponents/SchoolManagement/YearSwitchPopup';



const SchoolManagement = () => {
  const [activeView, setActiveView] = useState('menu');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isSavingHours, setIsSavingHours] = useState(false);
  const [newSlot, setNewSlot] = useState({ type: 'subject', label: '', durationMinutes: 45, breakType: 'Short' });
  const [isSwitchPopupOpen, setIsSwitchPopupOpen] = useState(false);
  const [adminSchoolId, setAdminSchoolId] = useState(localStorage.getItem("schoolId") ? Number(localStorage.getItem("schoolId")) : null);
  const [currentAdminEmail, setCurrentAdminEmail] = useState("");

  // --- Shared Global State ---
  const [schoolConfig, setSchoolConfig] = useState({
    name: "",
    address: "",
    logo: "",
    coverImage: "",
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

  const [range, setRange] = useState({ from: null, to: null });
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
        if (!adminId) {
          console.warn("No adminId found in localStorage.");
          return;
        }

        console.log(`Fetching admin profile for adminId: ${adminId}`);
        const adminProfile = await adminService.getAdminById(adminId);
        let currentSchoolId = null;

        if (adminProfile) {
          if (adminProfile.schoolId) {
            currentSchoolId = adminProfile.schoolId;
            setAdminSchoolId(currentSchoolId);
            localStorage.setItem("schoolId", currentSchoolId);
            console.log(`Admin profile found, schoolId: ${currentSchoolId}`);
          }
          if (adminProfile.email) {
            setCurrentAdminEmail(adminProfile.email);
          }
        } else {
          console.warn("Admin profile not found.");
        }

        const effectiveSchoolId = currentSchoolId || adminSchoolId;
        if (!effectiveSchoolId) {
          console.warn("No effective schoolId available to fetch data.");
          return;
        }
        console.log(`Using effective schoolId: ${effectiveSchoolId}`);

        // 1. Fetch School config by ID
        try {
          console.log(`Fetching school config for schoolId: ${effectiveSchoolId}`);
          const schoolData = await schoolService.getSchoolById(effectiveSchoolId);
          if (schoolData) {
            console.log("School data fetched successfully:", schoolData);
            const transformedData = {
              name: schoolData.name || "",
              address: schoolData.address || "",
              logo: schoolData.logo || "",
              coverImage: schoolData.coverImage || "",
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
              setRange({
                from: schoolData.gradeSpan.start,
                to: schoolData.gradeSpan.end
              });
            }
            if (schoolData.operatingHours) {
              setSchoolHours(prev => ({
                ...prev,
                ...schoolData.operatingHours
              }));
            }
          } else {
            console.warn("School data was empty for schoolId:", effectiveSchoolId);
          }
        } catch (schoolError) {
          if (schoolError.response?.status === 404) {
            console.log("New school admin - showing empty profile to add details for schoolId:", effectiveSchoolId);
          } else {
            console.error("Error fetching school:", schoolError);
          }
        }

        // 2. Fetch Grades (only if school exists)
        try {
          console.log(`Fetching grades for schoolId: ${effectiveSchoolId}`);
          const gradesData = await gradeService.getGrades(effectiveSchoolId);
          if (gradesData && Array.isArray(gradesData)) {
            console.log("Grades data fetched successfully:", gradesData);
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
          } else {
            console.warn("Grades data was empty or not an array for schoolId:", effectiveSchoolId);
          }
        } catch (gradeErr) {
          console.warn("No grade data for this school yet.", gradeErr.message);
        }

        // 3. Fetch Routines
        try {
          console.log(`Fetching routines for schoolId: ${effectiveSchoolId}`);
          const routineData = await routineService.getRoutineMatrix(effectiveSchoolId);
          if (routineData) {
            console.log("Routine data fetched successfully:", routineData);
            if (routineData.operatingHours) setSchoolHours(routineData.operatingHours);

            // Merge with local storage for unfinalized/modified routines
            const localCache = localStorage.getItem(`routine_cache_${effectiveSchoolId}`);
            let mergedRoutines = routineData.classRoutines || {};

            if (localCache) {
              const parsedCache = JSON.parse(localCache);
              Object.keys(parsedCache).forEach(grade => {
                // If the remote version is unlocked OR we have a local version that is unlocked, 
                // we might want to prioritize local. 
                // Usually: if remote is LOCKED, we discard local (finalized is truth).
                // if remote is UNLOCKED, we use local if available.
                if (!mergedRoutines[grade]?.isLocked) {
                  mergedRoutines[grade] = parsedCache[grade];
                }
              });
            }
            setClassRoutines(mergedRoutines);
          }
          else {
            console.warn("Routine data was empty for schoolId:", effectiveSchoolId);
          }
        } catch (routineErr) {
          console.warn("No routine data for this school yet.", routineErr.message);
        }
      } catch (error) {
        console.error("Failed to fetch data in SchoolManagement useEffect:", error);
      }
    };

    fetchData();
  }, [adminSchoolId]);

  // Persistent Cache Effect
  useEffect(() => {
    if (adminSchoolId && Object.keys(classRoutines).length > 0) {
      // Only cache unfinalized parts? Or just cache everything.
      // We'll cache everything and the merge logic takes care of priority.
      localStorage.setItem(`routine_cache_${adminSchoolId}`, JSON.stringify(classRoutines));
    }
  }, [classRoutines, adminSchoolId]);
  // ... (handlers) ...

  // --- Routine Handlers ---
  const handleUpdateHours = (newHours) => {
    setSchoolHours(newHours);
  };

  const handleUpdateRoutines = (grade, routines, isLocked) => {
    console.log(`Updating routines for grade ${grade}:`, routines, `Locked: ${isLocked}`);
    setClassRoutines(prev => ({
      ...prev,
      [grade]: { slots: routines, isLocked }
    }));
  };

  const handleFinalizeRoutine = async (grade) => {
    try {
      const routineData = classRoutines[grade];
      if (!routineData) {
        console.warn(`No routine data found for grade ${grade} to finalize.`);
        return;
      }
      console.log(`Finalizing routine for Grade ${grade}, schoolId: ${adminSchoolId}`);
      await Promise.all([
        routineService.updateGradeRoutine(grade, routineData.slots, true, adminSchoolId),
        schoolService.updateSchool(adminSchoolId, { operatingHours: schoolHours })
      ]);

      setClassRoutines(prev => ({
        ...prev,
        [grade]: { ...prev[grade], isLocked: true }
      }));

      const localCache = localStorage.getItem(`routine_cache_${adminSchoolId}`);
      if (localCache) {
        const parsed = JSON.parse(localCache);
        delete parsed[grade];
        localStorage.setItem(`routine_cache_${adminSchoolId}`, JSON.stringify(parsed));
      }

      toast({ type: 'success', message: `Routine for Grade ${grade} finalized and locked.`, duration: 2000 });
    } catch (e) {
      console.error(`Error finalizing routine for grade ${grade}:`, e);
      toast({ type: 'error', message: "Failed to finalize routine.", duration: 3000 });
    }
  };

  const handleSaveGlobalTiming = async () => {
    try {
      if (!adminSchoolId) {
        toast({ type: 'error', message: "School context missing." });
        console.error("Attempted to save global timing without adminSchoolId.");
        return;
      }
      setIsSavingHours(true); // Set local loading state for this specific action
      console.log(`Saving global timing for schoolId: ${adminSchoolId}, hours:`, schoolHours);
      await schoolService.updateSchool(adminSchoolId, { operatingHours: schoolHours });
      toast({ type: 'success', message: "Timing matrix synchronized successfully.", duration: 2500 });
    } catch (e) {
      console.error("OS SAVE ERROR:", e);
      toast({ type: 'error', message: "Failed to update global timing.", duration: 3000 });
    } finally {
      setIsSavingHours(false); // Reset local loading state
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
      phoneNumbers: phoneArray,
      operatingHours: schoolHours
    };

    // Remove frontend-only state fields that backend doesn't expect
    delete payload.schoolEmail;

    return payload;
  };

  const saveConfig = async (payload, manualId) => {
    try {
      const activeId = manualId || adminSchoolId;
      if (!activeId) {
        console.error("No activeId available for saving school config.");
        return false;
      }

      // Add schoolId to payload
      const finalPayload = { ...payload, schoolId: activeId };

      console.log(`Attempting to update school config for schoolId: ${activeId}`, finalPayload);
      await schoolService.updateSchool(activeId, finalPayload);
      console.log(`School config updated successfully for schoolId: ${activeId}`);
      return true;
    } catch (e) {
      const activeId = manualId || adminSchoolId;
      if (e.response?.status === 404 && activeId) {
        console.warn(`School with ID ${activeId} not found, attempting to add new school.`);
        // Add schoolId for new record
        const finalPayload = { ...payload, _id: activeId, schoolId: activeId };
        await schoolService.addSchool(finalPayload);
        console.log(`New school added successfully with ID: ${activeId}`);
        return true;
      }
      console.error(`Error saving school config for schoolId: ${activeId}:`, e);
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
      console.log(`Updating grade range for schoolId: ${manualId || adminSchoolId} to ${from}-${to}`);
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
      console.log(`Updating sections for grade ${grade} to ${count} for schoolId: ${activeId}`);
      await gradeService.updateGradeSections(grade, count, activeId);
      setSectionMap(prev => ({ ...prev, [grade]: count }));
      toast({ type: 'success', message: `Grade ${grade} sections updated to ${count}.`, duration: 3000 });
    } catch (error) {
      console.error(`Error updating sections for grade ${grade}:`, error);
      toast({ type: 'error', message: "Failed to update section.", duration: 3000 });
    }
  };

  const handleSyncSections = async (count, manualId) => {
    try {
      const activeId = manualId || adminSchoolId;
      const gradesToSync = Array.from({ length: range.to - range.from + 1 }, (_, i) => (range.from + i).toString());
      console.log(`Syncing sections for grades ${gradesToSync.join(', ')} to ${count} for schoolId: ${activeId}`);
      await gradeService.syncSections(count, gradesToSync, activeId);
      const newMap = { ...sectionMap };
      gradesToSync.forEach(g => newMap[g] = count);
      setSectionMap(newMap);
      toast({ type: 'success', message: `All visible grades synced to ${count} sections.`, duration: 3000 });
    } catch (error) {
      console.error("Error syncing sections:", error);
      toast({ type: 'error', message: "Failed to sync sections.", duration: 3000 });
    }
  };

  // --- Curriculum Handlers ---
  const handleAddCore = async (grade, name) => {
    try {
      console.log(`Adding global core subject '${name}' for schoolId: ${adminSchoolId}`);
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
      console.error(`Error adding global core subject '${name}':`, e);
      toast({ type: 'error', message: "Failed to add global core subject.", duration: 3000 });
    }
  };

  const handleRemoveCore = async (grade, name) => {
    try {
      console.log(`Removing global core subject '${name}' for schoolId: ${adminSchoolId}`);
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
      console.error(`Error removing global core subject '${name}':`, e);
      toast({ type: 'error', message: "Failed to remove subject.", duration: 3000 });
    }
  };

  const handleAddExtra = async (grades, name) => {
    setIsLoading(true);
    try {
      console.log(`Adding specialized subject '${name}' to grades ${grades.join(', ')} for schoolId: ${adminSchoolId}`);
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
      console.error(`Error adding specialized subject '${name}':`, e);
      toast({ type: 'error', message: "Failed to add specialized subject.", duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveExtra = async (grades, name) => {
    setIsLoading(true);
    try {
      console.log(`Removing specialized subject '${name}' from grades ${grades.join(', ')} for schoolId: ${adminSchoolId}`);
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
      console.error(`Error removing specialized subject '${name}':`, e);
      toast({ type: 'error', message: "Failed to remove specialized subject.", duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const getCoreForGrade = (grade) => curriculumMap[grade]?.core || [];
  const allExtras = Object.entries(curriculumMap).flatMap(([gNum, data]) => data.extra || []);
  const gradeList = (range.from && range.to)
    ? Array.from({ length: Math.max(0, range.to - range.from + 1) }, (_, i) => (range.from + i).toString())
    : [];

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
          onSaveGlobalTiming={handleSaveGlobalTiming}
          isSavingHours={isSavingHours} // Pass the loading state
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
            <HubCard icon={Settings} color="bg-emerald-500" title="School Setup" desc="Edit School Information." onClick={() => setActiveView('institutional')} />
            <HubCard icon={Layers} color="bg-blue-500" title="Grade & Sections" desc="Introduce Grade and Section to your school" onClick={() => setActiveView('grades')} />
            <HubCard icon={BookOpen} color="bg-amber-500" title="School Subjects" desc="Manage mandatory subjects and specialized subjects." onClick={() => setActiveView('curriculum')} />
            <HubCard icon={Clock} color="bg-indigo-600" title="Routine Structure" desc="Set universal school day routine and structure." onClick={() => setActiveView('routine')} />
            <HubCard icon={RefreshCcw} color="bg-rose-500" title="Next Year Switch" desc="Transition school records to the next academic cycle (2083)." onClick={() => setIsSwitchPopupOpen(true)} />
          </div>

          <YearSwitchPopup
            isOpen={isSwitchPopupOpen}
            onClose={() => setIsSwitchPopupOpen(false)}
            currentYear={2082}
            schoolEmail={currentAdminEmail || schoolConfig.schoolEmail}
          />
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