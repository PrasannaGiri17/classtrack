import React from 'react';

const PlaceholderPage = ({ title }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">{title}</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md">This section is currently under active development. Our AI-driven school management features are being prepared for your campus.</p>
    </div>
  );
};

export default PlaceholderPage;