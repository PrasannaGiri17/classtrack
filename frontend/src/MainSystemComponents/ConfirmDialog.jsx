import React from 'react';
import { AlertTriangle } from 'lucide-react';
import PortalPopup from './PortalPopup';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <PortalPopup isOpen={isOpen} onClose={onClose} zIndex="z-[10000]">
      <div className="relative bg-white dark:bg-slate-900 w-[95vw] max-w-lg rounded-[32px] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-2xl flex items-center justify-center mb-6">
          <AlertTriangle size={32} />
        </div>
        <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-2 uppercase">{title}</h4>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          {message}
        </p>
        <div className="grid grid-cols-2 gap-4 w-full">
          <button 
            onClick={onClose}
            className="py-4 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          >
            No, Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
          >
            Yes, Confirm
          </button>
        </div>
      </div>
    </PortalPopup>
  );
};

export default ConfirmDialog;