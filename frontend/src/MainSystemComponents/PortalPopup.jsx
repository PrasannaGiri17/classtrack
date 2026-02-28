import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const PortalPopup = ({ isOpen, onClose, children, zIndex = "z-[9999]" }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300`}>
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xl cursor-pointer"
        onClick={onClose}
      />
      <div className="relative w-full flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto w-full flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PortalPopup;