import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  ShieldAlert,
  Star,
  Users,
  Navigation,
  CheckCircle2,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';
import { Hospital, Doctor } from '../types';

interface HospitalDetailsScreenProps {
  hospitalId: string;
  onBack: () => void;
  onSelectDoctor: (doctorId: string) => void;
}

export const HospitalDetailsScreen: React.FC<HospitalDetailsScreenProps> = ({
  hospitalId,
  onBack,
  onSelectDoctor,
}) => {
  const [hospital, setHospital] = useState<(Hospital & { doctors?: Doctor[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/hospitals/${hospitalId}`)
      .then((res) => res.json())
      .then((data) => {
        setHospital(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [hospitalId]);

  if (loading || !hospital) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 space-y-2">
        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs">Loading hospital information...</span>
      </div>
    );
  }

  const handleDirections = () => {
    const q = encodeURIComponent(`${hospital.name} ${hospital.address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  };

  const handleCall = () => {
    window.location.href = `tel:${hospital.phone.replace(/\s+/g, '')}`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hospitals</span>
        </button>

        <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
          <span>{hospital.rating} Rating</span>
        </span>
      </div>

      {/* Hospital Banner */}
      <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="relative h-44 w-full">
          <img src={hospital.image} alt={hospital.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <h2 className="text-base sm:text-lg font-extrabold leading-tight text-white drop-shadow">
              {hospital.name}
            </h2>
            <p className="text-xs text-slate-200 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{hospital.city} • Est. {hospital.establishedYear}</span>
            </p>
          </div>
        </div>

        {/* Address and Actions */}
        <div className="p-4 space-y-3 text-xs">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {hospital.address}
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleCall}
              className="py-2.5 px-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center gap-1.5 hover:bg-purple-100 transition cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Reception</span>
            </button>
            <button
              onClick={handleDirections}
              className="py-2.5 px-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-sky-600/20"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Directions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Trauma Banner */}
      {hospital.hasEmergency24x7 && (
        <div className="p-3.5 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-rose-800 dark:text-rose-300">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold block">24x7 Emergency Trauma Unit</span>
              <span className="text-[11px] text-rose-600/80 dark:text-rose-400">
                Hotline: {hospital.emergencyHotline}
              </span>
            </div>
          </div>
          <button
            onClick={() => (window.location.href = `tel:${hospital.emergencyHotline.replace(/\s+/g, '')}`)}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 shadow transition cursor-pointer"
          >
            Call SOS
          </button>
        </div>
      )}

      {/* Departments */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Clinical Departments
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {hospital.departments.map((dept, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-xs font-semibold"
            >
              {dept}
            </span>
          ))}
        </div>
      </div>

      {/* Hospital Facilities */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Center Infrastructure & Facilities
        </h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
          {hospital.facilities.map((fac, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
              <span>{fac}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Affiliated Doctors Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Consultants at {hospital.name}
          </h3>
          <span className="text-[11px] text-slate-400">
            {hospital.doctors ? hospital.doctors.length : 0} Available
          </span>
        </div>

        {hospital.doctors && hospital.doctors.length > 0 ? (
          <div className="space-y-2">
            {hospital.doctors.map((doc) => (
              <div
                key={doc.id}
                onClick={() => onSelectDoctor(doc.id)}
                className="p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-400 shadow-sm transition flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    className="w-10 h-10 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-sky-600">
                      {doc.name}
                    </h4>
                    <p className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">
                      {doc.specialty}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{doc.consultationFee}
                  </span>
                  <div className="flex items-center gap-0.5 text-[10px] text-sky-600 font-semibold group-hover:underline">
                    <span>Book</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No doctors currently listed for online booking.</p>
        )}
      </div>
    </div>
  );
};
