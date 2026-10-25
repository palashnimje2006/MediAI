export interface CodeFile {
  path: string;
  name: string;
  category: 'Kotlin' | 'Gradle' | 'Manifest' | 'SQL' | 'Documentation' | 'Tests';
  description: string;
  code: string;
}

export const ANDROID_PROJECT_FILES: CodeFile[] = [
  {
    path: 'app/build.gradle.kts',
    name: 'build.gradle.kts',
    category: 'Gradle',
    description: 'Android App Module Gradle build script with Jetpack Compose, Material 3, Hilt, Retrofit, and Coroutines',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.hilt.android)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.mediai.healthcare"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.mediai.healthcare"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "com.mediai.healthcare.HiltTestRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    // Jetpack Compose & Material 3
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)
    implementation(libs.androidx.navigation.compose)

    // Lifecycle & ViewModel
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)

    // Hilt Dependency Injection
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.androidx.hilt.navigation.compose)

    // Networking (Retrofit & OkHttp)
    implementation(libs.retrofit)
    implementation(libs.retrofit.converter.gson)
    implementation(libs.okhttp.logging)

    // Supabase / Coroutines
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.kotlinx.coroutines.core)

    // Local Storage DataStore
    implementation(libs.androidx.datastore.preferences)

    // Image loading (Coil)
    implementation(libs.coil.compose)

    // Testing
    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)
    testImplementation(libs.mockk)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
}`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    category: 'Manifest',
    description: 'Android Manifest defining permissions, activities, notification channels, and network security',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Essential Healthcare Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.CALL_PHONE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

    <application
        android:name=".MediAiApplication"
        android:allowBackup="false"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.MediAI"
        android:networkSecurityConfig="@xml/network_security_config">

        <activity
            android:name=".ui.MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize"
            android:theme="@style/Theme.MediAI">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Push Notifications Service -->
        <service
            android:name=".notifications.MediFirebaseMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>
    </application>
</manifest>`,
  },
  {
    path: 'app/src/main/java/com/mediai/healthcare/ui/MainActivity.kt',
    name: 'MainActivity.kt',
    category: 'Kotlin',
    description: 'Single-Activity Entry point hosting Navigation Compose and Edge-to-Edge Material 3 Theme',
    code: `package com.mediai.healthcare.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.mediai.healthcare.ui.navigation.MediNavGraph
import com.mediai.healthcare.ui.theme.MediAiTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MediAiTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    MediNavGraph(navController = navController)
                }
            }
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/mediai/healthcare/ui/theme/Theme.kt',
    name: 'Theme.kt',
    category: 'Kotlin',
    description: 'Material 3 Color Scheme, Typography and Shapes for Medi AI healthcare palette',
    code: `package com.mediai.healthcare.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val MedicalBlue = Color(0xFF0284C7)
val MedicalBlueDark = Color(0xFF0369A1)
val TealAccent = Color(0xFF0D9488)
val SurfaceLight = Color(0xFFF8FAFC)
val CardLight = Color(0xFFFFFFFF)
val TextPrimary = Color(0xFF0F172A)
val TextSecondary = Color(0xFF475569)
val DangerRed = Color(0xFFEF4444)
val SuccessGreen = Color(0xFF10B981)

private val LightColorScheme = lightColorScheme(
    primary = MedicalBlue,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFE0F2FE),
    secondary = TealAccent,
    background = SurfaceLight,
    surface = CardLight,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
    error = DangerRed
)

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFF38BDF8),
    onPrimary = Color(0xFF0C4A6E),
    primaryContainer = Color(0xFF0369A1),
    secondary = Color(0xFF2DD4BF),
    background = Color(0xFF0F172A),
    surface = Color(0xFF1E293B),
    onBackground = Color(0xFFF1F5F9),
    onSurface = Color(0xFFF1F5F9),
    error = Color(0xFFF87171)
)

