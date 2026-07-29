import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Plus, Calendar } from 'lucide-react';
import AppointmentCard from '../../components/AppointmentCard';
import Modal from '../../components/shared/Modal';


const AppointmentPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    const [reschedulingId, setReschedulingId] = useState(null);
    const [rescheduleError, setRescheduleError] = useState('');
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
            if (!newDate) {
                setRescheduleError('Please select a new date and time');
                return;
            }
            setRescheduleError('');
            const response = await api.patch(`/auth/appointments/${id}/reschedule`, { date: newDate });
            setAppointments(prev => prev.map(a => a._id === id ? { ...a, date: response.data.date, status: response.data.status } : a));
            setReschedulingId(null);
            setNewDate('');
        } catch (error) {
            setRescheduleError(error.response?.data?.message || 'Failed to reschedule appointment');
        }
    };

    return (
        <DashboardLayout>
            <div className='max-w-5xl mx-auto'>
                <div className='flex justify-between items-center mb-6'>
                    <div>
                        <h1 className='text-2xl font-bold text-teal-900'>My Appointments</h1>
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

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading appointments...</p>
                ) : appointments.length === 0 ? (
                    <div className='text-center py-16'>
                        <Calendar className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                        <p className='text-teal-900 font-medium'>No appointments yet</p>
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
                                viewerRole="user"
                                onReschedule={(a) => {
                                    setReschedulingId(a._id);
                                    setNewDate(a.date ? new Date(a.date).toISOString().slice(0, 16) : '');
                                }}
                                onCancel={handleCancel}
                            />
                        ))}
                    </div>
                )}

                <Modal 
                    isOpen={!!reschedulingId}
                    onClose={() => { 
                        setReschedulingId(null);
                        setNewDate('');
                        setRescheduleError('');
                    }}
                    title='Reschedule Appointment'
                >
                    <form onSubmit={(e) => {
                        e.preventDefault(); 
                        handleReschedule(reschedulingId); 
                    }}>
                        {rescheduleError && (
                            <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{rescheduleError}</p>
                        )}

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