import { useState, useEffect, useLocation } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import Modal from '../../components/shared/Modal';

const BookAppointmentPage = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    const location = useLocation();
    const [selectedDoctor, setSelectedDoctor] = useState(location.state?.preselectedDoctor || null);
    const [date, setDate] = useState('');
    const [reason, setReason] = useState('');

    const [formError, setFormError] = useState('');
    const [booking, setBooking] = useState(false);

    const navigate = useNavigate();
    

    useEffect (() => {
        const fetchDoctors = async () => {
            try {
                const response = await api.get('/public/doctors');
                setDoctors(response.data.doctors);
            } catch (error) {
                setPageError(error.response?.data?.message || 'Failed to load doctors');
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const handleBook = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!selectedDoctor || !date) {
            setFormError('Please select a doctor and date');
            return;
        }
        setBooking(true);
        try {
            await api.post('/auth/appointments', {
                doctorId: selectedDoctor._id,
                date,
                reason
            });
            navigate('/appointments');
        } catch (error) {
            setFormError(error.response?.data?.message || 'Appointment booking failed');
        } finally {
            setBooking(false);
        }
    };

    return (
        <DashboardLayout>
            <div className='max-w-5xl mx-auto'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-gray-900'>Book Appointment</h1>
                    <p className='text-sm text-gray-500 mt-1'>Choose a doctor and pick a time that works for you</p>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading doctors...</p>
                ) : doctors.length === 0 ? (
                    <p className='text-gray-400 text-center py-12'>No doctors available right now</p>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                        {doctors.map(doc => (
                            <div
                                key={doc._id}
                                onClick={() => setSelectedDoctor(doc)}
                                className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-colors ${
                                    selectedDoctor?._id === doc._id ? 'border-teal-600 bg-teal-50' : 'border-gray-100 hover:border-teal-200'
                                }`}
                            >
                                <h4 className='font-medium text-gray-900'>{doc.name}</h4>
                                <p className='text-xs text-gray-500'>{doc.doctorProfile?.specialty}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* BOOKING MODAL */}
                <Modal
                    isOpen={!!selectedDoctor}
                    onClose={() => { 
                        setSelectedDoctor(null); 
                        setDate(''); 
                    }}
                    title={selectedDoctor ? `Book with ${selectedDoctor.name}` : ''}
                >
                    <form onSubmit={handleBook}>
                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Appointment Date & Time</label>
                            <input
                                type='datetime-local'
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Reason for Visit</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={3}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        {formError && (
                            <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{formError}</p>
                        )}

                        <button
                            type='submit'
                            disabled={booking}
                            className='w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors'
                        >
                            {booking ? 'Booking...' : 'Confirm Appointment'}
                        </button>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
};

export default BookAppointmentPage;