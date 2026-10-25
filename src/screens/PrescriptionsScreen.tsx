import React, { useState, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  Calendar,
  Download,
  Share2,
  Printer,
  ChevronRight,
  Stethoscope,
  Pill,
  RefreshCw,
  HardDrive,
  CheckCircle2,
} from 'lucide-react';
import { Prescription, User } from '../types';
import { exportPrescriptionToDrive } from '../lib/googleDriveService';
import { isGoogleConnected, googleSignIn } from '../lib/googleAuth';
import { GoogleDriveVaultModal } from '../components/GoogleDriveVaultModal';

interface PrescriptionsScreenProps {
  currentUser: User;
  onOpenPrescriptionModal: (prescription: Prescription) => void;
  selectedPrescriptionId?: string;
}

export const PrescriptionsScreen: React.FC<PrescriptionsScreenProps> = ({
  currentUser,
  onOpenPrescriptionModal,
  selectedPrescriptionId,
}) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportedIds, setExportedIds] = useState<Record<string, boolean>>({});

  const fetchPrescriptions = () => {
    setLoading(true);
    fetch(`/api/prescriptions?patientId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        setPrescriptions(data);
        setLoading(false);
        if (selectedPrescriptionId) {
          const match = data.find((p: Prescription) => p.id === selectedPrescriptionId);
          if (match) onOpenPrescriptionModal(match);
        }
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [currentUser.id, selectedPrescriptionId]);

  const handleExportToDrive = async (e: React.MouseEvent, rx: Prescription) => {
    e.stopPropagation();
    setExportingId(rx.id);
    try {
      if (!isGoogleConnected()) {
        const res = await googleSignIn();
        if (!res) return;
      }
      await exportPrescriptionToDrive(rx);
      setExportedIds((prev) => ({ ...prev, [rx.id]: true }));
      alert(`Prescription #${rx.id} successfully backed up to Google Drive Health Vault!`);
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.message?.includes('popup-closed-by-user')
      ) {
        return;
      }
      alert(err.message || 'Could not export prescription to Google Drive.');
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Digital Prescriptions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            NMC verified electronic prescriptions & pharmacy orders
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowDriveModal(true)}
            className="py-1.5 px-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-sky-400 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Google Drive Vault"
          >
            <HardDrive className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span className="hidden sm:inline">Drive Vault</span>
          </button>

          <button
            onClick={fetchPrescriptions}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Verified Notice */}
      <div className="p-3.5 rounded-3xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/50 flex items-center gap-3 text-xs text-teal-900 dark:text-teal-300">
        <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
        <span className="leading-snug">
          All digital prescriptions are signed with a tamper-proof cryptographic audit hash and can be archived directly to Google Drive.
        </span>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Fetching prescription documents...</span>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold">No Prescriptions Issued Yet</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Once you complete an appointment with an authorized specialist, your official electronic prescription will appear here.
            </p>
          </div>
        ) : (
          prescriptions.map((rx) => {
            const isExporting = exportingId === rx.id;
            const isExported = exportedIds[rx.id];

            return (
              <div
                key={rx.id}
                onClick={() => onOpenPrescriptionModal(rx)}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 shadow-sm transition space-y-3 cursor-pointer group"
              >
                {/* Header */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded-md">
                    {rx.id}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{rx.date}</span>
                    </span>

                    <button
                      onClick={(e) => handleExportToDrive(e, rx)}
                      disabled={isExporting}
                      className="p-1 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Back up to Google Drive"
                    >
                      {isExporting ? (
                        <div className="w-3.5 h-3.5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                      ) : isExported ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <HardDrive className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Diagnosis & Doctor info */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition">
                    {rx.diagnosis}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5 text-teal-500" />
                    <span>{rx.doctorName} ({rx.doctorSpecialty})</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {rx.hospitalName} • Lic: {rx.doctorLicense}
                  </p>
                </div>

                {/* Medicines Summary Pill List */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                    <Pill className="w-3 h-3 text-sky-500" />
                    <span>Prescribed Medications ({rx.items.length})</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {rx.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                      >
                        {item.medicineName}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-teal-600 dark:text-teal-400 font-bold">
                  <span className="flex items-center gap-1">
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print & Download Official Copy</span>
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })
        )}
      </div>

      <GoogleDriveVaultModal
        isOpen={showDriveModal}
        onClose={() => setShowDriveModal(false)}
        currentUser={currentUser}
      />
    </div>
  );
};
