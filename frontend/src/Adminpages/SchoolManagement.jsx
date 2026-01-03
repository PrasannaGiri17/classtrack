import React, { useState } from 'react';
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

const SchoolManagement = () => {
  const [activeView, setActiveView] = useState('menu');

  // --- Shared Global State ---
  const [schoolConfig, setSchoolConfig] = useState({
    name: "Real Madrid Academy",
    address: "Santiago Bernabéu, Madrid, Spain",
    logo: "https://picsum.photos/seed/school/200/200",
  });

  const [range, setRange] = useState({ from: 1, to: 10 });
  const [sectionMap, setSectionMap] = useState({
    "1": 2, "2": 2, "3": 2, "4": 2, "5": 3, "6": 3, "7": 3, "8": 3, "9": 4, "10": 4
  });

  const [baseSubjects] = useState(["Nepali", "English", "Mathematics", "Social Studies", "Science", "Computer"]);
  const [extraSubjects, setExtraSubjects] = useState([
    { gradeNum: "1", subjectName: "Moral Education" },
    { gradeNum: "10", subjectName: "Optional Mathematics" }
  ]);

  const [schoolHours, setSchoolHours] = useState({ start: "09:00", end: "16:00" });
  const [classRoutines, setClassRoutines] = useState({
    "1": [
      { id: '1', type: 'subject', label: 'Instructional Period 1', durationMinutes: 45 },
      { id: '2', type: 'subject', label: 'Instructional Period 2', durationMinutes: 45 },
      { id: '3', type: 'break', label: 'Short Break', durationMinutes: 15, breakType: 'Short' },
      { id: '4', type: 'sport', label: 'Physical Activity', durationMinutes: 45 },
    ]
  });

  const gradeList = Array.from(
    { length: range.to - range.from + 1 },
    (_, i) => (range.from + i).toString()
  );

  // --- Render Switcher ---
  const renderView = () => {
    switch (activeView) {
      case 'institutional':
        return (
          <InstitutionalView
            config={schoolConfig}
            onUpdate={(updates) => setSchoolConfig({ ...schoolConfig, ...updates })}
          />
        );
      case 'grades':
        return (
          <GradeView
            range={range}
            sectionMap={sectionMap}
            gradeList={gradeList}
            onUpdateRange={(from, to) => setRange({ from, to })}
            onUpdateSections={(grade, count) => setSectionMap({ ...sectionMap, [grade]: count })}
          />
        );
      case 'curriculum':
        return (
          <CurriculumView
            baseSubjects={baseSubjects}
            extraSubjects={extraSubjects}
            gradeList={gradeList}
            onAddExtra={(grade, name) =>
              setExtraSubjects([...extraSubjects, { gradeNum: grade, subjectName: name }])
            }
            onRemoveExtra={(grade, name) =>
              setExtraSubjects(extraSubjects.filter(s => !(s.gradeNum === grade && s.subjectName === name)))
            }
          />
        );
      case 'routine':
        return (
          <RoutineView
            schoolHours={schoolHours}
            onUpdateHours={setSchoolHours}
            classRoutines={classRoutines}
            onUpdateRoutines={(grade, routines) =>
              setClassRoutines({ ...classRoutines, [grade]: routines })
            }
            gradeList={gradeList}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-full animate-in fade-in duration-500 pb-20">
      {activeView === 'menu' ? (
        <div className="space-y-12">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
              School Hub
            </h1>
            <p className="text-[12px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-3.5">
              Administrative Configuration Module
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HubCard
              icon={Settings}
              color="bg-emerald-500"
              title="Institutional Settings"
              desc="Configure school identity, addresses, and global metadata."
              onClick={() => setActiveView('institutional')}
            />
            <HubCard
              icon={Layers}
              color="bg-blue-500"
              title="Grade & Sections"
              desc="Define class hierarchies and active learning sections."
              onClick={() => setActiveView('grades')}
            />
            <HubCard
              icon={BookOpen}
              color="bg-amber-500"
              title="Curriculum Builder"
              desc="Manage core mandatory subjects and specialized electives."
              onClick={() => setActiveView('curriculum')}
            />
            <HubCard
              icon={Clock}
              color="bg-indigo-600"
              title="Routine Structure"
              desc="Set universal school day frameworks and period skeletons."
              onClick={() => setActiveView('routine')}
            />
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
  <button
    onClick={onClick}
    className="group relative flex items-start gap-6 p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-xl transition-all text-left overflow-hidden h-full"
  >
    <div className={`shrink-0 w-12 h-12 ${color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
      <Icon className="text-white w-6 h-6" />
    </div>

    <div className="flex-1 space-y-1.5">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
        {title}
      </h3>
      <p className="text-sm font-medium text-slate-500 leading-relaxed line-clamp-2">
        {desc}
      </p>
    </div>

    <div className="absolute top-8 right-8 text-slate-200 group-hover:text-emerald-500 transition-colors">
      <ArrowRight size={20} />
    </div>
  </button>
);

export default SchoolManagement;
