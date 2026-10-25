import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Droplet,
  ShieldCheck,
  Heart,
  FolderHeart,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  AlertTriangle,
  Edit3,
  X,
  PhoneCall,
} from 'lucide-react';
import { User as UserType } from '../types';

interface PatientProfileScreenProps {
  currentUser: UserType;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
  onUpdateUser: (updated: UserType) => void;
}

export const PatientProfileScreen: React.FC<PatientProfileScreenProps> = ({
  currentUser,
  onNavigate,
  onLogout,
  onUpdateUser,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [bloodGroup, setBloodGroup] = useState(currentUser.bloodGroup || 'B+');
  const [allergies, setAllergies] = useState(currentUser.allergies?.join(', ') || 'Penicillin, Peanuts');
  const [chronicConditions, setChronicConditions] = useState(
    currentUser.chronicConditions?.join(', ') || 'Mild Asthma'
  );
  const [emergencyName, setEmergencyName] = useState(currentUser.emergencyContact?.name || 'Sunita Verma');
  const [emergencyPhone, setEmergencyPhone] = useState(currentUser.emergencyContact?.phone || '+91 98765 12345');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserType = {
      ...currentUser,
      bloodGroup,
      allergies: allergies.split(',').map((s) => s.trim()).filter(Boolean),
      chronicConditions: chronicConditions.split(',').map((s) => s.trim()).filter(Boolean),
      emergencyContact: {
        name: emergencyName,
        relation: 'Primary Contact',
        phone: emergencyPhone,
      },
    };
    onUpdateUser(updated);
    setShowEditModal(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Profile Header */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white text-2xl font-extrabold shadow-md">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {currentUser.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {currentUser.email}
            </p>
            <span className="inline-block px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[10px] font-bold mt-1">
              Verified Patient ID: {currentUser.id}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowEditModal(true)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition cursor-pointer"
          title="Edit Profile"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>

      {/* Clinical Health Snapshot */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Health & Emergency Snapshot</span>
          </h3>
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">● Protected</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-slate-400 text-[10px] block font-medium">Blood Group</span>
            <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
              {currentUser.bloodGroup || 'O+'}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <span className="text-slate-400 text-[10px] block font-medium">Mobile Phone</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
              {currentUser.phone || '+91 98765 43210'}
            </span>
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <span className="text-slate-400 text-[11px] font-medium block">Known Drug & Food Allergies</span>
          <div className="flex flex-wrap gap-1">
            {currentUser.allergies && currentUser.allergies.length > 0 ? (
              currentUser.allergies.map((a, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-semibold border border-rose-200 dark:border-rose-900"
                >
                  ⚠️ {a}
                </span>
              ))
            ) : (
              <span className="text-slate-400 italic text-[11px]">No allergies reported</span>
            )}
          </div>
        </div>

        {currentUser.emergencyContact && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">Emergency Contact</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {currentUser.emergencyContact.name} ({currentUser.emergencyContact.relation})
              </span>
            </div>
            <a
              href={`tel:${currentUser.emergencyContact.phone.replace(/\s+/g, '')}`}
              className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-1 hover:bg-rose-100"
            >
              <PhoneCall className="w-3 h-3" />
              <span>{currentUser.emergencyContact.phone}</span>
            </a>
          </div>
        )}
      </div>

      {/* Account Navigation Shortcuts */}
      <div className="p-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 text-xs">
        <button
          onClick={() => onNavigate('medical_records')}
          className="w-full p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 flex items-center justify-center">
              <FolderHeart className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="font-bold block">Medical Records Vault</span>
              <span className="text-[11px] text-slate-400">Lab tests, scans & discharge summaries</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => onNavigate('prescriptions')}
          className="w-full p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="font-bold block">Digital Prescriptions</span>
              <span className="text-[11px] text-slate-400">View and print authorized NMC prescriptions</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className="w-full p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="font-bold block">Settings & Privacy</span>
              <span className="text-[11px] text-slate-400">Theme, biometric locks & DPDP data policy</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => onNavigate('help_support')}
          className="w-full p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="font-bold block">Help & Support</span>
              <span className="text-[11px] text-slate-400">24x7 Emergency directory & FAQ</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Logout Action */}
      <button
        onClick={onLogout}
        className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 transition cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out Session</span>
      </button>

      {/* Edit Health Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-sky-600" />
                <span>Update Health Profile</span>
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Known Allergies (comma separated)</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts, Pollen"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Chronic Conditions</label>
                <input
                  type="text"
                  value={chronicConditions}
                  onChange={(e) => setChronicConditions(e.target.value)}
                  placeholder="e.g. Hypertension, Mild Asthma"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Emergency Name</label>
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Contact Name"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Emergency Phone</label>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+91..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/25 transition active:scale-98 cursor-pointer mt-2"
              >
                Save Health Snapshot
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
