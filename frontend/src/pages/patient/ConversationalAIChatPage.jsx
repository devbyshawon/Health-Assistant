import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';


const AIChat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!input.trim()) {
            return;
        }

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await api.post('/auth/ai/chat', { message: userMessage.text });
            setMessages(prev => [...prev, { role: 'ai', text: response.data.data }]);
        } catch (error) {
            setFormError(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className='max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]'>
                <Link to="/ai-chat" className='text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 mb-4'>
                    <ArrowLeft className='w-4 h-4' /> Back to AI Assistant
                </Link>

                <div className='mb-4'>
                    <h1 className='text-2xl font-bold text-gray-900'>AI Assistant</h1>
                    <p className='text-sm text-gray-500 mt-1'>Chat about your health concerns</p>
                </div>

                <p className='text-xs text-gray-400 text-center mb-2'>
                    AI-generated responses. Not a substitute for professional medical advice.
                </p>


                <div className='flex-1 overflow-y-auto bg-white rounded-xl border border-gray-100 p-4 mb-4 space-y-3'>
                    {messages.length === 0 ? (
                        <p className='text-gray-400 text-center py-12'>Start a conversation about how you're feeling</p>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                                msg.role === 'user' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-800'
                                }`}>
                                {msg.text}
                                </div>
                            </div>
                        ))
                    )}
                    {loading && (
                        <div className='flex justify-start'>
                            <div className='bg-gray-100 text-gray-500 px-4 py-2 rounded-2xl text-sm'>Thinking...</div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {formError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-3'>{formError}</p>
                )}

                <form onSubmit={handleSend} className='flex gap-2'>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder='Type your message...'
                        className='flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                    />
                    <button
                        type='submit'
                        disabled={loading}
                        className='bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50'
                    >
                        Send
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default AIChat;