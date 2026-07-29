import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Link } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import { Calendar, Pill, Activity, Stethoscope, MessageSquare } from 'lucide-react';
import QuickActionCard from '../../components/QuickActionCard';


const PatientDashboard = () => {
    const [stats, setStats] = useState({ upcomingAppointments: 0, activeReminders: 0, healthLogs: 0 });
    const [loading, setLoading] = useState(true);
    const [completion, setCompletion] = useState(null);
    const [pageError, setPageError] = useState('');
    const [summary, setSummary] = useState(null);

    const { user } = useAuth();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [appointmentsRes, remindersRes, logsRes, summaryRes, profileRes] = await Promise.all([
                    api.get("/auth/appointments/my"),
                    api.get("/auth/reminders"),
                    api.get("/auth/healthlogs"),
                    api.get("/auth/health-summary"),
                    api.get("/auth/profile"),
                ]);
                setStats({
                    upcomingAppointments: appointmentsRes.data.filter(
                        (a) => a.status === "Pending" || a.status === "Confirmed",
                    ).length,
                    activeReminders: remindersRes.data.data.filter(r => !r.completed).length,
                    healthLogs: logsRes.data.data.length,
                });
                setSummary(summaryRes.data.summary);
                setCompletion(profileRes.data.user.completion);
            } catch (error) {
                console.error(error);
                setPageError('Failed to load some dashboard data. Please refresh the page.');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <DashboardLayout>
            <h1 className='text-2xl font-bold text-teal-900 mb-6'>Welcome back, {user?.name}</h1>

            {pageError && (
                <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
            )}

            {!loading && completion !== null && completion < 100 && (
                <Link to='/settings'
                    className='flex items-center justify-between bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6 hover:bg-blue-100 transition-colors'>
                    <p className='text-sm font-medium'>Your profile is {completion}% complete — add more details</p>
                    <span className='text-sm font-medium'>Complete Profile →</span>
                </Link>
            )}
            
            {loading ? (
                <p className='text-gray-400 text-center py-12'>Loading dashboard...</p>
            ) : (
                <>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                        <StatCard icon={Calendar} label="Upcoming Appointments" value={stats.upcomingAppointments} color="blue" />
                        <StatCard icon={Pill} label="Active Reminders" value={stats.activeReminders} color="green" />
                        <StatCard icon={Activity} label="Health Logs" value={stats.healthLogs} color="purple" />
                    </div>

                    {summary && summary.totalLogs > 0 && (
                        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8'>
                            <h3 className='font-semibold text-gray-900 mb-4'>Latest Health Snapshot</h3>
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                                {summary.latestLog?.weight && (
                                    <div>
                                        <p className='text-gray-500 text-xs'>Weight</p>
                                        <p className='font-semibold text-gray-900'>{summary.latestLog.weight} kg</p>
                                    </div>
                                )}
                                {summary.latestLog?.vitals?.heartRate && (
                                    <div>
                                        <p className='text-gray-500 text-xs'>Heart Rate</p>
                                        <p className='font-semibold text-gray-900'>{summary.latestLog.vitals.heartRate} bpm</p>
                                    </div>
                                )}
                                {summary.latestLog?.vitals?.temperature && (
                                    <div>
                                        <p className='text-gray-500 text-xs'>Temperature</p>
                                        <p className='font-semibold text-gray-900'>{summary.latestLog.vitals.temperature}°</p>
                                    </div>
                                )}
                                {summary.latestLog?.vitals?.bloodPressure && (
                                    <div>
                                        <p className='text-gray-500 text-xs'>Blood Pressure</p>
                                        <p className='font-semibold text-gray-900'>{summary.latestLog.vitals.bloodPressure}</p>
                                    </div>
                                )}
                            </div>
                            <p className='text-xs text-gray-400 mt-3'>Based on {summary.totalLogs} logged {summary.totalLogs === 1 ? 'entry' : 'entries'}</p>
                        </div>
                    )}
                    
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <QuickActionCard to="/doctors" icon={Stethoscope} title="Find a Doctor" description='Browse verified doctors near you' color='blue' />
                        <QuickActionCard to="/ai-chat" icon={MessageSquare} title="Check Symptoms with AI" description='Get instant AI-powered health insights' color='purple' />
                    </div>
                </>
            )}
        </DashboardLayout>
    );
};

export default PatientDashboard;