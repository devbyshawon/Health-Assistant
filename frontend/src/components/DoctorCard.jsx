import { Briefcase, Star, Phone, Navigation } from 'lucide-react';
import formatDoctorName from '../utils/formatName';

const DoctorCard = ({ doctor, onClick }) => {
    const profile = doctor.doctorProfile || doctor;
    const phone = profile.phone;
    const [lng, lat] = profile.clinicLocation?.coordinates || [0, 0];
    const hasCoords = lat !== 0 || lng !== 0;
    const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    return (
        <div
            onClick={() => onClick(doctor)}
            className='bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md transition-shadow flex flex-col h-full'
        >
            <div className='flex items-center gap-3 mb-3'>
                <div className='w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 font-bold overflow-hidden'>
                    {(doctor.profilePic || doctor.userId?.profilePic) ? (
                        <img src={`http://localhost:5001${doctor.profilePic || doctor.userId?.profilePic}`} alt={doctor.name || doctor.userId?.name} className='w-full h-full object-cover' />
                    ) : (
                        (doctor.name || doctor.userId?.name || 'D')[0]
                    )}
                </div>

                <div>
                    <h3 className='font-semibold text-teal-900'>{formatDoctorName(doctor.name || doctor.userId?.name)}</h3>
                    <p className='text-xs text-gray-500'>{profile.specialty || 'General Physician'}</p>
                </div>
            </div>

            <p className='text-sm text-gray-500 mb-3 line-clamp-2'>{profile.bio || 'Experienced healthcare professional'}</p>

            <div className='flex items-center gap-4 text-xs text-gray-500'>
                {profile.experience && (
                    <span className='flex items-center gap-1'><Briefcase className='w-3 h-3' /> {profile.experience} yrs</span>
                )}
                {profile.rating > 0 && (
                    <span className='flex items-center gap-1'><Star className='w-3 h-3 text-yellow-500' /> {profile.rating}</span>
                )}
            </div>

            {profile.fees && (
                <div className='mt-3 pt-3 border-t border-gray-100 text-sm font-medium text-teal-600'>
                    ৳{profile.fees} consultation fee
                </div>
            )}

            {(phone || hasCoords) && (
                <div className='mt-auto pt-4 flex items-center gap-2'>
                    {phone && (
                        <a
                            href={`tel:${phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className='flex-1 border border-gray-300 text-teal-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-1.5'
                        >
                            <Phone className='w-4 h-4' /> Call
                        </a>
                    )}
                    {hasCoords && (
                        <a
                            href={directionsUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            onClick={(e) => e.stopPropagation()}
                            className='flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 flex items-center justify-center gap-1.5'
                        >
                            <Navigation className='w-4 h-4' /> Directions
                        </a>
                    )}
                </div>
            )}
        </div>
    );
};
export default DoctorCard;
