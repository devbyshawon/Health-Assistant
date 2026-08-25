import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/shared/Navbar";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import VerifiedDoctorRoute from "./components/shared/VerifiedDoctorRoute";

//Publict Routes
import LandingPage from "./pages/public/LandingPage";
import AboutPage from './pages/public/AboutPage';
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage';
import TermsOfServicePage from './pages/public/TermsOfServicePage';
import DoctorDirectory from "./pages/public/DoctorDirectory";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";

//Patient Routes
import PatientDashboard from "./pages/patient/PatientDashboard";
import AppointmentPage from "./pages/patient/AppointmentsPage";
import BookAppointmentPage from "./pages/patient/BookAppointmentPage";
import HealthLogs from "./pages/patient/HealthLogsPage";
import ReminderPage from "./pages/patient/RemindersPage";
import PrescriptionPage from "./pages/patient/PrescriptionsPage";
import AISymptomChecker from "./pages/patient/AISymptomCheckerPage";
import AIChat from "./pages/patient/ConversationalAIChatPage";
import TermSimplifier from "./pages/patient/MedicalTermSimplifierPage";
import VisitPrep from "./pages/patient/DoctorVisitPrepPage";
import AIAssistantHub from "./pages/patient/AIAssistantHub";
import AIHistoryPage from "./pages/patient/AIHistoryPage";

//Doctor Routes
import UploadDocs from "./pages/doctor/DoctorDocumentUploadPage";
import DoctorProfile from "./pages/doctor/DoctorProfilePage";
import DoctorAppointments from "./pages/doctor/DoctorAppointmentsPage";
import DoctorPatients from "./pages/doctor/DoctorsPatientsList";
import PatientHealthLogs from "./pages/doctor/PatientHealthLogs";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";

//Admin Routes
import UsersManagement from "./pages/admin/UsersManagementPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AuditLogs from "./pages/admin/AuditLogsPage";
import PendingDoctors from "./pages/admin/PendingDoctorsPage";
import SystemSettings from "./pages/admin/SystemSettingsPage";
import DoctorsManagement from "./pages/admin/AllDoctorsPage";
import Hospitals from "./pages/admin/HospitalsPage";
import SendNotification from "./pages/admin/SendNotificationPage";

//All Users Routes
import Settings from "./pages/SettingsPage";
import Notifications from "./pages/NotificationsPage";



const App = () => {
    return (
        <>
            <Navbar />
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                <Route path="/doctors" element={<DoctorDirectory />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/unauthorized" element={ 
                    <div className="min-h-screen flex items-center justify-center">
                        <h1 className="text-2xl font-bold text-gray-900">
                            403 — Unauthorized
                        </h1>
                    </div>
                    }
                />                

                {/* Patient routes */}
                <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
                    <Route path="/dashboard" element={<PatientDashboard />} />
                    <Route path="/appointments" element={<AppointmentPage />} />
                    <Route path="/appointments/book" element={<BookAppointmentPage />} />
                    <Route path="/healthlogs" element={<HealthLogs />} />
                    <Route path="/reminders" element={<ReminderPage />} />                   
                    <Route path="/prescriptions" element={<PrescriptionPage />} />
                    <Route path="/ai-chat" element={<AIAssistantHub />} />
                    <Route path="/ai/chat" element={<AIChat />} />
                    <Route path="/ai/symptom-checker" element={<AISymptomChecker />} />
                    <Route path="/ai/term-simplifier" element={<TermSimplifier />} />
                    <Route path="/ai/visit-prep" element={<VisitPrep />} />
                    <Route path="/ai/history" element={<AIHistoryPage />} />
                </Route>

                {/* Doctor routes */}
                <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
                    {/* Always accessible to any doctor, verified or not */}
                    <Route path="/doctor/upload-docs" element={<UploadDocs />} />

                    {/* Only accessible once verified */}
                    <Route element={<VerifiedDoctorRoute />}>
                        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
                        <Route path="/doctor/patients" element={<DoctorPatients />} />
                        <Route path="/doctor/profile" element={<DoctorProfile />} />
                        <Route path="/doctor/patients/:patientId/healthlogs" element={<PatientHealthLogs />} />
                    </Route>
                </Route>

                {/* Admin routes */}
                <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<UsersManagement />} />
                    <Route path="/admin/doctors" element={<DoctorsManagement />} />
                    <Route path="/admin/doctors/pending" element={<PendingDoctors />} />
                    <Route path="/admin/hospitals" element={<Hospitals />} />
                    <Route path="/admin/notify" element={<SendNotification />} />
                    <Route path="/admin/logs" element={<AuditLogs />} />
                    <Route path="/admin/settings" element={<SystemSettings />} />
                </Route>

                {/* Shared routes — accessible to all logged-in roles */}
                <Route element={<ProtectedRoute allowedRoles={["user", "doctor", "admin"]} />}>
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/notifications" element={<Notifications />} />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </>
    );
};

export default App;