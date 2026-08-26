import { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';


const AIChatContext = createContext(null);

const useAIChat = () => {
    const context = useContext(AIChatContext);
    if (!context) {
        throw new Error('useAIChat must be used inside AIChatProvider');
    }
    return context;
};

const AIChatProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const [historyLoaded, setHistoryLoaded] = useState(false);

    const loadHistory = useCallback(async () => {
        if (historyLoaded) return;
        setHistoryLoaded(true);

        try {
            const response = await api.get('/auth/ai/history');
            const chatTurns = response.data.data
                .filter(log => log.type === 'chat')
                .slice(0, 10)
                .reverse();

            if (chatTurns.length > 0) {
                setMessages(
                    chatTurns.flatMap(log => [
                        { role: 'user', text: log.input },
                        { role: 'ai', text: log.output },
                    ])
                );
            }
        } catch {
            // A failed history load shouldn't block a new conversation.
        }
    }, [historyLoaded]);

    const openChat = useCallback(() => {
        setIsOpen(true);
        setHasUnread(false);
        loadHistory();
    }, [loadHistory]);

    const closeChat = useCallback(() => setIsOpen(false), []);

    const toggleChat = useCallback(() => {
        if (isOpen) {
            closeChat();
        } else {
            openChat();
        }
    }, [isOpen, openChat, closeChat]);

    const resetChat = useCallback(() => setMessages([]), []);

    const sendMessage = useCallback(async (text) => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;

        setMessages(prev => [
            ...prev.filter(m => m.role !== 'error'),
            { role: 'user', text: trimmed },
        ]);
        setLoading(true);

        try {
            const response = await api.post('/auth/ai/chat', { message: trimmed });
            setMessages(prev => [...prev, { role: 'ai', text: response.data.data }]);

            setIsOpen(open => {
                if (!open) setHasUnread(true);
                return open;
            });
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
    }, [loading]);

    return (
        <AIChatContext.Provider
            value={{
                isOpen,
                messages,
                loading,
                hasUnread,
                openChat,
                closeChat,
                toggleChat,
                resetChat,
                sendMessage,
            }}
        >
            {children}
        </AIChatContext.Provider>
    );
};


// eslint-disable-next-line react-refresh/only-export-components
export { useAIChat, AIChatProvider}