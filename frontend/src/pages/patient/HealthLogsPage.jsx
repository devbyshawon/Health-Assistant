import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import StatCard from '../../components/StatCard';
import HealthSummaryChart from '../../components/HealthSummaryChart';
import Modal from '../../components/shared/Modal';
import { Plus, Activity, Scale, HeartPulse, Thermometer } from 'lucide-react';

const emptyLogForm = { symptoms: '', mood: '', notes: '', height: '', weight: '', temperature: '', heartRate: '', bloodPressure: '' };

const HealthLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    const [summary, setSummary] = useState(null);
    const [summaryError, setSummaryError] = useState('');

    const [actionError, setActionError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [formError, setFormError] = useState('');
    const [creating, setCreating] = useState(false);
    const [newLog, setNewLog] = useState(emptyLogForm);

    const [editingLog, setEditingLog] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [editFormError, setEditFormError] = useState('');
    const [updating, setUpdating] = useState(false);

    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => {
        const fetchHealthLogs = async () => {
            try {
                const response = await api.get('/auth/healthlogs');
                setLogs(response.data.data);
            } catch (error) {
                setPageError(error.response?.data?.message || 'Failed to load health logs');
            } finally {
                setLoading(false);
            }
        };
        fetchHealthLogs();
    }, []);

    useEffect(() => {
        const fetchHealthSummary = async () => {
            try {
                const response = await api.get('/auth/health-summary');
                setSummary(response.data.summary);
            } catch (error) {
                setSummaryError(error.response?.data?.message || 'Failed to load summary');
            }
        };
        fetchHealthSummary();
    }, []);

    const handleChange = (e) => {
        setNewLog(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleEditChange = (e) => {
        setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const closeCreateModal = () => {
        setShowForm(false);
        setFormError('');
        setNewLog(emptyLogForm);
    };

    const closeEditModal = () => {
        setEditingLog(null);
        setEditForm({});
        setEditFormError('');
    };

    const buildLogBody = (form) => ({
        symptoms: form.symptoms.split(',').map(s => s.trim()).filter(Boolean),
        mood: form.mood,
        notes: form.notes,
        height: form.height ? Number(form.height) : null,
        weight: form.weight ? Number(form.weight) : null,
        vitals: {
            temperature: form.temperature ? Number(form.temperature) : null,
            heartRate: form.heartRate ? Number(form.heartRate) : null,
            bloodPressure: form.bloodPressure || null
        }
    });

    const handleCreateHealthLog = async (e) => {
        e.preventDefault();
        setFormError('');
        setCreating(true);
        try {
            const response = await api.post('/auth/healthlogs', buildLogBody(newLog));
            setLogs(prev => [response.data.data, ...prev]);
            closeCreateModal();
        } catch (error) {
            setFormError(error.response?.data?.message || 'Something went wrong');
        } finally {
            setCreating(false);
        }
    };

    const handleEditStart = (log) => {
        setEditingLog(log);
        setEditForm({
            symptoms: log.symptoms?.join(', ') || '',
            mood: log.mood || '',
            notes: log.notes || '',
            height: log.height || '',
            weight: log.weight || '',
            temperature: log.vitals?.temperature || '',
            heartRate: log.vitals?.heartRate || '',
            bloodPressure: log.vitals?.bloodPressure || ''
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditFormError('');
        setUpdating(true);
        try {
            const response = await api.patch(`/auth/healthlogs/${editingLog._id}`, buildLogBody(editForm));
            setLogs(prev => prev.map(l => l._id === editingLog._id ? response.data.data : l));
            closeEditModal();
        } catch (error) {
            setEditFormError(error.response?.data?.message || 'Something went wrong');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (id) => {
        setActionLoading(true);
        setActionError('');
        try {
            await api.delete(`/auth/healthlogs/${id}`);
            setLogs(prev => prev.filter(l => l._id !== id));
            setConfirmDelete(null);
        } catch (error) {
            setActionError(error.response?.data?.message || 'Failed to delete health log');
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
                        <h1 className='text-2xl font-bold text-teal-900'>Health Logs</h1>
                        <p className='text-sm text-gray-500 mt-1'>Track your vitals and symptoms over time</p>
                    </div>

                    <button
                        onClick={() => setShowForm(true)}
                        className='bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 cursor-pointer'
                    >
                        <Plus className='w-4 h-4' />
                        New Health Log
                    </button>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}

                {summaryError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{summaryError}</p>
                )}

                {actionError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{actionError}</p>
                )}

                {!loading && summary?.totalLogs > 0 && (
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
                        <StatCard icon={Scale} label='Avg Weight' value={summary.averages?.weight ? `${summary.averages.weight.toFixed(1)}kg` : '—'} color='blue' />
                        <StatCard icon={HeartPulse} label='Avg Heart Rate' value={summary.averages?.heartRate ? `${summary.averages.heartRate.toFixed(0)}bpm` : '—'} color='green' />
                        <StatCard icon={Thermometer} label='Avg Temp' value={summary.averages?.temperature ? `${summary.averages.temperature.toFixed(1)}°C` : '—'} color='purple' />
                        <StatCard icon={Activity} label='Total Logs' value={summary.totalLogs} color='blue' />
                    </div>
                )}

                {!loading && logs.length > 0 && (
                    <div className='mb-6'>
                        <HealthSummaryChart logs={logs} />
                    </div>
                )}

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading health logs...</p>
                ) : logs.length === 0 ? (
                    <div className='text-center py-16'>
                        <Activity className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                        <p className='text-teal-900 font-medium'>No health logs yet</p>
                        <p className='text-sm text-gray-400 mt-1'>Start tracking your health by adding your first log</p>

                        <button
                            onClick={() => setShowForm(true)}
                            className='mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors cursor-pointer'
                        >
                            New Health Log
                        </button>
                    </div>
                ) : (
                    <div className='space-y-3'>
                        {logs.map(log => (
                            <div key={log._id} className='bg-white rounded-xl shadow-sm border border-gray-100 p-5'>
                                <div className='flex justify-between items-start mb-2'>
                                    <span className='text-xs text-gray-400'>
                                        {new Date(log.date).toLocaleDateString()}
                                    </span>

                                    <div className='flex gap-3'>
                                        <button
                                            onClick={() => handleEditStart(log)}
                                            className='text-xs text-teal-600 hover:underline cursor-pointer'
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => setConfirmDelete(log)}
                                            className='text-xs text-red-500 hover:underline cursor-pointer'
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {log.symptoms?.length > 0 && (
                                    <div className='flex flex-wrap gap-1 mb-2'>
                                        {log.symptoms.map((s, i) => (
                                            <span key={i} className='text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full'>{s}</span>
                                        ))}
                                    </div>
                                )}

                                <div className='grid grid-cols-2 md:grid-cols-4 gap-3 text-sm'>
                                    {log.weight && <div><span className='text-gray-400'>Weight:</span> {log.weight}kg</div>}
                                    {log.vitals?.temperature && <div><span className='text-gray-400'>Temp:</span> {log.vitals.temperature}°C</div>}
                                    {log.vitals?.heartRate && <div><span className='text-gray-400'>HR:</span> {log.vitals.heartRate}bpm</div>}
                                    {log.vitals?.bloodPressure && <div><span className='text-gray-400'>BP:</span> {log.vitals.bloodPressure}</div>}
                                </div>

                                {log.mood && <p className='text-xs text-gray-500 mt-2'>Mood: {log.mood}</p>}
                                {log.notes && <p className='text-sm text-gray-500 mt-1'>{log.notes}</p>}
                            </div>
                        ))}
                    </div>
                )}

                {/* CREATE MODAL */}
                <Modal isOpen={showForm} onClose={closeCreateModal} title='New Health Log' titleClassName='text-teal-900'>
                    <form onSubmit={handleCreateHealthLog}>
                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Symptoms</label>
                            <input
                                type='text'
                                name='symptoms'
                                value={newLog.symptoms}
                                onChange={handleChange}
                                placeholder='e.g. headache, fatigue'
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                            <p className='text-xs text-gray-400 mt-1'>Separate multiple symptoms with commas</p>
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Mood</label>
                            <input
                                type='text'
                                name='mood'
                                value={newLog.mood}
                                onChange={handleChange}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Notes</label>
                            <textarea
                                name='notes'
                                value={newLog.notes}
                                onChange={handleChange}
                                rows={2}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4 mb-4'>
                            <div>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Height (cm)</label>
                                <input
                                    type='number'
                                    name='height'
                                    value={newLog.height}
                                    onChange={handleChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Weight (kg)</label>
                                <input
                                    type='number'
                                    name='weight'
                                    value={newLog.weight}
                                    onChange={handleChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                />
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-4 mb-4'>
                            <div>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Temperature (°C)</label>
                                <input
                                    type='text'
                                    name='temperature'
                                    value={newLog.temperature}
                                    onChange={handleChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Heart Rate (bpm)</label>
                                <input
                                    type='text'
                                    name='heartRate'
                                    value={newLog.heartRate}
                                    onChange={handleChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                />
                            </div>
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Blood Pressure (mmHg)</label>
                            <input
                                type='text'
                                name='bloodPressure'
                                value={newLog.bloodPressure}
                                onChange={handleChange}
                                placeholder='e.g. 120/80'
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
                            {creating ? 'Creating...' : 'Create Health Log'}
                        </button>
                    </form>
                </Modal>

                {/* EDIT MODAL */}
                <Modal isOpen={!!editingLog} onClose={closeEditModal} title='Edit Health Log' titleClassName='text-teal-900'>
                    <form onSubmit={handleEditSubmit}>
                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Symptoms</label>
                            <input
                                type='text'
                                name='symptoms'
                                value={editForm.symptoms || ''}
                                onChange={handleEditChange}
                                placeholder='e.g. headache, fatigue'
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                            <p className='text-xs text-gray-400 mt-1'>Separate multiple symptoms with commas</p>
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Mood</label>
                            <input
                                type='text'
                                name='mood'
                                value={editForm.mood || ''}
                                onChange={handleEditChange}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Notes</label>
                            <textarea
                                name='notes'
                                value={editForm.notes || ''}
                                onChange={handleEditChange}
                                rows={2}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4 mb-4'>
                            <div>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Height (cm)</label>
                                <input
                                    type='number'
                                    name='height'
                                    value={editForm.height || ''}
                                    onChange={handleEditChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Weight (kg)</label>
                                <input
                                    type='number'
                                    name='weight'
                                    value={editForm.weight || ''}
                                    onChange={handleEditChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                />
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-4 mb-4'>
                            <div>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Temperature (°C)</label>
                                <input
                                    type='text'
                                    name='temperature'
                                    value={editForm.temperature || ''}
                                    onChange={handleEditChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Heart Rate (bpm)</label>
                                <input
                                    type='text'
                                    name='heartRate'
                                    value={editForm.heartRate || ''}
                                    onChange={handleEditChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                />
                            </div>
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Blood Pressure (mmHg)</label>
                            <input
                                type='text'
                                name='bloodPressure'
                                value={editForm.bloodPressure || ''}
                                onChange={handleEditChange}
                                placeholder='e.g. 120/80'
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
                    title='Delete Health Log'
                    titleClassName='text-teal-900'
                >
                    {confirmDelete && (
                        <div>
                            <p className='text-sm text-gray-600 mb-6'>
                                Are you sure you want to delete your health log from{' '}
                                <span className='font-medium'>{new Date(confirmDelete.date).toLocaleDateString()}</span>?
                                This cannot be undone.
                            </p>

                            <div className='flex gap-3'>
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className='flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer'
                                >
                                    Keep Log
                                </button>
                                <button
                                    onClick={() => handleDelete(confirmDelete._id)}
                                    disabled={actionLoading}
                                    className='flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer'
                                >
                                    {actionLoading ? 'Deleting...' : 'Delete Log'}
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </DashboardLayout>
    );
};

export default HealthLogsPage;