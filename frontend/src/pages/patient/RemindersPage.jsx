import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import ReminderCard from '../../components/ReminderCard';
import Modal from '../../components/shared/Modal';
import { Plus, Pill } from 'lucide-react';

const emptyReminderForm = { medicineName: '', dosage: '', time: '', repeat: 'None', notes: '' };

const ReminderPage = () => {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    const [actionError, setActionError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [formError, setFormError] = useState('');
    const [creating, setCreating] = useState(false);
    const [newReminder, setNewReminder] = useState(emptyReminderForm);

    const [editingReminder, setEditingReminder] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [editFormError, setEditFormError] = useState('');
    const [updating, setUpdating] = useState(false);

    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => {
        const fetchReminders = async () => {
            try {
                const response = await api.get('/auth/reminders');
                setReminders(response.data.data);
            } catch (error) {
                setPageError(error.response?.data?.message || 'Failed to load reminders');
            } finally {
                setLoading(false);
            }
        };
        fetchReminders();
    }, []);

    const handleChange = (e) => {
        setNewReminder(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleEditChange = (e) => {
        setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const closeCreateModal = () => {
        setShowModal(false);
        setFormError('');
        setNewReminder(emptyReminderForm);
    };

    const closeEditModal = () => {
        setEditingReminder(null);
        setEditForm({});
        setEditFormError('');
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!newReminder.medicineName.trim() || !newReminder.time) {
            setFormError('Medicine name and time are required');
            return;
        }
        setCreating(true);
        try {
            const response = await api.post('/auth/reminders', newReminder);
            setReminders(prev => [response.data.data, ...prev]);
            closeCreateModal();
        } catch (error) {
            setFormError(error.response?.data?.message || 'Something went wrong');
        } finally {
            setCreating(false);
        }
    };

    const handleEditStart = (reminder) => {
        setEditingReminder(reminder);
        setEditForm({
            medicineName: reminder.medicineName,
            dosage: reminder.dosage || '',
            time: reminder.time ? new Date(reminder.time).toISOString().slice(0, 16) : '',
            repeat: reminder.repeat,
            notes: reminder.notes || ''
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditFormError('');
        if (!editForm.medicineName?.trim() || !editForm.time) {
            setEditFormError('Medicine name and time are required');
            return;
        }
        setUpdating(true);
        try {
            const response = await api.patch(`/auth/reminders/${editingReminder._id}`, editForm);
            setReminders(prev => prev.map(r => r._id === editingReminder._id ? response.data.data : r));
            closeEditModal();
        } catch (error) {
            setEditFormError(error.response?.data?.message || 'Something went wrong');
        } finally {
            setUpdating(false);
        }
    };

    const handleToggleComplete = async (reminder) => {
        setActionError('');
        try {
            const response = await api.patch(`/auth/reminders/${reminder._id}`, { completed: !reminder.completed });
            setReminders(prev => prev.map(r => r._id === reminder._id ? response.data.data : r));
        } catch (error) {
            setActionError(error.response?.data?.message || 'Failed to update reminder');
        }
    };

    const handleDelete = async (id) => {
        setActionLoading(true);
        setActionError('');
        try {
            await api.delete(`/auth/reminders/${id}`);
            setReminders(prev => prev.filter(r => r._id !== id));
            setConfirmDelete(null);
        } catch (error) {
            setActionError(error.response?.data?.message || 'Failed to delete reminder');
            setConfirmDelete(null);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className='max-w-6xl mx-auto'>
                <div className='flex justify-between items-center mb-6'>
                    <div>
                        <h1 className='text-2xl font-bold text-teal-900'>Medicine Reminders</h1>
                        <p className='text-sm text-gray-500 mt-1'>Never miss a dose</p>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className='bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 cursor-pointer'
                    >
                        <Plus className='w-4 h-4' />
                        New Reminder
                    </button>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}

                {actionError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{actionError}</p>
                )}

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading reminders...</p>
                ) : reminders.length === 0 ? (
                    <div className='text-center py-16'>
                        <Pill className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                        <p className='text-gray-900 font-medium'>No reminders yet</p>
                        <p className='text-sm text-gray-400 mt-1'>Add a reminder so you never miss your medication</p>

                        <button
                            onClick={() => setShowModal(true)}
                            className='mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors cursor-pointer'
                        >
                            New Reminder
                        </button>
                    </div>
                ) : (
                    <div className='space-y-3'>
                        {reminders.map(reminder => (
                            <ReminderCard
                                key={reminder._id}
                                reminder={reminder}
                                onEdit={handleEditStart}
                                onToggleComplete={handleToggleComplete}
                                onDelete={(id) => setConfirmDelete(reminders.find(r => r._id === id))}
                            />
                        ))}
                    </div>
                )}

                {/* CREATE MODAL */}
                <Modal
                    isOpen={showModal}
                    onClose={closeCreateModal}
                    title='New Reminder'
                    titleClassName='text-teal-900'
                >
                    <form onSubmit={handleCreate}>
                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Medicine Name</label>
                            <input
                                type='text'
                                name='medicineName'
                                value={newReminder.medicineName}
                                onChange={handleChange}
                                placeholder='e.g. Paracetamol'
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4 mb-4'>
                            <div>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Dosage</label>
                                <input
                                    type='text'
                                    name='dosage'
                                    value={newReminder.dosage}
                                    onChange={handleChange}
                                    placeholder='e.g. 500mg'
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Repeat</label>
                                <select
                                    name='repeat'
                                    value={newReminder.repeat}
                                    onChange={handleChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer'
                                >
                                    <option value='None'>None</option>
                                    <option value='Daily'>Daily</option>
                                    <option value='Weekly'>Weekly</option>
                                </select>
                            </div>
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Time</label>
                            <input
                                type='datetime-local'
                                name='time'
                                value={newReminder.time}
                                onChange={handleChange}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Notes (optional)</label>
                            <textarea
                                name='notes'
                                value={newReminder.notes}
                                onChange={handleChange}
                                rows={2}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        {formError && (
                            <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{formError}</p>
                        )}

                        <button
                            type='submit'
                            disabled={creating}
                            className='w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors cursor-pointer'
                        >
                            {creating ? 'Creating...' : 'Create Reminder'}
                        </button>
                    </form>
                </Modal>

                {/* EDIT MODAL */}
                <Modal
                    isOpen={!!editingReminder}
                    onClose={closeEditModal}
                    title='Edit Reminder'
                    titleClassName='text-teal-900'
                >
                    <form onSubmit={handleEditSubmit}>
                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Medicine Name</label>
                            <input
                                type='text'
                                name='medicineName'
                                value={editForm.medicineName || ''}
                                onChange={handleEditChange}
                                placeholder='e.g. Paracetamol'
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4 mb-4'>
                            <div>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Dosage</label>
                                <input
                                    type='text'
                                    name='dosage'
                                    value={editForm.dosage || ''}
                                    onChange={handleEditChange}
                                    placeholder='e.g. 500mg'
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Repeat</label>
                                <select
                                    name='repeat'
                                    value={editForm.repeat || 'None'}
                                    onChange={handleEditChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer'
                                >
                                    <option value='None'>None</option>
                                    <option value='Daily'>Daily</option>
                                    <option value='Weekly'>Weekly</option>
                                </select>
                            </div>
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Time</label>
                            <input
                                type='datetime-local'
                                name='time'
                                value={editForm.time || ''}
                                onChange={handleEditChange}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Notes (optional)</label>
                            <textarea
                                name='notes'
                                value={editForm.notes || ''}
                                onChange={handleEditChange}
                                rows={2}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        {editFormError && (
                            <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{editFormError}</p>
                        )}

                        <button
                            type='submit'
                            disabled={updating}
                            className='w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors cursor-pointer'
                        >
                            {updating ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </Modal>

                {/* DELETE CONFIRM MODAL */}
                <Modal
                    isOpen={!!confirmDelete}
                    onClose={() => setConfirmDelete(null)}
                    title='Delete Reminder'
                    titleClassName='text-teal-900'
                >
                    {confirmDelete && (
                        <div>
                            <p className='text-sm text-gray-600 mb-6'>
                                Are you sure you want to delete the reminder for{' '}
                                <span className='font-medium'>{confirmDelete.medicineName}</span>?
                                This cannot be undone.
                            </p>

                            <div className='flex gap-3'>
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className='flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer'
                                >
                                    Keep Reminder
                                </button>
                                <button
                                    onClick={() => handleDelete(confirmDelete._id)}
                                    disabled={actionLoading}
                                    className='flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer'
                                >
                                    {actionLoading ? 'Deleting...' : 'Delete Reminder'}
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </DashboardLayout>
    );
};

export default ReminderPage;