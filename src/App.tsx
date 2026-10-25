import React, { useState, useEffect } from 'react';
import { AndroidPhoneFrame } from './components/AndroidPhoneFrame';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { CodeInspectorModal } from './components/CodeInspectorModal';
import { PrescriptionModal } from './components/PrescriptionModal';
import { AppointmentPassModal } from './components/AppointmentPassModal';
import { EmergencyModal } from './components/EmergencyModal';

// Screens
import { SplashScreen } from './screens/SplashScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { LoginScreen } from './screens/LoginScreen';
import { PatientRegisterScreen } from './screens/PatientRegisterScreen';
import { DoctorRegisterScreen } from './screens/DoctorRegisterScreen';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { PatientHomeScreen } from './screens/PatientHomeScreen';
import { DoctorSearchScreen } from './screens/DoctorSearchScreen';
import { DoctorDetailsScreen } from './screens/DoctorDetailsScreen';
import { HospitalSearchScreen } from './screens/HospitalSearchScreen';
import { HospitalDetailsScreen } from './screens/HospitalDetailsScreen';
import { BookingScreen } from './screens/BookingScreen';
import { BookingConfirmationScreen } from './screens/BookingConfirmationScreen';
import { MyAppointmentsScreen } from './screens/MyAppointmentsScreen';
import { AppointmentDetailsScreen } from './screens/AppointmentDetailsScreen';
import { AiHealthAssistantScreen } from './screens/AiHealthAssistantScreen';
import { PrescriptionsScreen } from './screens/PrescriptionsScreen';
import { MedicalRecordsScreen } from './screens/MedicalRecordsScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { PatientProfileScreen } from './screens/PatientProfileScreen';
import { DoctorDashboardScreen } from './screens/DoctorDashboardScreen';
import { DoctorAvailabilityScreen } from './screens/DoctorAvailabilityScreen';
import { DoctorAppointmentsManageScreen } from './screens/DoctorAppointmentsManageScreen';
import { PrescriptionCreationScreen } from './screens/PrescriptionCreationScreen';
import { HospitalDashboardScreen } from './screens/HospitalDashboardScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { HelpSupportScreen } from './screens/HelpSupportScreen';

