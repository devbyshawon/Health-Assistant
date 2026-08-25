import { useState, useEffect } from 'react';
import api from '../services/api';
import DashboardLayout from '../components/shared/DashboardLayout';
import { Bell } from 'lucide-react';

const typeColors = {
    appointment: 'bg-blue-50 text-blue-700',
    reminder: 'bg-green-50 text-green-700',
    prescription: 'bg-purple-50 text-purple-700',
    system: 'bg-gray-50 text-gray-600',
};

const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await api.get('/auth/notifications?page=1&limit=20');
                setNotifications(response.data.data);
                setHasMore(response.data.pagination.hasMore);
            } catch (error) {
                setPageError(error.response?.data?.message || 'Failed to load notifications');
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const handleLoadMore = async () => {
        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const response = await api.get(`/auth/notifications?page=${nextPage}&limit=20`);
            setNotifications(prev => [...prev, ...response.data.data]);
            setHasMore(response.data.pagination.hasMore);
            setPage(nextPage);
        } catch (error) {
            setPageError(error.response?.data?.message || 'Failed to load more notifications');
        } finally {
            setLoadingMore(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            const response = await api.patch(`/auth/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? response.data.data : n));
        } catch (error) {
            setPageError(error.response?.data?.message || 'Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const unread = notifications.filter(n => !n.isRead);
            const results = await Promise.allSettled(unread.map(n => api.patch(`/auth/notifications/${n._id}/read`)));
            const succeededIds = unread.filter((_, i) => results[i].status === 'fulfilled').map(n => n._id);
            setNotifications(prev => prev.map(n => succeededIds.includes(n._id) ? { ...n, isRead: true } : n));
            const failedCount = results.filter(r => r.status === 'rejected').length;
            if (failedCount > 0) {
                setPageError(`${failedCount} notification(s) could not be marked as read`);
            }
        } catch (error) {
            setPageError(error.response?.data?.message || 'Failed to mark all as read');
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <DashboardLayout>
            <div className='max-w-6xl mx-auto'>

                <div className='flex justify-between items-center mb-6'>
                    <div>
                        <h1 className='text-2xl font-bold text-teal-900'>Notifications</h1>
                        <p className='text-sm text-gray-500 mt-1'>Stay updated on your appointments, reminders and more</p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className='text-sm text-teal-600 hover:text-teal-700 font-medium cursor-pointer'
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading notifications...</p>
                ) : notifications.length === 0 ? (
                    <div className='text-center py-16'>
                        <Bell className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                        <p className='text-gray-900 font-medium'>No notifications yet</p>
                        <p className='text-sm text-gray-400 mt-1'>You'll see updates about appointments and reminders here</p>
                    </div>
                ) : (
                    <div className='space-y-2'>
                        {notifications.map(n => (
                            <div
                                key={n._id}
                                className={`bg-white rounded-xl border p-4 flex items-start gap-3 transition-colors ${
                                    !n.isRead ? 'border-teal-200 bg-teal-50/30' : 'border-gray-100'
                                }`}
                            >
                                {!n.isRead && <span className='w-2 h-2 bg-teal-600 rounded-full mt-2 shrink-0' />}
                                <div className={`flex-1 ${!n.isRead ? '' : 'ml-5'}`}>
                                    <div className='flex items-start justify-between gap-3'>
                                        <div>
                                            <div className='flex items-center gap-2 mb-1'>
                                                <p className='text-sm font-medium text-gray-900'>{n.title}</p>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[n.type] || 'bg-gray-50 text-gray-600'}`}>
                                                    {n.type}
                                                </span>
                                            </div>
                                            <p className='text-sm text-gray-600'>{n.message}</p>
                                            <p className='text-xs text-gray-400 mt-1'>{formatRelativeTime(n.createdAt)}</p>
                                        </div>
                                        {!n.isRead && (
                                            <button
                                                onClick={() => handleMarkAsRead(n._id)}
                                                className='text-xs text-teal-600 hover:text-teal-700 font-medium whitespace-nowrap shrink-0 cursor-pointer'
                                            >
                                                Mark as read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {hasMore && (
                            <div className='pt-4'>
                                <button 
                                    onClick={handleLoadMore} 
                                    disabled={loadingMore}
                                    className='w-full text-center text-sm text-teal-600 hover:text-teal-700 font-medium py-3 bg-white rounded-xl border border-gray-100 disabled:opacity-50 cursor-pointer shadow-sm hover:bg-gray-50 transition'
                                >
                                    {loadingMore ? 'Loading...' : 'Load More'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default NotificationsPage;