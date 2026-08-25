import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/shared/DashboardLayout';

const DoctorProfile = () => {
    // eslint-disable-next-line no-unused-vars
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    const [form, setForm] = useState({
        specialty: '', bio: '', phone: '', experience: '', fees: '',
        lat: '', lng: '', availability: []
    });
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/doctor/me');
                const doc = response.data.doctor;
                setProfile(doc);
                setForm({
                    specialty: doc.specialty || '',
                    bio: doc.bio || '',
                    phone: doc.phone || '',
                    experience: doc.experience || '',
                    fees: doc.fees || '',
                    lat: doc.clinicLocation?.coordinates?.[1] || '',
                    lng: doc.clinicLocation?.coordinates?.[0] || '',
                    availability: doc.availability || []
                });
            } catch (error) {
                if (error.response?.status !== 404) {
                    setPageError(error.response?.data?.message || 'Failed to load profile');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const addSlot = () => {
        setForm(prev => ({
            ...prev,
            availability: [...prev.availability, { day: 'Monday', startTime: '', endTime: '' }]
        }));
    };

    const updateSlot = (index, field, value) => {
        setForm(prev => ({
            ...prev,
            availability: prev.availability.map((slot, i) => i === index ? { ...slot, [field]: value } : slot)
        }));
    };

    const removeSlot = (index) => {
        setForm(prev => ({
            ...prev,
            availability: prev.availability.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaveError('');
        setSaveSuccess(false);
        setSaving(true);
        try {
            if (form.availability.some(s => !s.day || !s.startTime || !s.endTime)) {
                setSaveError('Please fill in all fields for each availability slot, or remove incomplete ones');
                return;
            }
            const payload = {
                specialty: form.specialty,
                bio: form.bio,
                phone: form.phone,
                experience: Number(form.experience) || undefined,
                fees: Number(form.fees) || undefined,
                availability: form.availability,
            };
            if (form.lat && form.lng) {
                payload.clinicLocation = {
                    type: 'Point',
                    coordinates: [parseFloat(form.lng), parseFloat(form.lat)]
                };
            }
            const response = await api.patch('/doctor/update-profile', payload);
            setProfile(response.data.doctor);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            setSaveError(error.response?.data?.message || 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className='max-w-6xl mx-auto'>
                <div className='mb-6'>
                    <h1 className='text-2xl font-bold text-teal-900'>My Profile</h1>
                    <p className='text-sm text-gray-500 mt-1'>Manage your specialty, bio, and availability</p>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{pageError}</p>
                )}

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading profile...</p>
                ) : (
                    <form onSubmit={handleSave} className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Specialty</label>
                            <input value={form.specialty} onChange={(e) => setForm(prev => ({ ...prev, specialty: e.target.value }))}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Bio</label>
                            <textarea value={form.bio} onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))} rows={3}
                                className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Phone</label>
                                <input value={form.phone} onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Experience (years)</label>
                                <input type='number' value={form.experience} onChange={(e) => setForm(prev => ({ ...prev, experience: e.target.value }))}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                            </div>
                        </div>

                        <div className='grid grid-cols-3 gap-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Fees (৳)</label>
                                <input type='number' value={form.fees} onChange={(e) => setForm(prev => ({ ...prev, fees: e.target.value }))}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Latitude</label>
                                <input value={form.lat} onChange={(e) => setForm(prev => ({ ...prev, lat: e.target.value }))}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Longitude</label>
                                <input value={form.lng} onChange={(e) => setForm(prev => ({ ...prev, lng: e.target.value }))}
                                    className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                            </div>
                        </div>

                        <div>
                            <div className='flex justify-between items-center mb-2'>
                                <label className='text-sm font-medium text-gray-700'>Availability</label>
                                <button type='button' onClick={addSlot} className='text-sm text-teal-600 hover:text-teal-700 font-medium cursor-pointer'>+ Add Slot</button>
                            </div>
                            {form.availability.map((slot, i) => (
                                <div key={i} className='flex gap-2 mb-2'>
                                    <select value={slot.day} onChange={(e) => updateSlot(i, 'day', e.target.value)}
                                        className='border border-gray-300 rounded-lg px-2 py-2 text-sm'>
                                        {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                    <input type='time' value={slot.startTime} onChange={(e) => updateSlot(i, 'startTime', e.target.value)}
                                        className='border border-gray-300 rounded-lg px-2 py-2 text-sm' />
                                    <input type='time' value={slot.endTime} onChange={(e) => updateSlot(i, 'endTime', e.target.value)}
                                        className='border border-gray-300 rounded-lg px-2 py-2 text-sm' />
                                    <button type='button' onClick={() => removeSlot(i)} className='text-red-500 text-sm px-2 cursor-pointer'>Remove</button>
                                </div>
                            ))}
                        </div>

                        {saveSuccess && <p className='text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg'>Profile saved successfully</p>}
                        {saveError && <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg'>{saveError}</p>}

                        <button type='submit' disabled={saving}
                            className='w-full bg-teal-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 cursor-pointer'>
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </form>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DoctorProfile;