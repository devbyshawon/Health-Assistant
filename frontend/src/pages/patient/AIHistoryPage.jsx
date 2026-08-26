import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import MarkdownText from '../../components/shared/MarkdownText';
import {
    ArrowLeft,
    MessageSquare,
    Stethoscope,
    BookOpen,
    ClipboardCheck,
    History,
} from 'lucide-react';

const PAGE_SIZE = 10;

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

    const [typeFilter, setTypeFilter] = useState('all');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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

    const filteredLogs = typeFilter === 'all' ? logs : logs.filter(log => log.type === typeFilter);
    const visibleLogs = filteredLogs.slice(0, visibleCount);
    const hasMore = filteredLogs.length > visibleCount;

    return (
        <DashboardLayout>
            <div className='max-w-4xl mx-auto'>
                <Link
                    to='/ai'
                    className='text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 mb-4 cursor-pointer'
                >
                    <ArrowLeft className='w-4 h-4' /> Back to AI Assistant
                </Link>

                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-teal-900'>AI History</h1>
                    <p className='text-sm text-gray-500 mt-1'>Review your past AI interactions</p>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}

                {!loading && logs.length > 0 && (
                    <div className='mb-4'>
                        <select
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(e.target.value);
                                setVisibleCount(PAGE_SIZE);
                            }}
                            className='w-full md:w-56 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer'
                        >
                            <option value='all'>All interactions</option>
                            <option value='chat'>AI Chat</option>
                            <option value='diagnosis'>Symptom Checker</option>
                            <option value='simplifier'>Term Simplifier</option>
                            <option value='prep'>Visit Prep</option>
                        </select>
                    </div>
                )}

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading history...</p>
                ) : logs.length === 0 ? (
                    <div className='text-center py-16'>
                        <History className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                        <p className='text-teal-900 font-medium'>No AI interactions yet</p>
                        <p className='text-sm text-gray-400 mt-1'>
                            Anything you ask the assistant will be saved here
                        </p>

                        <Link
                            to='/ai-chat'
                            className='inline-block mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors cursor-pointer'
                        >
                            Open AI Assistant
                        </Link>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className='text-center py-16'>
                        <History className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                        <p className='text-teal-900 font-medium'>Nothing here yet</p>
                        <p className='text-sm text-gray-400 mt-1'>
                            You haven't used this tool — pick another from the filter above
                        </p>
                    </div>
                ) : (
                    <div className='space-y-3'>
                        {visibleLogs.map(log => (
                            <HistoryEntry key={log._id} log={log} />
                        ))}

                        {hasMore && (
                            <div className='pt-1'>
                                <button
                                    onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
                                    className='w-full text-center text-sm text-teal-600 hover:text-teal-700 font-medium py-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors cursor-pointer'
                                >
                                    Show older
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

const HistoryEntry = ({ log }) => {
    const [expanded, setExpanded] = useState(false);

    const Icon = typeIcons[log.type];
    const label = typeLabels[log.type] || 'AI Assistant';

    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-5'>
            <div className='flex items-center gap-2 mb-3'>
                {Icon && <Icon className='w-4 h-4 text-teal-600 shrink-0' />}
                <span className='text-xs font-medium text-teal-600'>{label}</span>
                <span className='text-xs text-gray-400 ml-auto shrink-0'>
                    {new Date(log.createdAt).toLocaleString()}
                </span>
            </div>

            <p className='text-sm font-medium text-teal-900'>{log.input}</p>

            <div className='mt-3 pt-3 border-t border-gray-100'>
                <div className={expanded ? '' : 'max-h-32 overflow-hidden relative'}>
                    <MarkdownText>{log.output}</MarkdownText>

                    {!expanded && (
                        <div className='absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-white to-transparent' />
                    )}
                </div>

                <button
                    onClick={() => setExpanded(prev => !prev)}
                    className='text-xs text-teal-600 hover:text-teal-700 font-medium mt-2 cursor-pointer'
                >
                    {expanded ? 'Show less' : 'Show full answer'}
                </button>
            </div>
        </div>
    );
};

export default AIHistoryPage;