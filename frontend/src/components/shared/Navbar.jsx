import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
    const { user, logout, isAdmin, isDoctor, isPatient } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isLandingPage = location.pathname === '/';

    const isDashboardPage = location.pathname.startsWith('/dashboard') ||
        location.pathname.startsWith('/doctor') ||
        location.pathname.startsWith('/admin') ||
        location.pathname.startsWith('/appointments') ||
        location.pathname.startsWith('/ai-chat') ||
        location.pathname.startsWith('/doctors') ||
        location.pathname.startsWith('/healthlogs') ||
        location.pathname.startsWith('/reminders') ||
        location.pathname.startsWith('/prescriptions') ||
        location.pathname.startsWith('/settings') ||
        location.pathname.startsWith('/notifications');

    if (user && isDashboardPage) {
        return (
            <nav className='bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center'>
                <div
                    onClick={() => navigate('/dashboard')}
                    className='text-lg font-bold text-teal-600 cursor-pointer flex items-center gap-2'
                >
                    Health Assistant
                </div>
                <div className='flex items-center gap-4'>
                    <NotificationDropdown />
                    
                    <div className='flex items-center gap-2'>
                        <div className='w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-sm overflow-hidden'>
                            {user.profilePic ? (
                                <img src={`http://localhost:5001${user.profilePic}`} alt={user.name} className='w-full h-full object-cover' />
                            ) : (
                                user.name?.[0] || 'U'
                            )}
                        </div>
                        <span className='text-sm text-teal-900 font-medium'>{user.name}</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className='text-sm bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition-colors'
                    >
                        Logout
                    </button>
                </div>
            </nav>
        );
    }

    return (
        <nav className='bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center'>
            <div
                onClick={() => navigate('/')}
                className='text-xl font-bold text-teal-600 cursor-pointer'
            >
                Health Assistant
            </div>

            {!user && (
                <div className='hidden md:flex items-center gap-6'>
                    {isLandingPage ? (
                        <Link to="/#features" className='text-sm font-semibold text-teal-900 hover:text-teal-600'>Features</Link>
                    ) : (
                        <Link to="/" className='text-sm font-semibold text-teal-900 hover:text-teal-600'>Home</Link>
                    )}
                    <Link to="/doctors" className='text-sm font-semibold text-teal-900 hover:text-teal-600'>Doctors</Link>
                    <Link to="/login" className='text-sm font-semibold text-teal-900 hover:text-teal-600'>Login</Link>
                    <Link
                        to="/register"
                        className='text-sm bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors'
                    >
                        Get Started
                    </Link>
                </div>
            )}

            {user && (
                <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-2'>
                        <div className='w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-sm overflow-hidden'>
                            {user.profilePic ? (
                                <img src={`http://localhost:5001${user.profilePic}`} alt={user.name} className='w-full h-full object-cover' />
                            ) : (
                                user.name?.[0] || 'U'
                            )}
                        </div>
                        <span className='text-sm text-teal-900 font-medium'>{user.name}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className='text-sm bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition-colors'
                    >
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;