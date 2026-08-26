import Sidebar from './Sidebar';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AIChatWidget from '../AIChatWidget';

const DashboardLayout = ({ children, showFooter = false, hideSidebar = false }) => {
    const location = useLocation();
    const { user } = useAuth();

    const CHAT_HIDDEN_ON = ['/settings', '/notifications'];
    
    const showChatWidget =
        user?.role === 'user' &&
        !CHAT_HIDDEN_ON.some(path => location.pathname.startsWith(path));
    return (
        <div className='min-h-screen flex flex-col bg-gray-50'>
            <div className='flex flex-1'>
                {!hideSidebar && <Sidebar />}
                <main className='flex-1 p-6'>
                    {children}
                </main>
            </div>
            {showFooter && <Footer />}
            {showChatWidget && <AIChatWidget />}
        </div>
    );
};

export default DashboardLayout;