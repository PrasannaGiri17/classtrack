// src/Components/SmallerComponents/FailedPopup.jsx
import React, { useEffect } from "react";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { TiTickOutline } from "react-icons/ti";
import { IoWarningOutline } from "react-icons/io5";

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
      icon: <IoIosCloseCircleOutline className="text-white text-4xl" />,
    },
    success: {
      bgColor: "bg-[#4CAF50]",
      icon: <TiTickOutline className="text-white text-4xl" />,
    },
    warning: {
      bgColor: "bg-yellow-500",
      icon: <IoWarningOutline className="text-white text-4xl" />,
    },
  };

  const current = config[type] || config.error;

  return (
    <div className="fixed right-6 top-6 z-50">
      <div className="flex min-w-[320px] overflow-hidden rounded-lg border-2 border-black shadow-xl">
        <div className={`${current.bgColor} flex w-20 flex-shrink-0 items-center justify-center`}>
          {current.icon}
        </div>

        <div className="flex-1 bg-white px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-medium text-gray-800">{message}</p>
            <button
              onClick={onClose}
              className="text-2xl leading-none text-gray-500 hover:text-gray-700"
              aria-label="Close"
              type="button"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FailedPopup;
