import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import Modal from '../../components/shared/Modal';
import { Plus, Hospital as HospitalIcon } from 'lucide-react';

const HospitalsPage = () => {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [formError, setFormError] = useState('');
    const [creating, setCreating] = useState(false);
    const [newHospital, setNewHospital] = useState({
        name: '', address: '', phone: '', email: '', lat: '', lng: ''
    });

    const [confirmAction, setConfirmAction] = useState(null); // { hospital }
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');

    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const response = await api.get('/admin/hospitals');
                setHospitals(response.data.hospitals);
            } catch (error) {
                setPageError(error.response?.data?.message || 'Failed to load hospitals');
            } finally {
                setLoading(false);
            }
        };
        fetchHospitals();
    }, []);

    const handleChange = (e) => {
        setNewHospital(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!newHospital.name.trim() || !newHospital.lat || !newHospital.lng) {
            setFormError('Name, latitude, and longitude are required');
            return;
        }

        setCreating(true);
        try {
            const response = await api.post('/admin/hospital', newHospital);
            setHospitals(prev => [response.data.data, ...prev]);
            setNewHospital({ name: '', address: '', phone: '', email: '', lat: '', lng: '' });
            setShowModal(false);
        } catch (error) {
            setFormError(error.response?.data?.message || 'Failed to add hospital');
        } finally {
            setCreating(false);
        }
    };

    const handleDeactivate = async (hospitalId) => {
        setActionLoading(true);
        setActionError('');
        try {
            await api.patch(`/admin/hospitals/${hospitalId}/deactivate`);
            setHospitals(prev => prev.filter(h => h._id !== hospitalId));
            setConfirmAction(null);
        } catch (error) {
            setActionError(error.response?.data?.message || 'Failed to deactivate hospital');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className='max-w-6xl mx-auto'>
                <div className='flex justify-between items-center mb-6'>
                    <div>
                        <h1 className='text-2xl font-bold text-teal-900'>Hospitals</h1>
                        <p className='text-sm text-gray-500 mt-1'>Manage hospital locations shown to patients</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className='bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2'
                    >
                        <Plus className='w-4 h-4' />
                        Add Hospital
                    </button>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading hospitals...</p>
                ) : hospitals.length === 0 ? (
                    <div className='text-center py-16'>
                        <HospitalIcon className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                        <p className='text-gray-900 font-medium'>No hospitals yet</p>
                        <p className='text-sm text-gray-400 mt-1'>Add a hospital so patients can find it nearby</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className='mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700'
                        >
                            + Add Hospital
                        </button>
                    </div>
                ) : (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                        <table className='w-full text-sm'>
                            <thead className='bg-gray-50 border-b border-gray-100'>
                                <tr>
                                    <th className='text-left px-4 py-3 font-bold text-gray-500'>Name</th>
                                    <th className='text-left px-4 py-3 font-bold text-gray-500'>Address</th>
                                    <th className='text-left px-4 py-3 font-bold text-gray-500'>Phone</th>
                                    <th className='text-right px-4 py-3 font-bold text-gray-500'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100'>
                                {hospitals.map(hospital => (
                                    <tr key={hospital._id} className='hover:bg-gray-50'>
                                        <td className='px-4 py-3 text-gray-900'>{hospital.name}</td>
                                        <td className='px-4 py-3 text-gray-500'>{hospital.address || '—'}</td>
                                        <td className='px-4 py-3 text-gray-500'>{hospital.phone || '—'}</td>
                                        <td className='px-4 py-3 text-right'>
                                            <button
                                                onClick={() => setConfirmAction({ hospital })}
                                                className='text-red-500 hover:text-red-600 text-sm font-medium cursor-pointer'
                                            >
                                                Deactivate
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Modal
                    isOpen={showModal}
                    onClose={() => {
                        setShowModal(false);
                        setFormError('');
                    }}
                    title='Add Hospital'
                    titleClassName='text-teal-900'
                >
                    <form onSubmit={handleCreate}>
                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Hospital Name</label>
                            <input
                                type='text'
                                name='name'
                                value={newHospital.name}
                                onChange={handleChange}
                                placeholder='e.g. City General Hospital'
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Address</label>
                            <input
                                type='text'
                                name='address'
                                value={newHospital.address}
                                onChange={handleChange}
                                placeholder='e.g. 123 Main Street, Dhaka'
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4 mb-4'>
                            <div>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Phone</label>
                                <input
                                    type='text'
                                    name='phone'
                                    value={newHospital.phone}
                                    onChange={handleChange}
                                    placeholder='e.g. 01700000000'
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Email</label>
                                <input
                                    type='email'
                                    name='email'
                                    value={newHospital.email}
                                    onChange={handleChange}
                                    placeholder='e.g. contact@hospital.com'
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                />
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-4 mb-4'>
                            <div>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Latitude</label>
                                <input
                                    type='text'
                                    name='lat'
                                    value={newHospital.lat}
                                    onChange={handleChange}
                                    placeholder='e.g. 23.8103'
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Longitude</label>
                                <input
                                    type='text'
                                    name='lng'
                                    value={newHospital.lng}
                                    onChange={handleChange}
                                    placeholder='e.g. 90.4125'
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                />
                            </div>
                        </div>

                        {formError && (
                            <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{formError}</p>
                        )}

                        <button
                            type='submit'
                            disabled={creating}
                            className='w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors'
                        >
                            {creating ? 'Adding...' : 'Add Hospital'}
                        </button>
                    </form>
                </Modal>

                <Modal
                    isOpen={!!confirmAction}
                    onClose={() => { setConfirmAction(null); setActionError(''); }}
                    title='Confirm Deactivation'
                    titleClassName='text-teal-900'
                >
                    {confirmAction && (
                        <div>
                            <p className='text-sm text-gray-600 mb-4'>
                                Are you sure you want to deactivate{' '}
                                <span className='font-medium'>{confirmAction.hospital.name}</span>?
                                It will no longer be shown to patients.
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
                                    onClick={() => handleDeactivate(confirmAction.hospital._id)}
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

export default HospitalsPage;