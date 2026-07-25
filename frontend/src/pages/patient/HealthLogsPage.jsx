import { useState, useEffect, Activity } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import StatCard from '../../components/StatCard';
import HealthSummaryChart from '../../components/HealthSummaryChart';
import Modal from '../../components/shared/Modal';
import { Thermometer } from 'lucide-react';

const HealthLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formError, setFormError] = useState('');
    const [creating, setCreating] = useState(false);
    const [newLog, setNewLog] = useState({ symptoms: '', mood: '', notes: '', height: '', 
        weight: '', temperature: '', heartRate: '', bloodPressure: '' });
    const [editingLog, setEditingLog] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [editFormError, setEditFormError] = useState('');
    const [updating, setUpdating] = useState(false);
    
    useEffect(() => {
        const fetchHealthlogs = async () => {
            try {
                const response = await api.get('/auth/healthlogs');
                setLogs(response.data.data);
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to load healthlogs');
            } finally {
                setLoading(false);
            }
        };
        fetchHealthlogs();
    }, []);

    const [summary, setSummary] = useState(null);
    useEffect(() => {
        const fetchHealthSummary = async () => {
            try {
                const response = await api.get('/auth/health-summary');
                console.log("Health Summary Response:", response.data);
                setSummary(response.data.summary);
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to load health summary');
            }
        };
        fetchHealthSummary();
    }, []);
    
    const handleCreateHealthlog = async (e) => {
        e.preventDefault();
        setFormError('');
        setCreating(true);
        try {
            const body = {
                ...newLog, 
                symptoms: newLog.symptoms.split(',').map(s => s.trim()).filter(Boolean),
                height: newLog.height ? Number(newLog.height) : null,
                weight: newLog.weight ? Number(newLog.weight) : null,
                vitals: {
                    temperature: newLog.temperature ? Number(newLog.temperature) : null,
                    heartRate: newLog.heartRate ? Number(newLog.heartRate) : null,
                    bloodPressure: newLog.bloodPressure || null
                }
            };
            const response = await api.post('/auth/healthlogs', body);
            setLogs(prev => [...prev, response.data.data]);
            setNewLog({ symptoms: '', mood: '', notes: '', height: '', weight: '', temperature: '', heartRate: '', bloodPressure: '' });
            setShowForm(false);
        } catch (error) {
            setFormError(error.response?.data?.message || 'Something went wrong');
        } finally {
            setCreating(false);
        }
    };

    const handleChange = (e) => {
        setNewLog(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleEditStart = (log) => {
        setEditingLog(log);
        setEditForm({ symptoms: log.symptoms.join(', '), mood: log.mood, notes: log.notes, height: log.height || '', 
            weight: log.weight || '', temperature: log.vitals?.temperature || '', heartRate: log.vitals?.heartRate || '', bloodPressure: log.vitals?.bloodPressure || '' });
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditFormError('');
        setUpdating(true);
        try {
            const body = {
                ...editForm, 
                symptoms: editForm.symptoms.split(',').map(s => s.trim()).filter(Boolean),
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
            setEditingLog(null);
        } catch (error) {
            setEditFormError(error.response?.data?.message || 'Something went wrong');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async(id) => {
        try {
            const result = window.confirm("Delete this health log?");
            if (!result) {
                return;
            }
            await api.delete(`/auth/healthlogs/${id}`);
            setLogs(prev => prev.filter(l => l._id !== id));
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || 'Something went wrong');
        }
    };
    
    const handleEditChange = (e) => {
        setEditForm(prev => ({ ...prev, [e.target.name] : e.target.value }));
    };

    return (
        <DashboardLayout>
                <div className='max-w-5xl mx-auto'>
                    <div className='flex justify-between items-center mb-6'>
                        <h1 className='text-2xl font-bold text-teal-900'>My Healthlogs</h1>
                        <button 
                            onClick={() => {
                                if (showForm) {
                                    setShowForm(false);
                                    setFormError('');
                                    setNewLog({ symptoms: '', mood: '', notes: '', height: '', weight: '', temperature: '', heartRate: '', bloodPressure: '' });
                                } else {
                                    setShowForm(true);
                                }
                            }}
                            className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'
                        >
                            {showForm ? 'Cancel' : 'New Healthlog'}
                        </button>
                    </div>

                    {summary && (
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
                            <StatCard label="Avg Weight" value={summary.averages?.weight ? `${summary.averages.weight.toFixed(1)}kg` : '—'} />
                            <StatCard label="Avg Heart Rate" value={summary.averages?.heartRate ? `${summary.averages.heartRate.toFixed(0)}bpm` : '—'} />
                            <StatCard label="Avg Temp" value={summary.averages?.temperature ? `${summary.averages.temperature.toFixed(1)}°C` : '—'} />
                            <StatCard label="Total Logs" value={summary.totalLogs} />
                        </div>
                    )}

                    <HealthSummaryChart logs={logs} />

                    <Modal isOpen={showForm} onClose={() => { setShowForm(false); setFormError(''); }} title="New Health Log">
                        <form onSubmit={handleCreateHealthlog}>
                                <div className='mb-4'>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Symptoms</label>
                                    <p className='text-xs text-gray-400 mt-1'>Separate multiple symptoms with commas</p>
                                    <input
                                        type='text'
                                        name='symptoms'
                                        value={newLog.symptoms}
                                        onChange={handleChange}
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        placeholder=''
                                    />
                                </div>                   

                                <div className='mb-4'>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Mood</label>
                                    <input
                                        type='text'
                                        name='mood'
                                        value={newLog.mood}
                                        onChange={handleChange}
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        placeholder=''
                                    />
                                </div>

                                <div className='mb-4'>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Notes</label>
                                    <input
                                        type='text'
                                        name='notes'
                                        value={newLog.notes}
                                        onChange={handleChange}
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        placeholder=''
                                    />
                                </div>

                                <div className='grid grid-cols-2 gap-4 mb-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>Height (cm)</label>
                                        <input
                                            type='number'
                                            name='height'
                                            value={newLog.height}
                                            onChange={handleChange}
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                            placeholder=''
                                        />
                                    </div>

                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>Weight (kg)</label>
                                        <input
                                            type='number'
                                            name='weight'
                                            value={newLog.weight}
                                            onChange={handleChange}
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                            placeholder=''
                                        />
                                    </div>
                                </div>

                                <div className='grid grid-cols-2 gap-4 mb-4'>
                                    <div className='relative'>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>Temperature (°C)</label>
                                        <input
                                            type='text'
                                            name='temperature'
                                            value={newLog.temperature}
                                            onChange={handleChange}
                                            className='w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                            placeholder=''
                                        />
                                        <Thermometer className='w-6 h-6 text-red-400 absolute left-0.75 -bottom-2 -translate-y-1/2' />
                                    </div>

                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>Heart Rate (bpm)</label>
                                        <input
                                            type='text'
                                            name='heartRate'
                                            value={newLog.heartRate}
                                            onChange={handleChange}
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                            placeholder=''
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
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        placeholder=''
                                    />
                                </div>

                                {formError && (
                                    <p className='text-red-500 text-sm mb-4 bg-red-50 px-3 py-2 rounded-lg'>{formError}</p>
                                )}
                                <button
                                    type='submit'
                                    disabled={creating}
                                    className='w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors'
                                >
                                    {creating ? 'Creating...' : 'Create'}
                                </button>                    
                        </form>
                    </Modal>

                    <Modal isOpen={!!editingLog} onClose={() => { setEditingLog(null); setEditFormError(''); }} title="Edit Health Log">
                        <form onSubmit={handleEditSubmit}>
                                <div className='mb-4'>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Symptoms</label>
                                    <input 
                                        type='text'
                                        name='symptoms'
                                        value={editForm.symptoms}
                                        onChange={handleEditChange}
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        placeholder=''
                                    />
                                </div>

                                <div className='mb-4'>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Mood</label>
                                    <input
                                        type='text'
                                        name='mood'
                                        value={editForm.mood}
                                        onChange={handleEditChange}
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        placeholder=''
                                    />
                                </div>

                                <div className='mb-4'>
                                    <label className='block text-sm font-medium text-gray-700 mb-1'>Notes</label>
                                    <input
                                        type='text'
                                        name='notes'
                                        value={editForm.notes}
                                        onChange={handleEditChange}
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        placeholder=''
                                    />
                                </div>

                                <div className='grid grid-cols-2 gap-4 mb-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>Height (cm)</label>
                                        <input
                                            type='number'
                                            name='height'
                                            value={newLog.height}
                                            onChange={handleChange}
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                            placeholder=''
                                        />
                                    </div>

                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>Weight (kg)</label>
                                        <input
                                            type='number'
                                            name='weight'
                                            value={newLog.weight}
                                            onChange={handleChange}
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                            placeholder=''
                                        />
                                    </div>
                                </div>

                                <div className='grid grid-cols-2 gap-4 mb-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>Temperature (°C)</label>
                                        <input
                                            type='text'
                                            name='temperature'
                                            value={newLog.temperature}
                                            onChange={handleChange}
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                            placeholder=''
                                        />
                                    </div>

                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>Heart Rate (bpm)</label>
                                        <input
                                            type='text'
                                            name='heartRate'
                                            value={newLog.heartRate}
                                            onChange={handleChange}
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                            placeholder=''
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
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                                        placeholder=''
                                    />
                                </div>

                                {editFormError && <p className='text-red-500 text-sm mb-4 bg-red-50 px-3 py-2 rounded-lg'>{editFormError}</p>}

                                <button
                                    type='submit'
                                    disabled={updating}
                                    className='w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors'
                                >
                                    {updating ? 'Updating...' : 'Save Changes'}
                                </button>

                                <button 
                                    type='button' 
                                    onClick={() => { 
                                        setEditingLog(null);
                                        setEditFormError(''); }}
                                    className='text-sm text-blue-600 hover:underline mt-3'
                                >
                                    Cancel
                                </button>  

                        </form>
                    </Modal>

                    {loading ? (
                        <p>Loading...</p>
                        ) : error ? (
                        <p className='text-red-500'>{error}</p>
                        ) : logs.length === 0 ? (
                        <div className='text-center py-16'>
                            <Activity className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                            <p className='text-gray-900 font-medium'>No health logs yet</p>
                            <p className='text-sm text-gray-400 mt-1'>Start tracking your health by adding your first log</p>
                            <button onClick={() => setShowForm(true)} className='mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700'>
                                + Add Health Log
                            </button>
                        </div>
                        ) : (
                        <div className='space-y-3'>
                            {logs.map(log => (
                                <div key={log._id} className='bg-white rounded-xl shadow-sm border border-gray-100 p-5'>
                                    <div className='flex justify-between items-start mb-2'>
                                        <span className='text-xs text-gray-400'>{new Date(log.date).toLocaleDateString()}</span>
                                        <div className='flex gap-3'>
                                            <button onClick={() => handleEditStart(log)} className='text-xs text-teal-600 hover:underline'>Edit</button>
                                            <button onClick={() => handleDelete(log._id)} className='text-xs text-red-500 hover:underline'>Delete</button>
                                        </div>
                                    </div>
                                    {log.symptoms?.length > 0 && (
                                        <div className='flex flex-wrap gap-1 mb-2'>
                                            {log.symptoms.map(s => (
                                                <span key={s} className='text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full'>{s}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className='grid grid-cols-2 md:grid-cols-4 gap-3 text-sm'>
                                        {log.weight && <div><span className='text-gray-400'>Weight:</span> {log.weight}kg</div>}
                                        {log.vitals?.temperature && <div><span className='text-gray-400'>Temp:</span> {log.vitals.temperature}°C</div>}
                                        {log.vitals?.heartRate && <div><span className='text-gray-400'>HR:</span> {log.vitals.heartRate}bpm</div>}
                                        {log.vitals?.bloodPressure && <div><span className='text-gray-400'>BP:</span> {log.vitals.bloodPressure}</div>}
                                    </div>
                                    {log.notes && <p className='text-sm text-gray-500 mt-2'>{log.notes}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                </div>                
        </DashboardLayout>
    );
};

export default HealthLogs;