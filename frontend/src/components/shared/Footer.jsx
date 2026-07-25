import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className='bg-teal-600 text-gray-400 py-6'>
            <div className='max-w-7xl mx-auto px-6'>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-6 items-start'>
                    <div className='md:col-span-1'>
                        <h3 className='text-white font-bold text-lg mb-3'>Health Assistant</h3>
                        <p className='text-white leading-relaxed mb-6 max-w-xs'>
                            AI-powered healthcare platform connecting patients 
                            with verified doctors.
                        </p>
                    </div>
                    <div>
                        <h3 className='text-white font-bold text-lg mb-3'>For Patients</h3>
                        <ul className='space-y-2 text-white'>
                            <li><Link to="/register" className='hover:text-teal-900 transition-colors'>Register</Link></li>
                            <li><Link to="/doctors" className='hover:text-teal-900 transition-colors'>Find Doctors</Link></li>
                            <li><Link to="/login" className='hover:text-teal-900 transition-colors'>Login</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className='text-white font-bold text-lg mb-3'>For Doctors</h3>
                        <ul className='space-y-2 text-white'>
                            <li><Link to="/register" className='hover:text-teal-900 transition-colors'>Join as Doctor</Link></li>
                            <li><Link to="/login" className='hover:text-teal-900 transition-colors'>Doctor Login</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className='text-white font-bold text-lg mb-3'>Platform</h3>
                        <ul className='space-y-2 text-white'>
                            <li><span className='hover:text-teal-900 transition-colors cursor-pointer'>About</span></li>
                            <li><span className='hover:text-teal-900 transition-colors cursor-pointer'>Privacy & Policy</span></li>
                            <li><span className='hover:text-teal-900 transition-colors cursor-pointer'>Terms of Service</span></li>
                        </ul>
                    </div>                    
                </div>
                <div className='border-t border-teal-700 pt-10 text-center text-white'>
                    © 2026 Health Assistant. Built by MD. Shawon Hossain.
                </div>
            </div>
        </footer>
    );
};

export default Footer;