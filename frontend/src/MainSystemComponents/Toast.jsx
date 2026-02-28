import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

/**
 * GLOBAL EVENT BUS
 * This allows the toast() function to work outside of React components.
 */
const listeners = new Set();

/**
 * The global API function to trigger a toast
 */
export const toast = (payload) => {
  listeners.forEach((listener) => listener(payload));
};

/**
 * TOAST HOST COMPONENT
 * Mount this once at the top level of your app (e.g., in App.js).
 */
export const ToastHost = () => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    );
    // Wait for exit animation (300ms) before removing from state
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  useEffect(() => {
    const handleNewToast = (payload) => {
      const id = Math.random().toString(36).substring(2, 9);
      const duration = payload.duration || 3000;

      setToasts((prev) => [...prev, { ...payload, id, duration }]);

      // Auto-remove after duration
      setTimeout(() => {
        removeToast(id);
      }, duration);
    };

    listeners.add(handleNewToast);
    return () => {
      listeners.delete(handleNewToast);
    };
  }, [removeToast]);

  return createPortal(
    <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} instance={t} onManualClose={() => removeToast(t.id)} />
      ))}
    </div>,
    document.body
  );
};

/**
 * TOAST ITEM COMPONENT
 * Visual representation of an individual toast.
 */
const ToastItem = ({
  instance,
  onManualClose,
}) => {
  const themes = {
    success: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-emerald-500/20 dark:border-emerald-500/30',
      icon: <CheckCircle2 className="text-emerald-500" size={20} />,
      accent: 'bg-emerald-500',
      text: 'text-emerald-600 dark:text-emerald-400',
      label: 'Success',
    },
    warning: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-amber-500/20 dark:border-amber-500/30',
      icon: <AlertTriangle className="text-amber-500" size={20} />,
      accent: 'bg-amber-500',
      text: 'text-amber-600 dark:text-amber-400',
      label: 'Warning',
    },
    error: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-red-500/20 dark:border-red-500/30',
      icon: <XCircle className="text-red-500" size={20} />,
      accent: 'bg-red-500',
      text: 'text-red-600 dark:text-red-400',
      label: 'Error',
    },
    info: {
      bg: 'bg-white dark:bg-slate-900',
      border: 'border-blue-500/20 dark:border-blue-500/30',
      icon: <Info className="text-blue-500" size={20} />,
      accent: 'bg-blue-500',
      text: 'text-blue-600 dark:text-blue-400',
      label: 'Information',
    },
  };

  const theme = themes[instance.type];

  return (
    <div
      className={`
        relative flex items-center gap-4 min-w-[320px] max-w-sm p-4 rounded-[24px] shadow-2xl border transition-all duration-300 pointer-events-auto overflow-hidden
        ${theme.bg} ${theme.border}
        ${instance.isExiting ? 'opacity-0 translate-x-12 scale-95' : 'animate-in slide-in-from-right-12 fade-in'}
      `}
    >
      {/* Icon Section */}
      <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${instance.type === 'success' ? 'bg-emerald-500/10' : instance.type === 'warning' ? 'bg-amber-500/10' : instance.type === 'error' ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
        {theme.icon}
      </div>

      {/* Content Section */}
      <div className="flex-1">
        <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 ${theme.text}`}>
          {theme.label}
        </p>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">
          {instance.message}
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onManualClose();
        }}
        className="shrink-0 p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
      >
        <X size={18} />
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-50 dark:bg-slate-800">
        <div
          className={`h-full ${theme.accent}`}
          style={{
            animation: `toast-progress ${instance.duration}ms linear forwards`,
          }}
        />
      </div>

      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};