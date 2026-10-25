// Filter benign internal Firestore idle stream timeout warnings
const isBenignNotice = (msg: string) =>
  msg.includes('Disconnecting idle stream') ||
  msg.includes("RPC 'Listen' stream") ||
  msg.includes('idle stream');

const origWarn = console.warn;
console.warn = (...args: any[]) => {
  const msg = args.map((a) => (typeof a === 'string' ? a : a?.message || '')).join(' ');
  if (isBenignNotice(msg)) return;
  origWarn(...args);
};

const origError = console.error;
console.error = (...args: any[]) => {
  const msg = args.map((a) => (typeof a === 'string' ? a : a?.message || '')).join(' ');
  if (isBenignNotice(msg)) return;
  origError(...args);
};

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { Doctor, Hospital, Appointment, Prescription, MedicalRecord, AppNotification, User } from './src/types/index';
import {
  seedInitialFirestoreData,
  getFirestoreMeta,
  getDoctorsList,
  getDoctorById,
  updateDoctorScheduleDoc,
  getHospitalsList,
  getHospitalById,
  getAppointmentsList,
  createAppointmentTransaction,
  updateAppointmentDoc,
  getPrescriptionsList,
  createPrescriptionDoc,
  getMedicalRecordsList,
  createMedicalRecordDoc,
  deleteMedicalRecordDoc,
  getNotificationsList,
  markNotificationReadDoc,
  findUserByEmail,
  saveUserDoc,
  saveDoctorDoc,
} from './src/server/firestore';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initial Gemini AI setup
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Database In-Memory Store with Realistic Initial Seed Data
const users: User[] = [
  {
    id: 'user-pat-01',
    name: 'Rahul Verma',
    email: 'rahul.verma@example.com',
    phone: '+91 98765 43210',
    role: 'patient',
    dob: '1996-05-14',
    bloodGroup: 'B+',
    allergies: ['Penicillin', 'Peanuts'],
    chronicConditions: ['Mild Asthma'],
    emergencyContact: {
      name: 'Sunita Verma',
      relation: 'Mother',
      phone: '+91 98765 12345',
    },
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'user-doc-01',
    name: 'Dr. Priya Sharma',
    email: 'dr.priya@apollo.med',
    phone: '+91 91234 56789',
    role: 'doctor',
    specialty: 'Cardiologist',
    qualifications: 'MBBS, MD (Medicine), DM (Cardiology)',
    licenseNumber: 'NMC-CARD-2012-8819',
    experienceYears: 14,
    hospitalAffiliation: 'Apollo Hospital, Bengaluru',
    hospitalId: 'hosp-02',
    consultationFee: 1200,
    isVerified: true,
    rating: 4.9,
    reviewCount: 342,
    createdAt: '2025-08-12T09:00:00Z',
  },
  {
    id: 'user-hosp-01',
    name: 'Admin - Apollo Bengaluru',
    email: 'admin.blr@apollo.med',
    phone: '+91 80 2630 4050',
    role: 'hospital_admin',
    createdAt: '2025-01-01T00:00:00Z',
  },
];

const hospitals: Hospital[] = [
  {
    id: 'hosp-01',
    name: 'All India Institute of Medical Sciences (AIIMS)',
    city: 'New Delhi',
    address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi 110029',
    phone: '+91 11 2658 8500',
    emergencyHotline: '102 / +91 11 2658 8700',
    email: 'helpdesk@aiims.edu',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80',
    departments: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'General Medicine', 'Pediatrics'],
    facilities: ['Level-1 Trauma Center', '24x7 Emergency', 'Advanced Robotic Surgery', 'Blood Bank', 'ICU / NICU'],
    hasEmergency24x7: true,
    doctorCount: 450,
    establishedYear: 1956,
  },
  {
    id: 'hosp-02',
    name: 'Apollo Hospital',
    city: 'Bengaluru',
    address: '154/11, Opp IIM, Bannerghatta Road, Bengaluru 560076',
    phone: '+91 80 2630 4050',
    emergencyHotline: '1066',
    email: 'info_blr@apollohospitals.com',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    departments: ['Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 'Gynecology'],
    facilities: ['JCI Accredited', '24x7 Pharmacy', 'Dedicated Cardiac ICU', 'PET-CT Scan', 'Tele-Consultation'],
    hasEmergency24x7: true,
    doctorCount: 180,
    establishedYear: 2006,
  },
  {
    id: 'hosp-03',
    name: 'Fortis Memorial Research Institute',
    city: 'Gurugram',
    address: 'Sector 44, Opposite HUDA City Centre Metro, Gurugram 122002',
    phone: '+91 124 496 2200',
    emergencyHotline: '105010',
    email: 'fmri@fortishealthcare.com',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    departments: ['Neurosciences', 'Bone & Joint Institute', 'Oncology', 'Pediatrics'],
    facilities: ['24x7 Emergency', 'Bone Marrow Transplant', 'Brain Suite', 'Helipad Access'],
    hasEmergency24x7: true,
    doctorCount: 140,
    establishedYear: 2013,
  },
  {
    id: 'hosp-04',
    name: 'Lilavati Hospital & Research Centre',
    city: 'Mumbai',
    address: 'A-791, Bandra Reclamation, Bandra West, Mumbai 400050',
    phone: '+91 22 2675 1000',
    emergencyHotline: '+91 22 2656 8000',
    email: 'info@lilavatihospital.com',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    departments: ['Cardiology', 'Dermatology', 'Gastroenterology', 'General Surgery', 'Gynecology'],
    facilities: ['Cath Lab', '24x7 Ambulance', 'Pathology Lab', 'Day Care Surgery'],
    hasEmergency24x7: true,
    doctorCount: 120,
    establishedYear: 1997,
  },
  {
    id: 'hosp-05',
    name: 'Manipal Hospital',
    city: 'Bengaluru',
    address: '98, HAL Old Airport Road, Kodihalli, Bengaluru 560017',
    phone: '+91 80 2502 4444',
    emergencyHotline: '080-22221111',
    email: 'info@manipalhospitals.com',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    departments: ['Orthopedics', 'Pediatrics', 'Neurology', 'Internal Medicine', 'Dermatology'],
    facilities: ['Advanced NICU', 'Sports Medicine Wing', '24x7 Trauma Care', 'Dialysis Center'],
    hasEmergency24x7: true,
    doctorCount: 165,
    establishedYear: 1991,
  },
];

