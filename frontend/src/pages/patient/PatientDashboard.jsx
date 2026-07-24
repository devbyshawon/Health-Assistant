import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import QuickActionCard from '../../components/QuickActionCard';
import { Calendar, Pill, Activity, Stethoscope, MessageSquare } from 'lucide-react';

const PatientDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ upcomingAppointments: 0, activeReminders: 0, healthLogs: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [appointmentsRes, remindersRes, logsRes] = await Promise.all([
                    api.get("/auth/appointments/my"),
                    api.get("/auth/reminders"),
                    api.get("/auth/healthlogs"),
                ]);
                setStats({
                    upcomingAppointments: appointmentsRes.data.filter(
                        (a) => a.status === "Pending" || a.status === "Confirmed",
                    ).length,
                    activeReminders: remindersRes.data.data.length,
                    healthLogs: logsRes.data.data.length,
                });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <DashboardLayout>
            <h1 className='text-2xl font-bold text-teal-900 mb-6'>Welcome back, {user.name}</h1>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                <StatCard icon={Calendar} label="Upcoming Appointments" value={stats.upcomingAppointments} color="blue" />
                <StatCard icon={Pill} label="Active Reminders" value={stats.activeReminders} color="green" />
                <StatCard icon={Activity} label="Health Logs" value={stats.healthLogs} color="purple" />
            </div>

            {/* Quick action cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <QuickActionCard to="/doctors" icon={Stethoscope} title="Find a Doctor" description='Browse verified doctors near you' color='blue' />
                <QuickActionCard to="/ai-chat" icon={MessageSquare} title="Check Symptoms with AI" description='Get instant AI-powered health insights' color='purple' />
            </div>

        </DashboardLayout>
    );
};

export default PatientDashboard;