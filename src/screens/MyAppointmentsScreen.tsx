import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  ChevronRight,
  FileCheck2,
  CalendarX,
  RefreshCw,
  QrCode,
  AlertCircle,
  Navigation,
} from 'lucide-react';
import { Appointment, AppointmentStatus, User } from '../types';

interface MyAppointmentsScreenProps {
  currentUser: User;
  onSelectAppointment: (appointment: Appointment) => void;
  onOpenPass: (appointment: Appointment) => void;
  onViewPrescription: (prescriptionId: string) => void;
  onBookNew: () => void;
}

export const MyAppointmentsScreen: React.FC<MyAppointmentsScreenProps> = ({
  currentUser,
  onSelectAppointment,
  onOpenPass,
  onViewPrescription,
  onBookNew,
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = () => {
    setLoading(true);
    fetch(`/api/appointments?patientId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        setAppointments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentUser.id]);

  const filtered = appointments.filter((a) => {
    if (activeTab === 'upcoming') return a.status === 'confirmed' || a.status === 'pending';
    if (activeTab === 'completed') return a.status === 'completed';
    return a.status === 'cancelled';
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">My Appointments</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track consultation schedule & digital entry passes
          </p>
        </div>

        <button
          onClick={fetchAppointments}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
        </button>
      </div>

      {/* 3 Tabs: Upcoming, Completed, Cancelled */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`py-2 rounded-xl transition cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`py-2 rounded-xl transition cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`py-2 rounded-xl transition cursor-pointer ${
            activeTab === 'cancelled'
              ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Appointment Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Loading appointments...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 mx-auto flex items-center justify-center">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold">No {activeTab} appointments found</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {activeTab === 'upcoming'
                ? 'You do not have any scheduled consultations at the moment.'
                : `No past ${activeTab} consultation records.`}
            </p>
            {activeTab === 'upcoming' && (
              <button
                onClick={onBookNew}
                className="mt-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition cursor-pointer"
              >
                Book a Consultation
              </button>
            )}
          </div>
        ) : (
          filtered.map((appt) => (
            <div
              key={appt.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-sky-300 dark:hover:border-sky-700 transition"
            >
              {/* Header with ID and Status */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/80 px-2 py-0.5 rounded-md">
                  {appt.id}
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    appt.status === 'confirmed'
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                      : appt.status === 'completed'
                      ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                      : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {appt.status}
                </span>
              </div>

              {/* Doctor Details */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {appt.doctorName}
                  </h3>
                  <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                    {appt.doctorSpecialty}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                    <span>{appt.hospitalName}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    ₹{appt.fee}
                  </span>
                  <span className="block text-[10px] text-slate-400 capitalize">{appt.type}</span>
                </div>
              </div>

              {/* Date & Time Slot */}
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <CalendarDays className="w-3.5 h-3.5 text-sky-500" />
                  <span className="font-semibold">{appt.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-teal-500" />
                  <span className="font-semibold">{appt.timeSlot}</span>
                </div>
              </div>

              {/* Action Buttons based on status */}
              <div className="pt-1 flex items-center gap-2">
                {appt.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => onOpenPass(appt)}
                      className="flex-1 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Entry Pass</span>
                    </button>
                    <button
                      onClick={() => onSelectAppointment(appt)}
                      className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs transition cursor-pointer"
                    >
                      Details & Manage
                    </button>
                  </>
                )}

                {appt.status === 'completed' && appt.prescriptionId && (
                  <button
                    onClick={() => onViewPrescription(appt.prescriptionId!)}
                    className="flex-1 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>View Digital Prescription</span>
                  </button>
                )}

                {appt.status === 'cancelled' && (
                  <div className="text-[11px] text-rose-500 italic">
                    Reason: {appt.cancelReason || 'Cancelled by user'}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
