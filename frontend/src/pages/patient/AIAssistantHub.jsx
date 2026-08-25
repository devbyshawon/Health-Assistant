//import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/shared/DashboardLayout';
import QuickActionCard from '../../components/QuickActionCard';
import { MessageSquare, Stethoscope, BookOpen, ClipboardCheck, History } from 'lucide-react';

const AIAssistantHub = () => {
    return (
        <DashboardLayout>
            <div className='max-w-5xl mx-auto'>
                
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-gray-900'>AI Assistant</h1>
                    <p className='text-sm text-gray-500 mt-1'>Get quick health guidance powered by AI</p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <QuickActionCard
                        to="/ai/chat"
                        icon={MessageSquare}
                        title="Chat with AI"
                        description="Have a conversation about how you're feeling"
                        color="blue"
                    />
                    <QuickActionCard
                        to="/ai/symptom-checker"
                        icon={Stethoscope}
                        title="Symptom Checker"
                        description="Describe symptoms and get a quick assessment"
                        color="blue"
                    />
                    <QuickActionCard
                        to="/ai/term-simplifier"
                        icon={BookOpen}
                        title="Term Simplifier"
                        description="Understand confusing medical terms in plain language"
                        color="purple"
                    />
                    <QuickActionCard
                        to="/ai/visit-prep"
                        icon={ClipboardCheck}
                        title="Visit Prep"
                        description="Get a checklist ready for your next doctor visit"
                        color="green"
                    />
                    <QuickActionCard
                        to="/ai/history"
                        icon={History}
                        title="History"
                        description="Review your past AI interactions"
                        color="green"
                    />
                </div>

                <p className='text-xs text-gray-400 text-center mt-6'>
                    AI-generated guidance. Always consult a licensed doctor for medical advice.
                </p>
            </div>
        </DashboardLayout>
    );
};

export default AIAssistantHub;