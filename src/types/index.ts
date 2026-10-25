export type UserRole = 'patient' | 'doctor' | 'hospital_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  // Patient specific
  dob?: string;
  bloodGroup?: string;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
  // Doctor specific
  specialty?: string;
  qualifications?: string;
  licenseNumber?: string;
  experienceYears?: number;
  hospitalAffiliation?: string;
  hospitalId?: string;
  consultationFee?: number;
  isVerified?: boolean;
  bio?: string;
  rating?: number;
  reviewCount?: number;
}

export interface DoctorSchedule {
  workingDays: string[]; // e.g. ["Mon", "Tue", "Wed", "Thu", "Fri"]
  startHour: string; // "09:00"
  endHour: string; // "17:00"
  slotDurationMinutes: number; // 30
  breakStart?: string; // "13:00"
  breakEnd?: string; // "14:00"
  leaveDates: string[]; // ["2026-11-01"]
}

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  specialty: string;
  qualifications: string;
  licenseNumber: string;
  experienceYears: number;
  hospitalName: string;
  hospitalId: string;
  city: string;
  consultationFee: number;
  rating: number;
  reviewCount: number;
  avatar: string;
  about: string;
  isVerified: boolean;
  schedule: DoctorSchedule;
  services: string[];
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  emergencyHotline: string;
  email: string;
  rating: number;
  image: string;
  departments: string[];
  facilities: string[];
  hasEmergency24x7: boolean;
  doctorCount: number;
  establishedYear: number;
}

export type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

export interface Appointment {
  id: string; // e.g. MEDI-2026-8921
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  hospitalName: string;
  hospitalAddress: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30 AM"
  fee: number;
  status: AppointmentStatus;
  type: 'in-person' | 'tele-consult';
  symptoms?: string;
  createdAt: string;
  prescriptionId?: string;
  cancelReason?: string;
}

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  dosage: string; // e.g. "500 mg"
  frequency: string; // e.g. "1-0-1 (Twice daily after food)"
  duration: string; // e.g. "5 days"
  instructions: string; // e.g. "Drink plenty of water"
}

export interface Prescription {
  id: string; // e.g. RX-2026-4401
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorLicense: string;
  hospitalName: string;
  date: string;
  diagnosis: string;
  items: PrescriptionItem[];
  advice: string;
  followUpDate?: string;
  digitalSignature: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  title: string;
  category: 'Lab Report' | 'Prescription' | 'X-Ray / Scan' | 'Discharge Summary' | 'Other';
  date: string;
  fileSize: string;
  fileType: string;
  doctorOrLab: string;
  notes?: string;
  fileUrl?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment' | 'prescription' | 'system' | 'reminder';
  date: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  suggestedSpecialty?: string;
  recommendedDoctors?: string[];
  isEmergencyAlert?: boolean;
}
