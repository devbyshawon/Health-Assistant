import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import AIResultCard from '../../components/shared/AIResultCard';
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
            setFormError('Describe your symptoms to get an assessment');
            return;
        }
        setLoading(true);
        setDiagnosis('');
        try {
            const response = await api.post('/auth/ai/diagnose', { symptoms });
            setDiagnosis(response.data.data);
        } catch (error) {
            setFormError(error.response?.data?.message || 'The assistant could not respond. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className='max-w-4xl mx-auto'>
                <Link
                    to='/ai'
                    className='text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 mb-4 cursor-pointer'
                >
                    <ArrowLeft className='w-4 h-4' /> Back to AI Assistant
                </Link>

                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-teal-900'>Symptom Checker</h1>
                    <p className='text-sm text-gray-500 mt-1'>
                        Describe how you're feeling and get AI-powered guidance
                    </p>
                </div>

                <form
                    onSubmit={handleDiagnose}
                    className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'
                >
                    <div className='mb-4'>
                        <label className='block text-sm font-medium text-teal-900 mb-1'>Your Symptoms</label>
                        <textarea
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            rows={4}
                            placeholder='e.g. I have a headache, mild fever, and sore throat since yesterday'
                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                        />
                        <p className='text-xs text-gray-400 mt-1'>
                            Include when it started and anything that makes it better or worse
                        </p>
                    </div>

                    {formError && (
                        <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{formError}</p>
                    )}

                    <button
                        type='submit'
                        disabled={loading || !symptoms.trim()}
                        className='w-full bg-teal-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors cursor-pointer'
                    >
                        {loading ? 'Checking...' : 'Check Symptoms'}
                    </button>
                </form>

                {diagnosis && <AIResultCard title='Assessment'>{diagnosis}</AIResultCard>}
            </div>
        </DashboardLayout>
    );
};

export default AISymptomChecker;