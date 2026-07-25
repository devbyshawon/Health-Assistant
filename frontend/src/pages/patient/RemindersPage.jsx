import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Pill, Plus } from 'lucide-react';
import ReminderCard from '../../components/ReminderCard';
import Modal from '../../components/shared/Modal';


const ReminderPage = () => {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [formError, setFormError] = useState('');
    const [creating, setCreating] = useState(false);
    const [newReminder, setNewReminder] = useState({
        medicineName: '', dosage: '', time: '', repeat: 'None', notes: ''
    });

    const [editingReminder, setEditingReminder] = useState(null);
    const [editForm, setEditForm] = useState([]);
    const [editFormError, setEditFormError] = useState('');
    const [updating, setUpadating] = useState(false);

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

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!newReminder.medicineName.trim() || !newReminder.time) {
            setFormError('Medicine name and time are required');
            return;
        }

        setCreating(true);
        try {
            const response = await api.post('auth/reminders', newReminder);
            setReminders(prev => [response.data.data, ...prev]);
            setNewReminder({
                medicineName: '', dosage: '', time: '', repeat: 'None', notes: ''
            });
            setShowModal(false);
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

    const handleEditChange = (e) => {
        setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditFormError('');
        if (!editForm.medicineName?.trim() || !editForm.time) {
            setEditFormError('Medicine name and time are required');
            return;   
        }

        setUpadating(true);
        try {
            const response = await api.patch(`/auth/reminders/${editingReminder._id}`, editForm);
            setReminders(prev => prev.map(r => r._id === editingReminder._id ? response.data.data : r));
            setEditingReminder(null);
        } catch (error) {
            setEditFormError(error.response?.data?.message || 'Something went wrong');
        } finally {
            setUpadating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this reminder?')) {
            return;
        }
        try {
            await api.delete(`/auth/reminders/${id}`);
            setReminders(prev => prev.filter(r => r._id !== id));
        } catch (error) {
            setPageError(error.response?.data?.message || 'Failed to delete reminder');
        }
    };

    return (
        <DashboardLayout>
            <div className='max-w-5xl mx-auto'>
                
                {/* Page header */}
                <div className='flex justify-between items-center mb-6'>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-900'>Medicine Reminders</h1>
                        <p className='text-sm text-gray-500 mt-1'>Never miss a dose</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className='bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2'
                    >
                        <Plus className='w-4 h-4' />
                        New Reminder
                    </button>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}

                {/* List states */}
                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading reminders...</p>
                ) : reminders.length === 0 ? (
                    <div className='text-center py-16'>
                        <Pill className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                        <p className='text-gray-900 font-medium'>No reminders yet</p>
                        <p className='text-sm text-gray-400 mt-1'>Add a reminder so you never miss your medication</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className='mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700'
                        >
                            + Add Reminder
                        </button>
                    </div>
                ) : (
                    <div className='space-y-3'>
                        {reminders.map(reminder => (
                            <ReminderCard
                                key={reminder._id}
                                reminder={reminder}
                                onEdit={handleEditStart}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}

                {/* CREATE MODAL */}
                <Modal 
                    isOpen={showModal}
                    onClose={() => { 
                        setShowModal(false);
                        setFormError('');
                    }}
                    title='New Reminder'
                >
                    <form onSubmit={handleCreate}>
                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Medicine Name</label>
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
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Dosage</label>
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
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Repeat</label>
                                <select
                                    name='repeat'
                                    value={newReminder.repeat}
                                    onChange={handleChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                >
                                    <option value='None'>None</option>
                                    <option value='Daily'>Daily</option>
                                    <option value='Weekly'>Weekly</option>
                                </select>
                            </div>
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Time</label>
                            <input
                                type='datetime-local'
                                name='time'
                                value={newReminder.time}
                                onChange={handleChange}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Notes (optional)</label>
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
                            className='w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors'
                        >
                            {creating ? 'Creating...' : 'Create Reminder'}
                        </button>                        
                    </form>
                </Modal>

                {/* EDIT MODAL */}
                <Modal 
                    isOpen={!!editingReminder}
                    onClose={() => { 
                        setEditingReminder(null);
                        setEditFormError('');
                    }}
                    title='Edit Reminder'
                >
                    <form onSubmit={handleEditSubmit}>
                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Medicine Name</label>
                            <input
                                type='text'
                                name='medicineName'
                                value={editForm.medicineName || ''}
                                onChange={handleEditChange}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4 mb-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Dosage</label>
                                <input
                                    type='text'
                                    name='dosage'
                                    value={editForm.dosage || ''}
                                    onChange={handleEditChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Repeat</label>
                                <select
                                    name='repeat'
                                    value={editForm.repeat || 'None'}
                                    onChange={handleEditChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                >
                                    <option value='None'>None</option>
                                    <option value='Daily'>Daily</option>
                                    <option value='Weekly'>Weekly</option>
                                </select>
                            </div>
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Time</label>
                            <input
                                type='datetime-local'
                                name='time'
                                value={editForm.time || ''}
                                onChange={handleEditChange}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Notes (optional)</label>
                            <textarea
                                name='notes'
                                value={editForm.notes || ''}
                                onChange={handleChange}
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
                            className='w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors'
                        >
                            {updating ? 'Saving...' : 'Save Changes'}
                        </button>                        
                    </form>
                </Modal>

            </div>
        </DashboardLayout>
    );
};

export default ReminderPage;