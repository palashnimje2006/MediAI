import React, { useState } from 'react';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  CalendarPlus,
  Navigation,
  ArrowRight,
  ShieldCheck,
  Share2,
  HardDrive,
} from 'lucide-react';
import { Appointment } from '../types';
import { exportAppointmentPassToDrive } from '../lib/googleDriveService';
import { isGoogleConnected, googleSignIn } from '../lib/googleAuth';

interface BookingConfirmationScreenProps {
  appointment: Appointment;
  onGoToAppointments: () => void;
  onGoToHome: () => void;
}

export const BookingConfirmationScreen: React.FC<BookingConfirmationScreenProps> = ({
  appointment,
  onGoToAppointments,
  onGoToHome,
}) => {
  const [savingDrive, setSavingDrive] = useState(false);
  const [driveSaved, setDriveSaved] = useState(false);
  const handleAddToCalendar = () => {
    const title = encodeURIComponent(`Medi AI: Appointment with ${appointment.doctorName}`);
    const details = encodeURIComponent(
      `Appointment ID: ${appointment.id}\nSpecialty: ${appointment.doctorSpecialty}\nHospital: ${appointment.hospitalName}\nSymptoms: ${appointment.symptoms || 'General Consultation'}`
    );
    const location = encodeURIComponent(`${appointment.hospitalName}, ${appointment.hospitalAddress}`);
    window.open(
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`,
      '_blank'
    );
  };

  const handleDirections = () => {
    const q = encodeURIComponent(`${appointment.hospitalName} ${appointment.hospitalAddress}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      <div className="max-w-md mx-auto w-full space-y-5 pt-2">
        {/* Animated Celebration Icon */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800">
            Booking Confirmed & Synchronized
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight">You're All Set!</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Your appointment has been logged in the hospital queue system. A confirmation notification has been sent.
          </p>
        </div>

        {/* Digital Pass Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Appointment Token ID
              </span>
              <span className="font-mono text-base font-extrabold text-sky-600 dark:text-sky-400">
                {appointment.id}
              </span>
            </div>

            <div className="w-14 h-14 bg-white p-1 rounded-xl border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
              <QrCode className="w-12 h-12 text-slate-900" />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {appointment.doctorName}
              </h3>
              <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold">
                {appointment.doctorSpecialty}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                <span>{appointment.hospitalName} ({appointment.hospitalAddress})</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 text-[10px] block font-medium">Date</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{appointment.date}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 text-[10px] block font-medium">Time Slot</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{appointment.timeSlot}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Patient: <strong className="text-slate-800 dark:text-slate-200">{appointment.patientName}</strong></span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Fee: ₹{appointment.fee}</span>
          </div>
        </div>

        {/* Useful Preparation Tips */}
        <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 text-[11px] text-sky-900 dark:text-sky-300 space-y-1">
          <span className="font-bold block flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
            <span>Consultation Preparation Advice:</span>
          </span>
          <p className="text-slate-600 dark:text-slate-300">
            Please arrive 15 minutes before your slot time with previous medical prescriptions or diagnostic reports.
          </p>
        </div>

        {/* Quick External Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleDirections}
            className="py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-100 transition cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-rose-500" />
            <span>Hospital Route</span>
          </button>
          <button
            onClick={handleAddToCalendar}
            className="py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-100 transition cursor-pointer"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-sky-500" />
            <span>Add to Calendar</span>
          </button>
        </div>

        <button
          onClick={async () => {
            try {
              setSavingDrive(true);
              if (!isGoogleConnected()) {
                const res = await googleSignIn();
                if (!res) return;
              }
              const f = await exportAppointmentPassToDrive(appointment);
              setDriveSaved(true);
              if (f.webViewLink) {
                alert('Appointment Pass safely backed up to Google Drive Medi AI Health Vault!');
              }
            } catch (err: any) {
              if (
                err?.code === 'auth/popup-closed-by-user' ||
                err?.code === 'auth/cancelled-popup-request' ||
                err?.message?.includes('popup-closed-by-user')
              ) {
                return;
              }
              alert(err.message || 'Could not back up pass to Google Drive.');
            } finally {
              setSavingDrive(false);
            }
          }}
          disabled={savingDrive}
          className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-sky-700 dark:text-sky-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <HardDrive className="w-3.5 h-3.5 text-sky-600" />
          <span>
            {savingDrive
              ? 'Backing up Pass to Google Drive...'
              : driveSaved
              ? '✓ Pass Backed Up to Google Drive'
              : 'Save Pass to Google Drive Vault'}
          </span>
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800 max-w-md mx-auto w-full">
        <button
          onClick={onGoToAppointments}
          className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/25 transition active:scale-98 cursor-pointer"
        >
          <span>View in My Appointments</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={onGoToHome}
          className="w-full py-2.5 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold text-xs transition cursor-pointer"
        >
          Return to Home Dashboard
        </button>
      </div>
    </div>
  );
};
