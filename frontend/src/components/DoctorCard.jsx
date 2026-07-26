import { Star, Briefcase } from 'lucide-react';

const DoctorCard = ({ doctor, onClick }) => {
    const profile = doctor.doctorProfile || doctor;

    return (
        <div
            onClick={() => onClick(doctor)}
            className='bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md transition-shadow'
        >
            <div className='flex items-center gap-3 mb-3'>
                <div className='w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 font-bold'>
                    {(doctor.name || doctor.userId?.name || 'D')[0]}
                </div>
                <div>
                    <h3 className='font-semibold text-teal-900'>{doctor.name || doctor.userId?.name}</h3>
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
        </div>
    );
};
export default DoctorCard;