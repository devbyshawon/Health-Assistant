import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import api from '../../services/api';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await api.get('/auth/notifications');
                setNotifications(response.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const recentNotifications = notifications.slice(0, 6);

    const handleMarkAsRead = async (id) => {
        try {
            const response = await api.patch(`/auth/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? response.data.data : n));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className='relative' ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className='relative p-2 text-gray-500 hover:text-teal-600 transition-colors'
            >
                <Bell className='w-5 h-5' />
                {unreadCount > 0 && (
                    <span className='absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center'>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className='absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50'>
                    <div className='px-4 py-3 border-b border-gray-100'>
                        <h3 className='text-sm font-semibold text-gray-900'>Notifications</h3>
                    </div>

                    <div className='max-h-80 overflow-y-auto'>
                        {loading ? (
                            <p className='text-gray-400 text-sm text-center py-6'>Loading...</p>
                        ) : recentNotifications.length === 0 ? (
                            <p className='text-gray-400 text-sm text-center py-6'>No notifications yet</p>
                        ) : (
                            recentNotifications.map(n => (
                                <div
                                    key={n._id}
                                    className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 ${!n.isRead ? 'bg-teal-50/30' : ''}`}
                                >
                                    <div className='flex items-start gap-2'>
                                        {!n.isRead && <span className='w-2 h-2 bg-teal-600 rounded-full mt-1.5 shrink-0' />}
                                        <div className={`flex-1 ${!n.isRead ? '' : 'ml-4'}`}>
                                            <div className='flex items-start justify-between gap-2'>
                                                <div>
                                                    <p className='text-sm font-medium text-gray-900'>{n.title}</p>
                                                    <p className='text-xs text-gray-500 mt-0.5'>{n.message}</p>
                                                    <p className='text-xs text-gray-400 mt-1'>{new Date(n.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                {!n.isRead && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(n._id)}
                                                        className='text-xs text-teal-600 hover:text-teal-700 font-medium whitespace-nowrap flex-shrink-0'
                                                    >
                                                        Mark read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <Link
                        to='/notifications'
                        onClick={() => setIsOpen(false)}
                        className='block text-center text-sm text-teal-600 hover:text-teal-700 font-medium py-3 border-t border-gray-100'
                    >
                        View All
                    </Link>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
