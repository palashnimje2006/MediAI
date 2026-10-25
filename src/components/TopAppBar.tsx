import React from 'react';
import { ArrowLeft, Bell, Code, ShieldCheck, UserCheck, Stethoscope, Building2 } from 'lucide-react';
import { UserRole } from '../types';

interface TopAppBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  unreadCount?: number;
  onNotificationClick?: () => void;
  onOpenCodeInspector?: () => void;
  userRole: UserRole;
  onRoleSwitch?: (role: UserRole) => void;
  isFramed?: boolean;
  onToggleFrame?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  unreadCount = 0,
  onNotificationClick,
  onOpenCodeInspector,
  userRole,
  onRoleSwitch,
  isFramed,
  onToggleFrame,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-2.5 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        {showBack && onBack ? (
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/20 shrink-0">
            <span className="text-base tracking-tighter">M+</span>
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-base font-bold text-slate-900 dark:text-white truncate leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Role Switcher Pill for rapid testing of doctor/patient/hospital flows */}
        {onRoleSwitch && (
          <div className="relative group">
            <button
              className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 transition cursor-pointer"
              title="Switch user role for testing"
            >
              {userRole === 'patient' && <UserCheck className="w-3 h-3 text-sky-600" />}
              {userRole === 'doctor' && <Stethoscope className="w-3 h-3 text-emerald-600" />}
              {userRole === 'hospital_admin' && <Building2 className="w-3 h-3 text-purple-600" />}
              <span className="capitalize">{userRole.replace('_', ' ')}</span>
            </button>
            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1 hidden group-hover:block group-focus-within:block z-50">
              <button
                onClick={() => onRoleSwitch('patient')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                  userRole === 'patient'
                    ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-sky-500" />
                <span>Patient View</span>
              </button>
              <button
                onClick={() => onRoleSwitch('doctor')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                  userRole === 'doctor'
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-emerald-500" />
                <span>Doctor View</span>
              </button>
              <button
                onClick={() => onRoleSwitch('hospital_admin')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                  userRole === 'hospital_admin'
                    ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-purple-500" />
                <span>Hospital Admin</span>
              </button>
            </div>
          </div>
        )}

        {/* Kotlin Code Inspector Button */}
        {onOpenCodeInspector && (
          <button
            onClick={onOpenCodeInspector}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
            title="Inspect Kotlin & Jetpack Compose Android Code"
          >
            <Code className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </button>
        )}

        {/* Notifications Button */}
        {onNotificationClick && (
          <button
            onClick={onNotificationClick}
            className="relative w-8 h-8 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
            )}
          </button>
        )}
      </div>
    </header>
  );
};
