import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  Save,
  ArrowLeft,
  Coffee,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { Doctor, DoctorSchedule, User } from '../types';

interface DoctorAvailabilityScreenProps {
  currentUser: User;
  onBack: () => void;
}

export const DoctorAvailabilityScreen: React.FC<DoctorAvailabilityScreenProps> = ({
  currentUser,
  onBack,
}) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [workingDays, setWorkingDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [startHour, setStartHour] = useState('09:00');
  const [endHour, setEndHour] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState<number>(30);
  const [breakStart, setBreakStart] = useState('13:00');
  const [breakEnd, setBreakEnd] = useState('14:00');
  const [leaveDates, setLeaveDates] = useState<string[]>([]);
  const [newLeaveDate, setNewLeaveDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    fetch('/api/doctors')
      .then((res) => res.json())
      .then((docs: Doctor[]) => {
        const doc = docs.find((d) => d.name === currentUser.name || d.userId === currentUser.id) || docs[0];
        setDoctor(doc);
        if (doc && doc.schedule) {
          setWorkingDays(doc.schedule.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
          setStartHour(doc.schedule.startHour || '09:00');
          setEndHour(doc.schedule.endHour || '17:00');
          setSlotDuration(doc.schedule.slotDurationMinutes || 30);
          setBreakStart(doc.schedule.breakStart || '13:00');
          setBreakEnd(doc.schedule.breakEnd || '14:00');
          setLeaveDates(doc.schedule.leaveDates || []);
        }
      })
      .catch(() => {});
  }, [currentUser]);

  const toggleDay = (day: string) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleAddLeave = () => {
    if (newLeaveDate && !leaveDates.includes(newLeaveDate)) {
      setLeaveDates([...leaveDates, newLeaveDate]);
      setNewLeaveDate('');
    }
  };

  const handleRemoveLeave = (dateStr: string) => {
    setLeaveDates(leaveDates.filter((d) => d !== dateStr));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/doctors/${doctor.id}/schedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workingDays,
          startHour,
          endHour,
          slotDurationMinutes: slotDuration,
          breakStart,
          breakEnd,
          leaveDates,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch {
      //
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <span className="text-[11px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded-full">
          Schedule Manager
        </span>
      </div>

      <div>
        <h2 className="text-xl font-extrabold tracking-tight">Availability & Slots</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Set your consultation working hours, slot lengths, and planned leave
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Doctor availability schedule successfully updated and synced with live patient bookings!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Working Days */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Weekly Working Days
          </label>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map((day) => {
              const active = workingDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`py-2 px-3.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                    active
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Start / End Hours */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Daily OPD Consultation Hours
          </label>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Shift Start Hour</span>
              <input
                type="time"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
              />
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Shift End Hour</span>
              <input
                type="time"
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
              />
            </div>
          </div>

          {/* Slot Duration */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <span className="text-slate-400 text-xs font-medium block">Appointment Slot Duration</span>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[15, 20, 30, 45].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setSlotDuration(mins)}
                  className={`py-2 rounded-xl font-bold transition cursor-pointer ${
                    slotDuration === mins
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {mins} Mins
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Break Hours */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
            <Coffee className="w-4 h-4 text-amber-500" />
            <span>Lunch / Break Interval (Excluded from booking)</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-slate-400">Break Start</span>
              <input
                type="time"
                value={breakStart}
                onChange={(e) => setBreakStart(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
              />
            </div>
            <div className="space-y-1">
              <span className="text-slate-400">Break End</span>
              <input
                type="time"
                value={breakEnd}
                onChange={(e) => setBreakEnd(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Planned Leave Dates */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
          <label className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Planned Holidays & Off Dates
          </label>

          <div className="flex gap-2">
            <input
              type="date"
              value={newLeaveDate}
              onChange={(e) => setNewLeaveDate(e.target.value)}
              className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
            />
            <button
              type="button"
              onClick={handleAddLeave}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 text-white font-bold flex items-center gap-1 cursor-pointer hover:bg-slate-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {leaveDates.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {leaveDates.map((ld) => (
                <div
                  key={ld}
                  className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-medium flex items-center gap-1.5"
                >
                  <span>{ld}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLeave(ld)}
                    className="text-rose-600 hover:text-rose-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 px-4 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl shadow-sky-600/30 transition active:scale-98 cursor-pointer"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Publish Live Availability</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
