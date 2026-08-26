import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import MarkdownText from './MarkdownText';
import AIDisclaimer from './AIDisclaimer';


const AIResultCard = ({ title, children }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(children);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            error.response?.data?.message
        }
    };

    return (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
            <div className='flex items-start justify-between gap-4 mb-3'>
                <h3 className='font-semibold text-teal-900'>{title}</h3>

                <button
                    onClick={handleCopy}
                    className='text-xs text-gray-400 hover:text-teal-600 flex items-center gap-1 shrink-0 transition-colors cursor-pointer'
                >
                    {copied ? (
                        <>
                            <Check className='w-3.5 h-3.5' /> Copied
                        </>
                    ) : (
                        <>
                            <Copy className='w-3.5 h-3.5' /> Copy
                        </>
                    )}
                </button>
            </div>

            <MarkdownText>{children}</MarkdownText>

            <div className='mt-4 pt-4 border-t border-gray-100'>
                <AIDisclaimer />
            </div>
        </div>
    );
};

export default AIResultCard;