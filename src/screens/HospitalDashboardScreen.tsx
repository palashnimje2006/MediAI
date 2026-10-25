import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  ShieldAlert,
  Activity,
  Bed,
  PhoneCall,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
} from 'lucide-react';
import { Hospital, Doctor, User } from '../types';

interface HospitalDashboardScreenProps {
  currentUser: User;
  onNavigate: (screen: string) => void;
}

export const HospitalDashboardScreen: React.FC<HospitalDashboardScreenProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [affiliatedDoctors, setAffiliatedDoctors] = useState<Doctor[]>([]);
  const [bedOccupancy, setBedOccupancy] = useState(84); // 84%
  const [emergencyStatus, setEmergencyStatus] = useState<'Operational' | 'High-Load'>('Operational');

  useEffect(() => {
    fetch('/api/hospitals/hosp-02')
      .then((res) => res.json())
      .then((data) => {
        setHospital(data);
        if (data.doctors) setAffiliatedDoctors(data.doctors);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Hospital Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-tr from-purple-700 to-indigo-900 text-white shadow-lg space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xl font-extrabold shadow-inner">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200">
                Hospital Administration Portal
              </span>
              <h2 className="text-base font-extrabold text-white">
                {hospital?.name || 'Apollo Hospital, Bengaluru'}
              </h2>
              <p className="text-xs text-purple-200 mt-0.5">
                NABH & JCI Accredited Medical Facility
              </p>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>OPD Active</span>
          </div>
        </div>

        {/* Operational Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-center">
          <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-sm">
            <span className="text-[10px] text-purple-200 block font-medium">Bed Occupancy</span>
            <span className="text-base font-extrabold text-white">{bedOccupancy}%</span>
          </div>

          <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-sm">
            <span className="text-[10px] text-purple-200 block font-medium">On-Duty Doctors</span>
            <span className="text-base font-extrabold text-teal-200">{affiliatedDoctors.length || 18}</span>
          </div>

          <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-sm">
            <span className="text-[10px] text-purple-200 block font-medium">Trauma Unit</span>
            <span className="text-base font-extrabold text-amber-300">{emergencyStatus}</span>
          </div>
        </div>
      </div>

      {/* Emergency Casualty Control */}
      <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-rose-800 dark:text-rose-300">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
          <div>
            <span className="font-bold block">Hospital Emergency Casualty Hotline</span>
            <span className="text-[11px] text-rose-600/80 dark:text-rose-400">
              Direct Ambulance Dispatch: 1066 / +91 80 2630 4050
            </span>
          </div>
        </div>

        <button
          onClick={() => alert('Emergency alert broadcast dispatched to casualty on-call staff!')}
          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 shadow transition cursor-pointer"
        >
          Dispatch SOS
        </button>
      </div>

      {/* Departments Roster */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Active Clinical Wings & Bed Capacity
        </h3>

        <div className="space-y-2 text-xs">
          {[
            { dept: 'Cardiology & Cardiac ICU', total: 60, occupied: 54 },
            { dept: 'Neurology & Stroke Unit', total: 40, occupied: 32 },
            { dept: 'Orthopedics & Joint Care', total: 50, occupied: 38 },
            { dept: 'Pediatric ICU & Nursery', total: 30, occupied: 24 },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold">
                <span>{item.dept}</span>
                <span>{item.occupied} / {item.total} Beds</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{ width: `${(item.occupied / item.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Affiliated Doctors Roster */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Consultants On Duty
          </h3>
          <button
            onClick={() => onNavigate('doctor_search')}
            className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline"
          >
            Manage Roster
          </button>
        </div>

        <div className="space-y-2">
          {affiliatedDoctors.map((doc) => (
            <div
              key={doc.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <img
                  src={doc.avatar}
                  alt={doc.name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {doc.name}
                  </span>
                  <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                    {doc.specialty}
                  </span>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                ● Live Slots Open
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
