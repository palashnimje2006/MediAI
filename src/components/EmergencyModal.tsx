import React, { useState, useEffect } from 'react';
import { X, PhoneCall, AlertTriangle, ShieldAlert, Building2, MapPin, ExternalLink } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const [emergencyData, setEmergencyData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/emergency')
        .then((res) => res.json())
        .then((data) => setEmergencyData(data))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCall = (num: string) => {
    window.location.href = `tel:${num.replace(/\s+/g, '')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 border-2 border-rose-500/80">
        {/* Urgent Header */}
        <div className="bg-rose-600 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 animate-bounce">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold uppercase tracking-tight">
                Emergency Medical Assistance
              </h2>
              <p className="text-xs text-rose-100 mt-0.5">
                If someone is unconscious, experiencing acute chest pain, or bleeding severely, call immediately!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Emergency Helplines List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-3.5 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              Medi AI appointment booking and AI chat are NOT emergency dispatch services. Always dial emergency dispatch below.
            </span>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              National Medical Helplines (India)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleCall('112')}
                className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition flex items-center justify-between text-left cursor-pointer group"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">National Emergency</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">All-in-one helpline</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-600 text-white font-mono font-bold text-xs shadow group-hover:scale-105 transition">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>112</span>
                </div>
              </button>

              <button
                onClick={() => handleCall('108')}
                className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition flex items-center justify-between text-left cursor-pointer group"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Emergency Ambulance</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">24x7 Rapid Response</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-600 text-white font-mono font-bold text-xs shadow group-hover:scale-105 transition">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>108</span>
                </div>
              </button>

              <button
                onClick={() => handleCall('102')}
                className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition flex items-center justify-between text-left cursor-pointer group"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Govt Hospital Ambulance</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Free Maternity/Neonatal</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-600 text-white font-mono font-bold text-xs shadow group-hover:scale-105 transition">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>102</span>
                </div>
              </button>

              <button
                onClick={() => handleCall('104')}
                className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition flex items-center justify-between text-left cursor-pointer group"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Health & Blood Helpline</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Medical counseling</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-600 text-white font-mono font-bold text-xs shadow group-hover:scale-105 transition">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>104</span>
                </div>
              </button>
            </div>
          </div>

          {/* Hospital Casualty Direct Hotlines */}
          {emergencyData && emergencyData.hospitalHotlines && (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-sky-500" />
                <span>Accredited Hospital Casualty Centers</span>
              </h3>

              <div className="space-y-2">
                {emergencyData.hospitalHotlines.map((h: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800 dark:text-slate-100 truncate block">
                        {h.hospital}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{h.city}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleCall(h.hotline)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-sm"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>{h.hotline}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
