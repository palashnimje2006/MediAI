import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, QrCode, Stethoscope, Share2, CheckCircle2, Navigation, AlertCircle, HardDrive } from 'lucide-react';
import { Appointment } from '../types';
import { exportAppointmentPassToDrive } from '../lib/googleDriveService';
import { isGoogleConnected, googleSignIn } from '../lib/googleAuth';

interface AppointmentPassModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onViewPrescription?: (prescriptionId: string) => void;
}

export const AppointmentPassModal: React.FC<AppointmentPassModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onViewPrescription,
}) => {
  const [savingDrive, setSavingDrive] = useState(false);
  const [driveSaved, setDriveSaved] = useState(false);
  if (!isOpen || !appointment) return null;

  const handleAddToCalendar = () => {
    const title = encodeURIComponent(`Doctor Appointment: ${appointment.doctorName}`);
    const details = encodeURIComponent(
      `Appointment ID: ${appointment.id}\nSpecialty: ${appointment.doctorSpecialty}\nHospital: ${appointment.hospitalName}\nSymptoms: ${appointment.symptoms || 'General Checkup'}`
    );
    const location = encodeURIComponent(`${appointment.hospitalName}, ${appointment.hospitalAddress}`);
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    window.open(googleCalendarUrl, '_blank');
  };

  const handleDirections = () => {
    const q = encodeURIComponent(`${appointment.hospitalName} ${appointment.hospitalAddress}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800">
        {/* Pass Header */}
        <div className="bg-gradient-to-r from-sky-600 to-teal-600 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 text-sky-100 text-xs font-semibold mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>CONFIRMED APPOINTMENT PASS</span>
          </div>

          <h3 className="text-xl font-extrabold tracking-tight">{appointment.doctorName}</h3>
          <p className="text-xs text-sky-100 flex items-center gap-1 mt-0.5">
            <Stethoscope className="w-3.5 h-3.5 text-teal-200" />
            <span>{appointment.doctorSpecialty}</span>
          </p>

          <div className="mt-3 inline-block px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-mono font-bold tracking-wider">
            {appointment.id}
          </div>
        </div>

        {/* Pass Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Date, Time, Hospital */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <div>
              <span className="text-slate-400 font-medium flex items-center gap-1 mb-0.5">
                <Calendar className="w-3.5 h-3.5 text-sky-500" />
                <span>Date</span>
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{appointment.date}</span>
            </div>

            <div>
              <span className="text-slate-400 font-medium flex items-center gap-1 mb-0.5">
                <Clock className="w-3.5 h-3.5 text-teal-500" />
                <span>Slot Time</span>
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{appointment.timeSlot}</span>
            </div>

            <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 font-medium flex items-center gap-1 mb-0.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Facility</span>
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">{appointment.hospitalName}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{appointment.hospitalAddress}</span>
            </div>
          </div>

          {/* QR Code Pass for Hospital Entry Kiosk */}
          <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50">
            <div className="w-16 h-16 bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
              <QrCode className="w-14 h-14 text-slate-900" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-sky-900 dark:text-sky-300 uppercase tracking-wider block">
                OPD Fast-Track Check-in
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Scan this QR token at the hospital reception or self-service kiosk to print your queue slip.
              </p>
            </div>
          </div>

          {/* Patient Info */}
          <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Patient:</span>
              <span className="font-semibold">{appointment.patientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Consultation Fee:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{appointment.fee} (Paid)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mode:</span>
              <span className="capitalize font-medium">{appointment.type}</span>
            </div>
            {appointment.symptoms && (
              <div className="pt-1 text-[11px]">
                <span className="text-slate-400 block">Reported Symptoms:</span>
                <span className="italic text-slate-600 dark:text-slate-400">{appointment.symptoms}</span>
              </div>
            )}
          </div>

          {/* Linked Prescription Action */}
          {appointment.prescriptionId && onViewPrescription && (
            <button
              onClick={() => {
                onClose();
                onViewPrescription(appointment.prescriptionId!);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-teal-100 transition cursor-pointer"
            >
              <span>View Issued Prescription ({appointment.prescriptionId})</span>
            </button>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={handleDirections}
              className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-rose-500" />
              <span>Get Directions</span>
            </button>
            <button
              onClick={handleAddToCalendar}
              className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-sky-600/20"
            >
              <Calendar className="w-3.5 h-3.5" />
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
                  alert('Appointment pass backed up to Google Drive Medi AI Health Vault!');
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
            className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <HardDrive className="w-3.5 h-3.5 text-sky-600" />
            <span>
              {savingDrive
                ? 'Backing up to Google Drive...'
                : driveSaved
                ? '✓ Pass Backed Up to Google Drive'
                : 'Save Pass to Google Drive Vault'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
