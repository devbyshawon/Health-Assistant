import DashboardLayout from '../../components/shared/DashboardLayout';
import QuickActionCard from '../../components/QuickActionCard';
import AIDisclaimer from '../../components/shared/AIDisclaimer';
import {
    Stethoscope,
    BookOpen,
    ClipboardCheck,
    HistoryIcon,
} from 'lucide-react';

const AIAssistantHub = () => {

    return (
        <DashboardLayout>
            <div className='max-w-6xl mx-auto'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-teal-900'>AI Assistant</h1>
                    <p className='text-sm text-gray-500 mt-1'>Get quick health guidance powered by AI</p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <QuickActionCard
                        to='/ai/symptom-checker'
                        icon={Stethoscope}
                        title='Symptom Checker'
                        description='Describe symptoms and get a quick assessment'
                        color='blue'
                    />
                    <QuickActionCard
                        to='/ai/term-simplifier'
                        icon={BookOpen}
                        title='Term Simplifier'
                        description='Understand confusing medical terms in plain language'
                        color='purple'
                    />
                    <QuickActionCard
                        to='/ai/visit-prep'
                        icon={ClipboardCheck}
                        title='Visit Prep'
                        description='Get a checklist ready for your next doctor visit'
                        color='green'
                    />
                </div>

                <div className='py-4 grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <QuickActionCard
                        to='/ai/history'
                        icon={HistoryIcon}
                        title='History'
                        description='Review your past AI interactions'
                        color='ash'
                    />
                </div>
                <AIDisclaimer className='mt-6' />
            </div>
        </DashboardLayout>
    );
};

export default AIAssistantHub;