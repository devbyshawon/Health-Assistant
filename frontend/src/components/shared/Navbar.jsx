import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell } from 'lucide-react';

const Navbar = () => {
    const { user, logout, isAdmin, isDoctor, isPatient } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isDoctorDirectory = location.pathname === '/doctors';

    const homePath = isAdmin ? '/admin' : isDoctor ? '/doctor/dashboard' : isPatient ? '/dashboard' : '/';

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
                    {isDoctorDirectory && (
                        <button
                            onClick={() => navigate(homePath)}
                            className='text-sm font-medium text-teal-900 hover:text-teal-600'
                        >
                            Home
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/notifications')}
                        className='relative p-2 text-gray-500 hover:text-teal-600 transition-colors'
                    >
                        <Bell className='w-5 h-5' />
                    </button>
                    <span className='text-sm text-teal-900 font-medium'>
                        {user.name}
                    </span>
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
                    {isDoctorDirectory ? (
                        <Link to="/" className='text-sm font-semibold text-teal-900 hover:text-teal-600'>Home</Link>
                    ) : (
                        <Link to="/#features" className='text-sm font-semibold text-teal-900 hover:text-teal-600'>Features</Link>
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
                    <span className='text-sm text-teal-900'>{user.name}</span>
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