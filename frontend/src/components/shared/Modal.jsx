import { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) { 
        return null;
    }

    return (
        <div
            onClick={onClose}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className='bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200'
            >
                <div className='flex items-center gap-3 px-6 py-4 border-b border-gray-100'>
                    
                    <h2 className='text-lg font-semibold text-gray-900'>{title}</h2>
                    <button onClick={onClose} className='text-gray-400 hover:text-gray-600'>
                        <X className='w-5 h-5' />
                    </button>
                </div>
                <div className='p-6'>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;