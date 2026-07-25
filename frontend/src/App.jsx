import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/shared/Navbar";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import DoctorDirectory from "./pages/DoctorDirectory";
import PatientDashboard from "./pages/patient/PatientDashboard";
import HealthLogs from "./pages/patient/HealthLogsPage";
import ReminderPage from "./pages/patient/RemindersPage";
import AppointmentPage from "./pages/patient/AppointmentsPage";
import BookAppointmentPage from "./pages/patient/BookAppointmentPage";
import PrescriptionPage from "./pages/patient/PrescriptionsPage";


const App = () => {
    return (
        <>
            <Navbar />
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
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

                {/* Public doctor directory — no login required */}
                <Route path="/doctors" element={<DoctorDirectory />} />

                {/* Patient routes */}
                <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
                    <Route path="/dashboard" element={<PatientDashboard />} />
                    <Route path="/healthlogs" element={<HealthLogs />} />
                    <Route path="/reminders" element={<ReminderPage />} />
                    <Route path="/appointments" element={<AppointmentPage />} />
                    <Route path="/appointments/book" element={<BookAppointmentPage />} />
                    <Route path="/prescriptions" element={<PrescriptionPage />} />
                    <Route path="/ai-chat" element={<div className="p-6">AI Chat — Coming Soon</div>} />
                </Route>

                {/* Doctor routes */}
                <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
                    <Route path="/doctor/dashboard" element={<div className="p-6">Doctor Dashboard</div>} />
                    <Route path="/doctor/upload-docs" element={<div className="p-6">Upload Docs</div>} />
                    <Route path="/doctor/appointments" element={<div className="p-6">Doctor Appointments</div>} />
                </Route>

                {/* Admin routes */}
                <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                    <Route path="/admin" element={<div className="p-6">Admin Dashboard</div>} />
                    <Route path="/admin/users" element={<div className="p-6">Admin Users</div>} />
                    <Route path="/admin/doctors" element={<div className="p-6">Admin Doctors</div>} />
                    <Route path="/admin/logs" element={<div className="p-6">Admin Logs</div>} />
                    <Route path="/admin/settings" element={<div className="p-6">Admin Settings</div>} />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </>
    );
};

export default App;