import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import Modal from '../../components/shared/Modal';
import { Stethoscope, Search } from 'lucide-react';

const BookAppointmentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    const [selectedDoctor, setSelectedDoctor] = useState(location.state?.preselectedDoctor || null);
    const [date, setDate] = useState('');
    const [reason, setReason] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [formError, setFormError] = useState('');
    const [booking, setBooking] = useState(false);

    useEffect(() => {
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

    const filteredDoctors = doctors.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.doctorProfile?.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            <div className='max-w-6xl mx-auto'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-teal-900'>Book Appointment</h1>
                    <p className='text-sm text-gray-500 mt-1'>Choose a doctor and pick a time that works for you</p>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}

                <div className='mb-4'>
                    <div className='relative'>
                        <Search className='w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2' />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder='Search by name or specialty'
                            className='w-full md:w-96 border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                        />
                    </div>
                </div>

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading doctors...</p>
                ) : filteredDoctors.length === 0 ? (
                    <div className='text-center py-16'>
                        <Stethoscope className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                        <p className='text-gray-900 font-medium'>No doctors found</p>
                        <p className='text-sm text-gray-400 mt-1'>Try a different name or specialty</p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
                        {filteredDoctors.map(doc => (
                            <div
                                key={doc._id}
                                onClick={() => setSelectedDoctor(doc)}
                                className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-colors ${
                                    selectedDoctor?._id === doc._id
                                        ? 'border-teal-600 bg-teal-50'
                                        : 'border-gray-100 hover:border-teal-200'
                                }`}
                            >
                                <div className='flex items-center gap-3'>
                                    <div className='w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center shrink-0'>
                                        <Stethoscope className='w-5 h-5 text-teal-600' />
                                    </div>
                                    <div>
                                        <h4 className='font-medium text-gray-900 text-sm'>{doc.name}</h4>
                                        <p className='text-xs text-gray-500'>{doc.doctorProfile?.specialty || 'General Physician'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Modal
                    isOpen={!!selectedDoctor}
                    onClose={() => {
                        setSelectedDoctor(null);
                        setDate('');
                        setReason('');
                        setFormError('');
                    }}
                    title={selectedDoctor ? `Book with ${selectedDoctor.name}` : ''}
                    titleClassName='text-teal-900'
                >
                    <form onSubmit={handleBook}>
                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Appointment Date & Time</label>
                            <input
                                type='datetime-local'
                                value={date}
                                min={new Date().toISOString().slice(0, 16)}
                                onChange={(e) => setDate(e.target.value)}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Reason for Visit</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={3}
                                placeholder='Briefly describe your symptoms or reason for visiting'
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        {formError && (
                            <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{formError}</p>
                        )}

                        <button
                            type='submit'
                            disabled={booking}
                            className='w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors cursor-pointer'
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