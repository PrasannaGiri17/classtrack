import React, { useState } from 'react';
import { Plus, Trash2, BookOpen } from 'lucide-react';

const CurriculumView = ({ baseSubjects, extraSubjects, onAddExtra, onRemoveExtra, gradeList }) => {
  const [selectedGrade, setSelectedGrade] = useState("1");
  const [newSub, setNewSub] = useState("");

  const handleAdd = () => {
    if (!newSub.trim()) return;
    onAddExtra(selectedGrade, newSub);
    setNewSub("");
  };

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">Curriculum Matrix</h2>
        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto scrollbar-hide">
          {gradeList.map(grade => (
            <button 
              key={grade} 
              onClick={() => setSelectedGrade(grade)}
              className={`flex-1 min-w-[80px] py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all ${selectedGrade === grade ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              Grade {grade}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Core Academic Subjects</p>
          <div className="grid grid-cols-1 gap-2">
            {baseSubjects.map(sub => (
              <div key={sub} className="px-5 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-sm" /> {sub}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Specialized Electives (Grade {selectedGrade})</p>
          <div className="flex gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <input 
              type="text" 
              placeholder="Assign New Subject..." 
              value={newSub} 
              onChange={(e) => setNewSub(e.target.value)} 
              className="flex-1 px-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold outline-none placeholder:text-slate-300 dark:text-white"
            />
            <button onClick={handleAdd} className="h-11 px-8 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10">Enroll</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {extraSubjects.filter(s => s.gradeNum === selectedGrade).map(sub => (
              <div key={sub.subjectName} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl group shadow-sm hover:border-emerald-500/20 transition-all">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{sub.subjectName}</span>
                <button 
                  onClick={() => onRemoveExtra(selectedGrade, sub.subjectName)} 
                  className="text-slate-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {extraSubjects.filter(s => s.gradeNum === selectedGrade).length === 0 && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                <BookOpen className="text-slate-200 mx-auto mb-3" size={32} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Active Electives</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurriculumView;