import { useState, useEffect } from 'react';
import { Link, useLocation} from 'react-router-dom';
import { Stethoscope, Brain, Pill, FileText, MapPin, CheckCircle, 
    ArrowRight, Users, Calendar, Shield } from 'lucide-react';
import api from '../services/api';
import Footer from '../components/shared/Footer';

const LandingPage = () => {
    const location = useLocation();
    const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0, specialtyCount: 0 });
    
    useEffect(() => {
        api.get('/public/stats').then(res => setStats(res.data)).catch(error => console.error('Failed to load stats', error));
    }, []);

    useEffect(() => {
        if (location.hash) {
            const el = document.getElementById(location.hash.replace('#', ''));
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location.hash]);
    
    return (
        <div>
            {/* HERO */}
            <section className='bg-linear-to-br from-teal-600 to-teal-800 text-white'>
                <div className='max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-12'>
                    
                    {/* Left — text */}
                    <div className='flex-1 text-center lg:text-left'>
                        <h1 className='text-4xl lg:text-5xl font-bold leading-tight mb-6'>
                            Your Health,<br />
                            <span className='text-teal-200'>Smarter</span>
                        </h1>
                        <p className='text-teal-100 text-lg leading-relaxed mb-8 max-w-lg'>
                            Connect with verified doctors, get AI-powered symptom analysis, 
                            manage your health records and never miss a medication — all in one place.
                        </p>
                        <div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start'>
                            <Link
                                to="/register"
                                className='bg-white text-teal-700 px-6 py-3 rounded-lg font-semibold hover:bg-teal-100 transition-colors flex items-center justify-center gap-2'
                            >
                                Get Started Free <ArrowRight className='w-4 h-4' />
                            </Link>

                            <Link
                                to="/doctors"
                                className='border bg-teal text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-600 transition-colors text-center'
                            >
                                Find a Doctor
                            </Link>
                            
                        </div>
                    </div>

                    {/* Right — illustration */}
                    <div className='flex-1 flex justify-center'>
                        <img
                            src='/src/assets/auth-illustration.svg'
                            alt='Health Assistant'
                            className='w-full max-w-md'
                        />
                    </div>
                </div>
            </section>

            {/* STATS */}
            <section className='bg-white border-b border-gray-100'>
                <div className='max-w-7xl mx-auto px-6 py-10'>
                    <div className='grid grid-cols-2 lg:grid-cols-3 gap-8 text-center'>
                        {[
                            { value: stats.doctors, label: 'Verified Doctors' },
                            { value: stats.patients, label: 'Registered Patients' },
                            { value: stats.appointments, label: 'Appointments Booked' },
                        ].map(stat => (
                            <div key={stat.label}>
                                <p className='text-3xl font-bold text-teal-600'>{stat.value}</p>
                                <p className='text-sm text-gray-500 mt-1'>{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section id='features' className='bg-gray-50 py-20'>
                <div className='max-w-7xl mx-auto px-6'>
                    <div className='text-center mb-12'>
                        <h2 className='text-3xl font-bold text-teal-900 mb-4'>
                            Everything You Need for Better Health
                        </h2>
                        <p className='text-gray-500 max-w-xl mx-auto'>
                            From finding doctors to AI-powered symptom checking — 
                            Health Assistant covers every aspect of your healthcare journey.
                        </p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {[
                            {
                                icon: Brain,
                                color: 'bg-purple-50 text-purple-600',
                                title: 'AI Symptom Checker',
                                desc: 'Describe your symptoms and get instant AI-powered analysis with urgency assessment and next steps.'
                            },
                            {
                                icon: Stethoscope,
                                color: 'bg-teal-50 text-teal-600',
                                title: 'Verified Doctors',
                                desc: 'Browse a directory of admin-verified doctors filtered by specialty, location, and availability.'
                            },
                            {
                                icon: Calendar,
                                color: 'bg-blue-50 text-blue-600',
                                title: 'Appointment Booking',
                                desc: 'Book, reschedule, and track appointments with your doctors — all in one place.'
                            },
                            {
                                icon: Pill,
                                color: 'bg-green-50 text-green-600',
                                title: 'Medicine Reminders',
                                desc: 'Set smart reminders for your medications with daily and weekly repeat options.'
                            },
                            {
                                icon: FileText,
                                color: 'bg-yellow-50 text-yellow-600',
                                title: 'Prescription Reader',
                                desc: 'Upload handwritten prescriptions and get a clear digital version using OCR technology.'
                            },
                            {
                                icon: MapPin,
                                color: 'bg-red-50 text-red-600',
                                title: 'Nearby Doctors',
                                desc: 'Find verified doctors near your location using GPS-based geo search within your preferred radius.'
                            },
                        ].map(({ icon: Icon, color, title, desc }) => (
                            <div key={title} className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow'>
                                <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4`}>
                                    <Icon className='w-6 h-6' />
                                </div>
                                <h3 className='font-semibold text-teal-900 mb-2'>{title}</h3>
                                <p className='text-sm text-gray-500 leading-relaxed'>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className='bg-white py-20'>
                <div className='max-w-7xl mx-auto px-6'>
                    <div className='text-center mb-12'>
                        <h2 className='text-3xl font-bold text-teal-900 mb-4'>
                            How It Works
                        </h2>
                        <p className='text-gray-500'>Get started in three simple steps</p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                        {[
                            {
                                step: '01',
                                title: 'Create Your Account',
                                desc: 'Sign up as a patient or doctor. Verify your email with OTP and complete your profile.',
                                icon: Users
                            },
                            {
                                step: '02',
                                title: 'Find Your Doctor',
                                desc: 'Browse verified doctors by specialty or use location-based search to find doctors near you.',
                                icon: Stethoscope
                            },
                            {
                                step: '03',
                                title: 'Manage Your Health',
                                desc: 'Book appointments, track health logs, set reminders and use AI features for better health.',
                                icon: Shield
                            },
                        ].map(({ step, title, desc, icon: Icon }) => (
                            <div key={step} className='text-center'>
                                <div className='w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4'>
                                    <Icon className='w-8 h-8 text-teal-600' />
                                </div>
                                <div className='text-teal-600 font-bold text-sm mb-2'>{step}</div>
                                <h3 className='font-semibold text-teal-900 mb-2'>{title}</h3>
                                <p className='text-sm text-gray-500 leading-relaxed'>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOR DOCTORS */}
            <section className='bg-teal-600 py-20'>
                <div className='max-w-7xl mx-auto px-6'>
                    <div className='flex flex-col lg:flex-row items-center gap-12'>
                        <div className='flex-1 text-white'>
                            <span className='text-teal-200 text-sm font-medium'>For Healthcare Professionals</span>
                            <h2 className='text-3xl font-bold mt-2 mb-4'>
                                Join as a Verified Doctor
                            </h2>
                            <p className='text-teal-100 leading-relaxed mb-6'>
                                Expand your reach, manage appointments efficiently
                                and connect with patients who need your expertise.
                            </p>
                            <ul className='space-y-3'>
                                {[
                                    'Get listed in our verified doctor directory',
                                    'Manage appointments and patient records',
                                    'View patient health logs and history',
                                    'Receive appointment notifications instantly',
                                ].map(item => (
                                    <li key={item} className='flex items-center gap-3 text-teal-100 text-sm'>
                                        <CheckCircle className='w-4 h-4 text-teal-300 shrink-0' />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                to="/register"
                                className='inline-flex items-center gap-2 mt-8 bg-white text-teal-700 px-6 py-3 rounded-lg font-semibold hover:bg-teal-100 transition-colors'
                            >
                                Register as Doctor <ArrowRight className='w-4 h-4' />
                            </Link>
                        </div>
                        <div className='flex-1 grid grid-cols-2 gap-4'>
                            {[
                                { value: `${stats.specialtyCount}+`, label: 'Specialties' },
                                { value: '24/7', label: 'Platform Access' },
                                { value: 'Free', label: 'Registration' },
                                { value: 'Fast', label: 'Verification' },
                            ].map(item => (
                                <div key={item.label} className='bg-teal-700 rounded-xl p-6 text-center'>
                                    <p className='text-2xl font-bold text-white'>{item.value}</p>
                                    <p className='text-teal-200 text-sm mt-1'>{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA BANNER */}
            <section className='bg-gray-50 py-28'>
                <div className='max-w-3xl mx-auto px-6 text-center'>
                    <h2 className='text-3xl font-bold text-teal-900 mb-4'>
                        Ready to Take Control of Your Health?
                    </h2>
                    <p className='text-gray-500 mb-8 leading-relaxed'>
                        Join and experience smarter healthcare with AI-powered assistance, 
                        secure patient-doctor collaboration and easy access to your health information.
                    </p>
                    <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                        <Link
                            to="/register"
                            className='bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2'
                        >
                            Get Started Free <ArrowRight className='w-4 h-4' />
                        </Link>
                        <Link
                            to="/doctors"
                            className='border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-teal-600 transition-colors text-center'
                        >
                            Browse Doctors
                        </Link>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <Footer />
        </div>
    );
};

export default LandingPage;