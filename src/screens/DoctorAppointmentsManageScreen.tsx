import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Calendar,
  Clock,
  PenTool,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Appointment, User } from '../types';

interface DoctorAppointmentsManageScreenProps {
  currentUser: User;
  onBack: () => void;
  onWritePrescription: (appointment: Appointment) => void;
}

export const DoctorAppointmentsManageScreen: React.FC<DoctorAppointmentsManageScreenProps> = ({
  currentUser,
  onBack,
  onWritePrescription,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/appointments')
      .then((res) => res.json())
      .then((data: Appointment[]) => {
        setAppointments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleComplete = async (apptId: string) => {
    try {
      await fetch(`/api/appointments/${apptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      setAppointments((prev) =>
        prev.map((a) => (a.id === apptId ? { ...a, status: 'completed' } : a))
      );
    } catch {}
  };

  const filtered = appointments.filter((a) => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesSearch =
      a.patientName.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <span className="text-[11px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-full">
          Doctor Patient Queue
        </span>
      </div>

      <div>
        <h2 className="text-xl font-extrabold tracking-tight">Assigned Consultations</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage patient queue, mark consultations as completed, and issue prescriptions
        </p>
      </div>

      {/* Search & Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient name or MEDI appointment token..."
            className="w-full pl-10 pr-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold no-scrollbar">
          {(['all', 'confirmed', 'completed', 'cancelled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full capitalize cursor-pointer transition ${
                statusFilter === st
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Patients List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Loading patient appointments...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
            No consultations found under this filter.
          </div>
        ) : (
          filtered.map((appt) => (
            <div
              key={appt.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-teal-400 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                      {appt.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        appt.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : appt.status === 'completed'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {appt.patientName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {appt.patientPhone} • {appt.patientEmail}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    {appt.date}
                  </span>
                  <span className="text-xs text-teal-600 font-semibold">{appt.timeSlot}</span>
                </div>
              </div>

              {appt.symptoms && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                  <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider">
                    Reported Symptoms
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 italic mt-0.5">
                    {appt.symptoms}
                  </p>
                </div>
              )}

              {/* Consultation Control Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                {appt.status === 'confirmed' && (
                  <button
                    onClick={() => handleComplete(appt.id)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Mark Completed</span>
                  </button>
                )}

                <button
                  onClick={() => onWritePrescription(appt)}
                  className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Write Digital Rx</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
