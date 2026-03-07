import React, { useState } from 'react';
import {
  FileBox,
  FileText,
  Folder,
  FileSpreadsheet
} from 'lucide-react';
import Assignment from '../TeacherComponents/AssignmentsContent/Assignment';
import Content from '../TeacherComponents/AssignmentsContent/Content';

const AssignmentsContent = () => {
  const [activeTab, setActiveTab] = useState('assignments');

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <FileBox className="text-emerald-500 w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Assignments & Content</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Academic Resource Hub</p>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-8 py-4 text-xs font-black tracking-widest transition-all relative ${activeTab === 'assignments' || activeTab === 'report' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            <span className="flex items-center gap-2">
              <FileText size={16} /> Assignments
            </span>
            {(activeTab === 'assignments' || activeTab === 'report') && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-8 py-4 text-xs font-black tracking-widest transition-all relative ${activeTab === 'content' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            <span className="flex items-center gap-2">
              <Folder size={16} /> Your Content
            </span>
            {activeTab === 'content' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full" />
            )}
          </button>
          {activeTab === 'report' && (
            <button
              className="px-8 py-4 text-xs font-black tracking-widest transition-all relative text-emerald-600"
            >
              <span className="flex items-center gap-2">
                <FileSpreadsheet size={16} /> Submission Report
              </span>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-full" />
            </button>
          )}
        </div>
      </div>

      {activeTab === 'assignments' || activeTab === 'report' ? (
        <Assignment activeTab={activeTab} setActiveTab={setActiveTab} />
      ) : (
        <Content />
      )}
    </div>
  );
};

export default AssignmentsContent;