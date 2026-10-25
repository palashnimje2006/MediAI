import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  runTransaction,
  serverTimestamp,
  setLogLevel,
  type Firestore,
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { Doctor, Hospital, Appointment, Prescription, MedicalRecord, AppNotification, User } from '../types';

// Silence internal Firestore idle stream timeout warnings
try {
  setLogLevel('silent');
} catch {}

let dbInstance: Firestore | null = null;
let databaseId = '';
let projectId = '';

try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(raw);
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    databaseId = config.firestoreDatabaseId || '(default)';
    projectId = config.projectId || '';
    dbInstance = getFirestore(app, databaseId);
    console.log(`[Firestore Server] Connected to Firestore: ${projectId} (DB: ${databaseId})`);
  }
} catch (err) {
  console.warn('[Firestore Server] Initialization error:', err);
}

export function getDb(): Firestore | null {
  return dbInstance;
}

export function getFirestoreMeta() {
  return {
    isAvailable: !!dbInstance,
    projectId,
    databaseId,
  };
}

// ----------------- SEEDING INITIAL DATA -----------------
export async function seedInitialFirestoreData(initialData: {
  users: User[];
  hospitals: Hospital[];
  doctors: Doctor[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  medicalRecords: MedicalRecord[];
  notifications: AppNotification[];
}): Promise<{ seeded: boolean; counts: Record<string, number> }> {
  if (!dbInstance) {
    return { seeded: false, counts: {} };
  }

  const timeoutPromise = new Promise<{ seeded: boolean; counts: Record<string, number> }>((_, reject) =>
    setTimeout(() => reject(new Error('Firestore seeding timed out after 4000ms')), 4000)
  );

  const seedOperation = async (): Promise<{ seeded: boolean; counts: Record<string, number> }> => {
    const counts: Record<string, number> = {};
    // 1. Hospitals
    const hospSnap = await getDocs(collection(dbInstance, 'hospitals'));
    if (hospSnap.empty) {
      console.log('[Firestore Server] Seeding hospitals collection...');
      for (const h of initialData.hospitals) {
        await setDoc(doc(dbInstance, 'hospitals', h.id), h);
      }
      counts.hospitals = initialData.hospitals.length;
    } else {
      counts.hospitals = hospSnap.size;
    }

    // 2. Doctors
    const docSnap = await getDocs(collection(dbInstance, 'doctors'));
    if (docSnap.empty) {
      console.log('[Firestore Server] Seeding doctors collection...');
      for (const d of initialData.doctors) {
        await setDoc(doc(dbInstance, 'doctors', d.id), d);
      }
      counts.doctors = initialData.doctors.length;
    } else {
      counts.doctors = docSnap.size;
    }

    // 3. Users
    const userSnap = await getDocs(collection(dbInstance, 'users'));
    if (userSnap.empty) {
      console.log('[Firestore Server] Seeding users collection...');
      for (const u of initialData.users) {
        await setDoc(doc(dbInstance, 'users', u.id), u);
      }
      counts.users = initialData.users.length;
    } else {
      counts.users = userSnap.size;
    }

    // 4. Appointments & slot locks
    const apptSnap = await getDocs(collection(dbInstance, 'appointments'));
    if (apptSnap.empty) {
      console.log('[Firestore Server] Seeding appointments collection...');
      for (const a of initialData.appointments) {
        await setDoc(doc(dbInstance, 'appointments', a.id), a);
        const lockKey = `${a.doctorId}_${a.date}_${a.timeSlot.replace(/[\s:]/g, '_')}`;
        await setDoc(doc(dbInstance, 'slot_locks', lockKey), {
          appointmentId: a.id,
          doctorId: a.doctorId,
          date: a.date,
          timeSlot: a.timeSlot,
          booked: a.status !== 'cancelled',
          patientId: a.patientId,
        });
      }
      counts.appointments = initialData.appointments.length;
    } else {
      counts.appointments = apptSnap.size;
    }

    // 5. Prescriptions
    const rxSnap = await getDocs(collection(dbInstance, 'prescriptions'));
    if (rxSnap.empty) {
      console.log('[Firestore Server] Seeding prescriptions collection...');
      for (const rx of initialData.prescriptions) {
        await setDoc(doc(dbInstance, 'prescriptions', rx.id), rx);
      }
      counts.prescriptions = initialData.prescriptions.length;
    } else {
      counts.prescriptions = rxSnap.size;
    }

    // 6. Medical Records
    const medSnap = await getDocs(collection(dbInstance, 'medical_records'));
    if (medSnap.empty) {
      console.log('[Firestore Server] Seeding medical_records collection...');
      for (const m of initialData.medicalRecords) {
        await setDoc(doc(dbInstance, 'medical_records', m.id), m);
      }
      counts.medicalRecords = initialData.medicalRecords.length;
    } else {
      counts.medicalRecords = medSnap.size;
    }

    // 7. Notifications
    const notifSnap = await getDocs(collection(dbInstance, 'notifications'));
    if (notifSnap.empty) {
      console.log('[Firestore Server] Seeding notifications collection...');
      for (const n of initialData.notifications) {
        await setDoc(doc(dbInstance, 'notifications', n.id), n);
      }
      counts.notifications = initialData.notifications.length;
    } else {
      counts.notifications = notifSnap.size;
    }

    console.log('[Firestore Server] Initial seed check complete:', counts);
    return { seeded: true, counts };
  };

  try {
    return await Promise.race([seedOperation(), timeoutPromise]);
  } catch (error) {
    console.warn('[Firestore Server] Seeding bypassed or timed out:', error instanceof Error ? error.message : error);
    return { seeded: false, counts: {} };
  }
}

// ----------------- DOCTOR REPOSITORY -----------------
export async function getDoctorsList(filters?: {
  search?: string;
  specialty?: string;
  city?: string;
  maxFee?: number;
  minExp?: number;
}): Promise<Doctor[]> {
  if (!dbInstance) return [];

  try {
    const snap = await getDocs(collection(dbInstance, 'doctors'));
    let docs = snap.docs.map((d) => d.data() as Doctor);

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.name?.toLowerCase().includes(q) ||
          d.specialty?.toLowerCase().includes(q) ||
          d.hospitalName?.toLowerCase().includes(q) ||
          d.city?.toLowerCase().includes(q)
      );
    }
    if (filters?.specialty && filters.specialty !== 'All') {
      docs = docs.filter((d) => d.specialty?.toLowerCase() === filters.specialty!.toLowerCase());
    }
    if (filters?.city && filters.city !== 'All') {
      docs = docs.filter((d) => d.city?.toLowerCase() === filters.city!.toLowerCase());
    }
    if (filters?.maxFee) {
      docs = docs.filter((d) => d.consultationFee <= filters.maxFee!);
    }
    if (filters?.minExp) {
      docs = docs.filter((d) => d.experienceYears >= filters.minExp!);
    }

    return docs;
  } catch (err) {
    console.error('[Firestore Server] Error in getDoctorsList:', err);
    return [];
  }
}

