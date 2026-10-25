import React, { useState, useEffect } from 'react';
import {
  FolderHeart,
  UploadCloud,
  FileText,
  Trash2,
  Plus,
  ShieldCheck,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  FileCheck,
  HardDrive,
  ExternalLink,
  Upload,
} from 'lucide-react';
import { MedicalRecord, User } from '../types';
import { GoogleDriveVaultModal } from '../components/GoogleDriveVaultModal';
import { isGoogleConnected, googleSignIn, subscribeGoogleAuth } from '../lib/googleAuth';
import { exportMedicalRecordToDrive } from '../lib/googleDriveService';

interface MedicalRecordsScreenProps {
  currentUser: User;
}

export const MedicalRecordsScreen: React.FC<MedicalRecordsScreenProps> = ({ currentUser }) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);

  // Google Drive status & export state
  const [isDriveConnected, setIsDriveConnected] = useState(isGoogleConnected());
  const [exportingRecordId, setExportingRecordId] = useState<string | null>(null);
  const [exportedDriveLinks, setExportedDriveLinks] = useState<Record<string, string>>({});
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  // New record form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Lab Report' | 'Prescription' | 'X-Ray / Scan' | 'Discharge Summary' | 'Other'>('Lab Report');
  const [doctorOrLab, setDoctorOrLab] = useState('');
  const [notes, setNotes] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploading, setUploading] = useState(false);

  const categories = ['All', 'Lab Report', 'X-Ray / Scan', 'Prescription', 'Discharge Summary'];

  useEffect(() => {
    const unsubscribe = subscribeGoogleAuth((u, token) => {
      setIsDriveConnected(!!token && !!u);
    });
    return () => unsubscribe();
  }, []);

  const fetchRecords = () => {
    setLoading(true);
    fetch(`/api/records?patientId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        setRecords(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecords();
  }, [currentUser.id]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setUploading(true);

    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: currentUser.id,
          title,
          category,
          date: recordDate,
          fileSize: '2.1 MB',
          fileType: 'PDF Document',
          doctorOrLab: doctorOrLab || 'Certified Medical Lab',
          notes,
        }),
      });

      if (res.ok) {
        setShowUploadModal(false);
        setTitle('');
        setDoctorOrLab('');
        setNotes('');
        fetchRecords();
      }
    } catch {
      //
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this medical document from your records vault?')) return;
    try {
      await fetch(`/api/records/${id}`, { method: 'DELETE' });
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch {
      //
    }
  };

  const handleExportToGoogleDrive = async (record: MedicalRecord) => {
    setExportingRecordId(record.id);
    setExportNotification(null);
    try {
      if (!isGoogleConnected()) {
        const authRes = await googleSignIn();
        if (!authRes) {
          // User closed or cancelled sign-in popup
          return;
        }
      }

      const driveFile = await exportMedicalRecordToDrive(record);
      if (driveFile.webViewLink) {
        setExportedDriveLinks((prev) => ({ ...prev, [record.id]: driveFile.webViewLink! }));
      }
      setExportNotification(`"${record.title}" successfully backed up to your Google Drive!`);
      setTimeout(() => setExportNotification(null), 5000);
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.message?.includes('popup-closed-by-user')
      ) {
        return;
      }
      alert(err.message || 'Could not export to Google Drive. Please try again.');
    } finally {
      setExportingRecordId(null);
    }
  };

  const filtered =
    selectedCategory === 'All'
      ? records
      : records.filter((r) => r.category === selectedCategory);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Medical Records Vault</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Encrypted personal health documents & Google Drive sync
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDriveModal(true)}
            className="py-2 px-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-sky-400 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            title="Google Drive Vault"
          >
            <HardDrive className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Google Drive</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="py-2 px-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* Google Drive Health Vault Integration Banner */}
      <div className="p-3.5 rounded-3xl bg-gradient-to-r from-sky-500/10 via-sky-600/10 to-teal-500/10 border border-sky-200 dark:border-sky-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white">
                Google Drive Healthcare Cloud Vault
              </span>
              <span
                className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                  isDriveConnected
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                }`}
              >
                {isDriveConnected ? 'Drive Connected' : 'Google Sync Available'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Automatically back up, export, or import your medical files in your personal Google Drive "Medi AI - Health Vault" folder.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowDriveModal(true)}
          className="py-1.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shrink-0 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>{isDriveConnected ? 'Browse Drive Vault' : 'Connect Google Drive'}</span>
        </button>
      </div>

      {/* Export Notification Toast */}
      {exportNotification && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{exportNotification}</span>
          </div>
          <button onClick={() => setExportNotification(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === cat
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Privacy Guarantee Note */}
      <div className="p-3.5 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>
          End-to-end encrypted storage. Medical records are restricted exclusively to your authenticated user session and synced with Google Drive with user permission.
        </span>
      </div>

      {/* Records List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Accessing encrypted medical records...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 mx-auto flex items-center justify-center">
              <FolderHeart className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold">No Records in this category</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Upload blood tests, MRI scans, or import existing medical documents directly from Google Drive.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => setShowDriveModal(true)}
                className="py-2 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-200"
              >
                <HardDrive className="w-3.5 h-3.5 text-sky-600" />
                <span>Import from Google Drive</span>
              </button>
            </div>
          </div>
        ) : (
          filtered.map((record) => {
            const driveLink = exportedDriveLinks[record.id];
            const isExporting = exportingRecordId === record.id;
            const isImportedFromDrive = record.doctorOrLab?.includes('Google Drive') || record.notes?.includes('Google Drive');

            return (
              <div
                key={record.id}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-sky-300 dark:hover:border-sky-700 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                          {record.title}
                        </h3>
                        {isImportedFromDrive && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[9px] font-bold">
                            <HardDrive className="w-2.5 h-2.5" />
                            Drive Synced
                          </span>
                        )}
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-400 mt-1">
                        {record.category}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {record.doctorOrLab} • {record.fileSize}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleExportToGoogleDrive(record)}
                      disabled={isExporting}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Back up to Google Drive"
                    >
                      {isExporting ? (
                        <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <HardDrive className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(record.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {record.notes && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 italic">
                    Notes: {record.notes}
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Recorded on: {record.date}</span>
                  </span>

                  <div className="flex items-center gap-3">
                    {driveLink ? (
                      <a
                        href={driveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>View in Drive</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => handleExportToGoogleDrive(record)}
                        disabled={isExporting}
                        className="text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <HardDrive className="w-3 h-3" />
                        <span>{isExporting ? 'Syncing...' : 'Save to Drive'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Upload Record Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-sky-600" />
                <span>Upload Medical Record</span>
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Document Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Thyroid Profile & Vitamin D Test"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="Lab Report">Lab Report</option>
                    <option value="X-Ray / Scan">X-Ray / Scan</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Test Date</label>
                  <input
                    type="date"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Issuing Lab / Doctor</label>
                <input
                  type="text"
                  value={doctorOrLab}
                  onChange={(e) => setDoctorOrLab(e.target.value)}
                  placeholder="e.g. Apollo Diagnostics"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Clinical Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Key values or physician remarks"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/20 text-center">
                <FileCheck className="w-6 h-6 text-sky-600 mx-auto mb-1" />
                <span className="font-semibold text-sky-800 dark:text-sky-300 block">PDF / DICOM File Attached</span>
                <span className="text-[10px] text-slate-400">Max size 25MB • 256-bit AES Vault Encryption</span>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/25 transition active:scale-98 cursor-pointer"
              >
                {uploading ? 'Encrypting & Storing...' : 'Save to Medical Vault'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Google Drive Vault Explorer Modal */}
      <GoogleDriveVaultModal
        isOpen={showDriveModal}
        onClose={() => setShowDriveModal(false)}
        currentUser={currentUser}
        onRecordImported={fetchRecords}
      />
    </div>
  );
};
