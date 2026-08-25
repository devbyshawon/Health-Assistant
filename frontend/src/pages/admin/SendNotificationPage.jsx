import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import Modal from '../../components/shared/Modal';
import { Users, Stethoscope, Send } from 'lucide-react';

const SendNotification = () => {
    const [recipients, setRecipients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [composeTarget, setComposeTarget] = useState(null);

    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState('system');

    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState('');
    const [sendSuccess, setSendSuccess] = useState('');

    useEffect(() => {
        const fetchRecipients = async () => {
            try {
                const [usersRes, doctorsRes] = await Promise.all([
                    api.get('/admin/users'),
                    api.get('/admin/doctors?verified=true'),
                ]);
                const patients = usersRes.data.users.map(u => ({ ...u, roleLabel: 'Patient' }));
                const doctors = doctorsRes.data.doctors.map(d => ({ ...d, roleLabel: 'Doctor' }));
                setRecipients([...patients, ...doctors]);
            } catch (error) {
                setPageError(error.response?.data?.message || 'Failed to load recipients');
            } finally {
                setLoading(false);
            }
        };
        fetchRecipients();
    }, []);

    const filteredRecipients = recipients.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const closeModal = () => {
        setComposeTarget(null);
        setTitle('');
        setMessage('');
        setType('system');
        setSendError('');
    };

    const handleSend = async (e) => {
        e.preventDefault();
        setSendError('');
        if (!title.trim() || !message.trim()) {
            setSendError('Please fill in title and message');
            return;
        }
        setSending(true);
        try {
            if (composeTarget.mode === 'single') {
                await api.post('/admin/notify', {
                    userId: composeTarget.recipient._id,
                    title, message, type
                });
                setSendSuccess(`Notification sent to ${composeTarget.recipient.name}`);
            } else {
                const response = await api.post('/admin/notify/bulk', {
                    target: composeTarget.target,
                    title, message, type
                });
                setSendSuccess(response.data.message);
            }
            closeModal();
            setTimeout(() => setSendSuccess(''), 4000);
        } catch (error) {
            setSendError(error.response?.data?.message || 'Failed to send notification');
        } finally {
            setSending(false);
        }
    };

    return (
        <DashboardLayout>
            <div className='max-w-6xl mx-auto'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-teal-900'>Send Notification</h1>
                    <p className='text-sm text-gray-500 mt-1'>Send a notification and email to one or more users</p>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}
                {sendSuccess && (
                    <p className='text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg mb-4'>{sendSuccess}</p>
                )}

                {/* Bulk send options */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                    <button
                        onClick={() => setComposeTarget({ mode: 'bulk', target: 'patients', label: 'All Patients' })}
                        className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition duration-200 text-left cursor-pointer'
                    >
                        <div className='flex items-center gap-4'>
                            <div className='bg-blue-50 text-blue-600 p-3 rounded-lg'>
                                <Users className='w-6 h-6' />
                            </div>
                            <div>
                                <h3 className='font-semibold text-teal-900'>Message All Patients</h3>
                                <p className='text-sm text-gray-500'>Send to every registered patient</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setComposeTarget({ mode: 'bulk', target: 'doctors', label: 'All Doctors' })}
                        className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition duration-200 text-left cursor-pointer'
                    >
                        <div className='flex items-center gap-4'>
                            <div className='bg-purple-50 text-purple-600 p-3 rounded-lg'>
                                <Stethoscope className='w-6 h-6' />
                            </div>
                            <div>
                                <h3 className='font-semibold text-teal-900'>Message All Doctors</h3>
                                <p className='text-sm text-gray-500'>Send to every registered doctor</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setComposeTarget({ mode: 'bulk', target: 'all', label: 'Everyone' })}
                        className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition duration-200 text-left cursor-pointer'
                    >
                        <div className='flex items-center gap-4'>
                            <div className='bg-green-50 text-green-600 p-3 rounded-lg'>
                                <Send className='w-6 h-6' />
                            </div>
                            <div>
                                <h3 className='font-semibold text-teal-900'>Message Everyone</h3>
                                <p className='text-sm text-gray-500'>Send to all patients and doctors</p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Search + individual recipient table */}
                <div className='mb-4'>
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder='Search by name or email'
                        className='w-full md:w-80 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                    />
                </div>

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading recipients...</p>
                ) : filteredRecipients.length === 0 ? (
                    <p className='text-gray-400 text-center py-12'>No recipients found</p>
                ) : (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                        <table className='w-full text-sm'>
                            <thead className='bg-gray-50 border-b border-gray-100'>
                                <tr>
                                    <th className='text-left px-4 py-3 font-bold text-gray-500'>Name</th>
                                    <th className='text-left px-4 py-3 font-bold text-gray-500'>Email</th>
                                    <th className='text-left px-4 py-3 font-bold text-gray-500'>Role</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100'>
                                {filteredRecipients.map(u => (
                                    <tr
                                        key={u._id}
                                        onClick={() => setComposeTarget({ mode: 'single', recipient: u })}
                                        className='hover:bg-gray-50 cursor-pointer'
                                    >
                                        <td className='px-4 py-3 text-gray-900'>{u.name}</td>
                                        <td className='px-4 py-3 text-gray-500'>{u.email}</td>
                                        <td className='px-4 py-3'>
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                                u.roleLabel === 'Doctor' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                                            }`}>
                                                {u.roleLabel}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Compose modal — shared for single and bulk */}
                <Modal
                    isOpen={!!composeTarget}
                    onClose={closeModal}
                    title={
                        composeTarget?.mode === 'single'
                            ? `Message ${composeTarget.recipient.name}`
                            : composeTarget ? `Message ${composeTarget.label}` : ''
                    }
                    titleClassName='text-teal-900'
                >
                    {composeTarget && (
                        <form onSubmit={handleSend}>
                            {composeTarget.mode === 'single' && (
                                <div className='flex items-center gap-4 bg-blue-50 rounded-xl p-4 mb-4'>
                                    <div className='bg-white text-blue-600 p-3 rounded-lg'>
                                        {composeTarget.recipient.roleLabel === 'Doctor' ? (
                                            <Stethoscope className='w-6 h-6' />
                                        ) : (
                                            <Users className='w-6 h-6' />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className='font-semibold text-teal-900'>{composeTarget.recipient.name}</h3>
                                        <p className='text-sm text-gray-500'>{composeTarget.recipient.email} · {composeTarget.recipient.roleLabel}</p>
                                    </div>
                                </div>
                            )}
                            {composeTarget.mode === 'bulk' && (
                                <div className='flex items-center gap-4 bg-teal-50 rounded-xl p-4 mb-4'>
                                    <div className='bg-white text-teal-600 p-3 rounded-lg'>
                                        <Send className='w-6 h-6' />
                                    </div>
                                    <div>
                                        <h3 className='font-semibold text-teal-900'>{composeTarget.label}</h3>
                                        <p className='text-sm text-gray-500'>Sending to all recipients in this group</p>
                                    </div>
                                </div>
                            )}

                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Type</label>
                                <select value={type} onChange={(e) => setType(e.target.value)}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'>
                                    <option value='system'>System</option>
                                    <option value='appointment'>Appointment</option>
                                    <option value='reminder'>Reminder</option>
                                    <option value='prescription'>Prescription</option>
                                </select>
                            </div>

                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Title</label>
                                <input value={title} onChange={(e) => setTitle(e.target.value)}
                                    placeholder='e.g. Scheduled Maintenance Notice'
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                            </div>

                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-teal-900 mb-1'>Message</label>
                                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
                                    placeholder='Write the notification message...'
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                            </div>

                            {sendError && (
                                <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{sendError}</p>
                            )}

                            <button type='submit' disabled={sending}
                                className='w-full bg-teal-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors cursor-pointer'>
                                {sending ? 'Sending...' : 'Send Notification'}
                            </button>
                        </form>
                    )}
                </Modal>
            </div>
        </DashboardLayout>
    );
};

export default SendNotification;