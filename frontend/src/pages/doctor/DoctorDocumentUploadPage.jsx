import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const UploadDocs = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    const [idCard, setIdCard] = useState(null);
    const [certificate, setCertificate] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [formError, setFormError] = useState('');

    const idCardRef = useRef(null);
    const certificateRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/doctor/me');
                setProfile(response.data.doctor);
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
        if (!idCard && !certificate) {
            setFormError('Please select at least one document');
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
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
            setIdCard(null);
            setCertificate(null);
        } catch (error) {
            setFormError(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className='max-w-3xl mx-auto'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-gray-900'>Verification Documents</h1>
                    <p className='text-sm text-gray-500 mt-1'>Upload your ID and certificate for verification</p>
                </div>

                <Link
                    to='/doctor/profile' 
                    className='flex items-center justify-between bg-blue-50 border border-blue-200 text-teal-900 px-3 py-3 rounded-lg mb-6 hover:bg-blue-100 transition-colors cursor-pointer'
                >
                    <div className='flex items-center gap-3'>
                        <AlertTriangle className='w-5 h-5 shrink-0' />
                        <p className='text-sm font-medium'>
                            Don't forget to complete your profile with your specialty, bio, and fees
                        </p>
                    </div>
                    <span className='text-sm font-medium'>Go to My Profile →</span>
                </Link>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading...</p>
                ) : (
                    <>
                        {profile?.credentials?.status && (
                            <div className={`px-4 py-3 rounded-lg mb-6 text-sm font-medium ${
                                profile.credentials.status === 'Verified' ? 'bg-green-50 text-green-700' :
                                profile.credentials.status === 'Rejected' ? 'bg-red-50 text-red-700' :
                                'bg-yellow-50 text-yellow-700'}`}
                            >
                                Verification status: {profile.credentials.status}
                                {profile.credentials.status === 'Rejected' && profile.credentials.feedback && (
                                    <p className='mt-1 font-normal'>Reason: {profile.credentials.feedback}</p>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleUpload} className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>ID Card</label>
                                <div>
                                    <button type='button' onClick={() => idCardRef.current.click()}
                                        className='border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50'>
                                        Choose File
                                    </button>
                                    <span className='ml-3 text-sm text-gray-500'>{idCard ? idCard.name : 'No file chosen'}</span>
                                    <input ref={idCardRef} type='file' accept='.pdf,.jpg,.jpeg,.png'
                                        onChange={(e) => setIdCard(e.target.files[0])} className='hidden' />
                                </div>
                            </div>

                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Certificate</label>
                                <div>
                                <button type='button' onClick={() => certificateRef.current.click()}
                                    className='border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50'>
                                    Choose File
                                </button>
                                <span className='ml-3 text-sm text-gray-500'>{certificate ? certificate.name : 'No file chosen'}</span>
                                <input ref={certificateRef} type='file' accept='.pdf,.jpg,.jpeg,.png'
                                    onChange={(e) => setCertificate(e.target.files[0])} className='hidden' />
                                </div>
                            </div>

                            {formError && (
                                <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{formError}</p>
                            )}

                            <button type='submit' disabled={uploading}
                                className='w-full bg-teal-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50'>
                                {uploading ? 'Uploading...' : 'Upload Documents'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default UploadDocs;