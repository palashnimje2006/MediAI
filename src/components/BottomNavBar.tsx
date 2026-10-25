import React from 'react';
import {
  Home,
  Search,
  CalendarDays,
  FileText,
  Bot,
  User,
  LayoutDashboard,
  Clock,
  Users,
  PenTool,
  Building2,
  FolderHeart,
} from 'lucide-react';
import { UserRole } from '../types';

interface BottomNavBarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  userRole: UserRole;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentScreen,
  onNavigate,
  userRole,
}) => {
  // Patient nav items
  const patientTabs = [
    { id: 'patient_home', label: 'Home', icon: Home },
    { id: 'doctor_search', label: 'Find', icon: Search },
    { id: 'my_appointments', label: 'Bookings', icon: CalendarDays },
    { id: 'prescriptions', label: 'Rx & Care', icon: FileText },
    { id: 'ai_assistant', label: 'Medi AI', icon: Bot, isAi: true },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Doctor nav items
  const doctorTabs = [
    { id: 'doctor_dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'doctor_availability', label: 'Availability', icon: Clock },
    { id: 'doctor_appointments', label: 'Patients', icon: Users },
    { id: 'create_prescription', label: 'New Rx', icon: PenTool },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Hospital admin nav items
  const hospitalTabs = [
    { id: 'hospital_dashboard', label: 'Overview', icon: Building2 },
    { id: 'doctor_search', label: 'Doctors', icon: Search },
    { id: 'hospital_search', label: 'Hospitals', icon: Building2 },
    { id: 'settings', label: 'Settings', icon: User },
  ];

  const tabs =
    userRole === 'doctor'
      ? doctorTabs
      : userRole === 'hospital_admin'
      ? hospitalTabs
      : patientTabs;

  return (
    <nav className="sticky bottom-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/90 dark:border-slate-800/90 py-1.5 px-2 flex items-center justify-around transition-colors">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentScreen === tab.id;
        const isAi = (tab as any).isAi;

        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all cursor-pointer select-none ${
              isActive
                ? 'text-sky-600 dark:text-sky-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <div
              className={`relative flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-sky-100 dark:bg-sky-950/80 px-3.5 py-1 rounded-full'
                  : 'p-1'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'scale-110' : ''
                } ${isAi && !isActive ? 'text-teal-600 dark:text-teal-400' : ''}`}
              />
              {isAi && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-teal-500 rounded-full animate-ping" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[55px]">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
