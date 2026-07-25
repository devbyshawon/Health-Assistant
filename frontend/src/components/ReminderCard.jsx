import { Clock, Pill, Trash2, Edit2 } from 'lucide-react';

const ReminderCard = ({ reminder, onEdit, onDelete }) => {
    const time = new Date(reminder.time);
    const isPast = time < new Date();

    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center'>
                    <Pill className='w-5 h-5 text-green-600' />
                </div>
                <div>
                    <h4 className='font-medium text-gray-900 text-sm'>{reminder.medicineName}</h4>
                    <p className='text-xs text-gray-500'>{reminder.dosage}</p>
                    <p className={`text-xs flex items-center gap-1 mt-1 ${isPast ? 'text-gray-400' : 'text-teal-600'}`}>
                        <Clock className='w-3 h-3' />
                        {time.toLocaleString()} · {reminder.repeat}
                    </p>
                </div>
            </div>
            <div className='flex gap-2'>
                <button onClick={() => onEdit(reminder)} className='p-1.5 text-gray-400 hover:text-teal-600'>
                    <Edit2 className='w-4 h-4' />
                </button>
                <button onClick={() => onDelete(reminder._id)} className='p-1.5 text-gray-400 hover:text-red-500'>
                    <Trash2 className='w-4 h-4' />
                </button>
            </div>
        </div>
    );
};
export default ReminderCard;