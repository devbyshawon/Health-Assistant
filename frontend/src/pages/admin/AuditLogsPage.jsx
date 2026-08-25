import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');
    const [actionFilter, setActionFilter] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const params = actionFilter ? `?action=${encodeURIComponent(actionFilter)}` : '';
                const response = await api.get(`/admin/logs${params}`);
                setLogs(response.data.data);
            } catch (error) {
                setPageError(error.response?.data?.message || 'Failed to load logs');
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [actionFilter]);

    return (
        <DashboardLayout>
            <div className='max-w-6xl mx-auto'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-teal-900'>Audit Logs</h1>
                    <p className='text-sm text-gray-500 mt-1'>Track system activity and admin actions</p>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}

                <div className='mb-4'>
                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className='w-full md:w-80 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                    >
                        <option value=''>All actions</option>
                        <option value='Doctor Verified'>Doctor Verified</option>
                        <option value='Doctor Rejected'>Doctor Rejected</option>
                        <option value='User Blocked'>User Blocked</option>
                        <option value='User Unblocked'>User Unblocked</option>
                        <option value='User Deleted'>User Deleted</option>
                        <option value='Doctor Blocked'>Doctor Blocked</option>
                        <option value='Doctor Unblocked'>Doctor Unblocked</option>
                    </select>
                </div>

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading logs...</p>
                ) : logs.length === 0 ? (
                    <p className='text-gray-400 text-center py-12'>No audit logs yet</p>
                ) : (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                        <table className='w-full text-sm'>
                            <thead className='bg-gray-50 border-b border-gray-100'>
                                <tr>
                                    <th className='text-left px-4 py-3 font-bold text-gray-500'>Timestamp</th>
                                    <th className='text-left px-4 py-3 font-bold text-gray-500'>Actor</th>
                                    <th className='text-left px-4 py-3 font-bold text-gray-500'>Action</th>
                                    <th className='text-left px-4 py-3 font-bold text-gray-500'>Target</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100'>
                                {logs.map(log => (
                                    <tr key={log._id} className='hover:bg-gray-50'>
                                        <td className='px-4 py-3 text-gray-500'>{new Date(log.createdAt).toLocaleString()}</td>
                                        <td className='px-4 py-3 text-gray-900'>{log.performedBy?.name || 'System'}</td>
                                        <td className='px-4 py-3 text-gray-700'>{log.action}</td>
                                        <td className='px-4 py-3 text-gray-500'>{log.details?.email || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AuditLogs;