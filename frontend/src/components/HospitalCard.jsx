import { MapPin, Phone, ShieldCheck, Hospital as HospitalIcon, Navigation } from 'lucide-react';

const HospitalCard = ({ hospital }) => {
    const [lng, lat] = hospital.location?.coordinates || [0, 0];
    const hasCoords = lat !== 0 || lng !== 0;
    const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col h-full'>
            <div className='flex items-center gap-3 mb-3'>
                <div className='w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 shrink-0'>
                    <HospitalIcon className='w-6 h-6' />
                </div>

                <div className='min-w-0'>
                    <h3 className='font-semibold text-teal-900 truncate'>{hospital.name}</h3>
                    <span className='inline-flex items-center gap-1 text-xs font-medium text-teal-600'>
                        <ShieldCheck className='w-3 h-3' /> Verified
                    </span>
                </div>
            </div>

            {hospital.address && (
                <p className='text-sm text-gray-500 mb-2 flex items-start gap-1.5 line-clamp-2'>
                    <MapPin className='w-4 h-4 shrink-0 mt-0.5' /> {hospital.address}
                </p>
            )}

            {hospital.phone && (
                <p className='text-sm text-gray-500 flex items-center gap-1.5'>
                    <Phone className='w-4 h-4 shrink-0' /> {hospital.phone}
                </p>
            )}

            <div className='mt-auto pt-4 flex items-center gap-2'>
                {hospital.phone && (
                    <a
                        href={`tel:${hospital.phone}`}
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
                        className='flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 flex items-center justify-center gap-1.5'
                    >
                        <Navigation className='w-4 h-4' /> Directions
                    </a>
                )}
            </div>
        </div>
    );
};

export default HospitalCard;
