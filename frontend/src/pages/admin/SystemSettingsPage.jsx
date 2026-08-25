import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';

const SystemSettings = () => {
    const [settings, setSettings] = useState({ voiceInputEnabled: true, aiChatLogsEnabled: true });
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/admin/settings');
                setSettings(response.data);
            } catch (error) {
                setPageError(error.response?.data?.message || 'Failed to load settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleToggle = async (field, value) => {
        const updated = { ...settings, [field]: value };
        setSettings(updated);
        setSaveError('');
        setSaveSuccess(false);
        setSaving(true);
        try {
            await api.patch('/admin/settings', updated);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            setSaveError(error.response?.data?.message || 'Failed to save settings');
            setSettings(settings); // revert on failure
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className='max-w-6xl mx-auto'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-teal-900'>System Settings</h1>
                    <p className='text-sm text-gray-500 mt-1'>Configure platform-wide options</p>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}
                {saveSuccess && (
                    <p className='text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg mb-4'>Settings saved successfully</p>
                )}
                {saveError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{saveError}</p>
                )}

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading settings...</p>
                ) : (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                        <table className='w-full text-sm'>
                            <thead className='bg-gray-50 border-b border-gray-100'>
                                <tr>
                                    <th className='text-left px-4 py-3 font-bold text-gray-500'>Setting</th>
                                    <th className='text-left px-4 py-3 font-bold text-gray-500'>Description</th>
                                    <th className='text-right px-4 py-3 font-bold text-gray-500'>Action</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100'>
                                <tr className='hover:bg-gray-50'>
                                    <td className='px-4 py-3 text-gray-900'>Voice Input</td>
                                    <td className='px-4 py-3 text-gray-500'>Allow voice input across the platform</td>
                                    <td className='px-4 py-3 text-right'>
                                        <input
                                            type='checkbox'
                                            checked={settings.voiceInputEnabled}
                                            disabled={saving}
                                            onChange={(e) => handleToggle('voiceInputEnabled', e.target.checked)}
                                        />
                                    </td>
                                </tr>
                                <tr className='hover:bg-gray-50'>
                                    <td className='px-4 py-3 text-gray-900'>AI Chat Logs</td>
                                    <td className='px-4 py-3 text-gray-500'>Store logs of AI chat conversations</td>
                                    <td className='px-4 py-3 text-right'>
                                        <input
                                            type='checkbox'
                                            checked={settings.aiChatLogsEnabled}
                                            disabled={saving}
                                            onChange={(e) => handleToggle('aiChatLogsEnabled', e.target.checked)}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default SystemSettings;