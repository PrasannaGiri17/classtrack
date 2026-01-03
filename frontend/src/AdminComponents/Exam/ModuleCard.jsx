import React from 'react';
import { ArrowRight } from 'lucide-react';

const ModuleCard = ({ 
  icon: Icon, 
  color, 
  title, 
  description, 
  buttonLabel, 
  onClick 
}) => {
  return (
    <button 
      onClick={onClick} 
      className="group relative flex flex-col p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] shadow-sm hover:shadow-xl transition-all text-left overflow-hidden h-full"
    >
      <div className="flex flex-col gap-6">
        <div className={`w-14 h-14 ${color} rounded-[20px] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="text-white w-7 h-7" />
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
            {description}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 mt-auto pt-10">
        <span className="px-8 py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all group-hover:bg-emerald-700 shadow-lg shadow-emerald-500/20">
          {buttonLabel}
        </span>
        <ArrowRight className="text-slate-200 group-hover:text-emerald-500 transition-colors" size={24} />
      </div>
    </button>
  );
};

export default ModuleCard;