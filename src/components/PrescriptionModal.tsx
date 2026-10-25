import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  FileCheck,
  HardDrive,
  ExternalLink,
} from 'lucide-react';
import { Prescription } from '../types';
import { isGoogleConnected, googleSignIn } from '../lib/googleAuth';
import { exportPrescriptionToDrive } from '../lib/googleDriveService';

interface PrescriptionModalProps {
  prescription: Prescription | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  prescription,
  isOpen,
  onClose,
}) => {
  const [savingToDrive, setSavingToDrive] = useState(false);
  const [driveSavedLink, setDriveSavedLink] = useState<string | null>(null);
  const [driveNotification, setDriveNotification] = useState<string | null>(null);

  if (!isOpen || !prescription) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Prescription ${prescription.id}`,
          text: `Digital Prescription for ${prescription.patientName} from ${prescription.doctorName}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `Medi AI Digital Prescription #${prescription.id} for ${prescription.patientName} issued by ${prescription.doctorName} (${prescription.doctorLicense}) on ${prescription.date}`
      );
      alert('Prescription summary copied to clipboard!');
    }
  };

  const handleSaveToDrive = async () => {
    setSavingToDrive(true);
    setDriveNotification(null);
    try {
      if (!isGoogleConnected()) {
        const res = await googleSignIn();
        if (!res) return;
      }

      const file = await exportPrescriptionToDrive(prescription);
      if (file.webViewLink) {
        setDriveSavedLink(file.webViewLink);
      }
      setDriveNotification('Prescription saved to your Google Drive "Medi AI - Health Vault" folder!');
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.message?.includes('popup-closed-by-user')
      ) {
        return;
      }
      alert(err.message || 'Failed to save to Google Drive.');
    } finally {
      setSavingToDrive(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900 border border-slate-200">
        {/* Action Header */}
        <div className="no-print px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <span className="text-sm font-bold">Authorized Digital Prescription</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToDrive}
              disabled={savingToDrive}
              className="py-1.5 px-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Save to Google Drive"
            >
              {savingToDrive ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <HardDrive className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Save to Google Drive</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              title="Print Prescription"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Google Drive Status Notification */}
        {driveNotification && (
          <div className="no-print bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{driveNotification}</span>
            </div>
            {driveSavedLink && (
              <a
                href={driveSavedLink}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>Open in Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {/* Printable Prescription Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-white text-slate-900 print:p-0">
          {/* Hospital & Doctor Header */}
          <div className="border-b-2 border-sky-600 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sky-700 font-extrabold text-xl tracking-tight">
                <span className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs">M+</span>
                <span>Medi AI Healthcare Network</span>
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">{prescription.hospitalName}</p>
              <p className="text-[11px] text-slate-500">Accredited Multi-Specialty Clinical Center</p>
            </div>

            <div className="text-left sm:text-right">
              <h3 className="text-base font-bold text-slate-900">{prescription.doctorName}</h3>
              <p className="text-xs font-medium text-sky-700">{prescription.doctorSpecialty}</p>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                Reg / NMC Lic: {prescription.doctorLicense}
              </p>
            </div>
          </div>

          {/* Patient Details & Prescription Meta */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Patient Name</span>
              <span className="font-bold text-slate-800 text-sm">{prescription.patientName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Age / Gender</span>
              <span className="font-semibold text-slate-800">
                {prescription.patientAge ? `${prescription.patientAge} Yrs` : '28 Yrs'} /{' '}
                {prescription.patientGender || 'Unspecified'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Date of Issue</span>
              <span className="font-semibold text-slate-800">{prescription.date}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Prescription ID</span>
              <span className="font-mono font-bold text-sky-700">{prescription.id}</span>
            </div>
          </div>

          {/* Clinical Diagnosis */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>Provisional / Clinical Diagnosis</span>
            </h4>
            <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100 text-sm font-semibold text-sky-950">
              {prescription.diagnosis}
            </div>
          </div>

          {/* Medications Table (Rx) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-serif italic text-2xl font-black text-sky-700">Rx</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Prescribed Medications
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Medicine Name & Form</th>
                    <th className="py-2.5 px-3">Dosage</th>
                    <th className="py-2.5 px-3">Frequency</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prescription.items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{item.medicineName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{item.dosage}</td>
                      <td className="py-2.5 px-3 text-slate-700">{item.frequency}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">{item.duration}</td>
                      <td className="py-2.5 px-3 text-slate-600 italic">{item.instructions || 'As advised'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Doctor Advice & Follow-up */}
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Clinical Advice & Lifestyle Instructions
              </h4>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                {prescription.advice}
              </p>
            </div>

            {prescription.followUpDate && (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <span className="text-slate-400">Next Follow-up Review:</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                  {prescription.followUpDate}
                </span>
              </div>
            )}
          </div>

          {/* Digital Signature & Footer Seal */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="text-[11px] text-slate-400 max-w-sm">
              <p className="flex items-center gap-1 text-emerald-600 font-semibold mb-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Digitally Signed & Timestamped</span>
              </p>
              <p className="font-mono text-[10px] truncate text-slate-400">
                Hash: {prescription.digitalSignature}
              </p>
              <p className="mt-1">
                Valid as per Information Technology Act, 2000 and National Medical Commission (NMC) Telemedicine Practice Guidelines.
              </p>
            </div>

            <div className="text-right">
              <div className="h-10 border-b border-dashed border-slate-400 mb-1 flex items-end justify-end">
                <span className="font-serif italic text-sm text-sky-800 font-bold">
                  {prescription.doctorName}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800">Authorized Medical Practitioner</p>
              <p className="text-[10px] text-slate-500">{prescription.hospitalName}</p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="no-print px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <button
            onClick={handleSaveToDrive}
            disabled={savingToDrive}
            className="flex items-center gap-1.5 font-bold text-sky-700 hover:text-sky-800 cursor-pointer"
          >
            <HardDrive className="w-4 h-4 text-sky-600" />
            <span>{savingToDrive ? 'Backing up to Drive...' : 'Export to Google Drive'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
