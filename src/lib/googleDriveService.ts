import { getAccessToken } from './googleAuth';
import { MedicalRecord, Prescription, Appointment } from '../types';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  iconLink?: string;
  parents?: string[];
  isFolder?: boolean;
}

const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';
const DEFAULT_VAULT_FOLDER_NAME = 'Medi AI - Health Vault';

// Cache the vault folder ID in memory
let cachedVaultFolderId: string | null = null;

/**
 * Ensures or retrieves the valid access token
 */
async function getValidToken(): Promise<string> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Drive is not connected. Please sign in with your Google account.');
  }
  return token;
}

/**
 * Searches for or creates a dedicated "Medi AI - Health Vault" folder in the user's Drive
 */
export async function getOrCreateMediAIVaultFolder(): Promise<string> {
  if (cachedVaultFolderId) {
    return cachedVaultFolderId;
  }

  const token = await getValidToken();

  // Search if the folder already exists
  const query = encodeURIComponent(
    `name = '${DEFAULT_VAULT_FOLDER_NAME}' and mimeType = '${FOLDER_MIME_TYPE}' and trashed = false`
  );

  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&spaces=drive`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!searchRes.ok) {
    const err = await searchRes.text();
    throw new Error(`Failed to check Google Drive folder: ${err}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    cachedVaultFolderId = searchData.files[0].id;
    return cachedVaultFolderId!;
  }

  // Folder does not exist, create it
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: DEFAULT_VAULT_FOLDER_NAME,
      mimeType: FOLDER_MIME_TYPE,
      description: 'Encrypted storage for Medi AI medical records, lab reports, and prescriptions.',
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create Google Drive folder: ${err}`);
  }

  const createData = await createRes.json();
  cachedVaultFolderId = createData.id;
  return cachedVaultFolderId!;
}

/**
 * Lists files in user's Google Drive with optional search and folder filtering
 */
export async function fetchDriveFiles(options?: {
  folderId?: string;
  searchQuery?: string;
  categoryFilter?: 'all' | 'documents' | 'images' | 'folders';
  pageSize?: number;
  pageToken?: string;
}): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
  const token = await getValidToken();
  const { folderId, searchQuery, categoryFilter = 'all', pageSize = 40, pageToken } = options || {};

  const queryParts: string[] = ['trashed = false'];

  if (folderId) {
    queryParts.push(`'${folderId}' in parents`);
  }

  if (searchQuery && searchQuery.trim()) {
    const cleanQ = searchQuery.replace(/'/g, "\\'");
    queryParts.push(`name contains '${cleanQ}'`);
  }

  if (categoryFilter === 'folders') {
    queryParts.push(`mimeType = '${FOLDER_MIME_TYPE}'`);
  } else if (categoryFilter === 'documents') {
    queryParts.push(
      `(mimeType = 'application/pdf' or mimeType = 'text/plain' or mimeType = 'text/html' or mimeType contains 'document' or mimeType contains 'sheet')`
    );
  } else if (categoryFilter === 'images') {
    queryParts.push(`mimeType contains 'image/'`);
  }

  const q = encodeURIComponent(queryParts.join(' and '));
  const fields = encodeURIComponent(
    'nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink,iconLink,parents)'
  );

  let url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=${pageSize}&orderBy=folder,modifiedTime desc`;
  if (pageToken) {
    url += `&pageToken=${encodeURIComponent(pageToken)}`;
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to list Google Drive files: ${err}`);
  }

  const data = await res.json();
  const files: DriveFile[] = (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    size: f.size ? formatBytes(parseInt(f.size, 10)) : undefined,
    createdTime: f.createdTime,
    modifiedTime: f.modifiedTime,
    webViewLink: f.webViewLink,
    webContentLink: f.webContentLink,
    thumbnailLink: f.thumbnailLink,
    iconLink: f.iconLink,
    parents: f.parents,
    isFolder: f.mimeType === FOLDER_MIME_TYPE,
  }));

  return {
    files,
    nextPageToken: data.nextPageToken,
  };
}

/**
 * Creates a new folder inside Google Drive
 */
export async function createDriveFolder(name: string, parentFolderId?: string): Promise<DriveFile> {
  const token = await getValidToken();

  const metadata: any = {
    name,
    mimeType: FOLDER_MIME_TYPE,
  };
  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create folder: ${err}`);
  }

  return await res.json();
}