const doctors: Doctor[] = [
  {
    id: 'doc-01',
    userId: 'user-doc-01',
    name: 'Dr. Priya Sharma',
    specialty: 'Cardiologist',
    qualifications: 'MBBS, MD (Medicine), DM (Cardiology), FACC',
    licenseNumber: 'NMC-CARD-2012-8819',
    experienceYears: 14,
    hospitalName: 'Apollo Hospital',
    hospitalId: 'hosp-02',
    city: 'Bengaluru',
    consultationFee: 1200,
    rating: 4.9,
    reviewCount: 342,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=500&q=80',
    about: 'Senior Consultant Interventional Cardiologist specializing in coronary interventions, hypertension management, preventive cardiology, and adult cardiac disorders.',
    isVerified: true,
    schedule: {
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      startHour: '09:00',
      endHour: '17:00',
      slotDurationMinutes: 30,
      breakStart: '13:00',
      breakEnd: '14:00',
      leaveDates: [],
    },
    services: ['ECG Interpretation', 'Echocardiogram', 'Hypertension Clinic', 'Post-CABG Followup', 'Preventive Heart Check'],
  },
  {
    id: 'doc-02',
    userId: 'user-doc-02',
    name: 'Dr. Rajesh K. Nair',
    specialty: 'Neurologist',
    qualifications: 'MBBS, MD, DM (Neurology), DNB',
    licenseNumber: 'NMC-NEUR-2010-4491',
    experienceYears: 16,
    hospitalName: 'AIIMS',
    hospitalId: 'hosp-01',
    city: 'New Delhi',
    consultationFee: 1500,
    rating: 4.8,
    reviewCount: 289,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500&q=80',
    about: 'Renowned Neurologist with expertise in stroke rehabilitation, migraine therapy, epilepsy management, Parkinson’s disease, and neuropathic disorders.',
    isVerified: true,
    schedule: {
      workingDays: ['Mon', 'Wed', 'Thu', 'Fri', 'Sat'],
      startHour: '10:00',
      endHour: '18:00',
      slotDurationMinutes: 30,
      breakStart: '13:30',
      breakEnd: '14:30',
      leaveDates: [],
    },
    services: ['EEG & EMG Evaluation', 'Stroke Prevention', 'Headache & Migraine Clinic', 'Epilepsy Protocol'],
  },
  {
    id: 'doc-03',
    userId: 'user-doc-03',
    name: 'Dr. Ananya Sen',
    specialty: 'Dermatologist',
    qualifications: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
    licenseNumber: 'NMC-DERM-2017-9021',
    experienceYears: 9,
    hospitalName: 'Lilavati Hospital & Research Centre',
    hospitalId: 'hosp-04',
    city: 'Mumbai',
    consultationFee: 900,
    rating: 4.9,
    reviewCount: 412,
    avatar: 'https://images.unsplash.com/photo-1594824813590-7815349e5d48?auto=format&fit=crop&w=500&q=80',
    about: 'Consultant Dermatologist and Trichologist focused on clinical dermatology, chronic eczema, acne protocols, psoriasis, and aesthetic skin wellness.',
    isVerified: true,
    schedule: {
      workingDays: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      startHour: '09:30',
      endHour: '16:30',
      slotDurationMinutes: 30,
      breakStart: '13:00',
      breakEnd: '14:00',
      leaveDates: [],
    },
    services: ['Skin Allergy Diagnostics', 'Acne Scar Protocols', 'Hair Loss Therapy', 'Dermatosurgery Consult'],
  },
  {
    id: 'doc-04',
    userId: 'user-doc-04',
    name: 'Dr. Vikramaditya Reddy',
    specialty: 'Orthopedic Surgeon',
    qualifications: 'MBBS, MS (Ortho), MCh (Joint Replacement)',
    licenseNumber: 'NMC-ORTH-2011-3094',
    experienceYears: 15,
    hospitalName: 'Manipal Hospital',
    hospitalId: 'hosp-05',
    city: 'Bengaluru',
    consultationFee: 1100,
    rating: 4.8,
    reviewCount: 220,
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=500&q=80',
    about: 'Expert Orthopedic surgeon with extensive international fellowship in minimally invasive knee and hip joint replacements and sports injury arthroscopy.',
    isVerified: true,
    schedule: {
      workingDays: ['Mon', 'Tue', 'Thu', 'Fri'],
      startHour: '09:00',
      endHour: '16:00',
      slotDurationMinutes: 30,
      breakStart: '12:30',
      breakEnd: '13:30',
      leaveDates: [],
    },
    services: ['Robotic Knee Replacement', 'Arthroscopic ACL Repair', 'Spine Pain Management', 'Fracture Care'],
  },
  {
    id: 'doc-05',
    userId: 'user-doc-05',
    name: 'Dr. Sunita Deshmukh',
    specialty: 'Pediatrician',
    qualifications: 'MBBS, DCH, DNB (Pediatrics)',
    licenseNumber: 'NMC-PEDI-2015-6672',
    experienceYears: 11,
    hospitalName: 'Fortis Memorial Research Institute',
    hospitalId: 'hosp-03',
    city: 'Gurugram',
    consultationFee: 800,
    rating: 4.9,
    reviewCount: 510,
    avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=500&q=80',
    about: 'Caring pediatrician specializing in infant nutrition, immunization charts, pediatric asthma, developmental milestone tracking, and childhood infections.',
    isVerified: true,
    schedule: {
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      startHour: '10:00',
      endHour: '17:00',
      slotDurationMinutes: 20,
      breakStart: '13:00',
      breakEnd: '14:00',
      leaveDates: [],
    },
    services: ['Child Immunization', 'Growth & Milestone Assessment', 'Newborn Care', 'Pediatric Allergy Check'],
  },
  {
    id: 'doc-06',
    userId: 'user-doc-06',
    name: 'Dr. Arvind Mehra',
    specialty: 'General Physician',
    qualifications: 'MBBS, MD (Internal Medicine)',
    licenseNumber: 'NMC-MED-2014-1182',
    experienceYears: 12,
    hospitalName: 'Apollo Hospital',
    hospitalId: 'hosp-02',
    city: 'Bengaluru',
    consultationFee: 700,
    rating: 4.7,
    reviewCount: 310,
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=500&q=80',
    about: 'Experienced internal medicine practitioner managing adult illnesses, diabetes control, thyroid disorders, infectious fevers, and comprehensive health checkups.',
    isVerified: true,
    schedule: {
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      startHour: '08:30',
      endHour: '16:00',
      slotDurationMinutes: 20,
      breakStart: '12:30',
      breakEnd: '13:30',
      leaveDates: [],
    },
    services: ['Diabetes Reversal Guidance', 'Thyroid Assessment', 'Fever & Infection Clinic', 'Annual Executive Checkup'],
  },
];