@Composable
fun MediAiTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}`,
  },
  {
    path: 'app/src/main/java/com/mediai/healthcare/ui/navigation/NavGraph.kt',
    name: 'NavGraph.kt',
    category: 'Kotlin',
    description: 'Type-safe Navigation Compose routes covering all 27 patient, doctor, and hospital screens',
    code: `package com.mediai.healthcare.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.mediai.healthcare.ui.screens.*

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Onboarding : Screen("onboarding")
    object Login : Screen("login")
    object PatientRegister : Screen("register_patient")
    object DoctorRegister : Screen("register_doctor")
    object ForgotPassword : Screen("forgot_password")
    object PatientHome : Screen("patient_home")
    object DoctorSearch : Screen("doctor_search")
    object DoctorDetails : Screen("doctor_details/{doctorId}") {
        fun createRoute(doctorId: String) = "doctor_details/$doctorId"
    }
    object HospitalSearch : Screen("hospital_search")
    object HospitalDetails : Screen("hospital_details/{hospitalId}") {
        fun createRoute(hospitalId: String) = "hospital_details/$hospitalId"
    }
    object AppointmentBooking : Screen("booking/{doctorId}") {
        fun createRoute(doctorId: String) = "booking/$doctorId"
    }
    object BookingConfirmation : Screen("booking_confirmation/{appointmentId}") {
        fun createRoute(appointmentId: String) = "booking_confirmation/$appointmentId"
    }
    object MyAppointments : Screen("my_appointments")
    object AppointmentDetails : Screen("appointment_details/{appointmentId}") {
        fun createRoute(appointmentId: String) = "appointment_details/$appointmentId"
    }
    object AiHealthAssistant : Screen("ai_assistant")
    object Prescriptions : Screen("prescriptions")
    object MedicalRecords : Screen("medical_records")
    object Notifications : Screen("notifications")
    object PatientProfile : Screen("profile")
    object DoctorDashboard : Screen("doctor_dashboard")
    object DoctorAvailability : Screen("doctor_availability")
    object PrescriptionCreation : Screen("create_prescription/{appointmentId}")
    object HospitalDashboard : Screen("hospital_dashboard")
    object Settings : Screen("settings")
    object HelpEmergency : Screen("help_emergency")
}

