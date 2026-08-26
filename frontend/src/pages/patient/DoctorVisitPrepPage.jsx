import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import AIResultCard from '../../components/shared/AIResultCard';
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
            setFormError('Enter a condition to build a checklist');
            return;
        }
        setLoading(true);
        setChecklist('');
        try {
            const response = await api.post('/auth/ai/visit-prep', { condition });
            setChecklist(response.data.data);
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
                    <h1 className='text-2xl font-bold text-teal-900'>Doctor Visit Prep</h1>
                    <p className='text-sm text-gray-500 mt-1'>
                        Enter a condition to get a checklist for your visit
                    </p>
                </div>

                <form
                    onSubmit={handleGetPrep}
                    className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'
                >
                    <div className='mb-4'>
                        <label className='block text-sm font-medium text-teal-900 mb-1'>Condition</label>
                        <input
                            type='text'
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                            placeholder='e.g. Type 2 Diabetes'
                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                        />
                        <p className='text-xs text-gray-400 mt-1'>
                            Use the name your doctor used, or the reason for the visit
                        </p>
                    </div>

                    {formError && (
                        <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{formError}</p>
                    )}

                    <button
                        type='submit'
                        disabled={loading || !condition.trim()}
                        className='w-full bg-teal-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors cursor-pointer'
                    >
                        {loading ? 'Preparing...' : 'Get Checklist'}
                    </button>
                </form>

                {checklist && (
                    <AIResultCard title='Visit Preparation Checklist'>{checklist}</AIResultCard>
                )}
            </div>
        </DashboardLayout>
    );
};

export default VisitPrep;