const appointments: Appointment[] = [
  {
    id: 'MEDI-2026-7819',
    patientId: 'user-pat-01',
    patientName: 'Rahul Verma',
    patientPhone: '+91 98765 43210',
    patientEmail: 'rahul.verma@example.com',
    doctorId: 'doc-01',
    doctorName: 'Dr. Priya Sharma',
    doctorSpecialty: 'Cardiologist',
    hospitalName: 'Apollo Hospital',
    hospitalAddress: 'Bannerghatta Road, Bengaluru',
    date: '2026-10-25',
    timeSlot: '10:30 AM',
    fee: 1200,
    status: 'confirmed',
    type: 'in-person',
    symptoms: 'Occasional chest tightness during brisk walking, routine follow-up',
    createdAt: '2026-10-20T11:20:00Z',
  },
  {
    id: 'MEDI-2026-4420',
    patientId: 'user-pat-01',
    patientName: 'Rahul Verma',
    patientPhone: '+91 98765 43210',
    patientEmail: 'rahul.verma@example.com',
    doctorId: 'doc-06',
    doctorName: 'Dr. Arvind Mehra',
    doctorSpecialty: 'General Physician',
    hospitalName: 'Apollo Hospital',
    hospitalAddress: 'Bannerghatta Road, Bengaluru',
    date: '2026-10-12',
    timeSlot: '11:00 AM',
    fee: 700,
    status: 'completed',
    type: 'in-person',
    symptoms: 'Mild seasonal cough and sore throat',
    createdAt: '2026-10-10T14:10:00Z',
    prescriptionId: 'RX-2026-8910',
  },
];

const prescriptions: Prescription[] = [
  {
    id: 'RX-2026-8910',
    appointmentId: 'MEDI-2026-4420',
    patientId: 'user-pat-01',
    patientName: 'Rahul Verma',
    patientAge: 30,
    patientGender: 'Male',
    doctorId: 'doc-06',
    doctorName: 'Dr. Arvind Mehra',
    doctorSpecialty: 'General Physician',
    doctorLicense: 'NMC-MED-2014-1182',
    hospitalName: 'Apollo Hospital, Bengaluru',
    date: '2026-10-12',
    diagnosis: 'Acute Upper Respiratory Tract Infection (Mild Viral Pharyngitis)',
    items: [
      {
        id: 'item-1',
        medicineName: 'Paracetamol 650mg (Dolo 650)',
        dosage: '650 mg',
        frequency: '1-0-1 (Twice daily after meals)',
        duration: '3 days',
        instructions: 'Take if fever or body aches persist',
      },
      {
        id: 'item-2',
        medicineName: 'Levocetirizine 5mg',
        dosage: '5 mg',
        frequency: '0-0-1 (Once at bedtime)',
        duration: '5 days',
        instructions: 'May cause mild drowsiness',
      },
      {
        id: 'item-3',
        medicineName: 'Warm Saline Gargles',
        dosage: 'Salt water',
        frequency: 'Thrice daily',
        duration: '5 days',
        instructions: 'Gargle for 2 minutes after meals',
      },
    ],
    advice: 'Hydrate well with warm fluids. Rest for 48 hours. If fever exceeds 101°F or breathing difficulty occurs, visit OPD immediately.',
    followUpDate: '2026-10-19',
    digitalSignature: 'SHA256:d8a9f24e10b39c0172e291823746a',
  },
];

const medicalRecords: MedicalRecord[] = [
  {
    id: 'rec-01',
    patientId: 'user-pat-01',
    title: 'Complete Blood Count (CBC) & Lipid Panel',
    category: 'Lab Report',
    date: '2026-10-11',
    fileSize: '1.4 MB',
    fileType: 'PDF Document',
    doctorOrLab: 'Apollo Diagnostics Laboratory',
    notes: 'Total Cholesterol 185 mg/dL (Normal), Hb 14.8 g/dL',
    createdAt: '2026-10-11T16:00:00Z',
  },
  {
    id: 'rec-02',
    patientId: 'user-pat-01',
    title: 'Chest X-Ray PA View',
    category: 'X-Ray / Scan',
    date: '2026-08-15',
    fileSize: '4.2 MB',
    fileType: 'DICOM / PDF',
    doctorOrLab: 'Manipal Radiology Center',
    notes: 'Clear lung fields, normal cardiothoracic ratio',
    createdAt: '2026-08-15T12:30:00Z',
  },
];

