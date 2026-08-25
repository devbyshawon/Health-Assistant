import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';
import HealthSummaryChart from '../../components/HealthSummaryChart';
import { ArrowLeft, Activity } from 'lucide-react';

const PatientHealthLogs = () => {
    const { patientId } = useParams();
    const [patient, setPatient] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await api.get(`/doctor/patients/${patientId}/healthlogs`);
                setPatient(response.data.patient);
                setLogs(response.data.logs);
            } catch (error) {
                setPageError(error.response?.data?.message || 'Failed to load health logs');
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [patientId]);

    return (
        <DashboardLayout>
            <div className='max-w-5xl mx-auto'>

                <Link to='/doctor/patients' className='text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 mb-4'>
                    <ArrowLeft className='w-4 h-4' /> Back to Patients
                </Link>

                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-teal-900'>
                        Health Logs {patient ? `— ${patient.name}` : ''}
                    </h1>
                    <p className='text-sm text-gray-500 mt-1'>Reviewing patient health history</p>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}

                {patient && (
                    <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6'>
                        <h3 className='font-semibold text-teal-900 mb-3'>Patient Information</h3>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-3 text-sm'>
                            {patient.age && (
                                <div><p className='text-gray-500 text-xs'>Age</p><p className='font-medium text-gray-900'>{patient.age}</p></div>
                            )}
                            {patient.gender && (
                                <div><p className='text-gray-500 text-xs'>Gender</p><p className='font-medium text-gray-900'>{patient.gender}</p></div>
                            )}
                            {patient.bloodGroup && (
                                <div><p className='text-gray-500 text-xs'>Blood Group</p><p className='font-medium text-gray-900'>{patient.bloodGroup}</p></div>
                            )}
                            {patient.contact && (
                                <div><p className='text-gray-500 text-xs'>Contact</p><p className='font-medium text-gray-900'>{patient.contact}</p></div>
                            )}
                        </div>
                        {patient.emergencyContact?.name && (
                            <div className='mt-3 pt-3 border-t border-gray-100 text-sm'>
                                <p className='text-gray-500 text-xs mb-1'>Emergency Contact</p>
                                <p className='text-gray-900'>{patient.emergencyContact.name} ({patient.emergencyContact.relation}) — {patient.emergencyContact.phone}</p>
                            </div>
                        )}
                    </div>
                )}

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading health logs...</p>
                ) : logs.length === 0 ? (
                    <div className='text-center py-16'>
                        <Activity className='w-12 h-12 text-gray-300 mx-auto mb-3' />
                        <p className='text-gray-900 font-medium'>No health logs recorded yet</p>
                        <p className='text-sm text-gray-400 mt-1'>This patient hasn't logged any health data</p>
                    </div>
                ) : (
                    <> 
                        <HealthSummaryChart logs={logs} />

                        <div className='space-y-3 mt-6'>
                            {logs.map(log => (
                                <div key={log._id} className='bg-white rounded-xl shadow-sm border border-gray-100 p-4'>
                                    <div className='flex justify-between items-start mb-2'>
                                        <p className='text-sm font-medium text-gray-900'>
                                            {new Date(log.date).toLocaleDateString()}
                                        </p>
                                        {log.mood && (
                                            <span className='text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700'>
                                                {log.mood}
                                            </span>
                                        )}
                                    </div>

                                    <div className='grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500 mb-2'>
                                        {log.weight && <span>Weight: {log.weight} kg</span>}
                                        {log.height && <span>Height: {log.height} cm</span>}
                                        {log.vitals?.heartRate && <span>HR: {log.vitals.heartRate} bpm</span>}
                                        {log.vitals?.temperature && <span>Temp: {log.vitals.temperature}°</span>}
                                        {log.vitals?.bloodPressure && <span>BP: {log.vitals.bloodPressure}</span>}
                                    </div>

                                    {log.symptoms?.length > 0 && (
                                        <p className='text-xs text-gray-600 mb-1'>
                                            <span className='font-medium'>Symptoms:</span> {log.symptoms.join(', ')}
                                        </p>
                                    )}

                                    {log.notes && (
                                        <p className='text-xs text-gray-500 italic'>{log.notes}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default PatientHealthLogs;