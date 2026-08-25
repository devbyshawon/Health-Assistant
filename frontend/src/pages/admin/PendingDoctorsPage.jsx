import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import Modal from '../../components/shared/Modal';
import { ShieldCheck, FileText } from 'lucide-react';

const PendingDoctors = () => {
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [feedback, setFeedback] = useState('');
    const [reviewingDoctor, setReviewingDoctor] = useState(null);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState('');

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const response = await api.get('/admin/doctors/pending');
                setPendingDoctors(response.data.doctors);
            } catch (error) {
                setPageError(error.response?.data?.message || 'Failed to load pending doctors');
            } finally {
                setLoading(false);
            }
        };
        fetchPending();
    }, []);

    const filteredDoctors = pendingDoctors.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleReview = async (doctorId, decision) => {
        setReviewLoading(true);
        setReviewError('');
        try {
            await api.patch(`/admin/doctors/${doctorId}/verify`, {
                action: decision,
                ...(decision === 'reject' ? { feedback } : {})
            });
            setPendingDoctors(prev => prev.filter(d => d._id !== doctorId));
            setReviewingDoctor(null);
            setFeedback('');
        } catch (error) {
            const message = error.response?.data?.message === 'Doctor profile not found'
                ? 'This doctor has not uploaded verification documents yet and cannot be approved.'
                : error.response?.data?.message || 'Action failed';
            setReviewError(message);
        } finally {
            setReviewLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className='max-w-6xl mx-auto'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-teal-900'>Pending Doctors</h1>
                    <p className='text-sm text-gray-500 mt-1'>Review and verify doctor applications</p>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}

                <div className='mb-4'>
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder='Search by name or email'
                        className='w-full md:w-80 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                    />
                </div>

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading applications...</p>
                ) : filteredDoctors.length === 0 ? (
                    <div className='text-center py-16'>
                        <ShieldCheck className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                        <p className='text-gray-900 font-medium'>No pending applications</p>
                        <p className='text-sm text-gray-400 mt-1'>New doctor sign-ups will appear here for review</p>
                    </div>
                ) : (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                        <table className='w-full text-sm'>
                            <thead className='bg-gray-50 border-b border-gray-100'>
                                <tr>
                                    <th className='text-left px-4 py-3 font-bold text-gray-500'>Name</th>
                                    <th className='text-left px-4 py-3 font-bold text-gray-500'>Specialty</th>
                                    <th className='text-left px-4 py-3 font-bold text-gray-500'>Applied</th>
                                    <th className='text-right px-4 py-3 font-bold text-gray-500'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100'>
                                {filteredDoctors.map(doc => (
                                    <tr key={doc._id} className='hover:bg-gray-50'>
                                        <td className='px-4 py-3 text-gray-900'>{doc.name}</td>
                                        <td className='px-4 py-3 text-gray-500'>{doc.doctorProfile?.specialty || 'Not set'}</td>
                                        <td className='px-4 py-3 text-gray-500'>{new Date(doc.createdAt).toLocaleDateString()}</td>
                                        <td className='px-4 py-3 text-right'>
                                            <button
                                                onClick={() => setReviewingDoctor(doc)}
                                                className='text-teal-600 hover:text-teal-700 text-sm font-medium cursor-pointer'
                                            >
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <Modal
                    isOpen={!!reviewingDoctor}
                    onClose={() => {
                        setReviewingDoctor(null);
                        setReviewError('');
                        setFeedback('');
                    }}
                    title='Review Application'
                    titleClassName='text-teal-900'
                >
                    {reviewingDoctor && (
                        <div>
                            <h3 className='text-sm font-medium text-teal-900'>{reviewingDoctor.name}</h3>
                            <p className='text-sm text-gray-500 mb-2'>{reviewingDoctor.email}</p>
                            <p className='text-sm text-gray-700 mb-4'>{reviewingDoctor.doctorProfile?.bio || 'No bio provided'}</p>

                            {reviewingDoctor.doctorProfile?.documents?.length > 0 ? (
                                <div className='mb-4'>
                                    <label className='block text-sm font-medium text-teal-900 mb-2'>Submitted Documents</label>
                                    <div className='space-y-2'>
                                        {reviewingDoctor.doctorProfile.documents.map((doc, i) => (
                                            <a
                                                key={i}
                                                href={`http://localhost:5001/uploads/docs/${doc.filename}`}
                                                target='_blank'
                                                rel='noreferrer'
                                                className='flex items-center gap-2 text-sm text-teal-600 hover:underline'
                                            >
                                                <FileText className='w-4 h-4' />
                                                {doc.filetype?.includes('pdf') ? 'PDF Document' : 'Image Document'} {i + 1}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className='text-xs text-gray-400 mb-4'>No documents uploaded yet</p>
                            )}

                            {reviewError && (
                                <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{reviewError}</p>
                            )}

                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Feedback (required if rejecting)</label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    rows={3}
                                    placeholder='Explain why this application is being rejected...'
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                />
                            </div>

                            <div className='flex gap-3'>
                                <button
                                    onClick={() => {
                                        if (!feedback.trim()) {
                                            setReviewError('Please provide feedback before rejecting');
                                            return;
                                        }
                                        handleReview(reviewingDoctor._id, 'reject');
                                    }}
                                    disabled={reviewLoading}
                                    className='flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50'
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleReview(reviewingDoctor._id, 'approve')}
                                    disabled={reviewLoading}
                                    className='flex-1 bg-teal-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50'
                                >
                                    {reviewLoading ? 'Processing...' : 'Approve'}
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </DashboardLayout>
    );
};

export default PendingDoctors;