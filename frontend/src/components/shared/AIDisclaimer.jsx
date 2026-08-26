import { Info } from 'lucide-react';

const AIDisclaimer = ({ className = '' }) => (
    <p className={`text-xs text-gray-400 flex items-center justify-center gap-1.5 ${className}`}>
        <Info className='w-3.5 h-3.5 shrink-0' />
        AI-generated guidance. Not a diagnosis — consult a licensed doctor before acting on it.
    </p>
);

export default AIDisclaimer;