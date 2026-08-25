import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import { Users } from 'lucide-react';

const DoctorPatients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await api.get('/doctor/patients');
                setPatients(response.data.patients);
            } catch (error) {
                setPageError(error.response?.data?.message || 'Failed to load patients');
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className='max-w-6xl mx-auto'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-teal-900'>My Patients</h1>
                    <p className='text-sm text-gray-500 mt-1'>Patients you have appointments with</p>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}

                <div className='mb-4'>
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder='Search by name or email'
                        className='w-full md:w-80 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                    />
                </div>

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading patients...</p>
                ) : filteredPatients.length === 0 ? (
                    <div className='text-center py-16'>
                        <Users className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                        <p className='text-gray-900 font-medium'>No patients yet</p>
                        <p className='text-sm text-gray-400 mt-1'>Patients will appear here once they book an appointment with you</p>
                    </div>
                ) : (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                        <table className='w-full text-sm'>
                            <thead className='bg-gray-50 border-b border-gray-100'>
                                <tr>
                                    <th className='text-left px-4 py-3 font-bold text-gray-500'>Name</th>
                                    <th className='text-left px-4 py-3 font-bold text-gray-500'>Email</th>
                                    <th className='text-right px-4 py-3 font-bold text-gray-500'>Action</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-100'>
                                {filteredPatients.map(patient => (
                                    <tr
                                        key={patient._id}
                                        onClick={() => navigate(`/doctor/patients/${patient._id}/healthlogs`)}
                                        className='hover:bg-gray-50 cursor-pointer'
                                    >
                                        <td className='px-4 py-3 text-gray-900'>{patient.name}</td>
                                        <td className='px-4 py-3 text-gray-500'>{patient.email}</td>
                                        <td className='px-4 py-3 text-right text-teal-600 font-medium'>View Health Logs →</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DoctorPatients;