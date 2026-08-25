import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import authIllustration from '../../assets/auth-illustration.svg';
import { CheckCircle } from "lucide-react";


const LoginPage = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login, token, user } = useAuth();

    const [formData, setFormData] = useState({ emailOrUsername: '', password: '' });

    const [twoFAOtp, setTwoFAOtp] = useState('');

    const redirectAfterLogin = (user, redirectHint) => {
        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'doctor') {
            if (redirectHint === '/doctor/upload-docs') navigate('/doctor/upload-docs');
            else navigate('/doctor/dashboard');
        }
        else navigate('/dashboard');
    };

    useEffect(() => {
        if (token && user) {
            redirectAfterLogin(user);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    useEffect(() => {
        if (token && !user) {
            localStorage.removeItem('token');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.emailOrUsername || !formData.password) {
            setError('All fields are required');
            return;
        }
        setLoading(true);
        try {
            const response = await api.post('/auth/login', formData);
            if (!response.data.requiresTwoFA) {
                login(response.data.user, response.data.token);
                redirectAfterLogin(response.data.user, response.data.redirect);
                return;
            }
            localStorage.setItem('token', response.data.token);
            setStep(2);
        } catch (error) {
            setError(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handle2FA = async (e) => {
        e.preventDefault();
        setError('');
        if (twoFAOtp.length < 6) {
            setError('Please enter the 6-digit OTP');
            return;
        }
        setLoading(true);
        try {
            const response = await api.post('/auth/verify-2fa', { otp: twoFAOtp });
            login(response.data.user, response.data.token);
            redirectAfterLogin(response.data.user);
        } catch (error) {
            setError(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen flex'>
                {/* LEFT SIDE — teal panel */}
                <div className='hidden lg:flex lg:w-1/2 bg-teal-600 flex-col items-center justify-center p-12'>
                    <img src={authIllustration} alt='Health Assistant illustration' className='w-80 mb-8' />
                    <h2 className='text-3xl font-bold text-white text-center mb-4'>
                        Your Health, Smarter
                    </h2>

                    <p className='text-teal-100 text-center text-sm leading-relaxed max-w-sm'>
                        AI-powered health assistant with verified doctors, 
                        smart reminders and instant symptom analysis
                    </p>

                    <div className='mt-8 space-y-3'>
                        {['Verified Doctor Directory', 'AI Symptom Checker', 'Smart Medicine Reminders', 'Prescription Reader'].map(feature => (
                            <div key={feature} className='flex items-center gap-3 text-teal-100'>
                                <CheckCircle className='w-4 h-4 text-teal-300' />
                                <span className='text-sm'>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT SIDE — form */}
                <div className='w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white'>
                    <div className='w-full max-w-md'>
                        {/* Step 1 — Login form */}
                        {step === 1 && (
                            <div>
                                <h1 className='text-2xl font-bold text-teal-900 mb-1 text-center'>
                                    Welcome Back
                                </h1>
                                
                                <p className='text-sm text-gray-500 text-center mb-6'>
                                    Step 1 of 2
                                </p>

                                {error && (
                                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>
                                        {error}
                                    </p>
                                )}

                                <form onSubmit={handleLogin}>
                                    <div className='mb-4'>
                                        <label className='block text-sm font-medium text-teal-700 mb-1'>Email or Username</label>
                                        <input
                                            type='text'
                                            name='emailOrUsername'
                                            value={formData.emailOrUsername}
                                            onChange={handleChange} 
                                            placeholder='Email or username'
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                        />
                                    </div>

                                    <div className='mb-6'>
                                        <label className='block text-sm font-medium text-teal-700 mb-1'>Password</label>
                                        <input
                                            type='password'
                                            name='password'
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder='Your password'
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                        />
                                    </div>

                                    <button
                                        type='submit'
                                        disabled={loading}
                                        className='w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors'
                                    >
                                        {loading ? 'Logging in...' : 'Login'}
                                    </button>
                                </form>

                                <p className='mt-4 text-sm text-center text-black-500'>
                                    Don't have an account?{' '}
                                    <span
                                        onClick={() => navigate('/register')}
                                        className='text-teal-600 cursor-pointer hover:underline'
                                    >
                                        Register
                                    </span>
                                </p>
                            </div>
                        )}

                        {/* Step 2 - 2FA */}
                        {step === 2 && (
                            <div>
                                <h1 className='text-2xl font-bold text-teal-900 mb-1 text-center'>
                                    Two-Factor Authentication
                                </h1>
                                
                                <p className='text-sm text-gray-500 text-center mb-6'>
                                    Enter the OTP sent to your email
                                </p>

                                {error && (
                                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>
                                        {error}
                                    </p>
                                )}

                                <form onSubmit={handle2FA}>
                                    <div className='mb-4'>
                                        <label className='block text-sm font-medium text-teal-700 mb-1'>OTP</label>
                                        <input
                                            type='text'
                                            name='otp'
                                            value={twoFAOtp}
                                            onChange={(e) => setTwoFAOtp(e.target.value)}
                                            maxLength={6}
                                            placeholder='Enter 6-digit OTP'
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                        />
                                    </div>     

                                    <button
                                        type='submit'
                                        disabled={loading}
                                        className='w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors'
                                    >
                                        {loading ? 'Verifying OTP...' : 'Verify OTP'}
                                    </button>

                                    <button
                                        type='button'
                                        onClick={() => { setStep(1); setError(''); setTwoFAOtp(''); }}
                                        className='w-full mt-3 text-sm text-teal-500 hover:text-teal-700'
                                    >
                                        ← Back
                                    </button>
                                </form>                   
                            </div>
                        )}
                    </div>
                </div>
        </div>
    );
};

export default LoginPage;