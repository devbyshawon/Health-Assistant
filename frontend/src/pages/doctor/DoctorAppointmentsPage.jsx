import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import AppointmentCard from '../../components/AppointmentCard';
import { Calendar } from 'lucide-react';

const DoctorAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    // eslint-disable-next-line no-unused-vars
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await api.get('/doctor/appointments');
                setAppointments(response.data);
            } catch (error) {
                setPageError(error.response?.data?.message || 'Failed to load appointments');
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const handleComplete = async (id) => {
        setActionLoading(true);
        setActionError('');
        try {
            const response = await api.patch(`/doctor/appointments/${id}/complete`);
            setAppointments(prev => prev.map(a => a._id === id ? response.data.appointment : a));
        } catch (error) {
            setActionError(error.response?.data?.message || 'Failed to mark complete');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this appointment?')) return;
        setActionLoading(true);
        setActionError('');
        try {
            await api.patch(`/doctor/appointments/${id}/cancel`);
            setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'Cancelled' } : a));
        } catch (error) {
            setActionError(error.response?.data?.message || 'Failed to cancel appointment');
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirm = async (id) => {
        setActionLoading(true);
        setActionError('');
        try {
            const response = await api.patch(`/doctor/appointments/${id}/confirm`);
            setAppointments(prev => prev.map(a => a._id === id ? response.data.appointment : a));
        } catch (error) {
            setActionError(error.response?.data?.message || 'Failed to confirm appointment');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className='max-w-6xl mx-auto'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-teal-900'>My Appointments</h1>
                    <p className='text-sm text-gray-500 mt-1'>Manage your patient appointments</p>
                </div>

                {pageError && <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>}

                {actionError && <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{actionError}</p>}

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading appointments...</p>
                ) : appointments.length === 0 ? (
                    <div className='text-center py-16'>
                        <Calendar className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                        <p className='text-gray-900 font-medium'>No appointments yet</p>
                        <p className='text-sm text-gray-400 mt-1'>Appointments booked by patients will appear here</p>
                    </div>
                ) : (
                    <div className='space-y-3'>
                        {appointments.map(appointment => (
                            <AppointmentCard
                                key={appointment._id}
                                appointment={appointment}
                                viewerRole='doctor'
                                onCancel={handleCancel}
                                onComplete={handleComplete}
                                onConfirm={handleConfirm}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DoctorAppointments;