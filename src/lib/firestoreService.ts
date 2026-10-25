import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Doctor, Hospital, Appointment, Prescription, MedicalRecord, AppNotification, User } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------- USERS -----------------
export async function saveUserProfile(user: User): Promise<void> {
  const path = `users/${user.id}`;
  try {
    await setDoc(doc(db, 'users', user.id), {
      ...user,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserProfile(userId: string): Promise<User | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return null;
    return snap.data() as User;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// ----------------- DOCTORS -----------------
export async function fetchDoctorsFromFirestore(filters?: {
  specialty?: string;
  city?: string;
  search?: string;
  maxFee?: number;
}): Promise<Doctor[]> {
  const path = 'doctors';
  try {
    const snap = await getDocs(collection(db, 'doctors'));
    let docs = snap.docs.map((d) => d.data() as Doctor);

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          d.hospitalName.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q)
      );
    }
    if (filters?.specialty && filters.specialty !== 'All') {
      docs = docs.filter((d) => d.specialty.toLowerCase() === filters.specialty!.toLowerCase());
    }
    if (filters?.city && filters.city !== 'All') {
      docs = docs.filter((d) => d.city.toLowerCase() === filters.city!.toLowerCase());
    }
    if (filters?.maxFee) {
      docs = docs.filter((d) => d.consultationFee <= filters.maxFee!);
    }

    return docs;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchDoctorById(doctorId: string): Promise<Doctor | null> {
  const path = `doctors/${doctorId}`;
  try {
    const snap = await getDoc(doc(db, 'doctors', doctorId));
    if (!snap.exists()) return null;
    return snap.data() as Doctor;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// ----------------- HOSPITALS -----------------
export async function fetchHospitalsFromFirestore(filters?: {
  city?: string;
  search?: string;
}): Promise<Hospital[]> {
  const path = 'hospitals';
  try {
    const snap = await getDocs(collection(db, 'hospitals'));
    let list = snap.docs.map((d) => d.data() as Hospital);

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (h) => h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q)
      );
    }
    if (filters?.city && filters.city !== 'All') {
      list = list.filter((h) => h.city.toLowerCase() === filters.city!.toLowerCase());
    }

    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// ----------------- APPOINTMENTS WITH TRANSACTION CONCURRENCY LOCK -----------------
export async function createAppointmentWithConcurrencyGuard(bookingData: {
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  hospitalName: string;
  hospitalAddress: string;
  date: string;
  timeSlot: string;
  fee: number;
  type: 'in-person' | 'tele-consult';
  symptoms?: string;
}): Promise<Appointment> {
  const appointmentId = `MEDI-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const lockKey = `${bookingData.doctorId}_${bookingData.date}_${bookingData.timeSlot.replace(/[\s:]/g, '_')}`;
  const slotRef = doc(db, 'slot_locks', lockKey);
  const apptRef = doc(db, 'appointments', appointmentId);

  try {
    const newAppointment: Appointment = {
      id: appointmentId,
      ...bookingData,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    // Use Firestore Transaction to atomically ensure slot is not already booked
    await runTransaction(db, async (transaction) => {
      const slotSnap = await transaction.get(slotRef);
      if (slotSnap.exists() && slotSnap.data().booked && slotSnap.data().status !== 'cancelled') {
        throw new Error('CONCURRENCY_ERROR: Slot already reserved by another patient. Please pick another slot.');
      }

      // Reserve lock document
      transaction.set(slotRef, {
        appointmentId,
        doctorId: bookingData.doctorId,
        date: bookingData.date,
        timeSlot: bookingData.timeSlot,
        booked: true,
        patientId: bookingData.patientId,
        updatedAt: serverTimestamp(),
      });

      // Write appointment document
      transaction.set(apptRef, newAppointment);
    });

    return newAppointment;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `appointments/${appointmentId}`);
  }
}

export async function fetchAppointmentsForUser(
  userId: string,
  role: 'patient' | 'doctor'
): Promise<Appointment[]> {
  const path = 'appointments';
  try {
    const qField = role === 'doctor' ? 'doctorId' : 'patientId';
    const q = query(collection(db, 'appointments'), where(qField, '==', userId));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => d.data() as Appointment);
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateAppointmentStatusInFirestore(
  appointmentId: string,
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled',
  cancelReason?: string
): Promise<void> {
  const path = `appointments/${appointmentId}`;
  try {
    const ref = doc(db, 'appointments', appointmentId);
    await updateDoc(ref, {
      status,
      cancelReason: cancelReason || null,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ----------------- PRESCRIPTIONS -----------------
export async function createPrescriptionInFirestore(prescription: Prescription): Promise<void> {
  const path = `prescriptions/${prescription.id}`;
  try {
    await setDoc(doc(db, 'prescriptions', prescription.id), {
      ...prescription,
      createdAt: serverTimestamp(),
    });

    // Mark appointment with prescriptionId if linked
    if (prescription.appointmentId) {
      await updateDoc(doc(db, 'appointments', prescription.appointmentId), {
        prescriptionId: prescription.id,
        status: 'completed',
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchPrescriptionsForUser(
  userId: string,
  role: 'patient' | 'doctor'
): Promise<Prescription[]> {
  const path = 'prescriptions';
  try {
    const qField = role === 'doctor' ? 'doctorId' : 'patientId';
    const q = query(collection(db, 'prescriptions'), where(qField, '==', userId));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => d.data() as Prescription);
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
