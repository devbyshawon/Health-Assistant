import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authIllustration from '../../assets/auth-illustration.svg';
import { CheckCircle } from "lucide-react";

const RegisterPage = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const [formData, setFormData] = useState({ name: '', username: '', email: '', password: '' });

    const [otp, setOtp] = useState('');
    const [resendMessage, setResendMessage] = useState('');

    const [role, setRole] = useState('');

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResendMessage('');
        const { name, username, email: formEmail, password } = formData;
        if (!name || !username || !formEmail || !password){
            setError('All fields are required');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;   
        }
        setLoading(true);

        try {
            await api.post('/auth/register', formData);
            setEmail(formData.email);
            setStep(2)
        } catch (error) {
            setError(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('OTP must be 6 digits');
            return; 
        } 
        setError('');
        setStep(3);
    };

    const resendOtp = async () => {
        try {
            setLoading(true);
            await api.post('/auth/resend-otp', { email });
            setResendMessage('New OTP sent to your email');
        } catch (error) {
            setError(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setError('');
        if (!role) {
            setError('Please select a role');
            return;
        }
        setLoading(true);

        try {
            await api.post('/auth/verify-otp', { email, otp, role });
            setRole('');
            setResendMessage('Registration complete! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setError(error.response?.data?.message || 'OTP was wrong');
            setStep(2);
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
                    <div className='flex items-center justify-center gap-4 mb-8'>
                        {[
                            { num: 1, label: 'Account' },
                            { num: 2, label: 'Verify' },
                            { num: 3, label: 'Role' }
                        ].map((s, i) => (
                            <div key={s.num} className='flex items-center gap-2'>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                                    ${step >= s.num ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    {step > s.num ? <CheckCircle className='w-4 h-4' /> : s.num}
                                </div>

                                <span className={`text-xs ${step >= s.num ? 'text-teal-600 font-medium' : 'text-gray-400'}`}>
                                    {s.label}
                                </span>

                                {i < 2 && <div className={`w-8 h-px ${step > s.num ? 'bg-teal-600' : 'bg-gray-200'}`} />}
                            </div>
                        ))}
                    </div>

                    {/* Step 1 — Registration form */}
                    {step === 1 && (
                        <div>
                            <h1 className='text-2xl font-bold text-teal-900 mb-1 text-center'>
                                Create Account
                            </h1>
                            
                            <p className='text-sm text-gray-500 text-center mb-6'>
                                Step 1 of 3 - Provide required information
                            </p>

                            {error && (
                                <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>
                                    {error}
                                </p>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className='mb-4'>
                                    <label className='block text-sm font-medium text-teal-700 mb-1'>Name</label>
                                    <input
                                        type='text'
                                        name='name'
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder='Your full name'
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                    />
                                </div>

                                <div className='mb-4'>
                                    <label className='block text-sm font-medium text-teal-700 mb-1'>Username</label>
                                    <input
                                        type='text'
                                        name='username'
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder='Choose a username'
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                    />
                                </div>

                                <div className='mb-4'>
                                    <label className='block text-sm font-medium text-teal-700 mb-1'>Email</label>
                                    <input
                                        type='email'
                                        name='email'
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder='you@example.com'
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
                                        placeholder='Min 6 characters'
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                    />
                                </div>

                                <button
                                    type='submit'
                                    disabled={loading}
                                    className='w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors'
                                >
                                    {loading ? 'Sending OTP...' : 'Send OTP'}
                                </button>
                            </form>

                            <p className='mt-4 text-sm text-center text-black-500'>
                                Already have an account?{' '}
                                <span
                                    onClick={() => navigate('/login')}
                                    className='text-teal-600 cursor-pointer hover:underline'
                                >
                                    Login
                                </span>
                            </p>
                        </div>
                    )}

                    {/* Step 2 and 3 will go here */}
                    {step === 2 && (
                        <div>
                            <h1 className='text-2xl font-bold text-teal-900 mb-1 text-center'>
                                Verify Your Email
                            </h1>
                            
                            <p className='text-sm text-gray-500 text-center mb-6'>
                                Step 2 of 3 — We sent a 6-digit OTP to {email}
                            </p>

                            {error && (
                                <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>
                                    {error}
                                </p>
                            )}

                            <form onSubmit={onSubmit}>
                                <div className='mb-4'>
                                    <label className='block text-sm font-medium text-teal-700 mb-1'>OTP</label>
                                    <input
                                        type='text'
                                        name='otp'
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
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
                                    {loading ? 'Continuing...' : 'Continue'}
                                </button>

                                <button
                                    type='button'
                                    onClick={resendOtp}
                                    disabled={loading}
                                    className='w-full mt-3 text-sm text-teal-500 hover:text-teal-700 disabled:opacity-50'
                                >
                                    {loading ? 'Sending...' : 'Resend OTP'}
                                </button>

                                {resendMessage && (
                                    <p className='text-gray-500 text-sm text-center mt-2'>{resendMessage}</p>
                                )}
                            </form>                   
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h1 className='text-2xl font-bold text-teal-900 mb-1 text-center'>
                                Choose Your Role
                            </h1>
                            
                            <p className='text-sm text-gray-500 text-center mb-6'>
                                Step 3 of 3 — This cannot be changed later
                            </p>

                            {error && (
                                <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>
                                    {error}
                                </p>
                            )}

                            <form onSubmit={onSubmitHandler}>
                                <div className='grid grid-cols-2 gap-4 mb-6'>
                                    <div
                                        onClick={() => setRole('user')}
                                        className={`border-2 rounded-xl p-4 cursor-pointer text-center transition-colors ${
                                            role === 'user'
                                                ? 'border-teal-600 bg-teal-50'
                                                : 'border-gray-200 hover:border-teal-300'
                                        }`}
                                    >

                                        <div className='text-3xl mb-2'>👤</div>

                                        <h3 className='font-semibold text-teal-900 text-sm'>Patient</h3>
                                        <p className='text-xs text-gray-500 mt-1'>Book appointments and manage health</p>
                                    </div>

                                    <div
                                        onClick={() => setRole('doctor')}
                                        className={`border-2 rounded-xl p-4 cursor-pointer text-center transition-colors ${
                                            role === 'doctor'
                                                ? 'border-teal-600 bg-teal-50'
                                                : 'border-gray-200 hover:border-teal-300'
                                        }`}
                                    >

                                        <div className='text-3xl mb-2'>🏥</div>

                                        <h3 className='font-semibold text-teal-900 text-sm'>Doctor</h3>
                                        <p className='text-xs text-gray-500 mt-1'>Manage patients and appointments</p>
                                    </div>
                                </div>

                                <button
                                    type='submit'
                                    disabled={loading}
                                    className='w-full bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors'
                                >
                                    {loading ? 'Completing...' : 'Complete Registration'}
                                </button>
                            </form>

                            <button
                                type='button'
                                onClick={() => { setStep(2); setError(''); }}
                                className='w-full mt-3 text-sm text-teal-500 hover:text-teal-700 disabled:opacity-50'
                            >
                                ← Back
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;