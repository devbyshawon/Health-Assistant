import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import StatCard from '../../components/StatCard';
import QuickActionCard from '../../components/QuickActionCard';
import { Users, Calendar, Clock, Settings, UserCog, AlertTriangle } from 'lucide-react';

const DoctorDashboard = () => {
    const [stats, setStats] = useState({ patients: 0, upcoming: 0, pendingConfirm: 0 });
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [patientsRes, appointmentsRes, profileRes] = await Promise.all([
                    api.get('/doctor/patients'),
                    api.get('/doctor/appointments'),
                    api.get('/doctor/me').catch(() => null),
                ]);

                const appointments = appointmentsRes.data;

                setStats({
                    patients: patientsRes.data.results,
                    upcoming: appointments.filter(a => a.status === 'Pending' || a.status === 'Confirmed').length,
                    pendingConfirm: appointments.filter(a => a.status === 'Pending').length,
                });

                setVerificationStatus(profileRes?.data?.doctor?.credentials?.status || null);
            } catch (error) {
                setPageError(error.response?.data?.message || 'Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    return (
        <DashboardLayout>
            <div className='max-w-6xl mx-auto'>

                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-teal-900'>Doctor Dashboard</h1>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}

                {!loading && verificationStatus && verificationStatus !== 'Verified' && (
                    <Link
                        to='/doctor/upload-docs'
                        className={`flex items-center gap-4 rounded-xl p-4 mb-6 transition-colors ${
                            verificationStatus === 'Rejected' ? 'bg-red-50 hover:bg-red-100' : 'bg-yellow-50 hover:bg-yellow-100'
                        }`}
                    >
                        <div className={`bg-white p-3 rounded-lg ${
                            verificationStatus === 'Rejected' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                            <AlertTriangle className='w-6 h-6' />
                        </div>
                        <div>
                            <h3 className='font-semibold text-teal-900'>
                                {verificationStatus === 'Rejected' ? 'Verification Rejected' : 'Verification Pending'}
                            </h3>
                            <p className='text-sm text-gray-500'>
                                {verificationStatus === 'Rejected'
                                    ? 'Review and re-upload your documents'
                                    : 'Patients cannot book with you until approved'}
                            </p>
                        </div>
                    </Link>
                )}

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading dashboard...</p>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                        <StatCard icon={Users} label="Total Patients" value={stats.patients} color="blue" />
                        <StatCard icon={Calendar} label="Upcoming Appointments" value={stats.upcoming} color="green" />
                        <StatCard icon={Clock} label="Pending Confirmations" value={stats.pendingConfirm} color="purple" />
                    </div>
                )}

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                    <QuickActionCard to="/doctor/appointments" icon={Calendar} title="My Appointments" description="View and manage your appointments" color="blue" />
                    <QuickActionCard to="/doctor/patients" icon={Users} title="My Patients" description="View patients and their health history" color="green" />
                    <QuickActionCard to="/doctor/profile" icon={UserCog} title="My Profile" description="Update your specialty, bio, and availability" color="purple" />
                    <QuickActionCard to="/settings" icon={Settings} title="Settings" description="Manage your account and preferences" color="blue" />
                </div>

            </div>
        </DashboardLayout>
    );
};

export default DoctorDashboard;