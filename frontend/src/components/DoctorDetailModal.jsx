import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from './shared/Modal';
import { Briefcase, Star, Phone, Clock } from 'lucide-react';

const DoctorDetailModal = ({ doctor, isOpen, onClose }) => {
    const navigate = useNavigate();
    const { isPatient, isDoctor, isAdmin } = useAuth();

    if (!doctor) {
        return null;
    }
    const profile = doctor.doctorProfile || doctor;

    const handleBookAppointment = () => {
        onClose();
        navigate('/appointments/book', { state: { preselectedDoctor: doctor } });
    };

    const handleLoginPrompt = () => {
        onClose();
        navigate('/login');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={doctor.name || doctor.userId?.name}>
            <div className='flex items-center gap-4 mb-4'>
                <div className='w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 font-bold text-xl'>
                    {(doctor.name || doctor.userId?.name || 'D')[0]}
                </div>
                <div>
                    <h3 className='font-semibold text-gray-900 text-lg'>{doctor.name || doctor.userId?.name}</h3>
                    <p className='text-sm text-gray-500'>{profile.specialty || 'General Physician'}</p>
                </div>
            </div>

            <p className='text-sm text-gray-600 mb-4'>{profile.bio || 'Experienced healthcare professional'}</p>

            <div className='grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4'>
                {profile.experience && (
                    <span className='flex items-center gap-2'><Briefcase className='w-4 h-4 text-gray-400' /> {profile.experience} years experience</span>
                )}
                {profile.rating > 0 && (
                    <span className='flex items-center gap-2'><Star className='w-4 h-4 text-yellow-500' /> {profile.rating} rating</span>
                )}
                {profile.phone && (
                    <span className='flex items-center gap-2'><Phone className='w-4 h-4 text-gray-400' /> {profile.phone}</span>
                )}
                {profile.fees && (
                    <span className='flex items-center gap-2 font-medium text-teal-600'>৳{profile.fees} consultation fee</span>
                )}
            </div>

            {profile.availability?.length > 0 && (
                <div className='mb-4'>
                    <h4 className='text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
                        <Clock className='w-4 h-4 text-gray-400' /> Availability
                    </h4>
                    <div className='flex flex-wrap gap-2'>
                        {profile.availability.map((slot, i) => (
                            <span key={i} className='text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-600'>
                                {slot.day}: {slot.startTime}–{slot.endTime}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className='pt-4 border-t border-gray-100'>
                {isPatient ? (
                    <button
                        onClick={handleBookAppointment}
                        className='w-full bg-teal-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors'
                    >
                        Book Appointment
                    </button>
                ) : isDoctor || isAdmin ? (
                    <p className='text-xs text-gray-400 text-center'>Booking is only available for patient accounts</p>
                ) : (
                    <button
                        onClick={handleLoginPrompt}
                        className='w-full bg-teal-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors'
                    >
                        Book Appointment
                    </button>
                )}
            </div>
        </Modal>
    );
};

export default DoctorDetailModal;