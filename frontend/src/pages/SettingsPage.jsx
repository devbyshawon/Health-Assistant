import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/shared/DashboardLayout';
import Modal from '../components/shared/Modal';
import { Eye, EyeOff } from 'lucide-react';

const Settings = () => {
    const { updateUser, logout } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    // Profile edit form
    const [form, setForm] = useState({
        name: '', username: '', age: '', gender: '', contact: '',
        birthday: '', address: '', bloodGroup: '', intro: '',
        emergencyContact: { name: '', phone: '', email: '', relation: '' }
    });
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Avatar
    const avatarRef = useRef(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarError, setAvatarError] = useState('');

    // Password change
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // 2FA
    const [twoFALoading, setTwoFALoading] = useState(false);
    const [twoFAError, setTwoFAError] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState('');
    const [verifyingOtp, setVerifyingOtp] = useState(false);

    // Delete account
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/auth/profile');
                const p = response.data.user;
                setProfile(p);
                setForm({
                    name: p.name || '', username: p.username || '', age: p.age || '',
                    gender: p.gender || '', contact: p.contact || '', birthday: p.birthday || '',
                    address: p.address || '', bloodGroup: p.bloodGroup || '', intro: p.intro || '',
                    emergencyContact: p.emergencyContact || { name: '', phone: '', email: '', relation: '' }
                });
            } catch (error) {
                setPageError(error.response?.data?.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaveError('');
        setSaveSuccess(false);
        setSaving(true);
        try {
            const response = await api.patch('/auth/update-profile', form);
            setProfile(response.data.user);
            updateUser({ name: response.data.user.name }); // keep Navbar in sync if name changed
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            setSaveError(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async () => {
        setAvatarError('');
        if (!avatarFile) return;
        setUploadingAvatar(true);
        try {
            const formData = new FormData();
            formData.append('profilePic', avatarFile);
            const response = await api.post('/auth/upload-profile-pic', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfile(response.data.user);
            updateUser({ profilePic: response.data.user.profilePic }); // sync Navbar avatar
            setAvatarFile(null);
        } catch (error) {
            setAvatarError(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess(false);
        if (!passwordForm.currentPassword || !passwordForm.newPassword) {
            setPasswordError('Both fields are required');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters');
            return;
        }
        setChangingPassword(true);
        try {
            await api.patch('/auth/change-password', passwordForm);
            setPasswordForm({ currentPassword: '', newPassword: '' });
            setPasswordSuccess(true);
            setTimeout(() => setPasswordSuccess(false), 3000);
        } catch (error) {
            setPasswordError(error.response?.data?.message || 'Failed to change password');
        } finally {
            setChangingPassword(false);
        }
    };

    const handleToggle2FA = async () => {
        setTwoFAError('');
        setTwoFALoading(true);
        try {
            const response = await api.patch('/auth/toggle-2fa');
            if (response.data.otpSent) {
                setShowOtpInput(true);
            } else {
                setProfile(prev => ({ ...prev, isTwoFAEnabled: false }));
            }
        } catch (error) {
            setTwoFAError(error.response?.data?.message || 'Failed to update 2FA');
        } finally {
            setTwoFALoading(false);
        }
    };

    const handleVerify2FAOtp = async (e) => {
        e.preventDefault();
        setTwoFAError('');
        setVerifyingOtp(true);
        try {
            await api.post('/auth/verify-2fa', { otp });
            setProfile(prev => ({ ...prev, isTwoFAEnabled: true }));
            setShowOtpInput(false);
            setOtp('');
        } catch (error) {
            setTwoFAError(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setVerifyingOtp(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleteError('');
        setDeleting(true);
        try {
            await api.delete('/auth/delete');
            logout();
            navigate('/login');
        } catch (error) {
            setDeleteError(error.response?.data?.message || 'Failed to delete account');
            setDeleting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className='max-w-6xl mx-auto space-y-6'>
                <div className='mb-2'>
                    <h1 className='text-2xl font-bold text-teal-900'>Settings</h1>
                    <p className='text-sm text-gray-500 mt-1'>Manage your account and preferences</p>
                </div>

                {pageError && (
                    <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg'>{pageError}</p>
                )}

                {loading ? (
                    <p className='text-gray-400 text-center py-12'>Loading settings...</p>
                ) : (
                    <>
                        {/* AVATAR + PROFILE SECTION */}
                        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                            <h3 className='font-semibold text-teal-900 mb-4'>Profile</h3>

                            <div className='flex items-center gap-4 mb-6'>
                                <div className='w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-xl overflow-hidden'>
                                    {profile?.profilePic ? (
                                        <img src={`http://localhost:5001${profile.profilePic}`} alt={profile.name} className='w-full h-full object-cover' />
                                    ) : (
                                        profile?.name?.[0] || 'U'
                                    )}
                                </div>
                                <div>
                                    <button type='button' onClick={() => avatarRef.current.click()}
                                        className='border border-gray-300 text-teal-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100'>
                                        Choose Photo
                                    </button>
                                    <input ref={avatarRef} type='file' accept='image/*' className='hidden'
                                        onChange={(e) => setAvatarFile(e.target.files[0])} />
                                    {avatarFile && (
                                        <button type='button' onClick={handleAvatarUpload} disabled={uploadingAvatar}
                                            className='ml-2 text-sm text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50'>
                                            {uploadingAvatar ? 'Uploading...' : `Upload "${avatarFile.name}"`}
                                        </button>
                                    )}
                                    {avatarError && <p className='text-red-500 text-xs mt-1'>{avatarError}</p>}
                                </div>
                            </div>

                            <form onSubmit={handleSaveProfile} className='space-y-4'>
                                <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-teal-900 mb-1'>Name</label>
                                        <input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-teal-900 mb-1'>Username</label>
                                        <input value={form.username} onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                                    </div>
                                </div>

                                <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-teal-900 mb-1'>Age</label>
                                        <input type='number' value={form.age} onChange={(e) => setForm(prev => ({ ...prev, age: e.target.value }))}
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-teal-900 mb-1'>Gender</label>
                                        <select value={form.gender} onChange={(e) => setForm(prev => ({ ...prev, gender: e.target.value }))}
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'>
                                            <option value=''>Select</option>
                                            <option value='Male'>Male</option>
                                            <option value='Female'>Female</option>
                                            <option value='Others'>Others</option>
                                        </select>
                                    </div>
                                </div>

                                <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-teal-900 mb-1'>Contact</label>
                                        <input value={form.contact} onChange={(e) => setForm(prev => ({ ...prev, contact: e.target.value }))}
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-teal-900 mb-1'>Birthday</label>
                                        <input value={form.birthday} onChange={(e) => setForm(prev => ({ ...prev, birthday: e.target.value }))}
                                            placeholder='YYYY-MM-DD'
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                                    </div>
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-teal-900 mb-1'>Address</label>
                                    <input value={form.address} onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-teal-900 mb-1'>Blood Group</label>
                                    <input value={form.bloodGroup} onChange={(e) => setForm(prev => ({ ...prev, bloodGroup: e.target.value }))}
                                        placeholder='e.g. O+'
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-teal-900 mb-1'>Intro</label>
                                    <textarea value={form.intro} onChange={(e) => setForm(prev => ({ ...prev, intro: e.target.value }))}
                                        rows={3} maxLength={500}
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                                </div>

                                <div className='pt-4 border-t border-gray-100'>
                                    <label className='block text-sm font-medium text-teal-900 mb-2'>Emergency Contact</label>
                                    <div className='grid grid-cols-2 gap-4 mb-3'>
                                        <input placeholder='Name' value={form.emergencyContact.name}
                                            onChange={(e) => setForm(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, name: e.target.value } }))}
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                                        <input placeholder='Relation' value={form.emergencyContact.relation}
                                            onChange={(e) => setForm(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, relation: e.target.value } }))}
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                                    </div>
                                    <div className='grid grid-cols-2 gap-4'>
                                        <input placeholder='Phone' value={form.emergencyContact.phone}
                                            onChange={(e) => setForm(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, phone: e.target.value } }))}
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                                        <input placeholder='Email' value={form.emergencyContact.email}
                                            onChange={(e) => setForm(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, email: e.target.value } }))}
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                                    </div>
                                </div>

                                {saveSuccess && <p className='text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg'>Profile updated successfully</p>}
                                {saveError && <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg'>{saveError}</p>}

                                <button type='submit' disabled={saving}
                                    className='bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50'>
                                    {saving ? 'Saving...' : 'Save Profile'}
                                </button>
                            </form>
                        </div>

                        {/* PASSWORD SECTION */}
                        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                            <h3 className='font-semibold text-teal-900 mb-4'>Change Password</h3>
                            <form onSubmit={handleChangePassword} className='space-y-4'>
                                <div>
                                    <label className='block text-sm font-medium text-teal-900 mb-1'>Current Password</label>
                                    <div className='relative'>
                                        <input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                        />
                                        <button
                                            type='button'
                                            onClick={() => setShowCurrentPassword(prev => !prev)}
                                            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                                        >
                                            {showCurrentPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className='block text-sm font-medium text-teal-900 mb-1'>New Password</label>
                                    <div className='relative'>
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                            className='w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500'
                                        />
                                        <button
                                            type='button'
                                            onClick={() => setShowNewPassword(prev => !prev)}
                                            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                                        >
                                            {showNewPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                                        </button>
                                    </div>
                                </div>

                                {passwordSuccess && <p className='text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg'>Password changed successfully</p>}
                                {passwordError && <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg'>{passwordError}</p>}

                                <button type='submit' disabled={changingPassword}
                                    className='bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50'>
                                    {changingPassword ? 'Changing...' : 'Change Password'}
                                </button>
                            </form>
                        </div>

                        {/* 2FA SECTION */}
                        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
                            <h3 className='font-semibold text-teal-900 mb-4'>Two-Factor Authentication</h3>
                            <div className='flex items-center justify-between'>
                                <p className='text-sm text-gray-600'>
                                    {profile?.isTwoFAEnabled ? '2FA is currently enabled' : 'Strengthen your account protection and keep your data secure'}
                                </p>
                                <button onClick={handleToggle2FA} disabled={twoFALoading}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${
                                        profile?.isTwoFAEnabled ? 'border border-red-300 text-red-600 hover:bg-red-50' : 'bg-teal-600 text-white hover:bg-teal-700'
                                    }`}>
                                    {twoFALoading ? 'Processing...' : profile?.isTwoFAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                                </button>
                            </div>

                            {twoFAError && <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mt-3'>{twoFAError}</p>}

                            {showOtpInput && (
                                <form onSubmit={handleVerify2FAOtp} className='mt-4 pt-4 border-t border-gray-100 flex gap-2'>
                                    <input value={otp} onChange={(e) => setOtp(e.target.value)}
                                        placeholder='Enter OTP from your email'
                                        className='flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500' />
                                    <button type='submit' disabled={verifyingOtp}
                                        className='bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50'>
                                        {verifyingOtp ? 'Verifying...' : 'Confirm'}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* DELETE ACCOUNT */}
                        <div className='bg-white rounded-xl shadow-sm border border-red-100 p-6'>
                            <h3 className='font-semibold text-red-600 mb-2'>Delete Account</h3>
                            <p className='text-sm text-gray-500 mb-4'>This action cannot be undone. All your data will be permanently removed.</p>
                            <button 
                                onClick={() => setShowDeleteConfirm(true)}
                                className='border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 cursor-pointer transition'
                            >
                                Delete Account
                            </button>
                        </div>
                    </>
                )}

                <Modal 
                    isOpen={showDeleteConfirm} 
                    onClose={() => { setShowDeleteConfirm(false); setDeleteError(''); }} 
                    title='Delete Account'
                    titleClassName='text-teal-900'
                >
                    <p className='text-sm text-gray-600 mb-4'>
                        Are you sure you want to delete your account? This action is permanent and cannot be undone.
                    </p>
                    {deleteError && (
                        <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg mb-4'>{deleteError}</p>
                    )}
                    <div className='flex gap-3'>
                        <button 
                            onClick={() => setShowDeleteConfirm(false)}
                            className='flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 cursor-pointer transition'
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleDeleteAccount} 
                            disabled={deleting}
                            className='flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 cursor-pointer transition'
                        >
                            {deleting ? 'Deleting...' : 'Confirm Delete'}
                        </button>
                    </div>
                </Modal>
            </div>
        </DashboardLayout>
    );
};

export default Settings;