import { User, UserRole, Doctor, Appointment, Prescription } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>('splash');
  const [navHistory, setNavHistory] = useState<string[]>([]);
  const [darkTheme, setDarkTheme] = useState<boolean>(true);
  const [isFramed, setIsFramed] = useState<boolean>(true);

  // Active user profile (defaults to demo patient Rahul Verma)
  const [currentUser, setCurrentUser] = useState<User>({
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
  });

  // Navigation state payloads
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('doc-01');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('hosp-01');
  const [activeDoctorForBooking, setActiveDoctorForBooking] = useState<Doctor | null>(null);
  const [activeConfirmedAppointment, setActiveConfirmedAppointment] = useState<Appointment | null>(null);
  const [selectedAppointmentForDetails, setSelectedAppointmentForDetails] = useState<Appointment | null>(null);
  const [targetAppointmentForPrescription, setTargetAppointmentForPrescription] = useState<Appointment | undefined>();
  const [targetPrescriptionForModal, setTargetPrescriptionForModal] = useState<Prescription | null>(null);

  // Modals
  const [isCodeInspectorOpen, setIsCodeInspectorOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(1);

  // Apply dark class to body
  useEffect(() => {
    if (darkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkTheme]);

  // Navigate helper with history stack
  const navigateTo = (screen: string, data?: any) => {
    setNavHistory((prev) => [...prev, currentScreen]);
    if (data?.doctorId) setSelectedDoctorId(data.doctorId);
    if (data?.hospitalId) setSelectedHospitalId(data.hospitalId);
    if (data?.appointment) setSelectedAppointmentForDetails(data.appointment);
    if (data?.appointmentId) {
      setTargetAppointmentForPrescription({ id: data.appointmentId, patientName: data.patientName } as any);
    }
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    if (navHistory.length > 0) {
      const prev = navHistory[navHistory.length - 1];
      setNavHistory(navHistory.slice(0, -1));
      setCurrentScreen(prev);
    } else {
      // Default fallback
      if (currentUser.role === 'doctor') setCurrentScreen('doctor_dashboard');
      else if (currentUser.role === 'hospital_admin') setCurrentScreen('hospital_dashboard');
      else setCurrentScreen('patient_home');
    }
  };

  // Role Switcher for instant testing
  const handleRoleSwitch = (newRole: UserRole) => {
    if (newRole === 'patient') {
      setCurrentUser({
        id: 'user-pat-01',
        name: 'Rahul Verma',
        email: 'rahul.verma@example.com',
        phone: '+91 98765 43210',
        role: 'patient',
        bloodGroup: 'B+',
        allergies: ['Penicillin', 'Peanuts'],
        chronicConditions: ['Mild Asthma'],
        emergencyContact: { name: 'Sunita Verma', relation: 'Mother', phone: '+91 98765 12345' },
        createdAt: '2026-01-10T08:00:00Z',
      });
      setCurrentScreen('patient_home');
    } else if (newRole === 'doctor') {
      setCurrentUser({
        id: 'user-doc-01',
        name: 'Dr. Priya Sharma',
        email: 'dr.priya@apollo.med',
        phone: '+91 91234 56789',
        role: 'doctor',
        specialty: 'Cardiologist',
        qualifications: 'MBBS, MD (Medicine), DM (Cardiology)',
        licenseNumber: 'NMC-CARD-2012-8819',
        experienceYears: 14,
        hospitalAffiliation: 'Apollo Hospital',
        hospitalId: 'hosp-02',
        consultationFee: 1200,
        isVerified: true,
        createdAt: '2025-08-12T09:00:00Z',
      });
      setCurrentScreen('doctor_dashboard');
    } else {
      setCurrentUser({
        id: 'user-hosp-01',
        name: 'Admin - Apollo Bengaluru',
        email: 'admin.blr@apollo.med',
        phone: '+91 80 2630 4050',
        role: 'hospital_admin',
        createdAt: '2025-01-01T00:00:00Z',
      });
      setCurrentScreen('hospital_dashboard');
    }
  };

  // Open Prescription Modal
  const handleOpenPrescriptionModal = (prescription: Prescription) => {
    setTargetPrescriptionForModal(prescription);
    setIsPrescriptionModalOpen(true);
  };

  // Open Prescription by ID from appointment
  const handleOpenPrescriptionById = async (prescriptionId: string) => {
    try {
      const res = await fetch('/api/prescriptions');
      const data: Prescription[] = await res.json();
      const match = data.find((p) => p.id === prescriptionId);
      if (match) {
        handleOpenPrescriptionModal(match);
      } else {
        alert(`Prescription #${prescriptionId} found in verified records.`);
      }
    } catch {}
  };

  // Screen title & subtitle mapping
  const getScreenMeta = () => {
    switch (currentScreen) {
      case 'patient_home':
        return { title: 'Medi AI', subtitle: 'Healthcare System' };
      case 'doctor_search':
        return { title: 'Find Doctors', subtitle: 'Verified Specialists' };
      case 'doctor_details':
        return { title: 'Specialist Profile', subtitle: 'Doctor Details' };
      case 'hospital_search':
        return { title: 'Hospitals', subtitle: 'Emergency & Specialty Centers' };
      case 'hospital_details':
        return { title: 'Hospital Details', subtitle: 'Departments & Doctors' };
      case 'booking':
        return { title: 'Book Appointment', subtitle: 'Slot Selection' };
      case 'booking_confirmation':
        return { title: 'Confirmed', subtitle: 'Appointment Pass' };
      case 'my_appointments':
        return { title: 'My Bookings', subtitle: 'Consultation Schedule' };
      case 'appointment_details':
        return { title: 'Appointment Details', subtitle: 'Status & Timeline' };
      case 'ai_assistant':
        return { title: 'Medi AI Assistant', subtitle: 'Clinical Triage & Symptoms' };
      case 'prescriptions':
        return { title: 'Digital Prescriptions', subtitle: 'Official NMC Records' };
      case 'medical_records':
        return { title: 'Medical Vault', subtitle: 'Encrypted Documents' };
      case 'notifications':
        return { title: 'Notifications', subtitle: 'Appointment & Health Alerts' };
      case 'profile':
        return { title: 'Patient Profile', subtitle: 'Health Records & Settings' };
      case 'doctor_dashboard':
        return { title: 'Doctor Console', subtitle: 'Consultations & Revenue' };
      case 'doctor_availability':
        return { title: 'Manage Schedule', subtitle: 'Weekly Hours & Leaves' };
      case 'doctor_appointments':
        return { title: 'Patient Queue', subtitle: 'Today’s Consultations' };
      case 'create_prescription':
        return { title: 'Issue Prescription', subtitle: 'Digital Rx Form' };
      case 'hospital_dashboard':
        return { title: 'Hospital Admin', subtitle: 'OPD & Casualty Wing' };
      case 'settings':
        return { title: 'Settings', subtitle: 'Preferences & Privacy' };
      case 'help_support':
        return { title: 'Help & Emergency', subtitle: 'Helplines Directory' };
      default:
        return { title: 'Medi AI', subtitle: 'Smart Healthcare' };
    }
  };

  const meta = getScreenMeta();
  const showTopAndBottomBars =
    currentScreen !== 'splash' &&
    currentScreen !== 'onboarding' &&
    currentScreen !== 'login' &&
    currentScreen !== 'register_patient' &&
    currentScreen !== 'register_doctor' &&
    currentScreen !== 'forgot_password';

  return (
    <AndroidPhoneFrame
      isFramed={isFramed}
      onToggleFrame={() => setIsFramed(!isFramed)}
      darkTheme={darkTheme}
    >
      {/* Top App Bar */}
      {showTopAndBottomBars && (
        <TopAppBar
          title={meta.title}
          subtitle={meta.subtitle}
          showBack={navHistory.length > 0}
          onBack={handleBack}
          unreadCount={unreadNotificationsCount}
          onNotificationClick={() => navigateTo('notifications')}
          onOpenCodeInspector={() => setIsCodeInspectorOpen(true)}
          userRole={currentUser.role}
          onRoleSwitch={handleRoleSwitch}
          isFramed={isFramed}
          onToggleFrame={() => setIsFramed(!isFramed)}
        />
      )}

      {/* Screen Render Router */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {currentScreen === 'splash' && (
          <SplashScreen onComplete={() => setCurrentScreen('onboarding')} />
        )}

        {currentScreen === 'onboarding' && (
          <OnboardingScreen
            onFinish={() => setCurrentScreen('login')}
            onGoToLogin={() => setCurrentScreen('login')}
            onGoToRegister={() => setCurrentScreen('register_patient')}
          />
        )}

        {currentScreen === 'login' && (
          <LoginScreen
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              if (user.role === 'doctor') setCurrentScreen('doctor_dashboard');
              else if (user.role === 'hospital_admin') setCurrentScreen('hospital_dashboard');
              else setCurrentScreen('patient_home');
            }}
            onNavigateToRegisterPatient={() => setCurrentScreen('register_patient')}
            onNavigateToRegisterDoctor={() => setCurrentScreen('register_doctor')}
            onNavigateToForgotPassword={() => setCurrentScreen('forgot_password')}
          />
        )}

        {currentScreen === 'register_patient' && (
          <PatientRegisterScreen
            onSuccess={(user) => {
              setCurrentUser(user);
              setCurrentScreen('patient_home');
            }}
            onGoToLogin={() => setCurrentScreen('login')}
          />
        )}

        {currentScreen === 'register_doctor' && (
          <DoctorRegisterScreen
            onSuccess={(user) => {
              setCurrentUser(user);
              setCurrentScreen('doctor_dashboard');
            }}
            onGoToLogin={() => setCurrentScreen('login')}
          />
        )}

        {currentScreen === 'forgot_password' && (
          <ForgotPasswordScreen onBackToLogin={() => setCurrentScreen('login')} />
        )}

        {currentScreen === 'patient_home' && (
          <PatientHomeScreen
            user={currentUser}
            onNavigate={(scr, data) => navigateTo(scr, data)}
            onOpenEmergency={() => setIsEmergencyModalOpen(true)}
            onOpenPass={(appt) => {
              setSelectedAppointmentForDetails(appt);
              setIsPassModalOpen(true);
            }}
          />
        )}

        {currentScreen === 'doctor_search' && (
          <DoctorSearchScreen
            initialSearch=""
            initialSpecialty="All"
            onSelectDoctor={(docId) => {
              setSelectedDoctorId(docId);
              navigateTo('doctor_details', { doctorId: docId });
            }}
            onBack={navHistory.length > 0 ? handleBack : undefined}
          />
        )}

        {currentScreen === 'doctor_details' && (
          <DoctorDetailsScreen
            doctorId={selectedDoctorId}
            onBack={handleBack}
            onBookNow={(doc) => {
              setActiveDoctorForBooking(doc);
              navigateTo('booking');
            }}
          />
        )}

        {currentScreen === 'hospital_search' && (
          <HospitalSearchScreen
            onSelectHospital={(hospId) => {
              setSelectedHospitalId(hospId);
              navigateTo('hospital_details', { hospitalId: hospId });
            }}
            onBack={navHistory.length > 0 ? handleBack : undefined}
          />
        )}

        {currentScreen === 'hospital_details' && (
          <HospitalDetailsScreen
            hospitalId={selectedHospitalId}
            onBack={handleBack}
            onSelectDoctor={(docId) => {
              setSelectedDoctorId(docId);
              navigateTo('doctor_details', { doctorId: docId });
            }}
          />
        )}

        {currentScreen === 'booking' && activeDoctorForBooking && (
          <BookingScreen
            doctor={activeDoctorForBooking}
            currentUser={currentUser}
            onBack={handleBack}
            onBookingSuccess={(appt) => {
              setActiveConfirmedAppointment(appt);
              setCurrentScreen('booking_confirmation');
            }}
          />
        )}

        {currentScreen === 'booking_confirmation' && activeConfirmedAppointment && (
          <BookingConfirmationScreen
            appointment={activeConfirmedAppointment}
            onGoToAppointments={() => setCurrentScreen('my_appointments')}
            onGoToHome={() => setCurrentScreen('patient_home')}
          />
        )}

        {currentScreen === 'my_appointments' && (
          <MyAppointmentsScreen
            currentUser={currentUser}
            onSelectAppointment={(appt) => {
              setSelectedAppointmentForDetails(appt);
              navigateTo('appointment_details');
            }}
            onOpenPass={(appt) => {
              setSelectedAppointmentForDetails(appt);
              setIsPassModalOpen(true);
            }}
            onViewPrescription={(rxId) => handleOpenPrescriptionById(rxId)}
            onBookNew={() => navigateTo('doctor_search')}
          />
        )}

        {currentScreen === 'appointment_details' && selectedAppointmentForDetails && (
          <AppointmentDetailsScreen
            appointment={selectedAppointmentForDetails}
            onBack={handleBack}
            onAppointmentUpdated={() => {}}
            onViewPrescription={(rxId) => handleOpenPrescriptionById(rxId)}
          />
        )}

        {currentScreen === 'ai_assistant' && (
          <AiHealthAssistantScreen
            onSelectDoctorByName={(docName) => {
              navigateTo('doctor_search', { search: docName });
            }}
            onNavigateToSpecialty={(specialty) => {
              navigateTo('doctor_search', { specialty });
            }}
            onOpenEmergency={() => setIsEmergencyModalOpen(true)}
          />
        )}

        {currentScreen === 'prescriptions' && (
          <PrescriptionsScreen
            currentUser={currentUser}
            onOpenPrescriptionModal={handleOpenPrescriptionModal}
          />
        )}

        {currentScreen === 'medical_records' && (
          <MedicalRecordsScreen currentUser={currentUser} />
        )}

        {currentScreen === 'notifications' && (
          <NotificationsScreen
            currentUser={currentUser}
            onNavigate={(scr, data) => navigateTo(scr, data)}
          />
        )}

        {currentScreen === 'profile' && (
          <PatientProfileScreen
            currentUser={currentUser}
            onNavigate={(scr) => navigateTo(scr)}
            onLogout={() => {
              setCurrentScreen('login');
              setNavHistory([]);
            }}
            onUpdateUser={(updated) => setCurrentUser(updated)}
          />
        )}

        {currentScreen === 'doctor_dashboard' && (
          <DoctorDashboardScreen
            currentUser={currentUser}
            onNavigate={(scr, data) => navigateTo(scr, data)}
          />
        )}

        {currentScreen === 'doctor_availability' && (
          <DoctorAvailabilityScreen
            currentUser={currentUser}
            onBack={handleBack}
          />
        )}

        {currentScreen === 'doctor_appointments' && (
          <DoctorAppointmentsManageScreen
            currentUser={currentUser}
            onBack={handleBack}
            onWritePrescription={(appt) => {
              setTargetAppointmentForPrescription(appt);
              navigateTo('create_prescription');
            }}
          />
        )}

        {currentScreen === 'create_prescription' && (
          <PrescriptionCreationScreen
            currentUser={currentUser}
            targetAppointment={targetAppointmentForPrescription}
            onBack={handleBack}
            onSuccess={(rx) => {
              handleOpenPrescriptionModal(rx);
              navigateTo('doctor_dashboard');
            }}
          />
        )}

        {currentScreen === 'hospital_dashboard' && (
          <HospitalDashboardScreen
            currentUser={currentUser}
            onNavigate={(scr) => navigateTo(scr)}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            currentUser={currentUser}
            darkTheme={darkTheme}
            onToggleTheme={() => setDarkTheme(!darkTheme)}
            isFramed={isFramed}
            onToggleFrame={() => setIsFramed(!isFramed)}
            onBack={handleBack}
            onOpenCodeInspector={() => setIsCodeInspectorOpen(true)}
          />
        )}

        {currentScreen === 'help_support' && (
          <HelpSupportScreen
            onBack={handleBack}
            onOpenEmergency={() => setIsEmergencyModalOpen(true)}
          />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      {showTopAndBottomBars && (
        <BottomNavBar
          currentScreen={currentScreen}
          onNavigate={(scr) => navigateTo(scr)}
          userRole={currentUser.role}
        />
      )}

      {/* Interactive Modals */}
      <CodeInspectorModal
        isOpen={isCodeInspectorOpen}
        onClose={() => setIsCodeInspectorOpen(false)}
      />

      <PrescriptionModal
        prescription={targetPrescriptionForModal}
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
      />

      <AppointmentPassModal
        appointment={selectedAppointmentForDetails}
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        onViewPrescription={(rxId) => handleOpenPrescriptionById(rxId)}
      />

      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </AndroidPhoneFrame>
  );
}