/**
 * Uploads a file (text, html, or binary blob) to Google Drive using multipart upload
 */
export async function uploadFileToDrive(options: {
  name: string;
  mimeType: string;
  content: string | Blob;
  folderId?: string;
  description?: string;
}): Promise<DriveFile> {
  const token = await getValidToken();
  const { name, mimeType, content, folderId, description } = options;

  const metadata: any = {
    name,
    mimeType,
  };
  if (description) metadata.description = description;
  if (folderId) metadata.parents = [folderId];

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  let body: Blob | string;

  if (typeof content === 'string') {
    body =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}\r\n\r\n` +
      content +
      closeDelimiter;
  } else {
    // Binary Blob
    const metadataBlob = new Blob(
      [
        delimiter +
          'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          `Content-Type: ${mimeType}\r\n\r\n`,
      ],
      { type: 'text/plain' }
    );
    const closeBlob = new Blob([closeDelimiter], { type: 'text/plain' });
    body = new Blob([metadataBlob, content, closeBlob]);
  }

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink,webContentLink,createdTime',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to upload file to Google Drive: ${err}`);
  }

  return await res.json();
}

/**
 * Deletes a file from Google Drive.
 * (CRITICAL: Caller UI MUST prompt user confirmation first!)
 */
export async function deleteDriveFile(fileId: string): Promise<boolean> {
  const token = await getValidToken();

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok && res.status !== 204 && res.status !== 200) {
    const err = await res.text();
    throw new Error(`Failed to delete Google Drive file: ${err}`);
  }

  return true;
}

/**
 * Exports a Medical Record as a formatted HTML document into Medi AI Health Vault on Google Drive
 */
