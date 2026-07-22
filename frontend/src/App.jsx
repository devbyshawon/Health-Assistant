import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/auth/RegisterPage';
import LoginPage from './pages/auth/LoginPage';

const App = () => {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<LandingPage />} />

                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/unauthorized" element={
                    <div className='min-h-screen flex items-center justify-center'>
                        <h1 className='text-2xl font-bold text-gray-900'>403 — Unauthorized</h1>
                    </div>
                } />

                {/* Public doctor directory — no login required */}
                <Route path="/doctors" element={<div className='p-6'>Doctors — Coming Soon</div>} />

                {/* Patient routes */}
                <Route element={<ProtectedRoute allowedRoles={['user']} />}>
                    <Route path="/dashboard" element={<div className='p-6'>Patient Dashboard</div>} />
                    <Route path="/appointments" element={<div className='p-6'>Appointments — Coming Soon</div>} />
                    <Route path="/ai-chat" element={<div className='p-6'>AI Chat — Coming Soon</div>} />
                </Route>

                {/* Doctor routes */}
                <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
                    <Route path="/doctor/dashboard" element={<div className='p-6'>Doctor Dashboard</div>} />
                    <Route path="/doctor/upload-docs" element={<div className='p-6'>Upload Docs</div>} />
                    <Route path="/doctor/appointments" element={<div className='p-6'>Doctor Appointments</div>} />
                </Route>

                {/* Admin routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/admin" element={<div className='p-6'>Admin Dashboard</div>} />
                    <Route path="/admin/users" element={<div className='p-6'>Admin Users</div>} />
                    <Route path="/admin/doctors" element={<div className='p-6'>Admin Doctors</div>} />
                    <Route path="/admin/logs" element={<div className='p-6'>Admin Logs</div>} />
                    <Route path="/admin/settings" element={<div className='p-6'>Admin Settings</div>} />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </>
    );
};

export default App;