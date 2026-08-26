import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


const MarkdownText = ({ children }) => (
    <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
            p: ({ children }) => (
                <p className='text-sm text-teal-900 leading-relaxed mb-3 last:mb-0'>{children}</p>
            ),
            ul: ({ children }) => (
                <ul className='list-disc pl-5 space-y-1.5 mb-3 last:mb-0 text-sm text-teal-900'>{children}</ul>
            ),
            ol: ({ children }) => (
                <ol className='list-decimal pl-5 space-y-1.5 mb-3 last:mb-0 text-sm text-teal-900'>{children}</ol>
            ),
            li: ({ children }) => <li className='leading-relaxed'>{children}</li>,
            strong: ({ children }) => <strong className='font-semibold text-teal-900'>{children}</strong>,
            em: ({ children }) => <em className='italic'>{children}</em>,
            h1: ({ children }) => (
                <h4 className='text-sm font-semibold text-teal-900 mt-4 mb-2 first:mt-0'>{children}</h4>
            ),
            h2: ({ children }) => (
                <h4 className='text-sm font-semibold text-teal-900 mt-4 mb-2 first:mt-0'>{children}</h4>
            ),
            h3: ({ children }) => (
                <h5 className='text-sm font-semibold text-teal-900 mt-3 mb-1.5 first:mt-0'>{children}</h5>
            ),
            a: ({ href, children }) => (
                <a
                    href={href}
                    target='_blank'
                    rel='noreferrer'
                    className='text-teal-600 underline hover:text-teal-700'
                >
                    {children}
                </a>
            ),
            code: ({ inline, children }) =>
                inline ? (
                    <code className='bg-gray-100 text-gray-800 rounded px-1.5 py-0.5 text-xs font-mono'>
                        {children}
                    </code>
                ) : (
                    <code className='font-mono text-xs'>{children}</code>
                ),
            pre: ({ children }) => (
                <pre className='bg-gray-50 border border-gray-100 rounded-lg p-3 overflow-x-auto mb-3 last:mb-0'>
                    {children}
                </pre>
            ),
            blockquote: ({ children }) => (
                <blockquote className='border-l-2 border-teal-200 pl-3 text-sm text-gray-600 italic mb-3 last:mb-0'>
                    {children}
                </blockquote>
            ),
            hr: () => <hr className='border-gray-100 my-4' />,
            table: ({ children }) => (
                <div className='overflow-x-auto mb-3 last:mb-0'>
                    <table className='w-full text-sm border-collapse'>{children}</table>
                </div>
            ),
            th: ({ children }) => (
                <th className='text-left text-xs font-medium text-gray-500 border-b border-gray-200 px-3 py-2'>
                    {children}
                </th>
            ),
            td: ({ children }) => (
                <td className='text-gray-700 border-b border-gray-100 px-3 py-2'>{children}</td>
            ),
        }}
    >
        {children}
    </ReactMarkdown>
);

export default MarkdownText;