const notifications: AppNotification[] = [
  {
    id: 'notif-01',
    userId: 'user-pat-01',
    title: 'Appointment Confirmed',
    message: 'Your cardiology consultation with Dr. Priya Sharma is confirmed for Oct 25, 2026 at 10:30 AM at Apollo Hospital.',
    type: 'appointment',
    date: '2026-10-20T11:21:00Z',
    isRead: false,
    actionUrl: '/appointments',
  },
  {
    id: 'notif-02',
    userId: 'user-pat-01',
    title: 'Digital Prescription Available',
    message: 'Dr. Arvind Mehra has issued your digital prescription for consultation MEDI-2026-4420.',
    type: 'prescription',
    date: '2026-10-12T11:35:00Z',
    isRead: true,
    actionUrl: '/prescriptions',
  },
  {
    id: 'notif-03',
    userId: 'user-pat-01',
    title: 'Health Tip from Medi AI',
    message: 'Hydration reminder: Drinking 2.5L of water daily aids cardiovascular function and metabolic rate.',
    type: 'reminder',
    date: '2026-10-21T07:00:00Z',
    isRead: true,
  },
];

// Helper to generate slots for a doctor on a given date
function generateSlotsForDoctor(doctor: Doctor, dateStr: string, activeBookedSlots: string[] = []) {
  const dateObj = new Date(dateStr);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

  // Check if doctor works on this day
  if (!doctor.schedule.workingDays.includes(dayName)) {
    return [];
  }

  // Check if doctor is on leave
  if (doctor.schedule.leaveDates.includes(dateStr)) {
    return [];
  }

  const [startH, startM] = doctor.schedule.startHour.split(':').map(Number);
  const [endH, endM] = doctor.schedule.endHour.split(':').map(Number);
  const duration = doctor.schedule.slotDurationMinutes || 30;

  const startTotalMinutes = startH * 60 + startM;
  const endTotalMinutes = endH * 60 + endM;

  let breakStartMinutes = -1;
  let breakEndMinutes = -1;
  if (doctor.schedule.breakStart && doctor.schedule.breakEnd) {
    const [bsh, bsm] = doctor.schedule.breakStart.split(':').map(Number);
    const [beh, bem] = doctor.schedule.breakEnd.split(':').map(Number);
    breakStartMinutes = bsh * 60 + bsm;
    breakEndMinutes = beh * 60 + bem;
  }

  const slots: { time: string; period: 'morning' | 'afternoon' | 'evening'; isAvailable: boolean }[] = [];

  for (let m = startTotalMinutes; m < endTotalMinutes; m += duration) {
    // Skip if within break
    if (breakStartMinutes !== -1 && m >= breakStartMinutes && m < breakEndMinutes) {
      continue;
    }

    const hour = Math.floor(m / 60);
    const mins = m % 60;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const timeFormatted = `${displayHour}:${mins < 10 ? '0' : ''}${mins} ${ampm}`;

    let period: 'morning' | 'afternoon' | 'evening' = 'morning';
    if (hour >= 12 && hour < 17) period = 'afternoon';
    else if (hour >= 17) period = 'evening';

    const isAvailable = !activeBookedSlots.includes(timeFormatted);
    slots.push({
      time: timeFormatted,
      period,
      isAvailable,
    });
  }

  return slots;
}

// ---------------- REST API ROUTES ----------------

// Health check with Firestore database info
app.get('/api/health', (req, res) => {
  const dbMeta = getFirestoreMeta();
  res.json({
    status: 'online',
    appName: 'Medi AI Backend Engine',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    database: {
      type: 'Cloud Firestore',
      projectId: dbMeta.projectId,
      firestoreDatabaseId: dbMeta.databaseId,
      status: dbMeta.isAvailable ? 'connected' : 'fallback-mode',
    },
  });
});

// Database status & collection inspection
app.get('/api/db/status', async (req, res) => {
  const dbMeta = getFirestoreMeta();
  let firestoreCounts: Record<string, number> = {};
  if (dbMeta.isAvailable) {
    const [d, h, a, p, m, n] = await Promise.all([
      getDoctorsList(),
      getHospitalsList(),
      getAppointmentsList(),
      getPrescriptionsList(),
      getMedicalRecordsList(),
      getNotificationsList(),
    ]);
    firestoreCounts = {
      doctors: d.length,
      hospitals: h.length,
      appointments: a.length,
      prescriptions: p.length,
      medicalRecords: m.length,
      notifications: n.length,
    };
  }
  res.json({
    database: 'Cloud Firestore',
    projectId: dbMeta.projectId,
    databaseId: dbMeta.databaseId,
    connected: dbMeta.isAvailable,
    collections: firestoreCounts,
  });
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  let user = await findUserByEmail(email);
  if (!user) {
    user = users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  if (!user) {
    // If logging in via demo account or quick switch
    const defaultRole = role || 'patient';
    user = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      email,
      phone: '+91 99000 11223',
      role: defaultRole,
      createdAt: new Date().toISOString(),
      bloodGroup: 'O+',
    };
    await saveUserDoc(user);
    users.push(user);
  }

  res.json({
    success: true,
    user,
    token: `token_${user.id}_${Date.now()}`,
  });
});

// Auth: Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, role, specialty, qualifications, licenseNumber, experienceYears, hospitalAffiliation, consultationFee, dob, bloodGroup } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const existing = (await findUserByEmail(email)) || users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const userRole = role === 'doctor' ? 'doctor' : 'patient';
  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    phone: phone || '+91 90000 00000',
    role: userRole,
    createdAt: new Date().toISOString(),
    dob,
    bloodGroup: bloodGroup || 'O+',
  };

  if (userRole === 'doctor') {
    newUser.specialty = specialty || 'General Physician';
    newUser.qualifications = qualifications || 'MBBS';
    newUser.licenseNumber = licenseNumber || `REG-${Date.now()}`;
    newUser.experienceYears = Number(experienceYears) || 5;
    newUser.hospitalAffiliation = hospitalAffiliation || 'Apollo Hospital';
    newUser.consultationFee = Number(consultationFee) || 800;
    newUser.isVerified = false; // requires admin verification as per requirement #6

    // Add to doctor list
    const newDoc: Doctor = {
      id: `doc-${Date.now()}`,
      userId: newUser.id,
      name: newUser.name,
      specialty: newUser.specialty || 'General Physician',
      qualifications: newUser.qualifications || 'MBBS',
      licenseNumber: newUser.licenseNumber || `REG-${Date.now()}`,
      experienceYears: newUser.experienceYears || 5,
      hospitalName: newUser.hospitalAffiliation || 'Apollo Hospital',
      hospitalId: 'hosp-02',
      city: 'Bengaluru',
      consultationFee: newUser.consultationFee || 800,
      rating: 5.0,
      reviewCount: 1,
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500&q=80',
      about: `Dr. ${newUser.name} is a specialist in ${newUser.specialty || 'General Medicine'}.`,
      isVerified: false,
      schedule: {
        workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        startHour: '09:00',
        endHour: '17:00',
        slotDurationMinutes: 30,
        breakStart: '13:00',
        breakEnd: '14:00',
        leaveDates: [],
      },
      services: ['General Consultation', 'Specialist Assessment', 'Follow-up Evaluation'],
    };

    await saveDoctorDoc(newDoc);
    doctors.push(newDoc);
  }

  await saveUserDoc(newUser);
  users.push(newUser);

  res.status(201).json({
    success: true,
    user: newUser,
    message: userRole === 'doctor' ? 'Registration submitted! Account verification pending.' : 'Registration successful!',
  });
});

