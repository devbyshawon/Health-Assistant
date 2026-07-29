import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import StatCard from '../../components/StatCard';
import HealthSummaryChart from '../../components/HealthSummaryChart';
import { Activity } from 'lucide-react';
import Modal from '../../components/shared/Modal';


const emptyLogForm = { symptoms: '', mood: '', notes: '', height: '', weight: '', temperature: '', heartRate: '', bloodPressure: '' };

const HealthLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    const [summary, setSummary] = useState(null);
    const [summaryError, setSummaryError] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [formError, setFormError] = useState('');
    const [creating, setCreating] = useState(false);
    const [newLog, setNewLog] = useState(emptyLogForm);

    const [editingLog, setEditingLog] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [editFormError, setEditFormError] = useState('');
    const [updating, setUpdating] = useState(false);

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
        setEditFormError('');
    };

    const handleCreateHealthLog = async (e) => {
        e.preventDefault();
        setFormError('');
        setCreating(true);
        try {
            const body = {
                symptoms: newLog.symptoms.split(',').map(s => s.trim()).filter(Boolean),
                mood: newLog.mood,
                notes: newLog.notes,
                height: newLog.height ? Number(newLog.height) : null,
                weight: newLog.weight ? Number(newLog.weight) : null,
                vitals: {
                    temperature: newLog.temperature ? Number(newLog.temperature) : null,
                    heartRate: newLog.heartRate ? Number(newLog.heartRate) : null,
                    bloodPressure: newLog.bloodPressure || null
                }
            };
            const response = await api.post('/auth/healthlogs', body);
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
            const body = {
                symptoms: editForm.symptoms.split(',').map(s => s.trim()).filter(Boolean),
                mood: editForm.mood,
                notes: editForm.notes,
                height: editForm.height ? Number(editForm.height) : null,
                weight: editForm.weight ? Number(editForm.weight) : null,
                vitals: {
                    temperature: editForm.temperature ? Number(editForm.temperature) : null,
                    heartRate: editForm.heartRate ? Number(editForm.heartRate) : null,
                    bloodPressure: editForm.bloodPressure || null
                }
            };
            const response = await api.patch(`/auth/healthlogs/${editingLog._id}`, body);
            setLogs(prev => prev.map(l => l._id === editingLog._id ? response.data.data : l));
            closeEditModal();
        } catch (error) {
            setEditFormError(error.response?.data?.message || 'Something went wrong');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this health log?')) {
            return;
        }
        try {
            await api.delete(`/auth/healthlogs/${id}`);
            setLogs(prev => prev.filter(l => l._id !== id));
        } catch (error) {
            setPageError(error.response?.data?.message || 'Failed to delete health log');
        }
    };

    return (
        <DashboardLayout>
            <div className='max-w-5xl mx-auto'>
                <div className='flex justify-between items-center mb-6'>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-900'>Health Logs</h1>
                        <p className='text-sm text-gray-500 mt-1'>Track your vitals and symptoms over time</p>
                    </div>

                    <button
                        onClick={() => setShowForm(true)}
                        className='bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2'
                    >
                        + New Health Log
                    </button>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}

                {summaryError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{summaryError}</p>
                )}

                {summary && summary.totalLogs > 0 && (
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
                        <StatCard label="Avg Weight" value={summary.averages?.weight ? `${summary.averages.weight.toFixed(1)}kg` : '—'} color="blue" />
                        <StatCard label="Avg Heart Rate" value={summary.averages?.heartRate ? `${summary.averages.heartRate.toFixed(0)}bpm` : '—'} color="green" />
                        <StatCard label="Avg Temp" value={summary.averages?.temperature ? `${summary.averages.temperature.toFixed(1)}°C` : '—'} color="purple" />
                        <StatCard label="Total Logs" value={summary.totalLogs} color="blue" />
                    </div>
                )}

                <div className='mb-6'>
                    <HealthSummaryChart logs={logs} />
                </div>

                {/* List states */}
                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading health logs...</p>
                ) : logs.length === 0 ? (
                    <div className='text-center py-16'>
                        <Activity className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                        <p className='text-gray-900 font-medium'>No health logs yet</p>
                        <p className='text-sm text-gray-400 mt-1'>Start tracking your health by adding your first log</p>

                        <button
                            onClick={() => setShowForm(true)}
                            className='mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700'
                        >
                            + Add Health Log
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
                                            className='text-xs text-teal-600 hover:underline'
                                        >   
                                            Edit
                                        </button>

                                        <button 
                                            onClick={() => handleDelete(log._id)} 
                                            className='text-xs text-red-500 hover:underline'
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
                <Modal isOpen={showForm} onClose={closeCreateModal} title="New Health Log">
                    <form onSubmit={handleCreateHealthLog}>
                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Symptoms</label>
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
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Mood</label>
                            <input
                                type='text'
                                name='mood'
                                value={newLog.mood}
                                onChange={handleChange}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Notes</label>
                            <input
                                type='text'
                                name='notes'
                                value={newLog.notes}
                                onChange={handleChange}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4 mb-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Height (cm)</label>
                                <input type='number' name='height' value={newLog.height} onChange={handleChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Weight (kg)</label>
                                <input type='number' name='weight' value={newLog.weight} onChange={handleChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-4 mb-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Temperature (°C)</label>

                                <div>
                                    <input type='text' name='temperature' value={newLog.temperature} onChange={handleChange}
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                                </div>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Heart Rate (bpm)</label>
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
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Blood Pressure (mmHg)</label>
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
                            className='w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors'
                        >
                            {creating ? 'Creating...' : 'Create Health Log'}
                        </button>
                    </form>
                </Modal>

                {/* EDIT MODAL */}
                <Modal isOpen={!!editingLog} onClose={closeEditModal} title="Edit Health Log">
                    <form onSubmit={handleEditSubmit}>
                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Symptoms</label>
                            <input 
                                type='text' 
                                name='symptoms' 
                                value={editForm.symptoms || ''} 
                                onChange={handleEditChange}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' 
                            />
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Mood</label>
                            <input 
                                type='text' 
                                name='mood' 
                                value={editForm.mood || ''} 
                                onChange={handleEditChange}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' 
                            />
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Notes</label>
                            <input t
                                ype='text' 
                                name='notes' 
                                value={editForm.notes || ''} 
                                onChange={handleEditChange}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' 
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4 mb-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Height (cm)</label>
                                <input 
                                    type='number' 
                                    name='height' 
                                    value={editForm.height || ''} 
                                    onChange={handleEditChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' 
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Weight (kg)</label>
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
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Temperature (°C)</label>
                                <input 
                                    type='text' 
                                    name='temperature' 
                                    value={editForm.temperature || ''} 
                                    onChange={handleEditChange}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' 
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Heart Rate (bpm)</label>
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
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Blood Pressure (mmHg)</label>
                            <input 
                                type='text' 
                                name='bloodPressure' 
                                value={editForm.bloodPressure || ''} 
                                onChange={handleEditChange}
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

export default HealthLogsPage;