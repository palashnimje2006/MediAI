import React, { useState, useEffect } from 'react';
import {
  Search,
  Stethoscope,
  Building2,
  CalendarCheck,
  Bot,
  AlertTriangle,
  ChevronRight,
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  FileCheck2,
  ArrowRight,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { Doctor, Appointment, Prescription, User } from '../types';

interface PatientHomeScreenProps {
  user: User;
  onNavigate: (screen: string, data?: any) => void;
  onOpenEmergency: () => void;
  onOpenPass: (appt: Appointment) => void;
}

export const PatientHomeScreen: React.FC<PatientHomeScreenProps> = ({
  user,
  onNavigate,
  onOpenEmergency,
  onOpenPass,
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [upcomingAppt, setUpcomingAppt] = useState<Appointment | null>(null);
  const [recentPrescription, setRecentPrescription] = useState<Prescription | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch doctors
    fetch('/api/doctors')
      .then((res) => res.json())
      .then((data) => {
        setDoctors(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch appointments
    fetch(`/api/appointments?patientId=${user.id}&status=confirmed`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setUpcomingAppt(data[0]);
        }
      })
      .catch(() => {});

    // Fetch prescriptions
    fetch(`/api/prescriptions?patientId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setRecentPrescription(data[0]);
        }
      })
      .catch(() => {});
  }, [user.id]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('doctor_search', { search: searchQuery.trim() });
    } else {
      onNavigate('doctor_search');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Personalized Greeting */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Welcome back,
          </span>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {user.name} 👋
          </h2>
        </div>

        <button
          onClick={onOpenEmergency}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold text-xs transition cursor-pointer active:scale-95 animate-pulse"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>112 / 108 SOS</span>
        </button>
      </div>

      {/* Emergency Assistance Quick Call Banner */}
      <div className="bg-gradient-to-r from-rose-600 to-amber-600 rounded-3xl p-4 text-white shadow-lg shadow-rose-950/20 flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-100">
            <AlertTriangle className="w-4 h-4 text-amber-200" />
            <span>24x7 Emergency Assistance</span>
          </div>
          <p className="text-xs text-rose-100 font-medium">
            Immediate ambulance & casualty trauma hospital response
          </p>
        </div>
        <button
          onClick={onOpenEmergency}
          className="px-3.5 py-2 rounded-2xl bg-white text-rose-700 font-bold text-xs shrink-0 shadow-md hover:bg-rose-50 transition cursor-pointer"
        >
          Helpline
        </button>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search doctor, hospital, cardiology, dermatology..."
          className="w-full pl-10 pr-24 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
        />
        <button
          type="submit"
          className="absolute right-2 top-2 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* 4 Core Shortcuts Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        <button
          onClick={() => onNavigate('doctor_search')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-sky-400 hover:shadow-md transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
            <Stethoscope className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 text-center">
            Find Doctors
          </span>
        </button>

        <button
          onClick={() => onNavigate('hospital_search')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-400 hover:shadow-md transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 text-center">
            Hospitals
          </span>
        </button>

        <button
          onClick={() => onNavigate('my_appointments')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-400 hover:shadow-md transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 text-center">
            Bookings
          </span>
        </button>

        <button
          onClick={() => onNavigate('ai_assistant')}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-teal-500 to-sky-600 text-white shadow-md shadow-teal-500/20 hover:opacity-95 transition cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center mb-1.5 group-hover:scale-110 transition">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="text-[11px] font-bold text-white text-center">
            Medi AI
          </span>
        </button>
      </div>

      {/* AI Health Assistant Banner Card */}
      <div className="bg-gradient-to-tr from-teal-700 via-sky-800 to-slate-900 rounded-3xl p-4 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-400/20 text-teal-300 text-[11px] font-bold border border-teal-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Health & Symptom Guidance</span>
          </div>
          <h3 className="text-base font-extrabold leading-snug">
            Experiencing cough, fever, or joint discomfort?
          </h3>
          <p className="text-xs text-sky-200 leading-relaxed max-w-xs">
            Describe symptoms to Medi AI. Get instant triage guidance and find the right medical specialty in seconds.
          </p>
          <button
            onClick={() => onNavigate('ai_assistant')}
            className="mt-1 px-4 py-2 rounded-xl bg-white text-teal-800 font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-teal-50 transition cursor-pointer"
          >
            <span>Ask Medi AI Assistant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Upcoming Appointment Card */}
      {upcomingAppt && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Upcoming Consultation
            </h3>
            <button
              onClick={() => onNavigate('my_appointments')}
              className="text-xs text-sky-600 dark:text-sky-400 font-semibold hover:underline"
            >
              View All
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold">
                  {upcomingAppt.id}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {upcomingAppt.doctorName}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {upcomingAppt.doctorSpecialty} • {upcomingAppt.hospitalName}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                  ₹{upcomingAppt.fee}
                </span>
                <span className="block text-[10px] text-slate-400 font-medium">Confirmed</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <CalendarCheck className="w-3.5 h-3.5 text-sky-500" />
                <span>{upcomingAppt.date}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-teal-500" />
                <span>{upcomingAppt.timeSlot}</span>
              </div>
            </div>

            <button
              onClick={() => onOpenPass(upcomingAppt)}
              className="w-full py-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>View Appointment Pass & QR Entry</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Recent Authorized Prescription Summary */}
      {recentPrescription && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recent Authorized Prescription
            </h3>
            <button
              onClick={() => onNavigate('prescriptions')}
              className="text-xs text-sky-600 dark:text-sky-400 font-semibold hover:underline"
            >
              All Prescriptions
            </button>
          </div>

          <div
            onClick={() => onNavigate('prescriptions', { selectedId: recentPrescription.id })}
            className="p-3.5 rounded-3xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/50 flex items-center justify-between gap-3 cursor-pointer hover:bg-teal-100/60 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-teal-800 dark:text-teal-300 font-bold">
                    {recentPrescription.id}
                  </span>
                  <span className="text-[11px] text-slate-500">{recentPrescription.date}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate max-w-[200px]">
                  {recentPrescription.diagnosis}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {recentPrescription.doctorName} ({recentPrescription.doctorSpecialty})
                </p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-teal-600 shrink-0" />
          </div>
        </div>
      )}

      {/* Featured Verified Doctors */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Verified Doctors
            </h3>
            <p className="text-[11px] text-slate-500">Book instant slots with top specialists</p>
          </div>
          <button
            onClick={() => onNavigate('doctor_search')}
            className="text-xs text-sky-600 dark:text-sky-400 font-semibold hover:underline"
          >
            See All ({doctors.length})
          </button>
        </div>

        <div className="space-y-2.5">
          {doctors.slice(0, 4).map((doc) => (
            <div
              key={doc.id}
              onClick={() => onNavigate('doctor_details', { doctorId: doc.id })}
              className="p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 shadow-sm transition flex items-center justify-between gap-3 cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={doc.avatar}
                  alt={doc.name}
                  className="w-12 h-12 rounded-2xl object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {doc.name}
                    </h4>
                    {doc.isVerified && (
                      <span title="NMC Verified">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-sky-600 dark:text-sky-400 truncate">
                    {doc.specialty}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {doc.hospitalName} • {doc.city}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center justify-end gap-1 text-[11px] font-bold text-amber-500">
                  <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                  <span>{doc.rating}</span>
                </div>
                <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 block mt-0.5">
                  ₹{doc.consultationFee}
                </span>
                <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold group-hover:underline">
                  Book Slot
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