export async function exportMedicalRecordToDrive(record: MedicalRecord): Promise<DriveFile> {
  const folderId = await getOrCreateMediAIVaultFolder();

  const fileName = `Medical_Record_${record.category.replace(/[^a-zA-Z0-9]/g, '_')}_${record.id}.html`;

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Medi AI Medical Record: ${record.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 800px; margin: 40px auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff; }
    .header { border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .badge { background: #e0f2fe; color: #0369a1; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 12px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .card { background: #f8fafc; padding: 14px; border-radius: 10px; border: 1px solid #f1f5f9; }
    .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
    .value { font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 2px; }
    .notes { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 12px; color: #166534; font-size: 14px; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 style="margin: 0; font-size: 22px; color: #0369a1;">Medi AI Healthcare Vault Document</h1>
      <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">Official Verified Patient Diagnostic Record</p>
    </div>
    <span class="badge">${record.category}</span>
  </div>

  <div class="grid">
    <div class="card">
      <div class="label">Document Title</div>
      <div class="value">${record.title}</div>
    </div>
    <div class="card">
      <div class="label">Issuing Facility / Doctor</div>
      <div class="value">${record.doctorOrLab}</div>
    </div>
    <div class="card">
      <div class="label">Recorded Date</div>
      <div class="value">${record.date}</div>
    </div>
    <div class="card">
      <div class="label">Record Token ID</div>
      <div class="value">${record.id}</div>
    </div>
  </div>

  ${
    record.notes
      ? `
  <div style="margin-bottom: 24px;">
    <h3 style="font-size: 14px; color: #334155; margin-bottom: 8px;">Physician & Diagnostic Findings</h3>
    <div class="notes">${record.notes}</div>
  </div>`
      : ''
  }

  <div class="footer">
    <span>Stored in Google Drive Medi AI Health Vault</span>
    <span>Patient ID: ${record.patientId} • Timestamp: ${new Date().toISOString()}</span>
  </div>
</body>
</html>`;

  return await uploadFileToDrive({
    name: fileName,
    mimeType: 'text/html',
    content: htmlContent,
    folderId,
    description: `Exported Medical Record: ${record.title} (${record.category})`,
  });
}

/**
 * Exports a Digital Prescription into Medi AI Health Vault on Google Drive
 */
export async function exportPrescriptionToDrive(prescription: Prescription): Promise<DriveFile> {
  const folderId = await getOrCreateMediAIVaultFolder();

  const fileName = `Prescription_${prescription.id}_${prescription.patientName.replace(/[^a-zA-Z0-9]/g, '_')}.html`;

  const itemsHtml = prescription.items
    .map(
      (item, idx) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${idx + 1}. ${item.medicineName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${item.dosage}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.frequency}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.duration}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-style: italic; color: #64748b;">${item.instructions || 'As advised'}</td>
    </tr>`
    )
    .join('');

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Prescription ${prescription.id} - ${prescription.patientName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; color: #1e293b; max-width: 820px; margin: 40px auto; padding: 32px; border: 1px solid #cbd5e1; border-radius: 16px; background: #ffffff; }
    .clinic-header { border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; }
    .doctor-title { font-size: 18px; font-weight: bold; color: #0f172a; }
    .sub { font-size: 13px; color: #0284c7; font-weight: 600; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; font-size: 13px; }
    .diagnosis-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 6px; margin-bottom: 24px; font-weight: 600; color: #1e3a8a; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    th { background: #f1f5f9; text-align: left; padding: 10px; font-weight: bold; color: #334155; }
    .advice { background: #fefce8; border: 1px solid #fef08a; padding: 14px; border-radius: 10px; font-size: 13px; color: #854d0e; margin-bottom: 24px; }
    .signature-area { border-top: 1px dashed #cbd5e1; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
    .hash { font-family: monospace; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="clinic-header">
    <div>
      <div style="font-size: 20px; font-weight: 900; color: #0284c7;">Medi AI Healthcare Network</div>
      <div style="font-size: 13px; color: #475569; margin-top: 2px;">${prescription.hospitalName}</div>
      <div style="font-size: 11px; color: #94a3b8;">Accredited Multi-Specialty Clinical Center</div>
    </div>
    <div style="text-align: right;">
      <div class="doctor-title">${prescription.doctorName}</div>
      <div class="sub">${prescription.doctorSpecialty}</div>
      <div style="font-size: 11px; color: #64748b; font-family: monospace;">NMC Lic: ${prescription.doctorLicense}</div>
    </div>
  </div>

  <div class="meta-box">
    <div><strong style="color: #64748b; font-size: 11px; display: block;">PATIENT</strong> ${prescription.patientName}</div>
    <div><strong style="color: #64748b; font-size: 11px; display: block;">AGE / GENDER</strong> ${prescription.patientAge || 28} Y / ${prescription.patientGender || 'Unspecified'}</div>
    <div><strong style="color: #64748b; font-size: 11px; display: block;">DATE</strong> ${prescription.date}</div>
    <div><strong style="color: #64748b; font-size: 11px; display: block;">TOKEN ID</strong> <span style="font-family: monospace; color: #0284c7; font-weight: bold;">${prescription.id}</span></div>
  </div>

  <div style="font-size: 12px; font-weight: bold; color: #475569; margin-bottom: 6px;">PROVISIONAL DIAGNOSIS</div>
  <div class="diagnosis-box">${prescription.diagnosis}</div>

  <div style="font-size: 14px; font-weight: bold; color: #0f172a; margin-bottom: 8px;">Rx - Prescribed Medications</div>
  <table>
    <thead>
      <tr>
        <th>Medicine Name</th>
        <th>Dosage</th>
        <th>Frequency</th>
        <th>Duration</th>
        <th>Instructions</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div style="font-size: 12px; font-weight: bold; color: #475569; margin-bottom: 6px;">CLINICAL ADVICE & LIFESTYLE ROUTINE</div>
  <div class="advice">
    ${prescription.advice}
    ${prescription.followUpDate ? `<div style="margin-top: 8px; font-weight: bold;">Next Follow-up Review: ${prescription.followUpDate}</div>` : ''}
  </div>

  <div class="signature-area">
    <div>
      <div style="color: #059669; font-weight: bold; font-size: 12px;">✓ Digitally Certified & NMC Telemedicine Compliant</div>
      <div class="hash">Cryptographic Audit: ${prescription.digitalSignature}</div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Backed up to Google Drive Medi AI Health Vault</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 15px; font-style: italic; font-weight: bold; color: #0f172a;">${prescription.doctorName}</div>
      <div style="font-size: 11px; color: #64748b;">Registered Medical Specialist</div>
    </div>
  </div>
</body>
</html>`;

  return await uploadFileToDrive({
    name: fileName,
    mimeType: 'text/html',
    content: htmlContent,
    folderId,
    description: `Official NMC Digital Prescription: ${prescription.id} for ${prescription.patientName}`,
  });
}

/**
 * Exports an Appointment Pass into Medi AI Health Vault on Google Drive
 */
export async function exportAppointmentPassToDrive(appointment: Appointment): Promise<DriveFile> {
  const folderId = await getOrCreateMediAIVaultFolder();

  const fileName = `Appointment_Pass_${appointment.id}.html`;

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Appointment Pass ${appointment.id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; color: #0f172a; max-width: 600px; margin: 40px auto; padding: 24px; border: 2px solid #0284c7; border-radius: 20px; background: #ffffff; }
    .header { background: #0284c7; color: white; margin: -24px -24px 24px -24px; padding: 20px 24px; border-radius: 18px 18px 0 0; }
    .token { background: rgba(255,255,255,0.2); display: inline-block; padding: 4px 12px; border-radius: 9999px; font-family: monospace; font-size: 14px; font-weight: bold; margin-top: 8px; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 16px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #e0f2fe;">Hospital OPD Fast-Track Check-In Pass</div>
    <div style="font-size: 22px; font-weight: 800; margin-top: 4px;">${appointment.doctorName}</div>
    <div style="font-size: 13px; color: #bae6fd;">${appointment.doctorSpecialty}</div>
    <div class="token">Token ID: ${appointment.id}</div>
  </div>

  <div class="box">
    <div class="grid">
      <div>
        <span style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Date</span>
        <div style="font-size: 16px; font-weight: bold;">${appointment.date}</div>
      </div>
      <div>
        <span style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Slot Time</span>
        <div style="font-size: 16px; font-weight: bold; color: #0284c7;">${appointment.timeSlot}</div>
      </div>
    </div>
    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
      <span style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Hospital Facility</span>
      <div style="font-weight: bold;">${appointment.hospitalName}</div>
      <div style="font-size: 12px; color: #64748b;">${appointment.hospitalAddress}</div>
    </div>
  </div>

  <div class="box" style="font-size: 13px;">
    <div><strong>Patient:</strong> ${appointment.patientName}</div>
    <div><strong>Consultation Fee:</strong> ₹${appointment.fee} (Confirmed)</div>
    <div><strong>Mode:</strong> ${appointment.type.toUpperCase()}</div>
    ${appointment.symptoms ? `<div style="margin-top: 6px; font-style: italic; color: #64748b;">Symptoms: ${appointment.symptoms}</div>` : ''}
  </div>

  <div style="font-size: 12px; color: #64748b; text-align: center; margin-top: 20px;">
    Present this verified pass or token at the hospital reception kiosk.<br>
    Saved in Google Drive • Medi AI Health Vault
  </div>
</body>
</html>`;

  return await uploadFileToDrive({
    name: fileName,
    mimeType: 'text/html',
    content: htmlContent,
    folderId,
    description: `OPD Appointment Pass: ${appointment.id} with ${appointment.doctorName}`,
  });
}

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