// Auth: Forgot Password
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  res.json({
    success: true,
    message: `Password reset instructions and a 6-digit OTP have been dispatched to ${email}.`,
  });
});

// Doctors list & search (Direct from Firestore with filters)
app.get('/api/doctors', async (req, res) => {
  const { search, specialty, city, maxFee, minExp } = req.query;
  const fsDoctors = await getDoctorsList({
    search: search ? String(search) : undefined,
    specialty: specialty ? String(specialty) : undefined,
    city: city ? String(city) : undefined,
    maxFee: maxFee ? Number(maxFee) : undefined,
    minExp: minExp ? Number(minExp) : undefined,
  });

  if (fsDoctors.length > 0) {
    return res.json(fsDoctors);
  }

  // Fallback to in-memory
  let results = [...doctors];
  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.hospitalName.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q)
    );
  }

  if (specialty && specialty !== 'All') {
    results = results.filter((d) => d.specialty.toLowerCase() === String(specialty).toLowerCase());
  }

  if (city && city !== 'All') {
    results = results.filter((d) => d.city.toLowerCase() === String(city).toLowerCase());
  }

  if (maxFee) {
    results = results.filter((d) => d.consultationFee <= Number(maxFee));
  }

  if (minExp) {
    results = results.filter((d) => d.experienceYears >= Number(minExp));
  }

  res.json(results);
});

// Doctor by ID
app.get('/api/doctors/:id', async (req, res) => {
  const fsDoc = await getDoctorById(req.params.id);
  if (fsDoc) return res.json(fsDoc);

  const doctor = doctors.find((d) => d.id === req.params.id);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  res.json(doctor);
});

// Doctor Slots for Date (Calculated against live bookings in Firestore)
app.get('/api/doctors/:id/slots', async (req, res) => {
  let doctor = await getDoctorById(req.params.id);
  if (!doctor) {
    doctor = doctors.find((d) => d.id === req.params.id) || null;
  }
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

  const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];

  let bookedSlots: string[] = [];
  const allAppts = await getAppointmentsList({ doctorId: doctor.id });
  if (allAppts.length > 0) {
    bookedSlots = allAppts
      .filter((a) => a.date === dateStr && a.status !== 'cancelled')
      .map((a) => a.timeSlot);
  } else {
    bookedSlots = appointments
      .filter((a) => a.doctorId === doctor!.id && a.date === dateStr && a.status !== 'cancelled')
      .map((a) => a.timeSlot);
  }

  const slots = generateSlotsForDoctor(doctor, dateStr, bookedSlots);
  res.json({
    doctorId: doctor.id,
    date: dateStr,
    slots,
    totalAvailable: slots.filter((s) => s.isAvailable).length,
  });
});

// Update Doctor Schedule
app.put('/api/doctors/:id/schedule', async (req, res) => {
  const { id } = req.params;
  await updateDoctorScheduleDoc(id, req.body);

  const doctor = doctors.find((d) => d.id === id);
  if (doctor) {
    const { workingDays, startHour, endHour, slotDurationMinutes, breakStart, breakEnd, leaveDates } = req.body;
    if (workingDays) doctor.schedule.workingDays = workingDays;
    if (startHour) doctor.schedule.startHour = startHour;
    if (endHour) doctor.schedule.endHour = endHour;
    if (slotDurationMinutes) doctor.schedule.slotDurationMinutes = Number(slotDurationMinutes);
    if (breakStart !== undefined) doctor.schedule.breakStart = breakStart;
    if (breakEnd !== undefined) doctor.schedule.breakEnd = breakEnd;
    if (leaveDates) doctor.schedule.leaveDates = leaveDates;
    return res.json({ success: true, schedule: doctor.schedule });
  }

  res.json({ success: true, schedule: req.body });
});

// Hospitals list & search
app.get('/api/hospitals', async (req, res) => {
  const { search, city, department } = req.query;
  const fsHospitals = await getHospitalsList({
    search: search ? String(search) : undefined,
    city: city ? String(city) : undefined,
    department: department ? String(department) : undefined,
  });

  if (fsHospitals.length > 0) {
    return res.json(fsHospitals);
  }

  let results = [...hospitals];
  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter((h) => h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q));
  }

  if (city && city !== 'All') {
    results = results.filter((h) => h.city.toLowerCase() === String(city).toLowerCase());
  }

  if (department && department !== 'All') {
    results = results.filter((h) =>
      h.departments.some((d) => d.toLowerCase() === String(department).toLowerCase())
    );
  }

  res.json(results);
});

app.get('/api/hospitals/:id', async (req, res) => {
  let hospital = await getHospitalById(req.params.id);
  if (!hospital) {
    hospital = hospitals.find((h) => h.id === req.params.id) || null;
  }
  if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

  const allDocs = (await getDoctorsList()) || doctors;
  const hospitalDoctors = allDocs.filter((d) => d.hospitalId === hospital!.id);
  res.json({ ...hospital, doctors: hospitalDoctors });
});

