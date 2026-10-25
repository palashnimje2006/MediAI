import React, { useState } from 'react';
import {
  PenTool,
  Plus,
  Trash2,
  FileCheck2,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Pill,
} from 'lucide-react';
import { PrescriptionItem, User, Appointment } from '../types';

interface PrescriptionCreationScreenProps {
  currentUser: User;
  targetAppointment?: Appointment;
  onBack: () => void;
  onSuccess: (prescription: any) => void;
}

export const PrescriptionCreationScreen: React.FC<PrescriptionCreationScreenProps> = ({
  currentUser,
  targetAppointment,
  onBack,
  onSuccess,
}) => {
  const [patientName, setPatientName] = useState(targetAppointment?.patientName || 'Rahul Verma');
  const [patientAge, setPatientAge] = useState('30');
  const [patientGender, setPatientGender] = useState('Male');
  const [diagnosis, setDiagnosis] = useState('Upper Respiratory Tract Infection / Viral Pharyngitis');
  const [advice, setAdvice] = useState('Rest adequately, drink warm liquids, avoid chilled beverages. If fever rises over 101°F, report to casualty.');
  const [followUpDate, setFollowUpDate] = useState('2026-10-29');

  const [items, setItems] = useState<PrescriptionItem[]>([
    {
      id: 'item-1',
      medicineName: 'Paracetamol 650mg (Dolo)',
      dosage: '650 mg',
      frequency: '1-0-1 (After food)',
      duration: '3 days',
      instructions: 'Take if fever or headache occurs',
    },
    {
      id: 'item-2',
      medicineName: 'Cetirizine 10mg',
      dosage: '10 mg',
      frequency: '0-0-1 (Bedtime)',
      duration: '5 days',
      instructions: 'May cause mild drowsiness',
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddItem = () => {
    const newItem: PrescriptionItem = {
      id: `item-${Date.now()}`,
      medicineName: '',
      dosage: '500 mg',
      frequency: '1-0-1 (After food)',
      duration: '5 days',
      instructions: 'As advised',
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof PrescriptionItem, val: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: val } : item)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis || items.length === 0) {
      setError('Please provide diagnosis and at least one medication item.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: targetAppointment?.id || `MEDI-${Date.now()}`,
          patientId: targetAppointment?.patientId || 'user-pat-01',
          patientName,
          patientAge: Number(patientAge),
          patientGender,
          doctorId: 'doc-01', // Using current doctor id
          diagnosis,
          items,
          advice,
          followUpDate,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to issue prescription');
      }

      onSuccess(data.prescription);
    } catch (err: any) {
      setError(err.message || 'Error publishing digital prescription.');
    } finally {
      setSubmitting(false);
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
          <span>Back</span>
        </button>

        <span className="text-[11px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-full border border-teal-200">
          Digital Rx Generator
        </span>
      </div>

      <div>
        <h2 className="text-xl font-extrabold tracking-tight">Issue Digital Prescription</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Create legally signed electronic prescription with NMC compliance
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Patient Details */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Patient Identity
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="space-y-1 sm:col-span-1">
              <span className="text-slate-400">Patient Name</span>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              />
            </div>
            <div className="space-y-1">
              <span className="text-slate-400">Age</span>
              <input
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="space-y-1">
              <span className="text-slate-400">Gender</span>
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <label className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Clinical / Provisional Diagnosis *
          </label>
          <input
            type="text"
            required
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="e.g. Acute Bronchitis, Type-2 Diabetes Mellitus"
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white"
          />
        </div>

        {/* Dynamic Medications Table (Rx) */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-sky-500" />
              <span>Rx Medications ({items.length})</span>
            </label>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold text-xs flex items-center gap-1 hover:bg-teal-100 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Medicine</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-400 text-[10px]">Medicine #{idx + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Medicine Name (e.g. Amoxicillin 500mg)"
                    value={item.medicineName}
                    onChange={(e) => handleItemChange(item.id, 'medicineName', e.target.value)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Dosage (e.g. 500 mg, 1 tablet)"
                    value={item.dosage}
                    onChange={(e) => handleItemChange(item.id, 'dosage', e.target.value)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Frequency (1-0-1)"
                    value={item.frequency}
                    onChange={(e) => handleItemChange(item.id, 'frequency', e.target.value)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    placeholder="Duration (5 days)"
                    value={item.duration}
                    onChange={(e) => handleItemChange(item.id, 'duration', e.target.value)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    placeholder="Instructions"
                    value={item.instructions}
                    onChange={(e) => handleItemChange(item.id, 'instructions', e.target.value)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Advice & Follow-up */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              General Advice & Lifestyle Instructions
            </label>
            <textarea
              rows={2}
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Follow-Up Review Date
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl shadow-teal-600/30 transition active:scale-98 cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Digitally Sign & Issue Prescription</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
