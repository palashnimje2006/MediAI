import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  Building2,
  Award,
  Sparkles,
  Phone,
  FileCheck,
} from 'lucide-react';
import { Doctor } from '../types';

interface DoctorDetailsScreenProps {
  doctorId: string;
  onBack: () => void;
  onBookNow: (doctor: Doctor) => void;
}

export const DoctorDetailsScreen: React.FC<DoctorDetailsScreenProps> = ({
  doctorId,
  onBack,
  onBookNow,
}) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/doctors/${doctorId}`)
      .then((res) => res.json())
      .then((data) => {
        setDoctor(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [doctorId]);

  if (loading || !doctor) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 space-y-2">
        <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs">Loading specialist profile...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search</span>
        </button>

        <span className="text-[11px] font-mono bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full font-bold">
          Lic: {doctor.licenseNumber}
        </span>
      </div>

      {/* Doctor Header Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-start gap-4">
          <img
            src={doctor.avatar}
            alt={doctor.name}
            className="w-20 h-20 rounded-2xl object-cover shrink-0 ring-2 ring-sky-500/30 shadow-md"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {doctor.name}
              </h2>
              {doctor.isVerified && (
                <span title="NMC Verified">
                  <ShieldCheck className="w-4 h-4 text-teal-500 shrink-0" />
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-sky-600 dark:text-sky-400 mt-0.5">
              {doctor.specialty}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              {doctor.qualifications}
            </p>

            <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                <span>{doctor.rating}</span>
                <span className="text-[10px] text-slate-400 font-normal">({doctor.reviewCount} reviews)</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-slate-600 dark:text-slate-400">{doctor.experienceYears} Years Exp</span>
            </div>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-400 block font-medium">Fee</span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              ₹{doctor.consultationFee}
            </span>
          </div>
          <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-400 block font-medium">Working Days</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {doctor.schedule.workingDays.length} Days/wk
            </span>
          </div>
          <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-400 block font-medium">Slot Time</span>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
              {doctor.schedule.slotDurationMinutes} Mins
            </span>
          </div>
        </div>
      </div>

      {/* Hospital Affiliation Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-purple-500" />
          <span>Hospital Affiliation & Location</span>
        </h3>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            {doctor.hospitalName}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>{doctor.city} — Department of {doctor.specialty}</span>
          </p>
        </div>
      </div>

      {/* About Section */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          About Doctor
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {doctor.about}
        </p>
      </div>

      {/* Clinical Services Offered */}
      {doctor.services && doctor.services.length > 0 && (
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-teal-500" />
            <span>Clinical Services & Procedures</span>
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {doctor.services.map((svc, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-medium"
              >
                ✓ {svc}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Summary */}
      <div className="p-4 rounded-3xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 space-y-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-sky-900 dark:text-sky-300">
          <Clock className="w-4 h-4 text-sky-600" />
          <span>Consultation Schedule</span>
        </div>
        <p className="text-slate-600 dark:text-slate-300">
          Available on: <span className="font-semibold">{doctor.schedule.workingDays.join(', ')}</span>
        </p>
        <p className="text-slate-600 dark:text-slate-300">
          Hours: <span className="font-semibold">{doctor.schedule.startHour} to {doctor.schedule.endHour}</span>
        </p>
      </div>

      {/* Fixed Bottom Book Action */}
      <div className="pt-2">
        <button
          onClick={() => onBookNow(doctor)}
          className="w-full py-3.5 px-4 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-sky-600/30 transition active:scale-98 cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Select Date & Book Time Slot</span>
        </button>
      </div>
    </div>
  );
};
