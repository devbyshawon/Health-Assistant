import { useState } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';


const VisitPrep = () => {
    const [condition, setCondition] = useState('');
    const [checklist, setChecklist] = useState('');
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');

    const handleGetPrep = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!condition.trim()) {
            setFormError('Please enter a condition');
            return;
        }
        setLoading(true);
        setChecklist('');
        try {
            const response = await api.get(`/auth/ai/visit-prep/${encodeURIComponent(condition)}`);
            setChecklist(response.data.data);
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
                    <h1 className='text-2xl font-bold text-gray-900'>Doctor Visit Prep</h1>
                    <p className='text-sm text-gray-500 mt-1'>Enter a condition to get a checklist for your visit</p>
                </div>

                <form onSubmit={handleGetPrep} className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Condition</label>
                    <input
                        type='text'
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        placeholder='e.g. Type 2 Diabetes'
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
                        {loading ? 'Preparing...' : 'Get Checklist'}
                    </button>
                </form>

                {checklist && (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                        <h3 className='font-semibold text-gray-900 mb-2'>Visit Preparation Checklist</h3>
                        <p className='text-sm text-gray-700 whitespace-pre-wrap'>{checklist}</p>
                        <p className='text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100'>
                            This is AI-generated guidance, not medical advice. Always consult a licensed doctor for proper care.
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default VisitPrep;