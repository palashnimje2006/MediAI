import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Clock,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  PenTool,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Stethoscope,
  ChevronRight,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Doctor, Appointment, User } from '../types';

interface DoctorDashboardScreenProps {
  currentUser: User;
  onNavigate: (screen: string, data?: any) => void;
}

export const DoctorDashboardScreen: React.FC<DoctorDashboardScreenProps> = ({
  currentUser,
  onNavigate,
}) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [isAcceptingPatients, setIsAcceptingPatients] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find doctor record
    fetch('/api/doctors')
      .then((res) => res.json())
      .then((docs: Doctor[]) => {
        const doc = docs.find((d) => d.name === currentUser.name || d.userId === currentUser.id) || docs[0];
        setDoctor(doc);

        // Fetch doctor's appointments
        return fetch(`/api/appointments?doctorId=${doc.id}`);
      })
      .then((res) => res.json())
      .then((appts: Appointment[]) => {
        setTodayAppointments(appts);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentUser]);

  const totalRevenue = todayAppointments
    .filter((a) => a.status !== 'cancelled')
    .reduce((sum, a) => sum + a.fee, 0);

  const confirmedCount = todayAppointments.filter((a) => a.status === 'confirmed').length;
  const completedCount = todayAppointments.filter((a) => a.status === 'completed').length;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Doctor Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-tr from-sky-700 to-teal-800 text-white shadow-lg space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xl font-extrabold shadow-inner">
              <Stethoscope className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-extrabold text-white">
                  {currentUser.name}
                </h2>
                <span title="NMC Verified Medical Practitioner">
                  <ShieldCheck className="w-4 h-4 text-teal-300" />
                </span>
              </div>
              <p className="text-xs text-sky-200 mt-0.5">
                {doctor?.specialty || 'Cardiologist'} • {doctor?.hospitalName || 'Apollo Hospital'}
              </p>
              <span className="font-mono text-[10px] text-teal-200 block mt-0.5">
                NMC Lic: {doctor?.licenseNumber || 'NMC-2012-8819'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsAcceptingPatients(!isAcceptingPatients)}
            className="flex flex-col items-end gap-1 cursor-pointer"
            title="Toggle Live Availability"
          >
            <span className="text-[10px] text-sky-200 font-bold uppercase tracking-wider">
              {isAcceptingPatients ? 'Available' : 'On Leave'}
            </span>
            {isAcceptingPatients ? (
              <ToggleRight className="w-7 h-7 text-emerald-300" />
            ) : (
              <ToggleLeft className="w-7 h-7 text-slate-400" />
            )}
          </button>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-center">
          <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-sm">
            <span className="text-[10px] text-sky-200 block font-medium">Pending Queue</span>
            <span className="text-base font-extrabold text-white">{confirmedCount}</span>
          </div>

          <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-sm">
            <span className="text-[10px] text-sky-200 block font-medium">Completed</span>
            <span className="text-base font-extrabold text-teal-200">{completedCount}</span>
          </div>

          <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-sm">
            <span className="text-[10px] text-sky-200 block font-medium">Total Fees</span>
            <span className="text-base font-extrabold text-amber-300">₹{totalRevenue}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={() => onNavigate('doctor_availability')}
          className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1 hover:border-sky-400 transition cursor-pointer"
        >
          <Clock className="w-5 h-5 text-sky-600 dark:text-sky-400 mx-auto" />
          <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">
            Edit Schedule
          </span>
          <span className="text-[10px] text-slate-400 block">Slots & Hours</span>
        </button>

        <button
          onClick={() => onNavigate('doctor_appointments')}
          className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1 hover:border-teal-400 transition cursor-pointer"
        >
          <Users className="w-5 h-5 text-teal-600 dark:text-teal-400 mx-auto" />
          <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">
            Patient Queue
          </span>
          <span className="text-[10px] text-slate-400 block">{todayAppointments.length} Total</span>
        </button>

        <button
          onClick={() => onNavigate('create_prescription')}
          className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1 hover:border-emerald-400 transition cursor-pointer"
        >
          <PenTool className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">
            Write Rx
          </span>
          <span className="text-[10px] text-slate-400 block">Digital Prescription</span>
        </button>
      </div>

      {/* Today's Patient Queue Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Appointments Queue
          </h3>
          <button
            onClick={() => onNavigate('doctor_appointments')}
            className="text-xs text-sky-600 dark:text-sky-400 font-bold hover:underline"
          >
            Manage All ({todayAppointments.length})
          </button>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            No consultations scheduled for today.
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayAppointments.slice(0, 4).map((appt) => (
              <div
                key={appt.id}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-950 px-1.5 py-0.5 rounded">
                        {appt.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          appt.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                      {appt.patientName}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {appt.patientPhone} • Mode: {appt.type}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {appt.timeSlot}
                    </span>
                    <span className="block text-[10px] text-slate-400">{appt.date}</span>
                  </div>
                </div>

                {appt.symptoms && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                    Chief Complaint: {appt.symptoms}
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-600">Fee: ₹{appt.fee}</span>
                  <button
                    onClick={() => onNavigate('create_prescription', { appointmentId: appt.id, patientName: appt.patientName })}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition cursor-pointer"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Issue Prescription</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
