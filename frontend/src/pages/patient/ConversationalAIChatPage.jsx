import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import MarkdownText from '../../components/shared/MarkdownText';
import AIDisclaimer from '../../components/shared/AIDisclaimer';
import { ArrowLeft, ArrowUp, Check, Copy, History, RotateCcw, Sparkles } from 'lucide-react';

const STARTERS = [
    "I've had a headache and mild fever since yesterday",
    'What does a blood pressure reading of 140/90 mean?',
    'How should I prepare for a diabetes check-up?',
    'Is it safe to take paracetamol with antibiotics?',
];

const AIChat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);

    const bottomRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        const loadPreviousChat = async () => {
            try {
                const response = await api.get('/auth/ai/history');
                const chatTurns = response.data.data
                    .filter(log => log.type === 'chat')
                    .slice(0, 10)
                    .reverse();

                setMessages(
                    chatTurns.flatMap(log => [
                        { role: 'user', text: log.input, createdAt: log.createdAt },
                        { role: 'ai', text: log.output, createdAt: log.createdAt },
                    ])
                );
            } catch (error) {
                console.error(error);
                error.response?.data?.message || 'Something went wrong';
            } finally {
                setHistoryLoading(false);
            }
        };
        loadPreviousChat();
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const growTextarea = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    };

    const sendMessage = async (text) => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;

        setMessages(prev => [
            ...prev.filter(m => m.role !== 'error'),
            { role: 'user', text: trimmed, createdAt: new Date().toISOString() },
        ]);
        setInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        setLoading(true);

        try {
            const response = await api.post('/auth/ai/chat', { message: trimmed });
            setMessages(prev => [
                ...prev,
                { role: 'ai', text: response.data.data, createdAt: new Date().toISOString() },
            ]);
        } catch (error) {
            setMessages(prev => [
                ...prev,
                {
                    role: 'error',
                    text: error.response?.data?.message || 'The assistant could not respond.',
                    retry: trimmed,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const isEmpty = messages.length === 0;

    return (
        <DashboardLayout>
            <div className='max-w-3xl mx-auto flex flex-col h-[calc(100dvh-9rem)]'>
                <Link
                    to='/ai'
                    className='text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 mb-4 cursor-pointer'
                >
                    <ArrowLeft className='w-4 h-4' /> Back to AI Assistant
                </Link>

                <div className='flex justify-between items-start mb-4'>
                    <div>
                        <h1 className='text-2xl font-bold text-teal-900'>Chat with AI</h1>
                        <p className='text-sm text-gray-500 mt-1'>Ask about symptoms, medications or test results</p>
                    </div>

                    <div className='flex items-center gap-4 shrink-0'>
                        {!isEmpty && (
                            <button
                                onClick={() => setMessages([])}
                                className='text-sm text-gray-400 hover:text-teal-600 flex items-center gap-1.5 transition-colors cursor-pointer'
                            >
                                <RotateCcw className='w-4 h-4' /> New chat
                            </button>
                        )}

                        <Link
                            to='/ai/history'
                            className='text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1.5 cursor-pointer'
                        >
                            <History className='w-4 h-4' /> History
                        </Link>
                    </div>
                </div>

                <div className='flex-1 overflow-y-auto space-y-5 pb-2'>
                    {historyLoading ? (
                        <p className='text-gray-400 text-center py-12'>Loading conversation...</p>
                    ) : isEmpty ? (
                        <div className='py-10'>
                            <div className='text-center mb-6'>
                                <div className='w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mx-auto mb-3'>
                                    <Sparkles className='w-6 h-6 text-teal-600' />
                                </div>
                                <p className='text-gray-900 font-medium'>What would you like to ask?</p>
                                <p className='text-sm text-gray-400 mt-1'>
                                    Describe how you feel in your own words
                                </p>
                            </div>

                            <div className='grid gap-2 max-w-md mx-auto'>
                                {STARTERS.map(starter => (
                                    <button
                                        key={starter}
                                        onClick={() => sendMessage(starter)}
                                        className='text-left text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-4 py-2.5 hover:border-teal-300 hover:text-teal-900 transition-colors cursor-pointer'
                                    >
                                        {starter}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, i) => <ChatMessage key={i} message={msg} onRetry={sendMessage} />)
                    )}

                    {loading && (
                        <div className='flex items-center gap-2.5'>
                            <div className='w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center shrink-0'>
                                <Sparkles className='w-4 h-4 text-teal-600' />
                            </div>
                            <div className='flex gap-1' role='status' aria-label='Assistant is replying'>
                                <span className='w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0ms]' />
                                <span className='w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:150ms]' />
                                <span className='w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:300ms]' />
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                <div className='pt-3'>
                    <form
                        onSubmit={handleSubmit}
                        className='flex items-end gap-2 bg-white border border-gray-200 rounded-xl p-2 focus-within:border-teal-300 transition-colors'
                    >
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                growTextarea();
                            }}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            placeholder='Describe your symptoms or ask a question'
                            className='flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none max-h-40'
                        />

                        <button
                            type='submit'
                            disabled={!input.trim() || loading}
                            aria-label='Send message'
                            className='w-8 h-8 bg-teal-600 text-white rounded-lg flex items-center justify-center hover:bg-teal-700 disabled:opacity-40 disabled:hover:bg-teal-600 transition-colors cursor-pointer shrink-0'
                        >
                            <ArrowUp className='w-4 h-4' />
                        </button>
                    </form>

                    <AIDisclaimer className='mt-2' />
                </div>
            </div>
        </DashboardLayout>
    );
};

const ChatMessage = ({ message, onRetry }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error(error);
            error.response?.data?.message || 'Something went wrong';
        }
    };

    if (message.role === 'user') {
        return (
            <div className='flex justify-end'>
                <div className='max-w-[80%] bg-teal-600 text-white text-sm px-4 py-2.5 rounded-2xl rounded-br-md leading-relaxed whitespace-pre-wrap'>
                    {message.text}
                </div>
            </div>
        );
    }

    if (message.role === 'error') {
        return (
            <div className='flex items-start gap-2.5'>
                <div className='w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center shrink-0'>
                    <Sparkles className='w-4 h-4 text-red-500' />
                </div>
                <div className='bg-red-50 border border-red-100 rounded-xl px-4 py-3'>
                    <p className='text-sm text-red-600'>{message.text}</p>
                    <button
                        onClick={() => onRetry(message.retry)}
                        className='text-xs text-red-600 font-medium hover:underline mt-1.5 cursor-pointer'
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='flex items-start gap-2.5 group'>
            <div className='w-7 h-7 bg-teal-50 rounded-lg flex items-center justify-center shrink-0'>
                <Sparkles className='w-4 h-4 text-teal-600' />
            </div>

            <div className='min-w-0 flex-1'>
                <MarkdownText>{message.text}</MarkdownText>

                <button
                    onClick={handleCopy}
                    className='text-xs text-gray-400 hover:text-teal-600 flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer'
                >
                    {copied ? (
                        <>
                            <Check className='w-3.5 h-3.5' /> Copied
                        </>
                    ) : (
                        <>
                            <Copy className='w-3.5 h-3.5' /> Copy
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AIChat;