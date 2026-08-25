import { useState, useEffect } from 'react'
import api from '../../services/api'
import DashboardLayout from '../../components/shared/DashboardLayout';
import Modal from '../../components/shared/Modal';

const DoctorsManagement = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    const [searchQuery, setSearchQuery] = useState('');

    const [confirmAction, setConfirmAction] = useState(null);

    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await api.get('/admin/doctors?verified=true');
                setDoctors(response.data.doctors);
            } catch (error) {
                setPageError(error.response?.data?.message || 'Failed to load doctors');
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const filteredDoctors = doctors.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        d.email.toLowerCase().includes(searchQuery.toLowerCase()) 
    );

    const handleToggleBlock = async (doctor) => {
        setActionLoading(true);
        setActionError('');
        try {
            const endpoint = doctor.isBlocked ? 'unblock' : 'block';
            await api.patch(`/admin/doctors/${doctor._id}/${endpoint}`);
            setDoctors(prev => prev.map(u => u._id === doctor._id ? { ...u, isBlocked: !u.isBlocked } : u));
            setConfirmAction(null);
        } catch (error) {
            setActionError(error.response?.data?.message || 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        setActionLoading(true);
        setActionError('');
        try {
            await api.delete(`/admin/users/${userId}`);
            setDoctors(prev => prev.filter(d => d._id !== userId));
            setConfirmAction(null);
        } catch (error) {
            setActionError(error.response?.data?.message || 'Failed to delete doctor');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className='max-w-6xl mx-auto'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-teal-900'>Doctors Management</h1>
                    <p className='text-sm text-gray-500 mt-1'>View and manage all verified doctors</p>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}

                <div className='mb-4'>
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder='Search by name or email'
                        className='w-full md:w-80 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                    />
                </div>

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading doctors...</p>
                ) : filteredDoctors.length === 0 ? (
                    <p className='text-gray-400 text-center py-12'>No doctors found</p>
                ) : (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                        <table className='w-full text-sm'>
                            <thead className='bg-gray-50 border-b border-gray-100'>
                                <tr>
                                    <th className='text-left px-4 py-3 font-bold text-gray-500'>Name</th>
                                    <th className='text-left px-4 py-3 font-bold text-gray-500'>Specialty</th>
                                    <th className='text-left px-4 py-3 font-bold text-gray-500'>Joined date</th>
                                    <th className='text-left px-4 py-3 font-bold text-gray-500'>Status</th>
                                    <th className='text-right px-4 py-3 font-bold text-gray-500'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100'>
                                {filteredDoctors.map(doctor => (
                                    <tr key={doctor._id} className='hover:bg-gray-50'>
                                        <td className='px-4 py-3 text-gray-900'>{doctor.name}</td>
                                        <td className='px-4 py-3 text-gray-500'>{doctor.doctorProfile?.specialty || '—'}</td>
                                        <td className='px-4 py-3 text-gray-500'>{new Date(doctor.createdAt).toLocaleDateString()}</td>
                                        <td className='px-4 py-3'>
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                                doctor.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                                {doctor.isBlocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td className='px-4 py-3 text-right space-x-3'>
                                            <button
                                                onClick={() => setConfirmAction({ type: doctor.isBlocked ? 'unblock' : 'block', doctor })}
                                                className='text-teal-600 hover:text-teal-700 text-sm font-medium cursor-pointer'
                                            >
                                                {doctor.isBlocked ? 'Unblock' : 'Block'}
                                            </button>
                                            <button
                                                onClick={() => setConfirmAction({ type: 'delete', doctor })}
                                                className='text-red-500 hover:text-red-600 text-sm font-medium cursor-pointer'
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Modal
                    isOpen={!!confirmAction}
                    onClose={() => { 
                        setConfirmAction(null); 
                        setActionError(''); }}
                    title={confirmAction ? `Confirm ${confirmAction.type}` : ''}
                    titleClassName='text-teal-900'
                >
                    {confirmAction && (
                        <div>
                            <p className='text-sm text-gray-600 mb-4'>
                                Are you sure you want to {confirmAction.type} <span className='font-medium'>{confirmAction.doctor.name}</span>?
                            </p>

                            {actionError && (
                                <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{actionError}</p>
                            )}

                            <div className='flex gap-3'>
                                <button
                                    onClick={() => setConfirmAction(null)}
                                    className='flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-100'
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => confirmAction.type === 'delete'
                                        ? handleDelete(confirmAction.doctor._id)
                                        : handleToggleBlock(confirmAction.doctor)}
                                    disabled={actionLoading}
                                    className='flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50'
                                >
                                    {actionLoading ? 'Processing...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </DashboardLayout>
    );
};

export default DoctorsManagement;