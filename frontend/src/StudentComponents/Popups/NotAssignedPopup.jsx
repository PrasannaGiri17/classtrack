import React from 'react';
import PortalPopup from '../../MainSystemComponents/PortalPopup';
import { AlertCircle, LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import schoolService from '../../Api/schoolService';

const NotAssignedPopup = ({ isOpen, onConfirm }) => {
  const { schoolId } = useAuth();
  const [adminEmail, setAdminEmail] = React.useState("school-admin@example.com");

  React.useEffect(() => {
    const fetchAdminEmail = async () => {
      const id = schoolId || localStorage.getItem("schoolId");
      if (id) {
        try {
          const data = await schoolService.getSchoolById(id);
          if (data) {
            const email = data.admin?.email || data.email || "school-admin@example.com";
            setAdminEmail(email);
          }
        } catch (error) {
          console.error("Error fetching school admin email:", error);
        }
      }
    };
    fetchAdminEmail();
  }, [schoolId]);

  return (
    <PortalPopup isOpen={isOpen} onClose={onConfirm}>
      <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 w-[90vw] max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Visual Header */}
        <div className="h-32 bg-amber-500 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-24 h-24 bg-white rounded-full -translate-x-12 -translate-y-12" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16" />
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-xl animate-bounce">
            <AlertCircle size={32} />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-10 text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Access Restricted</h2>
            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-[0.3em] font-black">Account Pending Assignment</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
              You are currently <span className="text-slate-900 dark:text-white font-black">not assigned</span> to any classroom.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Please contact your school administrator to be assigned to a section. You need an active class assignment to access the school portal.
            </p>
          </div>

          <button
            onClick={onConfirm}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 hover:bg-[#4CAF50] hover:text-white dark:hover:bg-[#4CAF50] dark:hover:text-white focus:bg-[#4CAF50] focus:text-white dark:focus:bg-[#4CAF50] dark:focus:text-white active:bg-[#43A047] dark:active:bg-[#43A047] transition-all shadow-xl flex items-center justify-center gap-3 group"
          >
            Log Out for Now <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Support Footer */}
        <div className="bg-slate-50/50 dark:bg-slate-800/30 px-10 py-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 tracking-widest">
            System Support <ArrowRight size={12} /> {adminEmail}
          </div>
        </div>
      </div>
    </PortalPopup>
  );
};

export default NotAssignedPopup;
