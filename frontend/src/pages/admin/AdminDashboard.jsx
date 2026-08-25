import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import StatCard from '../../components/StatCard';
import QuickActionCard from '../../components/QuickActionCard';
import { Link } from 'react-router-dom';
import { Users, Stethoscope, ClipboardList, UserCheck, Settings, AlertTriangle, ShieldCheck } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, doctors: 0, pendingDoctors: 0 });
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [userResponse, doctorResponse, pendingResponse] = await Promise.all([
                    api.get('/admin/users'),
                    api.get('/admin/doctors?verified=true'),
                    api.get('/admin/doctors/pending')
                ]);

                setStats({
                    users: userResponse.data.results,
                    doctors: doctorResponse.data.results,
                    pendingDoctors: pendingResponse.data.results
                });
            } catch (error) {
                setPageError(error.response?.data?.message || 'Failed to load dashboard stats');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    return (
        <DashboardLayout>
            <div className='max-w-6xl mx-auto'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-teal-900'>Admin Dashboard</h1>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}

                {!loading && stats.pendingDoctors > 0 && (
                    <Link
                        to='/admin/doctors/pending'
                        className='flex items-center justify-between bg-blue-50 border border-blue-200 text-teal-900 px-4 py-3 rounded-lg mb-6 hover:bg-blue-100 transition-colors cursor-pointer'
                    >
                        <div className='flex items-center gap-3'>
                            <AlertTriangle className='w-5 h-5 shrink-0' />
                            <p className='text-sm font-medium'>
                                {stats.pendingDoctors} doctor{stats.pendingDoctors > 1 ? 's' : ''} awaiting verification — review now
                            </p>
                        </div>
                        <span className='text-sm font-medium'>Verify Doctor →</span>
                    </Link>
                )}

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading dashboard...</p>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                        <StatCard icon={Users} label="Total Patients" value={stats.users} color="blue" />
                        <StatCard icon={Stethoscope} label="Total Doctors" value={stats.doctors} color="green" />
                        <StatCard icon={ShieldCheck} label="Pending Verifications" value={stats.pendingDoctors} color="purple" />
                    </div>
                )}

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                    <QuickActionCard to="/admin/users" icon={UserCheck} title="Manage Users" description="View and manage all registered users" color="blue" />
                    <QuickActionCard to="/admin/doctors" icon={Stethoscope} title="Manage Doctors" description="View and manage all registered doctors" color="green" />
                    <QuickActionCard to="/admin/logs" icon={ClipboardList} title="Audit Logs" description="Track system activity and changes" color="purple" />
                    <QuickActionCard to="/admin/settings" icon={Settings} title="System Settings" description="Configure platform-wide options" color="blue" />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;