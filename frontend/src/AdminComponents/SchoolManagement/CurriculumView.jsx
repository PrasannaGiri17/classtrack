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

const CurriculumView = ({
  getCoreForGrade,
  extraSubjects,
  onAddCore,
  onRemoveCore,
  onAddExtra,
  onRemoveExtra,
  gradeList,
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

  const [newCoreName, setNewCoreName] = useState("");
  const [subjectToDelete, setSubjectToDelete] = useState("");

  const activeCoreSubjects = getCoreForGrade(selectedGrade);

  const electivesForGrade = extraSubjects.filter(
    (s) => s.gradeNum === selectedGrade
  );

  // ✅ ADD TOAST HERE (Enroll specialized subject)
  const handleAddExtra = () => {
    const name = newSub.trim();

    if (!name) {
      toast({
        type: "warning",
        message: "Please enter a subject name.",
        duration: 2500,
      });
      return;
    }

    const alreadyExists = electivesForGrade.some(
      (s) => s.subjectName.toLowerCase() === name.toLowerCase()
    );

    if (alreadyExists) {
      toast({
        type: "error",
        message: `This elective already exists for Grade ${selectedGrade}.`,
        duration: 3000,
      });
      return;
    }

    onAddExtra(selectedGrade, name);
    setNewSub("");
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
        message: `This core subject already exists for Grade ${selectedGrade}.`,
        duration: 3000,
      });
      return;
    }

    onAddCore(selectedGrade, name);
    setIsAddCoreOpen(false);
    setNewCoreName("");
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

    onRemoveCore(selectedGrade, subjectToDelete);
    setIsDeleteCoreOpen(false);
    setSubjectToDelete("");
  };

  const handleRemoveExtra = (subjectName) => {
    onRemoveExtra(selectedGrade, subjectName);
  };

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
          School Subjects
        </h2>

        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto scrollbar-hide">
          {gradeList.map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={`flex-1 min-w-[80px] py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all ${selectedGrade === grade
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
            >
              Grade {grade}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT COLUMN: CORE SUBJECTS */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Core Academic Subjects (Grade {selectedGrade})
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

        {/* RIGHT COLUMN: ELECTIVES */}
        <div className="lg:col-span-7 space-y-6">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Specialized Subjects (Grade {selectedGrade})
          </p>

          <div className="flex gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <input
              type="text"
              placeholder="Assign New Subject..."
              value={newSub}
              onChange={(e) => setNewSub(e.target.value)}
              className="flex-1 px-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold outline-none placeholder:text-slate-300 dark:text-white"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddExtra();
              }}
            />
            <button
              onClick={handleAddExtra}
              className="h-11 px-8 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10"
            >
              Enroll
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {electivesForGrade.map((sub) => (
              <div
                key={sub.subjectName}
                className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl group shadow-sm hover:border-emerald-500/20 transition-all"
              >
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {sub.subjectName}
                </span>

                <button
                  onClick={() => handleRemoveExtra(sub.subjectName)}
                  className="text-slate-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {electivesForGrade.length === 0 && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                <BookOpen className="text-slate-200 mx-auto mb-3" size={32} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  No Active Electives
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADD CORE MODAL */}
      {isAddCoreOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
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
        </div>
      )}

      {/* DELETE CORE MODAL */}
      {isDeleteCoreOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
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
        </div>
      )}
    </div>
  );
};

export default CurriculumView;
