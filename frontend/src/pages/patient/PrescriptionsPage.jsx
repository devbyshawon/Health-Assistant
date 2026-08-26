import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import Modal from '../../components/shared/Modal';
import { FileText, Trash2 } from 'lucide-react';

const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

const PrescriptionPage = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    const [file, setFile] = useState(null);
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const [formError, setFormError] = useState('');

    const [ocrText, setOcrText] = useState('');
    const [ocrLoading, setOcrLoading] = useState(false);
    const [ocrError, setOcrError] = useState('');

    const fileInputRef = useRef(null);

    const [confirmDelete, setConfirmDelete] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');


    useEffect(() => {
        const fetchPrescriptions = async () => {
            try {
                const response = await api.get('/auth/prescriptions');
                setPrescriptions(response.data.prescriptions);
            } catch (error) {
                setPageError(error.response?.data?.message || 'Failed to load prescriptions');
            } finally {
                setLoading(false);
            }
        };
        fetchPrescriptions();
    }, []);

    const clearFile = () => {
        setFile(null);
        setOcrText('');
        setOcrError('');
        setFormError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!file) {
            setFormError('Please choose a file first');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('prescription', file);
            formData.append('description', description);

            const response = await api.post('/auth/prescriptions', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPrescriptions(prev => [response.data.prescription, ...prev]);
            setDescription('');
            clearFile();
        } catch (error) {
            setFormError(error.response?.data?.message || 'Prescription upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleExtractText = async () => {
        setOcrError('');
        if (!file) {
            setOcrError('Please choose a file first');
            return;
        }
        setOcrLoading(true);
        setOcrText('');
        try {
            const formData = new FormData();
            formData.append('prescription', file);
            const response = await api.post('/auth/prescriptions/ocr', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setOcrText(response.data.text);
        } catch (error) {
            setOcrError(error.response?.data?.message || 'Failed to extract text');
        } finally {
            setOcrLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setActionLoading(true);
        setActionError('');
        try {
            await api.delete(`/auth/prescriptions/${id}`);
            setPrescriptions(prev => prev.filter(p => p._id !== id));
            setConfirmDelete(null);
        } catch (error) {
            setActionError(error.response?.data?.message || 'Failed to delete prescription');
            setConfirmDelete(null);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className='max-w-6xl mx-auto'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-teal-900'>Prescriptions</h1>
                    <p className='text-sm text-gray-500 mt-1'>Upload and manage your prescription files</p>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}

                {actionError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{actionError}</p>
                )}

                <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
                    <h3 className='font-semibold text-teal-900 mb-4'>Upload Prescription</h3>

                    <form onSubmit={handleUpload}>
                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Prescription File</label>

                            <div className='flex items-center gap-2'>
                                <button
                                    type='button'
                                    onClick={() => fileInputRef.current?.click()}
                                    className='border border-gray-300 text-teal-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer shrink-0'
                                >
                                    Choose File
                                </button>

                                <span className='text-sm text-teal-700 truncate'>
                                    {file ? file.name : 'No file chosen'}
                                </span>

                                {file && (
                                    <button
                                        type='button'
                                        onClick={clearFile}
                                        className='text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer shrink-0'
                                    >
                                        Clear
                                    </button>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type='file'
                                    accept='.pdf,.jpg,.jpeg,.png'
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className='hidden'
                                />
                            </div>

                            <p className='text-xs text-gray-400 mt-1'>PDF, JPG or PNG</p>
                        </div>

                        <div className='mb-4'>
                            <label className='block text-sm font-medium text-teal-900 mb-1'>Notes (optional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder='e.g. Prescribed by Dr. Rahman for fever'
                                rows={2}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                            />
                        </div>

                        {formError && (
                            <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{formError}</p>
                        )}

                        {ocrError && (
                            <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{ocrError}</p>
                        )}

                        <div className='flex gap-3'>
                            <button
                                type='submit'
                                disabled={!file || uploading}
                                className='flex-1 bg-teal-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors cursor-pointer'
                            >
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>

                            <button
                                type='button'
                                onClick={handleExtractText}
                                disabled={!file || ocrLoading}
                                className='flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors cursor-pointer'
                            >
                                {ocrLoading ? 'Reading...' : 'Extract Text (OCR)'}
                            </button>
                        </div>

                        {ocrLoading && (
                            <p className='text-xs text-gray-400 text-center mt-2'>This can take up to 15 seconds</p>
                        )}
                    </form>

                    {ocrText && (
                        <div className='mt-4 bg-gray-50 rounded-lg p-4'>
                            <h4 className='text-xs font-medium text-teal-900 mb-2'>Extracted Text</h4>
                            <p className='text-sm text-teal-700 whitespace-pre-wrap'>{ocrText}</p>
                        </div>
                    )}
                </div>

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading prescriptions...</p>
                ) : prescriptions.length === 0 ? (
                    <div className='text-center py-16'>
                        <FileText className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                        <p className='text-gray-900 font-medium'>No prescriptions yet</p>
                        <p className='text-sm text-gray-400 mt-1'>Upload a prescription file to keep it on record</p>
                    </div>
                ) : (
                    <div className='space-y-3'>
                        {prescriptions.map(p => (
                            <div key={p._id} className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex justify-between items-center gap-4'>
                                <div className='flex items-center gap-3 min-w-0'>
                                    <div className='w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center shrink-0'>
                                        <FileText className='w-5 h-5 text-teal-600' />
                                    </div>
                                    <div className='min-w-0'>
                                        <p className='text-sm font-medium text-teal-900 truncate'>{p.description || 'Prescription'}</p>
                                        <p className='text-xs text-gray-400'>{new Date(p.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className='flex items-center gap-3 shrink-0'>
                                    <a
                                        href={`${SERVER_URL}${p.fileUrl}`}
                                        target='_blank'
                                        rel='noreferrer'
                                        className='text-xs text-teal-600 hover:underline font-medium shrink-0 cursor-pointer'
                                    >
                                        View File
                                    </a>

                                    <button
                                        onClick={() => setConfirmDelete(p)}
                                        className='text-gray-400 hover:text-red-500 transition-colors cursor-pointer'
                                        title='Delete prescription'
                                    >
                                        <Trash2 className='w-4 h-4' />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Modal
                    isOpen={!!confirmDelete}
                    onClose={() => setConfirmDelete(null)}
                    title='Delete Prescription'
                    titleClassName='text-teal-900'
                >
                    {confirmDelete && (
                        <div>
                            <p className='text-sm text-gray-600 mb-6'>
                                Are you sure you want to delete{' '}
                                <span className='font-medium'>{confirmDelete.description || 'this prescription'}</span>?
                                The file will be permanently removed.
                            </p>

                            <div className='flex gap-3'>
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className='flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors cursor-pointer'
                                >
                                    Keep File
                                </button>
                                <button
                                    onClick={() => handleDelete(confirmDelete._id)}
                                    disabled={actionLoading}
                                    className='flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer'
                                >
                                    {actionLoading ? 'Deleting...' : 'Delete Prescription'}
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </DashboardLayout>
    );
};

export default PrescriptionPage;