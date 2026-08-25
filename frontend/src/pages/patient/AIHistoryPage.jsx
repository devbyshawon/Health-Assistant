import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { ArrowLeft, MessageSquare, Stethoscope, BookOpen, ClipboardCheck } from 'lucide-react';

const typeIcons = {
    diagnosis: Stethoscope,
    chat: MessageSquare,
    simplifier: BookOpen,
    prep: ClipboardCheck,
};

const typeLabels = {
    diagnosis: 'Symptom Checker',
    chat: 'AI Chat',
    simplifier: 'Term Simplifier',
    prep: 'Visit Prep',
};

const AIHistoryPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/auth/ai/history');
                setLogs(response.data.data);
            } catch (error) {
                setPageError(error.response?.data?.message || 'Failed to load history');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <DashboardLayout>
            <div className='max-w-3xl mx-auto'>
                <Link to="/ai-chat" className='text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 mb-4'>
                    <ArrowLeft className='w-4 h-4' /> Back to AI Assistant
                </Link>

                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-gray-900'>AI History</h1>
                    <p className='text-sm text-gray-500 mt-1'>Review your past AI interactions</p>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading history...</p>
                ) : logs.length === 0 ? (
                    <p className='text-gray-400 text-center py-12'>No AI interactions yet</p>
                ) : (
                    <div className='space-y-3'>
                        {logs.map(log => {
                            const Icon = typeIcons[log.type];
                            return (
                                <div key={log._id} className='bg-white rounded-xl shadow-sm border border-gray-100 p-4'>
                                    <div className='flex items-center gap-2 mb-2'>
                                        {Icon && <Icon className='w-4 h-4 text-teal-600' />}
                                        <span className='text-xs font-medium text-teal-600'>{typeLabels[log.type]}</span>
                                        <span className='text-xs text-gray-400 ml-auto'>{new Date(log.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p className='text-sm text-gray-900 font-medium mb-1'>{log.input}</p>
                                    <p className='text-sm text-gray-600 whitespace-pre-wrap'>{log.output}</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AIHistoryPage;