export async function getDoctorById(id: string): Promise<Doctor | null> {
  if (!dbInstance) return null;
  try {
    const snap = await getDoc(doc(dbInstance, 'doctors', id));
    if (!snap.exists()) return null;
    return snap.data() as Doctor;
  } catch (err) {
    console.error('[Firestore Server] Error in getDoctorById:', err);
    return null;
  }
}

export async function updateDoctorScheduleDoc(
  id: string,
  schedule: Partial<Doctor['schedule']>
): Promise<boolean> {
  if (!dbInstance) return false;
  try {
    const docRef = doc(dbInstance, 'doctors', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return false;
    const current = snap.data() as Doctor;
    const updatedSchedule = { ...current.schedule, ...schedule };
    await updateDoc(docRef, { schedule: updatedSchedule });
    return true;
  } catch (err) {
    console.error('[Firestore Server] Error in updateDoctorScheduleDoc:', err);
    return false;
  }
}

// ----------------- HOSPITALS REPOSITORY -----------------
export async function getHospitalsList(filters?: {
  search?: string;
  city?: string;
  department?: string;
}): Promise<Hospital[]> {
  if (!dbInstance) return [];

  try {
    const snap = await getDocs(collection(dbInstance, 'hospitals'));
    let list = snap.docs.map((d) => d.data() as Hospital);

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (h) => h.name?.toLowerCase().includes(q) || h.city?.toLowerCase().includes(q)
      );
    }
    if (filters?.city && filters.city !== 'All') {
      list = list.filter((h) => h.city?.toLowerCase() === filters.city!.toLowerCase());
    }
    if (filters?.department && filters.department !== 'All') {
      list = list.filter((h) =>
        h.departments?.some((d) => d.toLowerCase() === filters.department!.toLowerCase())
      );
    }

    return list;
  } catch (err) {
    console.error('[Firestore Server] Error in getHospitalsList:', err);
    return [];
  }
}

