import React, { useEffect } from "react";
import { IoIosCloseCircleOutline, IoIosCheckmarkCircleOutline } from "react-icons/io";
import { IoWarningOutline, IoClose } from "react-icons/io5";

const FailedPopup = ({ message, onClose, duration = 5000, type = "error" }) => {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  const config = {
    error: {
      bgColor: "bg-red-500",
      icon: <IoIosCloseCircleOutline className="text-white text-2xl" />,
      accentColor: "text-red-600",
    },
    success: {
      bgColor: "bg-emerald-500",
      icon: <IoIosCheckmarkCircleOutline className="text-white text-2xl" />,
      accentColor: "text-emerald-600",
    },
    warning: {
      bgColor: "bg-amber-500",
      icon: <IoWarningOutline className="text-white text-2xl" />,
      accentColor: "text-amber-600",
    },
  };

  const current = config[type] || config.error;

  return (
    <div className="fixed right-6 top-6 z-[100] animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex min-w-[340px] max-w-md overflow-hidden rounded-[24px] bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className={`${current.bgColor} flex w-16 flex-shrink-0 items-center justify-center`}>
          {current.icon}
        </div>

        <div className="flex-1 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${current.accentColor} mb-1`}>
                {type} Notification
              </span>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <IoClose size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FailedPopup;