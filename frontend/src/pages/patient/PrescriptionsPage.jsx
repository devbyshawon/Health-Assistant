import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { FileText } from 'lucide-react';

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
            setFile(null);
            setDescription('');
            setOcrText('');
        } catch (error) {
            setFormError(error.response?.data?.message || 'Prescription upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleExtractText = async (e) => {
        e.preventDefault();
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
                headers: { 'Content-Type' : 'multipart/form-data' }
            });
            setOcrText(response.data.text);
        } catch (error) {
            setOcrError(error.response?.data?.message || 'Failed to extract text');
        } finally {
            setOcrLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className='max-w-5xl mx-auto'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-gray-900'>Prescriptions</h1>
                    <p className='text-sm text-gray-500 mt-1'>Upload and manage your prescription files</p>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}

                <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
                    <h3 className='font-semibold text-gray-900 mb-4'>Upload Prescription</h3>
                    <div className='mb-3 flex items-center gap-2'>
                        <button
                            type='button'
                            onClick={() => fileInputRef.current.click()}
                            className='border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50'
                        >
                            Choose File
                        </button>
                        <span className='text-sm text-gray-500'>
                            {file ? file.name : 'No file chosen'}
                        </span>
                        {file && (
                            <button
                                type='button'
                                onClick={() => { setFile(null); setOcrText(''); }}
                                className='text-xs text-red-500 hover:text-red-600 font-medium'
                            >
                                Clear
                            </button>     
                        )}
                        <input
                            ref={fileInputRef}
                            type='file'
                            accept='.pdf,.jpg,.jpeg,.png'
                            onChange={(e) => setFile(e.target.files[0])}
                            className='hidden'
                        />
                    </div>

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder='Notes (optional)'
                        rows={2}
                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3'
                    />
                    {formError && (
                        <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-3'>{formError}</p>
                    )}

                    {ocrError && (
                        <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-3'>{ocrError}</p>
                    )}

                    <div className='flex gap-3'>
                        <button onClick={handleUpload} disabled={!file || uploading} className='flex-1 bg-teal-600 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50'>
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                        <button onClick={handleExtractText} disabled={!file || ocrLoading} className='flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium disabled:opacity-50'>
                            {ocrLoading ? 'Reading... (this can take up to 15s)' : 'Extract Text (OCR)'}
                        </button>
                    </div>

                    {ocrText && (
                        <div className='mt-4 bg-gray-50 rounded-lg p-4'>
                            <h4 className='text-xs font-medium text-gray-500 mb-2'>Extracted Text:</h4>
                            <p className='text-sm text-gray-700 whitespace-pre-wrap'>{ocrText}</p>
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
                            <div key={p._id} className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex justify-between items-center'>
                                <div>
                                    <p className='text-sm font-medium text-gray-900'>{p.description || 'Prescription'}</p>
                                    <p className='text-xs text-gray-400'>{new Date(p.createdAt).toLocaleDateString()}</p>
                                </div>
                                <a href={`http://localhost:5001${p.fileUrl}`} target='_blank' rel='noreferrer' className='text-xs text-teal-600 hover:underline'>
                                    View File
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default PrescriptionPage;