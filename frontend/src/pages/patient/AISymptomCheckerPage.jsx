import { useState } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';


const AISymptomChecker = () => {
    const [symptoms, setSymptoms] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const handleDiagnose = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!symptoms.trim()) {
            setFormError('Please describe your symptoms');
            return;
        }
        setLoading(true);
        setDiagnosis('');
        try {
            const response = await api.post('/auth/ai/diagnose', { symptoms });
            setDiagnosis(response.data.data);
        } catch (error) {
            setFormError(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className='max-w-3xl mx-auto'>
                <Link to="/ai-chat" className='text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 mb-4'>
                    <ArrowLeft className='w-4 h-4' /> Back to AI Assistant
                </Link>

                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-gray-900'>Symptom Checker</h1>
                    <p className='text-sm text-gray-500 mt-1'>Describe how you're feeling and get AI-powered guidance</p>
                </div>

                <form onSubmit={handleDiagnose} className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Your Symptoms</label>
                    <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={4}
                    placeholder='e.g. I have a headache, mild fever, and sore throat since yesterday'
                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-teal-500'
                    />

                    {formError && (
                        <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-3'>{formError}</p>
                    )}

                    <button
                        type='submit'
                        disabled={loading}
                        className='w-full bg-teal-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors'
                    >
                        {loading ? 'Analyzing...' : 'Check Symptoms'}
                    </button>
                </form>

                {diagnosis && (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                        <h3 className='font-semibold text-gray-900 mb-2'>Assessment</h3>
                        <p className='text-sm text-gray-700 whitespace-pre-wrap'>{diagnosis}</p>
                        <p className='text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100'>
                            This is AI-generated guidance, not a medical diagnosis. Always consult a licensed doctor for proper care.
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
};

export default AISymptomChecker;