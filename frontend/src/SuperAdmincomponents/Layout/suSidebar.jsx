import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  School,
  Users,
  GraduationCap,
  Clock,
  Store,
  Calendar,
  FileText,
  Bell,
  LogOut,
  CreditCard
} from 'lucide-react';
import ConfirmDialog from '../../MainSystemComponents/ConfirmDialog';

const SuSidebar = ({ activePage }) => {
  const navigate = useNavigate();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = React.useState(false);

  const menuItems = [
    { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/super-admin/dashboard' },
    { key: 'school', icon: Building2, label: 'Schools', path: '/super-admin/school' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Branding */}
      <div className="h-[72px] flex items-center px-6 border-b border-slate-50 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100 dark:shadow-none">
            <School className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">ClassTrack</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
        <p className="px-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Main Menu</p>

        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.key;

            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100 dark:shadow-none'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400'
                  }`} />
                <span className="text-sm font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute left-[-16px] w-1.5 h-6 bg-emerald-500 rounded-r-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-50 dark:border-slate-800 transition-colors">
        <button
          onClick={() => setIsLogoutDialogOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>

      <ConfirmDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={() => {
          localStorage.clear();
          navigate('/login');
        }}
        title="Confirm Logout"
        message="Are you sure you want to log out of the Super Admin portal?"
      />
    </div>
  );
};

export default SuSidebar;