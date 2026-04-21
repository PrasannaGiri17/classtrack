import React, { useState } from "react";
import {
  Plus,
  Trash2,
  BookOpen,
  X,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { toast } from "../../MainSystemComponents/Toast";
import PortalPopup from "../../MainSystemComponents/PortalPopup";

const CurriculumView = ({
  getCoreForGrade,
  extraSubjects,
  onAddCore,
  onRemoveCore,
  onAddExtra,
  onRemoveExtra,
  gradeList,
  schoolName,
}) => {
  const [selectedGrade, setSelectedGrade] = useState(gradeList[0] || "1");
  const [newSub, setNewSub] = useState("");

  // Sync selectedGrade when gradeList changes
  React.useEffect(() => {
    if (gradeList.length > 0 && !gradeList.includes(selectedGrade)) {
      setSelectedGrade(gradeList[0]);
    }
  }, [gradeList, selectedGrade]);

  // Modals for Core management
  const [isAddCoreOpen, setIsAddCoreOpen] = useState(false);
  const [isDeleteCoreOpen, setIsDeleteCoreOpen] = useState(false);

  // Modals for Specialized management
  const [isAddExtraOpen, setIsAddExtraOpen] = useState(false);
  const [isDeleteExtraOpen, setIsDeleteExtraOpen] = useState(false);

  const [newCoreName, setNewCoreName] = useState("");
  const [subjectToDelete, setSubjectToDelete] = useState("");

  const [newExtraName, setNewExtraName] = useState("");
  const [extraToDelete, setExtraToDelete] = useState("");

  const [selectedGradesForExtra, setSelectedGradesForExtra] = useState([]);

  const activeCoreSubjects = getCoreForGrade(gradeList[0] || "1"); // Core subjects are global in the system

  // Group electives by name to show a unique list with assigned grades
  const uniqueElectives = React.useMemo(() => {
    const grouped = {};
    extraSubjects.forEach((s) => {
      if (!grouped[s.subjectName]) {
        grouped[s.subjectName] = new Set();
      }
      grouped[s.subjectName].add(s.gradeNum);
    });
    return Object.entries(grouped).map(([name, grades]) => ({
      subjectName: name,
      assignedGrades: Array.from(grades).sort((a, b) => parseInt(a) - parseInt(b)),
    }));
  }, [extraSubjects]);

  const toggleGradeForExtra = (grade) => {
    setSelectedGradesForExtra((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };



  const handleAddCoreSubmit = (e) => {
    e.preventDefault();
    const name = newCoreName.trim();
    if (!name) {
      toast({
        type: "warning",
        message: "Please enter a core subject name.",
        duration: 2500,
      });
      return;
    }

    if (activeCoreSubjects.some((s) => s.toLowerCase() === name.toLowerCase())) {
      toast({
        type: "error",
        message: `This core subject already exists globally.`,
        duration: 3000,
      });
      return;
    }

    onAddCore(gradeList[0] || "1", name); // Adds globally
    setIsAddCoreOpen(false);
    setNewCoreName("");
  };

  // Handle Specialized Subject Submission
  const handleAddExtraSubmit = (e) => {
    e.preventDefault();
    const name = newExtraName.trim();
    if (!name) {
      toast({
        type: "warning",
        message: "Please enter a specialized subject name.",
        duration: 2500,
      });
      return;
    }

    if (selectedGradesForExtra.length === 0) {
      toast({
        type: "warning",
        message: "Please select at least one grade.",
        duration: 2500,
      });
      return;
    }

    onAddExtra(selectedGradesForExtra, name);
    setIsAddExtraOpen(false);
    setNewExtraName("");
    setSelectedGradesForExtra([]);
  };

  const handleDeleteExtraSubmit = (e) => {
    e.preventDefault();
    if (!extraToDelete) {
      toast({
        type: "warning",
        message: "Please select a subject to delete.",
        duration: 2500,
      });
      return;
    }

    // Pass the list of grades it was assigned to for removal
    const targetExtra = uniqueElectives.find(e => e.subjectName === extraToDelete);
    if (targetExtra) {
      onRemoveExtra(targetExtra.assignedGrades, extraToDelete);
    }

    setIsDeleteExtraOpen(false);
    setExtraToDelete("");
  };

  const handleDeleteCoreSubmit = (e) => {
    e.preventDefault();
    if (!subjectToDelete) {
      toast({
        type: "warning",
        message: "Please select a subject to delete.",
        duration: 2500,
      });
      return;
    }

    onRemoveCore(gradeList[0] || "1", subjectToDelete); // Removes globally
    setIsDeleteCoreOpen(false);
    setSubjectToDelete("");
  };

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
            School Subjects
          </h2>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">{schoolName || "Academic Curriculum Context"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT COLUMN: CORE SUBJECTS */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            All Core Academic Subjects
          </p>

          <div className="grid grid-cols-1 gap-2">
            {activeCoreSubjects.map((sub) => (
              <div
                key={sub}
                className="px-5 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300"
              >
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-sm" />
                {sub}
              </div>
            ))}

            {activeCoreSubjects.length === 0 && (
              <div className="py-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  No Core Subjects
                </p>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={() => setIsAddCoreOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10 transition-all active:scale-[0.98]"
            >
              <Plus size={16} strokeWidth={3} />
              Add Subject
            </button>

            <button
              onClick={() => {
                if (activeCoreSubjects.length === 0) {
                  toast({
                    type: "warning",
                    message: "No core subjects available to delete.",
                    duration: 2500,
                  });
                  return;
                }
                setIsDeleteCoreOpen(true);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all active:scale-[0.98]"
            >
              <Trash2 size={16} strokeWidth={2.5} />
              Delete Subject
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: ELECTIVES (Specialized) */}
        <div className="lg:col-span-7 space-y-4 flex flex-col">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            All Specialized Subjects (All Grades)
          </p>

          <div className="grid grid-cols-1 gap-2">
            {uniqueElectives.map((sub) => (
              <div
                key={sub.subjectName}
                className="px-5 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-right-2 duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-sm" />
                  {sub.subjectName}
                </div>
                <div className="flex gap-1 flex-wrap justify-end max-w-[50%]">
                  {sub.assignedGrades.map(g => (
                    <span key={g} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-black rounded-lg border border-indigo-100 dark:border-indigo-900/40 uppercase">
                      G{g}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {uniqueElectives.length === 0 && (
              <div className="py-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  No Specialized Subjects
                </p>
              </div>
            )}
          </div>

          {/* Specialized Action Row */}
          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={() => setIsAddExtraOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/10 transition-all active:scale-[0.98]"
            >
              <Plus size={16} strokeWidth={3} />
              Add Specialized Subject
            </button>

            <button
              onClick={() => {
                if (uniqueElectives.length === 0) {
                  toast({
                    type: "warning",
                    message: "No specialized subjects available to delete.",
                    duration: 2500,
                  });
                  return;
                }
                setIsDeleteExtraOpen(true);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all active:scale-[0.98]"
            >
              <Trash2 size={16} strokeWidth={2.5} />
              Delete From School
            </button>
          </div>
        </div>
      </div>

      {/* ADD CORE MODAL */}
      <PortalPopup isOpen={isAddCoreOpen} onClose={() => setIsAddCoreOpen(false)}>
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
          <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Add Core Subject
            </h3>
            <button
              onClick={() => setIsAddCoreOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleAddCoreSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Subject Name
              </label>
              <input
                autoFocus
                required
                type="text"
                value={newCoreName}
                onChange={(e) => setNewCoreName(e.target.value)}
                placeholder="e.g. Physics"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddCoreOpen(false)}
                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all"
              >
                Add Subject
              </button>
            </div>
          </form>
        </div>
      </PortalPopup>

      {/* DELETE CORE MODAL */}
      <PortalPopup isOpen={isDeleteCoreOpen} onClose={() => setIsDeleteCoreOpen(false)}>
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
          <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Delete Core Subject
            </h3>
            <button
              onClick={() => setIsDeleteCoreOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleDeleteCoreSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Select Subject
              </label>

              <div className="relative group">
                <select
                  required
                  value={subjectToDelete}
                  onChange={(e) => setSubjectToDelete(e.target.value)}
                  className="appearance-none w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer pr-12"
                >
                  <option value="">Select a Subject</option>
                  {activeCoreSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500"
                />
              </div>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 flex gap-3">
              <AlertCircle
                size={18}
                className="text-red-500 shrink-0 mt-0.5"
              />
              <p className="text-[10px] font-bold text-red-600 dark:text-red-400 leading-relaxed uppercase tracking-wider">
                Caution: Removing a core subject may affect current grade
                matrices and reports.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteCoreOpen(false)}
                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!subjectToDelete}
                className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 transition-all disabled:opacity-30 disabled:grayscale"
              >
                Confirm Delete
              </button>
            </div>
          </form>
        </div>
      </PortalPopup>

      {/* ADD SPECIALIZED MODAL */}
      <PortalPopup isOpen={isAddExtraOpen} onClose={() => setIsAddExtraOpen(false)}>
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
          <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Add Specialized Subject
            </h3>
            <button
              onClick={() => setIsAddExtraOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleAddExtraSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Subject Name
              </label>
              <input
                autoFocus
                required
                type="text"
                value={newExtraName}
                onChange={(e) => setNewExtraName(e.target.value)}
                placeholder="e.g. Advanced Calculus"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Assign to Grades
              </label>
              <div className="grid grid-cols-4 gap-2">
                {gradeList.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGradeForExtra(g)}
                    className={`py-3 rounded-xl text-[10px] font-black transition-all border ${selectedGradesForExtra.includes(g)
                      ? "bg-indigo-500 text-white border-indigo-600 shadow-md shadow-indigo-500/20"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      }`}
                  >
                    Grade {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddExtraOpen(false);
                  setSelectedGradesForExtra([]);
                }}
                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all"
              >
                Add Subject
              </button>
            </div>
          </form>
        </div>
      </PortalPopup>

      {/* DELETE SPECIALIZED MODAL */}
      <PortalPopup isOpen={isDeleteExtraOpen} onClose={() => setIsDeleteExtraOpen(false)}>
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
          <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Delete Specialized Subject
            </h3>
            <button
              onClick={() => setIsDeleteExtraOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleDeleteExtraSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Select Subject
              </label>

              <div className="relative group">
                <select
                  required
                  value={extraToDelete}
                  onChange={(e) => setExtraToDelete(e.target.value)}
                  className="appearance-none w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer pr-12"
                >
                  <option value="">Select a Subject</option>
                  {uniqueElectives.map((s) => (
                    <option key={s.subjectName} value={s.subjectName}>
                      {s.subjectName}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500"
                />
              </div>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 flex gap-3">
              <AlertCircle
                size={18}
                className="text-red-500 shrink-0 mt-0.5"
              />
              <p className="text-[10px] font-bold text-red-600 dark:text-red-400 leading-relaxed uppercase tracking-wider">
                Caution: This will remove "{extraToDelete}" from ALL assigned grades in the entire school.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteExtraOpen(false)}
                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!extraToDelete}
                className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20 transition-all disabled:opacity-30 disabled:grayscale"
              >
                Confirm Delete
              </button>
            </div>
          </form>
        </div>
      </PortalPopup>
    </div>
  );
};

export default CurriculumView;
