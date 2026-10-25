import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Navigation,
  RefreshCw,
} from 'lucide-react';
import { Appointment } from '../types';

interface AppointmentDetailsScreenProps {
  appointment: Appointment;
  onBack: () => void;
  onAppointmentUpdated: () => void;
  onViewPrescription?: (prescriptionId: string) => void;
}

export const AppointmentDetailsScreen: React.FC<AppointmentDetailsScreenProps> = ({
  appointment,
  onBack,
  onAppointmentUpdated,
  onViewPrescription,
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of schedule');
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
          cancelReason,
        }),
      });

      if (res.ok) {
        setCancelSuccess(true);
        setTimeout(() => {
          onAppointmentUpdated();
          onBack();
        }, 1500);
      }
    } catch {
      //
    } finally {
      setCancelling(false);
    }
  };

  const handleDirections = () => {
    const q = encodeURIComponent(`${appointment.hospitalName} ${appointment.hospitalAddress}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>My Appointments</span>
        </button>

        <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
          {appointment.id}
        </span>
      </div>

      {/* Main Info Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {appointment.doctorName}
            </h2>
            <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 mt-0.5">
              {appointment.doctorSpecialty}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>{appointment.hospitalName} ({appointment.hospitalAddress})</span>
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              appointment.status === 'confirmed'
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                : appointment.status === 'completed'
                ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
            }`}
          >
            {appointment.status}
          </span>
        </div>

        {/* Schedule grid */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Date</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              {appointment.date}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Time Slot</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              {appointment.timeSlot}
            </span>
          </div>
        </div>

        {/* Consultation details */}
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Consultation Fee:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{appointment.fee}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Mode:</span>
            <span className="capitalize font-semibold">{appointment.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Patient:</span>
            <span className="font-semibold">{appointment.patientName}</span>
          </div>
          {appointment.symptoms && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block mb-0.5">Reported Symptoms:</span>
              <p className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs italic text-slate-700 dark:text-slate-300">
                {appointment.symptoms}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status History Timeline */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Consultation Lifecycle Timeline
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">Slot Reserved & Payment Verified</span>
              <p className="text-[11px] text-slate-500">{appointment.createdAt}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                appointment.status === 'completed'
                  ? 'bg-blue-100 text-blue-600'
                  : appointment.status === 'cancelled'
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {appointment.status === 'completed'
                  ? 'Consultation Completed & Prescription Issued'
                  : appointment.status === 'cancelled'
                  ? `Cancelled (${appointment.cancelReason || 'Patient request'})`
                  : 'Waiting for Patient Check-in on Date'}
              </span>
              <p className="text-[11px] text-slate-500">
                {appointment.date} at {appointment.timeSlot}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Prescription Button */}
      {appointment.prescriptionId && onViewPrescription && (
        <button
          onClick={() => onViewPrescription(appointment.prescriptionId!)}
          className="w-full py-3 px-4 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-teal-100 transition cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>View Authorized Digital Prescription ({appointment.prescriptionId})</span>
        </button>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 pt-2">
        <button
          onClick={handleDirections}
          className="py-3 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <Navigation className="w-4 h-4 text-rose-500" />
          <span>Navigate Hospital</span>
        </button>

        {appointment.status === 'confirmed' && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="py-3 px-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-rose-100 transition cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel Slot</span>
          </button>
        )}
      </div>

      {/* Cancellation Dialog */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>Cancel Appointment?</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to cancel this appointment with {appointment.doctorName}? The reserved slot will be released for other patients immediately.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500">Reason for cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              >
                <option value="Change of travel / work schedule">Change of travel / work schedule</option>
                <option value="Health improved / no longer needed">Health improved / no longer needed</option>
                <option value="Want to book alternative specialist">Want to book alternative specialist</option>
                <option value="Emergency personal reasons">Emergency personal reasons</option>
              </select>
            </div>

            {cancelSuccess ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 text-xs font-bold rounded-xl text-center">
                Appointment Successfully Cancelled!
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={handleCancel}
                  className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                >
                  {cancelling ? 'Releasing...' : 'Confirm Cancel'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