export async function getHospitalById(id: string): Promise<Hospital | null> {
  if (!dbInstance) return null;
  try {
    const snap = await getDoc(doc(dbInstance, 'hospitals', id));
    if (!snap.exists()) return null;
    return snap.data() as Hospital;
  } catch (err) {
    console.error('[Firestore Server] Error in getHospitalById:', err);
    return null;
  }
}

// ----------------- APPOINTMENTS WITH CONCURRENCY GUARD -----------------
export async function getAppointmentsList(filters?: {
  patientId?: string;
  doctorId?: string;
  status?: string;
}): Promise<Appointment[]> {
  if (!dbInstance) return [];

  try {
    const snap = await getDocs(collection(dbInstance, 'appointments'));
    let list = snap.docs.map((d) => d.data() as Appointment);

    if (filters?.patientId) {
      list = list.filter((a) => a.patientId === filters.patientId);
    }
    if (filters?.doctorId) {
      list = list.filter((a) => a.doctorId === filters.doctorId);
    }
    if (filters?.status && filters.status !== 'all') {
      list = list.filter((a) => a.status === filters.status);
    }

    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  } catch (err) {
    console.error('[Firestore Server] Error in getAppointmentsList:', err);
    return [];
  }
}

export async function createAppointmentTransaction(appointmentData: {
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
}): Promise<{ success: boolean; appointment?: Appointment; error?: string; isConflict?: boolean }> {
  if (!dbInstance) {
    return { success: false, error: 'Database service is unavailable' };
  }

  const appointmentId = `MEDI-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const lockKey = `${appointmentData.doctorId}_${appointmentData.date}_${appointmentData.timeSlot.replace(/[\s:]/g, '_')}`;
  const slotRef = doc(dbInstance, 'slot_locks', lockKey);
  const apptRef = doc(dbInstance, 'appointments', appointmentId);
  const notifId = `notif-${Date.now()}`;
  const notifRef = doc(dbInstance, 'notifications', notifId);

  try {
    const newAppointment: Appointment = {
      id: appointmentId,
      ...appointmentData,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    const notificationPayload: AppNotification = {
      id: notifId,
      userId: appointmentData.patientId,
      title: 'Appointment Confirmed',
      message: `Your consultation with ${appointmentData.doctorName} on ${appointmentData.date} at ${appointmentData.timeSlot} is confirmed.`,
      type: 'appointment',
      date: new Date().toISOString(),
      isRead: false,
      actionUrl: '/appointments',
    };

    await runTransaction(dbInstance, async (tx) => {
      const slotSnap = await tx.get(slotRef);
      if (slotSnap.exists()) {
        const slotData = slotSnap.data();
        if (slotData.booked && slotData.status !== 'cancelled') {
          throw new Error('CONCURRENCY_CONFLICT');
        }
      }

      // Reserve slot lock
      tx.set(slotRef, {
        appointmentId,
        doctorId: appointmentData.doctorId,
        date: appointmentData.date,
        timeSlot: appointmentData.timeSlot,
        booked: true,
        patientId: appointmentData.patientId,
        updatedAt: new Date().toISOString(),
      });

      // Write appointment document
      tx.set(apptRef, newAppointment);

      // Write notification
      tx.set(notifRef, notificationPayload);
    });

    return { success: true, appointment: newAppointment };
  } catch (err: any) {
    if (err?.message === 'CONCURRENCY_CONFLICT') {
      return {
        success: false,
        isConflict: true,
        error: 'Concurrency Conflict: This slot has just been booked by another patient. Please choose an alternative slot.',
      };
    }
    console.error('[Firestore Server] createAppointmentTransaction error:', err);
    return { success: false, error: err?.message || 'Failed to complete appointment booking transaction' };
  }
}

export async function updateAppointmentDoc(
  id: string,
  updates: {
    status?: 'confirmed' | 'pending' | 'completed' | 'cancelled';
    cancelReason?: string;
    newDate?: string;
    newTimeSlot?: string;
  }
): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
  if (!dbInstance) return { success: false, error: 'Database unavailable' };

  try {
    const apptRef = doc(dbInstance, 'appointments', id);
    const snap = await getDoc(apptRef);
    if (!snap.exists()) return { success: false, error: 'Appointment not found' };

    const current = snap.data() as Appointment;

    if (updates.status === 'cancelled') {
      current.status = 'cancelled';
      current.cancelReason = updates.cancelReason || 'Cancelled by user';

      // Release slot lock
      const lockKey = `${current.doctorId}_${current.date}_${current.timeSlot.replace(/[\s:]/g, '_')}`;
      await updateDoc(doc(dbInstance, 'slot_locks', lockKey), {
        booked: false,
        status: 'cancelled',
      });

      await updateDoc(apptRef, {
        status: 'cancelled',
        cancelReason: current.cancelReason,
      });

      // Notify
      const notifId = `notif-${Date.now()}`;
      await setDoc(doc(dbInstance, 'notifications', notifId), {
        id: notifId,
        userId: current.patientId,
        title: 'Appointment Cancelled',
        message: `Your appointment ${current.id} with ${current.doctorName} has been cancelled.`,
        type: 'appointment',
        date: new Date().toISOString(),
        isRead: false,
      });

      return { success: true, appointment: current };
    }

    if (updates.newDate && updates.newTimeSlot) {
      // Release old lock
      const oldLockKey = `${current.doctorId}_${current.date}_${current.timeSlot.replace(/[\s:]/g, '_')}`;
      const newLockKey = `${current.doctorId}_${updates.newDate}_${updates.newTimeSlot.replace(/[\s:]/g, '_')}`;
      const newSlotRef = doc(dbInstance, 'slot_locks', newLockKey);

      const checkSnap = await getDoc(newSlotRef);
      if (checkSnap.exists() && checkSnap.data().booked && checkSnap.data().status !== 'cancelled') {
        return { success: false, error: 'Rescheduled slot is already booked. Please choose an alternative slot.' };
      }

      await updateDoc(doc(dbInstance, 'slot_locks', oldLockKey), { booked: false, status: 'rescheduled' });
      await setDoc(newSlotRef, {
        appointmentId: id,
        doctorId: current.doctorId,
        date: updates.newDate,
        timeSlot: updates.newTimeSlot,
        booked: true,
        patientId: current.patientId,
        updatedAt: new Date().toISOString(),
      });

      current.date = updates.newDate;
      current.timeSlot = updates.newTimeSlot;
      current.status = 'confirmed';

      await updateDoc(apptRef, {
        date: updates.newDate,
        timeSlot: updates.newTimeSlot,
        status: 'confirmed',
      });

      return { success: true, appointment: current };
    }

    if (updates.status) {
      current.status = updates.status;
      await updateDoc(apptRef, { status: updates.status });
    }

    return { success: true, appointment: current };
  } catch (err: any) {
    console.error('[Firestore Server] Error in updateAppointmentDoc:', err);
    return { success: false, error: err?.message || 'Update failed' };
  }
}

// ----------------- PRESCRIPTIONS REPOSITORY -----------------
export async function getPrescriptionsList(filters?: {
  patientId?: string;
  doctorId?: string;
}): Promise<Prescription[]> {
  if (!dbInstance) return [];

  try {
    const snap = await getDocs(collection(dbInstance, 'prescriptions'));
    let list = snap.docs.map((d) => d.data() as Prescription);

    if (filters?.patientId) {
      list = list.filter((p) => p.patientId === filters.patientId);
    }
    if (filters?.doctorId) {
      list = list.filter((p) => p.doctorId === filters.doctorId);
    }

    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  } catch (err) {
    console.error('[Firestore Server] Error in getPrescriptionsList:', err);
    return [];
  }
}

export async function createPrescriptionDoc(prescription: Prescription): Promise<boolean> {
  if (!dbInstance) return false;

  try {
    await setDoc(doc(dbInstance, 'prescriptions', prescription.id), prescription);

    // Update appointment if linked
    if (prescription.appointmentId) {
      const apptRef = doc(dbInstance, 'appointments', prescription.appointmentId);
      const snap = await getDoc(apptRef);
      if (snap.exists()) {
        await updateDoc(apptRef, {
          prescriptionId: prescription.id,
          status: 'completed',
        });
      }
    }

    // Write notification
    const notifId = `notif-${Date.now()}`;
    await setDoc(doc(dbInstance, 'notifications', notifId), {
      id: notifId,
      userId: prescription.patientId,
      title: 'New Digital Prescription',
      message: `${prescription.doctorName} has issued your official digital prescription for ${prescription.diagnosis}.`,
      type: 'prescription',
      date: new Date().toISOString(),
      isRead: false,
      actionUrl: '/prescriptions',
    });

    return true;
  } catch (err) {
    console.error('[Firestore Server] Error in createPrescriptionDoc:', err);
    return false;
  }
}

// ----------------- MEDICAL RECORDS REPOSITORY -----------------
export async function getMedicalRecordsList(patientId?: string): Promise<MedicalRecord[]> {
  if (!dbInstance) return [];

  try {
    const snap = await getDocs(collection(dbInstance, 'medical_records'));
    let list = snap.docs.map((d) => d.data() as MedicalRecord);
    if (patientId) {
      list = list.filter((m) => m.patientId === patientId);
    }
    return list;
  } catch (err) {
    console.error('[Firestore Server] Error in getMedicalRecordsList:', err);
    return [];
  }
}

export async function createMedicalRecordDoc(record: MedicalRecord): Promise<boolean> {
  if (!dbInstance) return false;
  try {
    await setDoc(doc(dbInstance, 'medical_records', record.id), record);
    return true;
  } catch (err) {
    console.error('[Firestore Server] Error in createMedicalRecordDoc:', err);
    return false;
  }
}

export async function deleteMedicalRecordDoc(id: string): Promise<boolean> {
  if (!dbInstance) return false;
  try {
    await deleteDoc(doc(dbInstance, 'medical_records', id));
    return true;
  } catch (err) {
    console.error('[Firestore Server] Error in deleteMedicalRecordDoc:', err);
    return false;
  }
}

// ----------------- NOTIFICATIONS REPOSITORY -----------------
export async function getNotificationsList(userId?: string): Promise<AppNotification[]> {
  if (!dbInstance) return [];

  try {
    const snap = await getDocs(collection(dbInstance, 'notifications'));
    let list = snap.docs.map((d) => d.data() as AppNotification);
    if (userId) {
      list = list.filter((n) => n.userId === userId);
    }
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  } catch (err) {
    console.error('[Firestore Server] Error in getNotificationsList:', err);
    return [];
  }
}

export async function markNotificationReadDoc(id: string): Promise<boolean> {
  if (!dbInstance) return false;
  try {
    const ref = doc(dbInstance, 'notifications', id);
    await updateDoc(ref, { isRead: true });
    return true;
  } catch (err) {
    console.error('[Firestore Server] Error in markNotificationReadDoc:', err);
    return false;
  }
}

// ----------------- USERS REPOSITORY -----------------
export async function findUserByEmail(email: string): Promise<User | null> {
  if (!dbInstance) return null;
  try {
    const snap = await getDocs(collection(dbInstance, 'users'));
    const match = snap.docs.find((d) => {
      const data = d.data() as User;
      return data.email?.toLowerCase() === email.toLowerCase();
    });
    return match ? (match.data() as User) : null;
  } catch (err) {
    console.error('[Firestore Server] Error in findUserByEmail:', err);
    return null;
  }
}

export async function saveUserDoc(user: User): Promise<boolean> {
  if (!dbInstance) return false;
  try {
    await setDoc(doc(dbInstance, 'users', user.id), user);
    return true;
  } catch (err) {
    console.error('[Firestore Server] Error in saveUserDoc:', err);
    return false;
  }
}

export async function saveDoctorDoc(doctor: Doctor): Promise<boolean> {
  if (!dbInstance) return false;
  try {
    await setDoc(doc(dbInstance, 'doctors', doctor.id), doctor);
    return true;
  } catch (err) {
    console.error('[Firestore Server] Error in saveDoctorDoc:', err);
    return false;
  }
}
