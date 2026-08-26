import { useState, useRef, useEffect } from 'react';
import { useAIChat } from '../context/AIChatContext';
import MarkdownText from '../components/shared/MarkdownText';
import { MessageCircle, X, Send, Sparkles, RotateCcw } from 'lucide-react';

const STARTERS = [
    'What should I ask my doctor about my blood pressure?',
    'Is it normal to feel dizzy after skipping meals?',
    'How do I prepare for a fasting blood test?',
];

const AIChatWidget = () => {
    const {
        isOpen,
        messages,
        loading,
        hasUnread,
        openChat,
        closeChat,
        resetChat,
        sendMessage,
    } = useAIChat();

    const [input, setInput] = useState('');
    const textareaRef = useRef(null);
    const scrollRef = useRef(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') closeChat();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeChat]);

    useEffect(() => {
        if (!isOpen) return;
        if (!window.matchMedia('(max-width: 639px)').matches) return;

        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) textareaRef.current?.focus();
    }, [isOpen]);

    const handleInputChange = (e) => {
        setInput(e.target.value);

        const el = e.target;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    };

    const handleSend = (text) => {
        const value = (text ?? input).trim();
        if (!value || loading) return;

        sendMessage(value);
        setInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            <button
                onClick={openChat}
                aria-label='Open AI assistant'
                className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-teal-600 text-white shadow-lg shadow-teal-600/30 flex items-center justify-center hover:bg-teal-700 transition-colors cursor-pointer ${
                    isOpen ? 'hidden' : 'flex'
                }`}
            >
                <MessageCircle className='w-6 h-6' />

                {hasUnread && (
                    <span className='absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white' />
                )}
            </button>

            {isOpen && (
                <div
                    role='dialog'
                    aria-modal='false'
                    aria-label='AI assistant'
                    className='fixed inset-0 z-40 bg-white flex flex-col sm:inset-auto sm:bottom-6 sm:right-6 sm:w-100 sm:h-150 sm:max-h-[calc(100dvh-3rem)] sm:rounded-2xl sm:shadow-2xl sm:border sm:border-gray-200 overflow-hidden'
                >
                    <div className='bg-teal-600 text-white px-4 py-3 flex items-center gap-3 shrink-0'>
                        <div className='w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0'>
                            <Sparkles className='w-5 h-5' />
                        </div>

                        <div className='min-w-0'>
                            <p className='text-sm font-semibold leading-tight'>AI Health Assistant</p>
                            <p className='text-[11px] text-teal-100 leading-tight mt-0.5'>
                                Not a diagnosis — always confirm with a doctor
                            </p>
                        </div>

                        <div className='ml-auto flex items-center gap-1 shrink-0'>
                            {messages.length > 0 && (
                                <button
                                    onClick={resetChat}
                                    aria-label='Start a new conversation'
                                    title='New conversation'
                                    className='p-2 rounded-lg hover:bg-white/15 transition-colors cursor-pointer'
                                >
                                    <RotateCcw className='w-4 h-4' />
                                </button>
                            )}

                            <button
                                onClick={closeChat}
                                aria-label='Close AI assistant'
                                className='p-2 rounded-lg hover:bg-white/15 transition-colors cursor-pointer'
                            >
                                <X className='w-5 h-5' />
                            </button>
                        </div>
                    </div>

                    <div ref={scrollRef} className='flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50'>
                        {messages.length === 0 ? (
                            <div className='py-6'>
                                <p className='text-sm text-gray-900 font-medium text-center'>
                                    How can I help today?
                                </p>
                                <p className='text-xs text-gray-400 text-center mt-1 mb-4'>
                                    Ask about symptoms, medicines, or your next visit
                                </p>

                                <div className='space-y-2'>
                                    {STARTERS.map(starter => (
                                        <button
                                            key={starter}
                                            onClick={() => handleSend(starter)}
                                            className='w-full text-left text-sm text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2.5 hover:border-teal-300 hover:bg-teal-50/40 transition-colors cursor-pointer'
                                        >
                                            {starter}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((message, index) => (
                                <ChatBubble
                                    key={index}
                                    message={message}
                                    onRetry={() => handleSend(message.retry)}
                                />
                            ))
                        )}

                        {loading && (
                            <div className='bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 w-fit'>
                                <div className='flex items-center gap-1'>
                                    <span className='w-1.5 h-1.5 rounded-full bg-gray-400 motion-safe:animate-bounce' />
                                    <span
                                        className='w-1.5 h-1.5 rounded-full bg-gray-400 motion-safe:animate-bounce'
                                        style={{ animationDelay: '0.15s' }}
                                    />
                                    <span
                                        className='w-1.5 h-1.5 rounded-full bg-gray-400 motion-safe:animate-bounce'
                                        style={{ animationDelay: '0.3s' }}
                                    />
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    {/* Composer */}
                    <div className='border-t border-gray-100 bg-white px-3 py-3 shrink-0'>
                        <div className='flex items-end gap-2'>
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                rows={1}
                                placeholder='Type your question...'
                                className='flex-1 resize-none border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 max-h-30'
                            />

                            <button
                                onClick={() => handleSend()}
                                disabled={loading || !input.trim()}
                                aria-label='Send message'
                                className='w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 hover:bg-teal-700 disabled:opacity-40 transition-colors cursor-pointer'
                            >
                                <Send className='w-4 h-4' />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const ChatBubble = ({ message, onRetry }) => {
    if (message.role === 'user') {
        return (
            <div className='flex justify-end'>
                <div className='bg-teal-600 text-white text-sm rounded-2xl rounded-br-md px-3.5 py-2.5 max-w-[85%] whitespace-pre-wrap wrap-break-word'>
                    {message.text}
                </div>
            </div>
        );
    }

    if (message.role === 'error') {
        return (
            <div className='bg-red-50 border border-red-100 rounded-2xl rounded-bl-md px-3.5 py-2.5 max-w-[92%]'>
                <p className='text-sm text-red-600'>{message.text}</p>

                <button
                    onClick={onRetry}
                    className='text-xs font-medium text-red-700 hover:text-red-800 mt-1.5 cursor-pointer'
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className='bg-white border border-gray-100 rounded-2xl rounded-bl-md px-3.5 py-2.5 max-w-[92%] wrap-break-word'>
            <MarkdownText>{message.text}</MarkdownText>
        </div>
    );
};

export default AIChatWidget;