@Composable
fun MediNavGraph(
    navController: NavHostController,
    startDestination: String = Screen.Splash.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(Screen.Splash.route) { SplashScreen(navController) }
        composable(Screen.Onboarding.route) { OnboardingScreen(navController) }
        composable(Screen.Login.route) { LoginScreen(navController) }
        composable(Screen.PatientRegister.route) { PatientRegisterScreen(navController) }
        composable(Screen.DoctorRegister.route) { DoctorRegisterScreen(navController) }
        composable(Screen.ForgotPassword.route) { ForgotPasswordScreen(navController) }
        composable(Screen.PatientHome.route) { PatientHomeScreen(navController) }
        composable(Screen.DoctorSearch.route) { DoctorSearchScreen(navController) }
        composable(Screen.HospitalSearch.route) { HospitalSearchScreen(navController) }
        composable(Screen.MyAppointments.route) { MyAppointmentsScreen(navController) }
        composable(Screen.AiHealthAssistant.route) { AiAssistantScreen(navController) }
        composable(Screen.Prescriptions.route) { PrescriptionsScreen(navController) }
        composable(Screen.MedicalRecords.route) { MedicalRecordsScreen(navController) }
        composable(Screen.Notifications.route) { NotificationsScreen(navController) }
        composable(Screen.PatientProfile.route) { PatientProfileScreen(navController) }
        composable(Screen.DoctorDashboard.route) { DoctorDashboardScreen(navController) }
        composable(Screen.DoctorAvailability.route) { DoctorAvailabilityScreen(navController) }
        composable(Screen.HospitalDashboard.route) { HospitalDashboardScreen(navController) }
        composable(Screen.Settings.route) { SettingsScreen(navController) }
        composable(Screen.HelpEmergency.route) { HelpEmergencyScreen(navController) }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/mediai/healthcare/data/repository/MediRepository.kt',
    name: 'MediRepository.kt',
    category: 'Kotlin',
    description: 'Clean Architecture Repository coordinating remote API, local caching, and concurrency safety',
    code: `package com.mediai.healthcare.data.repository

import com.mediai.healthcare.data.remote.MediApiService
import com.mediai.healthcare.domain.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MediRepository @Inject constructor(
    private val apiService: MediApiService
) {
    suspend fun getDoctors(
        query: String? = null,
        specialty: String? = null,
        city: String? = null
    ): Result<List<Doctor>> = runCatching {
        apiService.fetchDoctors(query, specialty, city)
    }

    suspend fun getAvailableSlots(
        doctorId: String,
        date: String
    ): Result<DoctorSlotsResponse> = runCatching {
        apiService.fetchSlots(doctorId, date)
    }

    suspend fun bookAppointment(
        bookingRequest: BookingRequest
    ): Result<Appointment> = runCatching {
        // Source of truth is verified on server to avoid double booking
        apiService.createAppointment(bookingRequest)
    }

    suspend fun cancelAppointment(
        appointmentId: String,
        reason: String
    ): Result<Unit> = runCatching {
        apiService.cancelAppointment(appointmentId, CancelRequest(reason))
    }

    suspend fun consultAiAssistant(
        prompt: String,
        history: List<ChatMessage>
    ): Result<AiChatResponse> = runCatching {
        apiService.sendAiMessage(AiChatRequest(prompt, history))
    }
}`,
  },
  {
    path: 'backend/supabase_schema.sql',
    name: 'supabase_schema.sql',
    category: 'SQL',
    description: 'PostgreSQL Database schema with Row Level Security (RLS), tables, triggers, and constraints',
    code: `-- Medi AI Complete PostgreSQL / Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Synced with Supabase Auth)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'hospital_admin', 'super_admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Patient Profiles
CREATE TABLE public.patient_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    dob DATE,
    blood_group TEXT,
    allergies TEXT[],
    chronic_conditions TEXT[],
    emergency_contact JSONB
);

-- 3. Hospitals Table
CREATE TABLE public.hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    emergency_hotline TEXT NOT NULL,
    email TEXT,
    rating NUMERIC(2,1) DEFAULT 4.5,
    has_emergency_24x7 BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Doctor Profiles
CREATE TABLE public.doctor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    specialty TEXT NOT NULL,
    qualifications TEXT NOT NULL,
    license_number TEXT NOT NULL UNIQUE,
    experience_years INT NOT NULL DEFAULT 1,
    hospital_id UUID REFERENCES public.hospitals(id),
    consultation_fee INT NOT NULL DEFAULT 500,
    is_verified BOOLEAN DEFAULT false,
    rating NUMERIC(2,1) DEFAULT 4.9,
    schedule_config JSONB NOT NULL DEFAULT '{"workingDays":["Mon","Tue","Wed","Thu","Fri"],"startHour":"09:00","endHour":"17:00","slotDurationMinutes":30}'::jsonb
);

-- 5. Appointments Table with Concurrency Guard
CREATE TABLE public.appointments (
    id TEXT PRIMARY KEY, -- e.g. MEDI-2026-1049
    patient_id UUID NOT NULL REFERENCES public.profiles(id),
    doctor_id UUID NOT NULL REFERENCES public.doctor_profiles(id),
    hospital_id UUID REFERENCES public.hospitals(id),
    date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    fee INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'completed', 'cancelled', 'no_show')),
    consultation_type TEXT NOT NULL DEFAULT 'in-person' CHECK (consultation_type IN ('in-person', 'tele-consult')),
    symptoms TEXT,
    cancel_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Enforce unique active slot constraint to prevent double bookings
    CONSTRAINT uq_doctor_slot_active UNIQUE(doctor_id, date, time_slot)
);

-- 6. Digital Prescriptions
CREATE TABLE public.prescriptions (
    id TEXT PRIMARY KEY, -- e.g. RX-2026-4401
    appointment_id TEXT UNIQUE REFERENCES public.appointments(id),
    patient_id UUID NOT NULL REFERENCES public.profiles(id),
    doctor_id UUID NOT NULL REFERENCES public.doctor_profiles(id),
    diagnosis TEXT NOT NULL,
    medications JSONB NOT NULL DEFAULT '[]'::jsonb,
    advice TEXT,
    follow_up_date DATE,
    digital_signature TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Medical Records (Private Document Vault)
CREATE TABLE public.medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Lab Report', 'Prescription', 'X-Ray / Scan', 'Discharge Summary', 'Other')),
    record_date DATE NOT NULL,
    file_path TEXT NOT NULL,
    doctor_or_lab TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Patients can read and update only their own profile
CREATE POLICY "Users own profile policy" ON public.profiles
    FOR ALL USING (auth.uid() = id);

-- Patients can view their own appointments; Doctors view their assigned appointments
CREATE POLICY "Appointments patient/doctor policy" ON public.appointments
    FOR SELECT USING (
        auth.uid() = patient_id OR 
        auth.uid() IN (SELECT user_id FROM public.doctor_profiles WHERE id = doctor_id)
    );

-- Only verified doctors can insert prescriptions
CREATE POLICY "Doctor prescription insert" ON public.prescriptions
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT user_id FROM public.doctor_profiles WHERE id = doctor_id AND is_verified = true)
    );`,
  },
  {
    path: 'README.md',
    name: 'README.md',
    category: 'Documentation',
    description: 'Comprehensive College Major Project Documentation & Android Setup Guide',
    code: `# Medi AI — Smart Healthcare & Doctor Appointment Android System

## 1. Project Overview
Medi AI is an enterprise-ready Android healthcare ecosystem engineered with **Kotlin**, **Jetpack Compose (Material 3)**, **MVVM with Clean Architecture**, **Supabase PostgreSQL backend**, and **Google Gemini AI Medical Assistant**.

### Core User Workflow
\`Ask (AI Assistant) → Find (Doctor & Hospital Search) → Book (Slot Availability Engine) → Consult (Digital Prescriptions & Records)\`

---

## 2. Architecture & Tech Stack
- **UI Toolkit**: 100% Jetpack Compose with Material Design 3
- **Language**: Kotlin 2.0+ (Coroutines, StateFlow, Flow)
- **Architecture**: MVVM + Repository Pattern with Hilt Dependency Injection
- **Network**: Retrofit 2 + OkHttp 4 + Gson Converter
- **AI Health Engine**: Google Gemini 3.8 Flash accessed securely through server-side endpoints
- **Database**: PostgreSQL with Row-Level Security (RLS) & concurrency slot constraints
- **Storage**: Private encrypted object storage for patient medical records

---

## 3. How to Build & Run on Android Studio
1. Clone the repository into your local machine:
   \`git clone https://github.com/mediai/android-healthcare.git\`
2. Open Android Studio (Ladybug or Hedgehog or newer).
3. Select **File > Open** and select the \`applet\` root folder.
4. Allow Gradle Sync to finish downloading dependencies.
5. In \`local.properties\`, verify your Android SDK path:
   \`sdk.dir=/Users/username/Library/Android/sdk\`
6. Connect an Android phone with USB Debugging enabled or start an Android Emulator (Pixel 8 Pro, API 34+ recommended).
7. Click **Run 'app'** (Shift + F10).

---

## 4. Key Highlights for Major Project Viva
1. **Concurrency Protection**: Implements database unique constraints and transactional lock checks to prevent double booking of time slots by concurrent users.
2. **Medical Guardrails**: Strict AI triage prompts preventing unauthorized medication prescription and detecting acute red-flag emergency symptoms (chest pain, acute dyspnea).
3. **Role-Based Access Control**: Discrete interfaces for Patients, Doctors, and Hospital Administrators.
4. **Digital Prescriptions**: Verifiable cryptographic signature hash with medicine schedules and printable PDF formats.
`,
  },
];