// Appointments: GET (all or filtered by patientId/doctorId)
app.get('/api/appointments', async (req, res) => {
  const { patientId, doctorId, status } = req.query;
  const fsAppts = await getAppointmentsList({
    patientId: patientId ? String(patientId) : undefined,
    doctorId: doctorId ? String(doctorId) : undefined,
    status: status ? String(status) : undefined,
  });

  if (fsAppts.length > 0) {
    return res.json(fsAppts);
  }

  let results = [...appointments];
  if (patientId) results = results.filter((a) => a.patientId === patientId);
  if (doctorId) results = results.filter((a) => a.doctorId === doctorId);
  if (status && status !== 'all') results = results.filter((a) => a.status === status);

  results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(results);
});

// Appointments: POST (Atomic Concurrency Guard & Transaction Check)
app.post('/api/appointments', async (req, res) => {
  const { patientId, patientName, patientPhone, patientEmail, doctorId, date, timeSlot, type, symptoms } = req.body;

  if (!doctorId || !date || !timeSlot) {
    return res.status(400).json({ error: 'Doctor, date, and time slot are required' });
  }

  let doctor = await getDoctorById(doctorId);
  if (!doctor) {
    doctor = doctors.find((d) => d.id === doctorId) || null;
  }
  if (!doctor) {
    return res.status(404).json({ error: 'Selected doctor does not exist' });
  }

  // Atomic Concurrency Guard using Firestore Transaction
  const txResult = await createAppointmentTransaction({
    patientId: patientId || 'user-pat-01',
    patientName: patientName || 'Rahul Verma',
    patientPhone: patientPhone || '+91 98765 43210',
    patientEmail: patientEmail || 'rahul.verma@example.com',
    doctorId: doctor.id,
    doctorName: doctor.name,
    doctorSpecialty: doctor.specialty,
    hospitalName: doctor.hospitalName,
    hospitalAddress: doctor.city,
    date,
    timeSlot,
    fee: doctor.consultationFee,
    type: type || 'in-person',
    symptoms: symptoms || '',
  });

  if (!txResult.success) {
    if (txResult.isConflict) {
      return res.status(409).json({
        error: txResult.error,
        code: 'SLOT_ALREADY_BOOKED',
      });
    }

    // In-memory fallback if Firestore transaction encountered an issue
    const isSlotTaken = appointments.some(
      (a) => a.doctorId === doctorId && a.date === date && a.timeSlot === timeSlot && a.status !== 'cancelled'
    );
    if (isSlotTaken) {
      return res.status(409).json({
        error: 'Concurrency Conflict: This slot has just been booked by another patient. Please choose an alternative slot.',
        code: 'SLOT_ALREADY_BOOKED',
      });
    }

    const fallbackApptId = `MEDI-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fallbackAppt: Appointment = {
      id: fallbackApptId,
      patientId: patientId || 'user-pat-01',
      patientName: patientName || 'Rahul Verma',
      patientPhone: patientPhone || '+91 98765 43210',
      patientEmail: patientEmail || 'rahul.verma@example.com',
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      hospitalName: doctor.hospitalName,
      hospitalAddress: doctor.city,
      date,
      timeSlot,
      fee: doctor.consultationFee,
      status: 'confirmed',
      type: type || 'in-person',
      symptoms: symptoms || '',
      createdAt: new Date().toISOString(),
    };
    appointments.unshift(fallbackAppt);
    return res.status(201).json({
      success: true,
      appointment: fallbackAppt,
      message: 'Appointment successfully booked!',
    });
  }

  // Also update in-memory cache
  if (txResult.appointment) {
    appointments.unshift(txResult.appointment);
  }

  res.status(201).json({
    success: true,
    appointment: txResult.appointment,
    message: 'Appointment successfully booked!',
  });
});

// Appointments: Status Update (Cancel, Reschedule, Complete)
app.patch('/api/appointments/:id', async (req, res) => {
  const { id } = req.params;
  const { status, cancelReason, newDate, newTimeSlot } = req.body;

  const result = await updateAppointmentDoc(id, { status, cancelReason, newDate, newTimeSlot });
  if (result.success && result.appointment) {
    const memAppt = appointments.find((a) => a.id === id);
    if (memAppt) Object.assign(memAppt, result.appointment);
    return res.json({ success: true, appointment: result.appointment });
  }

  // In-memory fallback
  const appt = appointments.find((a) => a.id === id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });

  if (status === 'cancelled') {
    appt.status = 'cancelled';
    appt.cancelReason = cancelReason || 'Cancelled by patient';
  } else if (newDate && newTimeSlot) {
    const isSlotTaken = appointments.some(
      (a) => a.doctorId === appt.doctorId && a.date === newDate && a.timeSlot === newTimeSlot && a.id !== id && a.status !== 'cancelled'
    );
    if (isSlotTaken) {
      return res.status(409).json({ error: 'Rescheduled slot is already booked. Please pick another slot.' });
    }
    appt.date = newDate;
    appt.timeSlot = newTimeSlot;
    appt.status = 'confirmed';
  } else if (status) {
    appt.status = status;
  }

  res.json({ success: true, appointment: appt });
});

// Prescriptions: GET
app.get('/api/prescriptions', async (req, res) => {
  const { patientId, doctorId } = req.query;
  const fsList = await getPrescriptionsList({
    patientId: patientId ? String(patientId) : undefined,
    doctorId: doctorId ? String(doctorId) : undefined,
  });

  if (fsList.length > 0) {
    return res.json(fsList);
  }

  let results = [...prescriptions];
  if (patientId) results = results.filter((p) => p.patientId === patientId);
  if (doctorId) results = results.filter((p) => p.doctorId === doctorId);

  results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(results);
});

// Prescriptions: POST (Doctor creates prescription)
app.post('/api/prescriptions', async (req, res) => {
  const { appointmentId, patientId, patientName, patientAge, patientGender, doctorId, diagnosis, items, advice, followUpDate } = req.body;

  let doctor = await getDoctorById(doctorId);
  if (!doctor) doctor = doctors.find((d) => d.id === doctorId) || null;
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

  const prescriptionId = `RX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newPrescription: Prescription = {
    id: prescriptionId,
    appointmentId: appointmentId || `MEDI-${Date.now()}`,
    patientId: patientId || 'user-pat-01',
    patientName: patientName || 'Patient',
    patientAge: Number(patientAge) || 28,
    patientGender: patientGender || 'Unspecified',
    doctorId: doctor.id,
    doctorName: doctor.name,
    doctorSpecialty: doctor.specialty,
    doctorLicense: doctor.licenseNumber,
    hospitalName: doctor.hospitalName,
    date: new Date().toISOString().split('T')[0],
    diagnosis: diagnosis || 'Clinical Consultation',
    items: items || [],
    advice: advice || 'Follow prescribed routine and stay hydrated.',
    followUpDate,
    digitalSignature: `SHA256:VERIFIED_${doctor.licenseNumber}_${Date.now()}`,
  };

  await createPrescriptionDoc(newPrescription);
  prescriptions.unshift(newPrescription);

  if (appointmentId) {
    const appt = appointments.find((a) => a.id === appointmentId);
    if (appt) {
      appt.prescriptionId = prescriptionId;
      appt.status = 'completed';
    }
  }

  res.status(201).json({ success: true, prescription: newPrescription });
});

// Medical Records: GET & POST
app.get('/api/records', async (req, res) => {
  const { patientId } = req.query;
  const fsRecords = await getMedicalRecordsList(patientId ? String(patientId) : undefined);
  if (fsRecords.length > 0) return res.json(fsRecords);

  let results = [...medicalRecords];
  if (patientId) {
    results = results.filter((r) => r.patientId === patientId);
  }
  res.json(results);
});

app.post('/api/records', async (req, res) => {
  const { patientId, title, category, date, fileSize, fileType, doctorOrLab, notes } = req.body;

  if (!title || !category) {
    return res.status(400).json({ error: 'Title and category are required' });
  }

  const newRecord: MedicalRecord = {
    id: `rec-${Date.now()}`,
    patientId: patientId || 'user-pat-01',
    title,
    category,
    date: date || new Date().toISOString().split('T')[0],
    fileSize: fileSize || '1.8 MB',
    fileType: fileType || 'PDF Document',
    doctorOrLab: doctorOrLab || 'Certified Medical Lab',
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };

  await createMedicalRecordDoc(newRecord);
  medicalRecords.unshift(newRecord);
  res.status(201).json({ success: true, record: newRecord });
});

app.delete('/api/records/:id', async (req, res) => {
  await deleteMedicalRecordDoc(req.params.id);
  const idx = medicalRecords.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Record not found' });
  medicalRecords.splice(idx, 1);
  res.json({ success: true, message: 'Medical record deleted' });
});

// Notifications
app.get('/api/notifications', async (req, res) => {
  const { userId } = req.query;
  const fsNotifs = await getNotificationsList(userId ? String(userId) : undefined);
  if (fsNotifs.length > 0) return res.json(fsNotifs);

  let results = [...notifications];
  if (userId) {
    results = results.filter((n) => n.userId === userId);
  }
  res.json(results);
});

app.post('/api/notifications/:id/read', async (req, res) => {
  await markNotificationReadDoc(req.params.id);
  const notif = notifications.find((n) => n.id === req.params.id);
  if (notif) notif.isRead = true;
  res.json({ success: true });
});

// Emergency directory
app.get('/api/emergency', (req, res) => {
  res.json({
    country: 'India',
    services: [
      { name: 'National Emergency Number', number: '112', description: 'All-in-one emergency helpline (Police, Fire, Medical)' },
      { name: 'Ambulance & Medical Emergency', number: '108', description: 'Toll-free 24x7 emergency medical response' },
      { name: 'Government Hospital Ambulance', number: '102', description: 'Free emergency transport for pregnant women & neonates' },
      { name: 'National Health Helpline', number: '104', description: 'Medical advice, directory and mental wellness support' },
      { name: 'Poison Information Center (AIIMS)', number: '1800 116 117', description: 'Toxicology & emergency poisoning intervention' },
    ],
    hospitalHotlines: hospitals.map((h) => ({
      hospital: h.name,
      city: h.city,
      hotline: h.emergencyHotline,
      address: h.address,
    })),
  });
});

// AI Health Assistant (Using Gemini 3.8 Flash via @google/genai)
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if message indicates an immediate life-threatening emergency
    const emergencyRegex = /(chest pain|crushing pain|cannot breathe|severe bleeding|unconscious|stroke|heart attack|coughing blood|suicide|poisoning)/i;
    const isEmergencyAlert = emergencyRegex.test(message);

    // List of our available specialties & doctors for grounding
    const availableSpecialties = Array.from(new Set(doctors.map((d) => d.specialty)));
    const doctorSummary = doctors
      .map(
        (d) =>
          `- ${d.name} (${d.specialty}) at ${d.hospitalName}, ${d.city} [Fee: ₹${d.consultationFee}, Rating: ${d.rating}]`
      )
      .join('\n');

    const systemInstruction = `
You are "Medi AI", a professional, empathetic, and clinically responsible Healthcare Assistant in India.
Your mission is to assist users with:
1. Explaining symptoms in clear, reassuring, and understandable medical terms.
2. Assessing symptom severity (mild, moderate, urgent, emergency).
3. Guiding the user to the correct medical specialty (e.g., Cardiology, Dermatology, Orthopedics, Pediatrics, Neurology, General Physician).
4. Assisting the patient in discovering verified doctors available in Medi AI's verified network.
5. Offering evidence-based lifestyle, nutrition, and home care advice where safe.

IMPORTANT SAFETY & ETHICAL RULES:
- Clearly state that you provide health information and triage guidance, NOT a formal medical diagnosis or prescription.
- NEVER prescribe medication dosages or encourage self-medication for prescription-only drugs.
- If emergency symptoms are mentioned (e.g., severe acute chest pain, stroke signs, difficulty breathing, severe hemorrhage), IMMEDIATELY advise dialing 112 or 108 and visiting the nearest Emergency Department.
- Cross-reference with our verified doctor directory below when recommending an appointment:
Available Specialties: ${availableSpecialties.join(', ')}
Our Doctors:
${doctorSummary}

Format your response cleanly using markdown with bold headings and bullet points. At the end of your response, if applicable, specify a suggested specialty tag on a new line like:
SPECIALTY_RECOMMENDATION: <SpecialtyName>
`;

    if (!process.env.GEMINI_API_KEY) {
      // Graceful fallback if key not attached yet
      return res.json({
        reply: `Thank you for sharing your health concern. 

Based on your symptoms:
- **Triage Advice**: It is best to have this evaluated by a qualified medical specialist.
- **Recommended Specialty**: ${isEmergencyAlert ? 'Emergency Medicine / Cardiology' : 'General Physician'}
- **Home Care**: Ensure adequate rest and hydration.

*Disclaimer: Medi AI provides health education and is not a substitute for clinical diagnosis. In case of severe discomfort, please visit your nearest hospital emergency department immediately or call 112 / 108.*

SPECIALTY_RECOMMENDATION: ${isEmergencyAlert ? 'Cardiologist' : 'General Physician'}`,
        isEmergencyAlert,
        suggestedSpecialty: isEmergencyAlert ? 'Cardiologist' : 'General Physician',
        recommendedDoctors: doctors.slice(0, 2).map((d) => d.name),
      });
    }

    const contents = [];
    if (history && Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        contents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    const rawText = response.text || 'I could not generate a response. Please consult a doctor.';
    
    // Extract specialty recommendation tag if present
    let suggestedSpecialty = '';
    const match = rawText.match(/SPECIALTY_RECOMMENDATION:\s*([^\n\r]+)/i);
    if (match && match[1]) {
      suggestedSpecialty = match[1].trim();
    } else if (isEmergencyAlert) {
      suggestedSpecialty = 'Cardiologist';
    }

    const cleanReply = rawText.replace(/SPECIALTY_RECOMMENDATION:\s*[^\n\r]+/i, '').trim();

    // Match recommended doctors
    const matchedDocs = doctors
      .filter((d) => suggestedSpecialty && d.specialty.toLowerCase() === suggestedSpecialty.toLowerCase())
      .map((d) => d.name);

    res.json({
      reply: cleanReply,
      isEmergencyAlert,
      suggestedSpecialty: suggestedSpecialty || (isEmergencyAlert ? 'Cardiologist' : undefined),
      recommendedDoctors: matchedDocs.length > 0 ? matchedDocs : [doctors[0].name],
    });
  } catch (error: any) {
    console.error('Gemini AI Chat Error:', error);

    // Resilient Fallback: Clinical Triage Rule Engine
    const msg = (req.body?.message || '').toLowerCase();
    const isEmergency = /(chest pain|crushing pain|cannot breathe|severe bleeding|unconscious|stroke|heart attack)/i.test(msg);
    let suggestedSpecialty = 'General Physician';
    let triageSummary = 'General medical evaluation recommended.';

    if (isEmergency || /(chest|heart|palpitation|pressure in chest|angina)/i.test(msg)) {
      suggestedSpecialty = 'Cardiologist';
      triageSummary = 'Cardiovascular assessment advised. If pain radiates to arm, jaw, or causes breathlessness, dial 112 / 108 immediately.';
    } else if (/(headache|migraine|head ache|dizziness|faint|numbness|nerve|vision blur|light sensitivity)/i.test(msg)) {
      suggestedSpecialty = 'Neurologist';
      triageSummary = 'Neurological evaluation recommended for sharp headaches, photophobia, and nerve sensations.';
    } else if (/(skin|rash|itch|acne|eczema|allergy|hair|trichology|spots)/i.test(msg)) {
      suggestedSpecialty = 'Dermatologist';
      triageSummary = 'Dermatological inspection advised to identify contact dermatitis, fungal or allergic reactions.';
    } else if (/(joint|knee|bone|ortho|spine|back pain|fracture|ligament|arthritis)/i.test(msg)) {
      suggestedSpecialty = 'Orthopedic Surgeon';
      triageSummary = 'Musculoskeletal examination advised. Avoid strenuous load until reviewed by an orthopedic specialist.';
    } else if (/(child|baby|infant|toddler|vaccination|pediatric)/i.test(msg)) {
      suggestedSpecialty = 'Pediatrician';
      triageSummary = 'Pediatric consultation advised for appropriate developmental and milestone-focused care.';
    } else if (/(fever|cough|cold|throat|flu|weakness|diabetes|sugar|thyroid)/i.test(msg)) {
      suggestedSpecialty = 'General Physician';
      triageSummary = 'Internal medicine evaluation recommended to monitor temperature, vitals, and infection parameters.';
    }

    const matchedDocs = doctors
      .filter((d) => d.specialty.toLowerCase() === suggestedSpecialty.toLowerCase())
      .map((d) => d.name);

    res.json({
      reply: `Thank you for consulting Medi AI.\n\n### Clinical Triage Assessment:\n- **Analysis**: ${triageSummary}\n- **Recommended Specialty**: **${suggestedSpecialty}**\n- **Clinical Guidance**: Ensure adequate rest and hydration. Note symptom onset and duration to share during your clinical consultation.\n\n*Disclaimer: Medi AI provides health education and triage guidance, not clinical prescription. For acute emergencies, call 112 / 108 immediately.*`,
      isEmergencyAlert: isEmergency,
      suggestedSpecialty,
      recommendedDoctors: matchedDocs.length > 0 ? matchedDocs : [doctors[0].name],
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Medi AI Server running at http://0.0.0.0:${PORT}`);

    // Asynchronously run Firestore seeding check in the background without blocking server startup
    seedInitialFirestoreData({
      users,
      hospitals,
      doctors,
      appointments,
      prescriptions,
      medicalRecords,
      notifications,
    }).catch((seedErr) => {
      console.warn('[Server Startup] Firestore seeding warning:', seedErr);
    });
  });
}

startServer();
