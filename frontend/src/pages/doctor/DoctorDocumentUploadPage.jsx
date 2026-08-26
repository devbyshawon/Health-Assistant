import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, UploadCloud } from 'lucide-react';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';

const SPECIALTIES = [
    'Cardiologist', 'Dermatologist', 'Pediatrician', 'Neurologist',
    'Orthopedic Surgeon', 'General Physician', 'Gynecologist', 'Psychiatrist',
    'ENT Specialist', 'Ophthalmologist', 'Dentist', 'Gastroenterologist',
];

const UploadDocs = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    const [specialty, setSpecialty] = useState('');
    const [idCard, setIdCard] = useState(null);
    const [certificate, setCertificate] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [formError, setFormError] = useState('');
    const [success, setSuccess] = useState(false);

    const idCardRef = useRef(null);
    const certificateRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/doctor/me');
                const doc = response.data.doctor;
                setProfile(doc);
                setSpecialty(doc.specialty || '');
            } catch (error) {
                if (error.response?.status !== 404) {
                    setPageError(error.response?.data?.message || 'Failed to load profile');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        setFormError('');
        setSuccess(false);
        if (!specialty) {
            setFormError('Please select your specialty');
            return;
        }
        if (!idCard && !certificate) {
            setFormError('Please select at least one document');
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('specialty', specialty);
            if (idCard) {
                formData.append('idCard', idCard);
            }
            if (certificate) {
                formData.append('certificate', certificate);
            }

            await api.post('/doctor/upload-docs', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const response = await api.get('/doctor/me');
            setProfile(response.data.doctor);
            setSpecialty(response.data.doctor.specialty || '');
            setIdCard(null);
            setCertificate(null);
            setSuccess(true);
        } catch (error) {
            setFormError(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const status = profile?.credentials?.status;
    const isVerified = status === 'Verified';

    return (
        <DashboardLayout>
            <div className='max-w-6xl mx-auto'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-teal-900'>Verification Documents</h1>
                    <p className='text-sm text-gray-500 mt-1'>Submit your specialty and credentials to get verified</p>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading...</p>
                ) : isVerified ? (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center'>
                        <div className='w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <ShieldCheck className='w-7 h-7 text-teal-600' />
                        </div>
                        <h2 className='text-lg font-semibold text-teal-900'>You&apos;re verified</h2>
                        <p className='text-sm text-gray-500 mt-1 mb-5 max-w-md mx-auto'>
                            Your credentials have been approved. You can manage your specialty and availability from your profile.
                        </p>
                        <Link to='/doctor/profile'
                            className='inline-block bg-teal-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-teal-700'>
                            Go to My Profile
                        </Link>
                    </div>
                ) : (
                    <>
                        {status && (
                            <div className={`px-4 py-3 rounded-lg mb-6 text-sm font-medium ${
                                status === 'Rejected' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}
                            >
                                Verification status: {status}
                                {status === 'Rejected' && profile?.credentials?.feedback && (
                                    <p className='mt-1 font-normal'>Reason: {profile.credentials.feedback}</p>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleUpload} className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Specialty</label>
                                <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'>
                                    <option value=''>Select your specialty</option>
                                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <p className='text-xs text-gray-400 mt-1'>Shown on your public profile once you&apos;re verified.</p>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium text-teal-900 mb-1'>ID Card</label>
                                    <button type='button' onClick={() => idCardRef.current.click()}
                                        className='border border-gray-300 text-teal-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 cursor-pointer'>
                                        Choose File
                                    </button>
                                    <span className='ml-3 text-sm text-gray-500'>{idCard ? idCard.name : 'No file chosen'}</span>
                                    <input ref={idCardRef} type='file' accept='.pdf,.jpg,.jpeg,.png'
                                        onChange={(e) => setIdCard(e.target.files[0])} className='hidden' />
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-teal-900 mb-1'>Certificate</label>
                                    <button type='button' onClick={() => certificateRef.current.click()}
                                        className='border border-gray-300 text-teal-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 cursor-pointer'>
                                        Choose File
                                    </button>
                                    <span className='ml-3 text-sm text-gray-500'>{certificate ? certificate.name : 'No file chosen'}</span>
                                    <input ref={certificateRef} type='file' accept='.pdf,.jpg,.jpeg,.png'
                                        onChange={(e) => setCertificate(e.target.files[0])} className='hidden' />
                                </div>
                            </div>

                            <p className='text-xs text-gray-400'>Accepted formats: PDF, JPG, PNG.</p>

                            {success && (
                                <p className='text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg'>Documents submitted. Your request is now under review.</p>
                            )}
                            {formError && (
                                <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg'>{formError}</p>
                            )}

                            <button type='submit' disabled={uploading}
                                className='w-full bg-teal-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2'>
                                <UploadCloud className='w-4 h-4' />
                                {uploading ? 'Uploading...' : 'Submit for Verification'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default UploadDocs;