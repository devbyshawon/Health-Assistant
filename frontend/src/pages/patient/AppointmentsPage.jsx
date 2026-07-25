import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus } from 'lucide-react';
import AppointmentCard from '../../components/AppointmentCard';
import Modal from '../../components/shared/Modal';

const AppointmentPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    const [reschedulingId, setReschedulingId] = useState(null);
    const [newDate, setNewDate] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await api.get('/auth/appointments/my'); 
                setAppointments(response.data);
            } catch (error) {
                setPageError(error.response?.data?.message || 'Failed to load appointments');
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this appointment?')) { 
            return;
        }
        try {
            await api.patch(`/auth/appointments/${id}/cancel`);
            setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'Cancelled' } : a));
        } catch (error) {
            setPageError(error.response?.data?.message || 'Failed to cancel appointment');
        }
    };

    const handleReschedule = async (id) => {
        try {
            const response = await api.patch(`/auth/appointments/${id}/reschedule`, { date: newDate });
            setAppointments(prev => prev.map(a => a._id === id ? response.data : a));
            setReschedulingId(null);
            setNewDate('');
        } catch (error) {
            setPageError(error.response?.data?.message || 'Failed to reschedule appointment');
        }
    };

    return (
        <DashboardLayout>
            <div className='max-w-5xl mx-auto'>
                {/* Page header */}
                <div className='flex justify-between items-center mb-6'>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-900'>My Appointments</h1>
                        <p className='text-sm text-gray-500 mt-1'>View and manage your upcoming visits</p>
                    </div>
                    <button
                        onClick={() => navigate('/appointments/book')}
                        className='bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2'
                    >
                        <Plus className='w-4 h-4' />
                        Book Appointment
                    </button>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}

                {/* List states */}
                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading appointments...</p>
                ) : appointments.length === 0 ? (
                    <div className='text-center py-16'>
                        <Calendar className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                        <p className='text-gray-900 font-medium'>No appointments yet</p>
                        <p className='text-sm text-gray-400 mt-1'>Book an appointment with a doctor to get started</p>
                        <button
                            onClick={() => navigate('/appointments/book')}
                            className='mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700'
                        >
                            + New Appointment
                        </button>
                    </div>
                ) : (
                    <div className='space-y-3'>
                        {appointments.map(appointment => (
                            <AppointmentCard
                                key={appointment._id}
                                appointment={appointment}
                                onReschedule={(a) => {
                                    setReschedulingId(a._id);
                                    setNewDate(a.date ? new Date(a.date).toISOString().slice(0, 16) : '');
                                }}
                                onCancel={handleCancel}
                            />
                        ))}
                    </div>
                )}

                {/* RESCHEDULE MODAL */}
                <Modal 
                    isOpen={!!reschedulingId}
                    onClose={() => { 
                        setReschedulingId(null);
                        setNewDate('');
                    }}
                    title='Reschedule Appointment'
                >
                    <form onSubmit={(e) => {
                        e.preventDefault(); 
                        handleReschedule(reschedulingId); 
                    }}>
                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>New Date & Time</label>
                            <input
                                type='datetime-local'
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        <button
                            type='submit'
                            className='w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors'
                        >
                            Save Changes
                        </button>                        
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
};

export default AppointmentPage;