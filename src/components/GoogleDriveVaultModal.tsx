import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Folder,
  FileText,
  Image as ImageIcon,
  File,
  Upload,
  RefreshCw,
  Search,
  ExternalLink,
  Trash2,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  DownloadCloud,
  FileCheck,
  FolderPlus,
  LogOut,
} from 'lucide-react';
import {
  DriveFile,
  fetchDriveFiles,
  uploadFileToDrive,
  deleteDriveFile,
  createDriveFolder,
  getOrCreateMediAIVaultFolder,
} from '../lib/googleDriveService';
import {
  googleSignIn,
  isGoogleConnected,
  getGoogleUser,
  logoutGoogle,
  subscribeGoogleAuth,
} from '../lib/googleAuth';
import { GoogleSignInButton } from './GoogleSignInButton';
import { User as UserType } from '../types';

interface GoogleDriveVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
  onRecordImported?: () => void;
}

export const GoogleDriveVaultModal: React.FC<GoogleDriveVaultModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onRecordImported,
}) => {
  const [connected, setConnected] = useState(isGoogleConnected());
  const [googleUser, setGoogleUser] = useState(getGoogleUser());
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'documents' | 'images' | 'folders'>('all');
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [vaultFolderId, setVaultFolderId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New folder modal
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Explicit user confirmation modal for DESTRUCTIVE operation (MANDATORY REQUIREMENT)
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [deleting, setDeleting] = useState(false);

  // File upload input
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeGoogleAuth((u, token) => {
      setConnected(!!token && !!u);
      setGoogleUser(u);
    });
    return () => unsubscribe();
  }, []);

  const loadFiles = async () => {
    if (!isGoogleConnected()) return;
    setLoading(true);
    setStatusMessage(null);
    try {
      // Ensure Vault folder exists
      const vId = await getOrCreateMediAIVaultFolder();
      setVaultFolderId(vId);

      const targetFolder = currentFolderId ?? vId;
      const res = await fetchDriveFiles({
        folderId: targetFolder === 'all' ? undefined : targetFolder,
        searchQuery: searchQuery || undefined,
        categoryFilter,
      });
      setFiles(res.files);
    } catch (err: any) {
      console.error('Failed to load Google Drive files:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to access Google Drive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && connected) {
      loadFiles();
    }
  }, [isOpen, connected, currentFolderId, categoryFilter]);

  const handleConnect = async () => {
    setAuthLoading(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (!res) {
        // User closed or dismissed popup
        return;
      }
      setStatusMessage({ type: 'success', text: 'Connected to Google Drive successfully!' });
      loadFiles();
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.message?.includes('popup-closed-by-user')
      ) {
        return;
      }
      setStatusMessage({ type: 'error', text: err.message || 'Google sign-in was cancelled or failed.' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await logoutGoogle();
    setFiles([]);
    setStatusMessage({ type: 'success', text: 'Disconnected from Google Drive.' });
  };

  // Upload local file to Drive
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatusMessage(null);
    try {
      const folder = currentFolderId && currentFolderId !== 'all' ? currentFolderId : (vaultFolderId || undefined);
      await uploadFileToDrive({
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        content: file,
        folderId: folder,
        description: `Uploaded from Medi AI Patient Vault by ${currentUser.name}`,
      });
      setStatusMessage({ type: 'success', text: `"${file.name}" uploaded to Google Drive!` });
      loadFiles();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'File upload failed.' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Create new folder
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const parent = currentFolderId && currentFolderId !== 'all' ? currentFolderId : vaultFolderId;
      await createDriveFolder(newFolderName.trim(), parent || undefined);
      setNewFolderName('');
      setShowCreateFolderModal(false);
      setStatusMessage({ type: 'success', text: `Folder "${newFolderName}" created in Google Drive.` });
      loadFiles();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Could not create folder' });
    }
  };

  // Import Drive file directly into Medi AI Medical Records Vault
  const handleImportToMedicalRecords = async (file: DriveFile) => {
    try {
      let inferredCat: any = 'Lab Report';
      const lower = file.name.toLowerCase();
      if (lower.includes('rx') || lower.includes('prescript')) inferredCat = 'Prescription';
      else if (lower.includes('xray') || lower.includes('scan') || lower.includes('mri') || lower.includes('ct'))
        inferredCat = 'X-Ray / Scan';
      else if (lower.includes('discharge')) inferredCat = 'Discharge Summary';

      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: currentUser.id,
          title: file.name.replace(/\.[^/.]+$/, ''),
          category: inferredCat,
          date: file.createdTime ? file.createdTime.split('T')[0] : new Date().toISOString().split('T')[0],
          fileSize: file.size || 'Google Drive File',
          fileType: file.mimeType.includes('pdf') ? 'PDF Document' : 'Google Drive Document',
          doctorOrLab: 'Imported from Google Drive',
          notes: `Stored in Google Drive (ID: ${file.id}). Web preview: ${file.webViewLink || 'Available in Drive'}`,
        }),
      });

      if (res.ok) {
        setStatusMessage({
          type: 'success',
          text: `"${file.name}" successfully imported into your Medical Records Vault!`,
        });
        if (onRecordImported) onRecordImported();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Failed to import record into local vault.' });
    }
  };

  // Confirm delete (MANDATORY per workspace skill)
  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    setDeleting(true);
    try {
      await deleteDriveFile(fileToDelete.id);
      setStatusMessage({ type: 'success', text: `Deleted "${fileToDelete.name}" from Google Drive.` });
      setFileToDelete(null);
      loadFiles();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Could not delete file from Google Drive' });
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-600 via-sky-700 to-teal-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight">Google Drive Health Vault</h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                  Workspace 1P
                </span>
              </div>
              <p className="text-xs text-sky-100">
                Securely store, synchronize & import patient medical files
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div
            className={`px-4 py-2.5 text-xs flex items-center justify-between ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-b border-emerald-200 dark:border-emerald-900'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-b border-rose-200 dark:border-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Connection View / Files View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {!connected ? (
            /* Disconnected State - Official Sign in with Google */
            <div className="py-8 px-4 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center shadow-inner">
                <HardDrive className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Connect Google Drive to Medi AI
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Connect your Google Drive with permission to securely synchronize, store, and organize your blood test reports, MRI scans, and verified prescriptions inside your private <strong>Medi AI - Health Vault</strong> folder.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-500" />
                  <span>Google Workspace Features</span>
                </span>
                <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 list-disc list-inside">
                  <li>Automatic creation of dedicated <strong>"Medi AI - Health Vault"</strong> in Google Drive</li>
                  <li>Instant backup for Doctor Prescriptions & Hospital Passes</li>
                  <li>Import diagnostic PDFs & scans from Drive into medical vault</li>
                  <li>Protected by Google OAuth token encryption</li>
                </ul>
              </div>

              <div className="pt-2">
                <GoogleSignInButton
                  onClick={handleConnect}
                  loading={authLoading}
                  text="Sign in with Google to Connect Drive"
                />
              </div>
            </div>
          ) : (
            /* Connected State - Full Google Drive Explorer */
            <>
              {/* Account Ribbon */}
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  {googleUser?.photoURL ? (
                    <img
                      src={googleUser.photoURL}
                      alt={googleUser.displayName || 'Google Account'}
                      className="w-8 h-8 rounded-full border border-slate-300 shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs">
                      {googleUser?.displayName?.charAt(0) || 'G'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {googleUser?.displayName || 'Google Account'}
                      </span>
                      <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                        Connected
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {googleUser?.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (fileInputRef.current) fileInputRef.current.click();
                    }}
                    disabled={uploading}
                    className="py-1.5 px-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                    title="Upload file to Google Drive"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  <button
                    onClick={() => setShowCreateFolderModal(true)}
                    className="p-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                    title="New Folder"
                  >
                    <FolderPlus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={loadFiles}
                    className="p-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                    title="Refresh Files"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
                  </button>

                  <button
                    onClick={handleDisconnect}
                    className="p-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Disconnect Google Drive"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Folder & Search Bar */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadFiles()}
                    placeholder="Search Google Drive medical files..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
                  <button
                    onClick={() => setCurrentFolderId(vaultFolderId || undefined)}
                    className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap cursor-pointer transition ${
                      currentFolderId === vaultFolderId || (!currentFolderId && vaultFolderId)
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    🏥 Health Vault
                  </button>
                  <button
                    onClick={() => setCurrentFolderId('all')}
                    className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap cursor-pointer transition ${
                      currentFolderId === 'all'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    📂 All Drive
                  </button>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 text-[11px]">
                {(['all', 'documents', 'images', 'folders'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg capitalize font-medium transition cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* File List */}
              <div className="space-y-2">
                {loading ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Fetching Google Drive files...</span>
                  </div>
                ) : files.length === 0 ? (
                  <div className="py-12 text-center space-y-2 bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
                    <Folder className="w-10 h-10 text-slate-400 mx-auto" />
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      No files found in this folder
                    </h5>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Use the "Upload" button above or export your prescriptions and lab reports directly to this Google Drive folder.
                    </p>
                  </div>
                ) : (
                  files.map((file) => {
                    const isPdf = file.mimeType.includes('pdf');
                    const isImg = file.mimeType.includes('image');
                    const isFld = file.isFolder;

                    return (
                      <div
                        key={file.id}
                        className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-sky-300 dark:hover:border-sky-600 transition flex items-center justify-between gap-3 text-xs"
                      >
                        <div
                          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                          onClick={() => {
                            if (isFld) {
                              setCurrentFolderId(file.id);
                            } else if (file.webViewLink) {
                              window.open(file.webViewLink, '_blank');
                            }
                          }}
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isFld
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                                : isPdf
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                                : isImg
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300'
                                : 'bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300'
                            }`}
                          >
                            {isFld ? (
                              <Folder className="w-4 h-4" />
                            ) : isPdf ? (
                              <FileText className="w-4 h-4" />
                            ) : isImg ? (
                              <ImageIcon className="w-4 h-4" />
                            ) : (
                              <File className="w-4 h-4" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <span className="font-semibold text-slate-900 dark:text-white block truncate">
                              {file.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {file.isFolder
                                ? 'Folder'
                                : `${file.size || 'Document'} • ${
                                    file.modifiedTime ? file.modifiedTime.split('T')[0] : 'Recent'
                                  }`}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {!isFld && (
                            <button
                              onClick={() => handleImportToMedicalRecords(file)}
                              className="px-2 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[11px] font-bold flex items-center gap-1 hover:bg-teal-100 transition cursor-pointer"
                              title="Import to Medi AI Medical Vault"
                            >
                              <DownloadCloud className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Import</span>
                            </button>
                          )}

                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                              title="Open in Google Drive"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => setFileToDelete(file)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                            title="Delete from Google Drive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Google Drive API v3 • Direct OAuth 2.0 In-Memory Session</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-sky-600" />
              <span>New Google Drive Folder</span>
            </h4>
            <form onSubmit={handleCreateFolder} className="space-y-3 text-xs">
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Diagnostic Scans 2026"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateFolderModal(false)}
                  className="px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mandatory User Confirmation Dialog for Destructive Operation */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-xs">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Delete from Google Drive?
              </h4>
              <p className="text-slate-500 dark:text-slate-400">
                Are you sure you want to delete <strong className="text-slate-900 dark:text-white">"{fileToDelete.name}"</strong> from your Google Drive? This action cannot be undone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={deleting}
                className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteFile}
                disabled={deleting}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition cursor-pointer shadow-md shadow-rose-600/25 flex items-center justify-center gap-1"
              >
                {deleting ? 'Deleting...' : 'Delete File'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
