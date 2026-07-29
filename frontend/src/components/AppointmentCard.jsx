import { Calendar, Clock, RefreshCw, XCircle, Check, CheckCircle } from 'lucide-react';

const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Confirmed: 'bg-blue-100 text-blue-700',
    Completed: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
};

const AppointmentCard = ({ appointment, viewerRole, onReschedule, onCancel, onComplete, onConfirm }) => {
    const date = new Date(appointment.date);
    const canModify = appointment.status === 'Pending' || appointment.status === 'Confirmed';

    const otherParty = viewerRole === 'doctor' ? appointment.patientId : appointment.doctorId;

        return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center'>
                    <Calendar className='w-5 h-5 text-blue-600' />
                </div>

                <div>
                    <h4 className='font-medium text-gray-900 text-sm'>
                        {otherParty?.name || (viewerRole === 'doctor' ? 'Patient' : 'Doctor')}
                    </h4>

                    {viewerRole !== 'doctor' && (
                        <p className='text-xs text-gray-500'>{appointment.doctorId?.doctorProfile?.specialty || ''}</p>
                    )}

                    <p className='text-xs flex items-center gap-1 mt-1 text-teal-600'>
                        <Clock className='w-3 h-3' />
                        {date.toLocaleString()}
                    </p>
                </div>
            </div>

            <div className='flex items-center gap-3'>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[appointment.status]}`}>
                    {appointment.status}
                </span>

                {/* Patient-only actions */}
                {viewerRole !== 'doctor' && canModify && (
                    <div className='flex gap-2'>
                        <button
                            onClick={() => onReschedule(appointment)}
                            className='p-1.5 text-gray-400 hover:text-teal-600'
                            title='Reschedule'
                        >
                            <RefreshCw className='w-4 h-4' />
                        </button>

                        <button
                            onClick={() => onCancel(appointment._id)}
                            className='p-1.5 text-gray-400 hover:text-red-500'
                            title='Cancel'
                        >
                            <XCircle className='w-4 h-4' />
                        </button>
                    </div>
                )}

                {/* Doctor-only actions */}
                {viewerRole === 'doctor' && (
                    <div className='flex gap-2'>
                        {appointment.status === 'Pending' && (
                            <button
                                onClick={() => onConfirm(appointment._id)}
                                className='p-1.5 text-gray-400 hover:text-blue-600'
                                title='Confirm'
                            >
                                <Check className='w-4 h-4' />
                            </button>
                        )}

                        {canModify && (
                            <button
                                onClick={() => onComplete(appointment._id)}
                                className='p-1.5 text-gray-400 hover:text-green-600'
                                title='Mark Complete'
                            >
                                <CheckCircle className='w-4 h-4' />
                            </button>
                        )}
                        
                        {canModify && (
                            <button
                                onClick={() => onCancel(appointment._id)}
                                className='p-1.5 text-gray-400 hover:text-red-500'
                                title='Cancel'
                            >
                                <XCircle className='w-4 h-4' />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppointmentCard;