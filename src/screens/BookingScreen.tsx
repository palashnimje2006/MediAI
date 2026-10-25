import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Video,
  Building,
  User,
  Phone,
  Mail,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Doctor, User as UserType } from '../types';

interface BookingScreenProps {
  doctor: Doctor;
  currentUser: UserType;
  onBack: () => void;
  onBookingSuccess: (appointmentData: any) => void;
}

export const BookingScreen: React.FC<BookingScreenProps> = ({
  doctor,
  currentUser,
  onBack,
  onBookingSuccess,
}) => {
  // Generate the next 7 days for quick date picking
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    return { dateStr, dayName, dayNumber, month };
  });

  const [selectedDate, setSelectedDate] = useState<string>(dates[0].dateStr);
  const [slots, setSlots] = useState<{ time: string; period: string; isAvailable: boolean }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [consultationType, setConsultationType] = useState<'in-person' | 'tele-consult'>('in-person');
  const [symptoms, setSymptoms] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch slots whenever selectedDate changes
  useEffect(() => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    setErrorMessage(null);

    fetch(`/api/doctors/${doctor.id}/slots?date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        setSlots(data.slots || []);
        setLoadingSlots(false);
      })
      .catch(() => {
        setLoadingSlots(false);
      });
  }, [doctor.id, selectedDate]);

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setErrorMessage('Please pick an available time slot.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: currentUser.id,
          patientName: currentUser.name,
          patientPhone: currentUser.phone,
          patientEmail: currentUser.email,
          doctorId: doctor.id,
          date: selectedDate,
          timeSlot: selectedSlot,
          type: consultationType,
          symptoms,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Booking request failed');
      }

      // Trigger celebratory confetti effect
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (_) {}

      onBookingSuccess(data.appointment);
    } catch (err: any) {
      setErrorMessage(err.message || 'Slot conflict or network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const morningSlots = slots.filter((s) => s.period === 'morning');
  const afternoonSlots = slots.filter((s) => s.period === 'afternoon');
  const eveningSlots = slots.filter((s) => s.period === 'evening');

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Doctor Profile</span>
        </button>

        <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
          Step 1 of 2: Slot Selection
        </span>
      </div>

      {/* Doctor Summary Header Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={doctor.avatar}
            alt={doctor.name}
            className="w-12 h-12 rounded-2xl object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {doctor.name}
            </h3>
            <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold">
              {doctor.specialty}
            </p>
            <p className="text-[10px] text-slate-500">
              {doctor.hospitalName}, {doctor.city}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Consultation Fee</span>
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            ₹{doctor.consultationFee}
          </span>
        </div>
      </div>

      {/* Consultation Mode Selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Consultation Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setConsultationType('in-person')}
            className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              consultationType === 'in-person'
                ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Hospital OPD Visit</span>
          </button>

          <button
            type="button"
            onClick={() => setConsultationType('tele-consult')}
            className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
              consultationType === 'tele-consult'
                ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Secure Video Consult</span>
          </button>
        </div>
      </div>

      {/* Date Carousel */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Choose Date</span>
          <span className="text-sky-600 dark:text-sky-400 font-semibold">{selectedDate}</span>
        </label>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {dates.map((d) => (
            <button
              key={d.dateStr}
              type="button"
              onClick={() => setSelectedDate(d.dateStr)}
              className={`p-2.5 rounded-2xl min-w-[62px] flex flex-col items-center justify-center transition cursor-pointer ${
                selectedDate === d.dateStr
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-sky-300'
              }`}
            >
              <span className="text-[10px] font-medium uppercase opacity-80">{d.dayName}</span>
              <span className="text-base font-extrabold my-0.5">{d.dayNumber}</span>
              <span className="text-[10px] font-medium">{d.month}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Slot Selection Engine */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Available Time Slots
          </label>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
            ● Green = Available to Book
          </span>
        </div>

        {loadingSlots ? (
          <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
            <span>Checking doctor schedule and booked slots...</span>
          </div>
        ) : slots.length === 0 ? (
          <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-center text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <p className="font-bold">No slots available on this date.</p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400">
              The doctor is either off-duty or all consultation slots are fully reserved. Please pick another date.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Morning Slots */}
            {morningSlots.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 block">Morning Slots</span>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {morningSlots.map((s) => (
                    <button
                      key={s.time}
                      type="button"
                      disabled={!s.isAvailable}
                      onClick={() => setSelectedSlot(s.time)}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        !s.isAvailable
                          ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 line-through cursor-not-allowed opacity-50'
                          : selectedSlot === s.time
                          ? 'bg-sky-600 text-white shadow-md ring-2 ring-sky-400'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-sky-400'
                      }`}
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Afternoon Slots */}
            {afternoonSlots.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 block">Afternoon Slots</span>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {afternoonSlots.map((s) => (
                    <button
                      key={s.time}
                      type="button"
                      disabled={!s.isAvailable}
                      onClick={() => setSelectedSlot(s.time)}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        !s.isAvailable
                          ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 line-through cursor-not-allowed opacity-50'
                          : selectedSlot === s.time
                          ? 'bg-sky-600 text-white shadow-md ring-2 ring-sky-400'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-sky-400'
                      }`}
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Evening Slots */}
            {eveningSlots.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 block">Evening Slots</span>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {eveningSlots.map((s) => (
                    <button
                      key={s.time}
                      type="button"
                      disabled={!s.isAvailable}
                      onClick={() => setSelectedSlot(s.time)}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        !s.isAvailable
                          ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 line-through cursor-not-allowed opacity-50'
                          : selectedSlot === s.time
                          ? 'bg-sky-600 text-white shadow-md ring-2 ring-sky-400'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-sky-400'
                      }`}
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Patient Symptoms Note */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Reason for Visit / Symptoms (Optional)
        </label>
        <textarea
          rows={2}
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="e.g. Mild palpitations, fever since 2 days, routine blood pressure checkup..."
          className="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
        />
      </div>

      {/* Patient Contact Confirmation */}
      <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
        <span className="font-bold text-slate-700 dark:text-slate-300 block">Booking For:</span>
        <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
          <span>{currentUser.name}</span>
          <span>{currentUser.phone}</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Confirm Button */}
      <div className="pt-2">
        <button
          type="button"
          disabled={!selectedSlot || submitting}
          onClick={handleConfirmBooking}
          className="w-full py-3.5 px-4 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-sky-600/30 transition active:scale-98 cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Appointment (₹{doctor.consultationFee})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
