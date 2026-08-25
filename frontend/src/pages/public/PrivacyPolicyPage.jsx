import Footer from '../../components/shared/Footer';

const PrivacyPolicyPage = () => {
    return (
        <div>
            <div className='max-w-4xl mx-auto px-6 py-16'>
                <h1 className='text-3xl font-bold text-teal-900 mb-6'>Privacy Policy</h1>
                <p className='text-sm text-gray-400 mb-8'>Last updated: July 2026</p>

                <div className='space-y-8 text-gray-600 leading-relaxed'>
                    <div>
                        <h2 className='text-lg font-semibold text-teal-900 mb-2'>Information We Collect</h2>
                        <p>
                            When you use Health Assistant, we collect information you provide directly, including
                            your name, username, email address and password. Depending on how you use the
                            platform, we may also collect health-related information such as symptoms, vitals
                            and notes you log yourself, appointment details, uploaded prescription files and
                            messages exchanged with our AI assistant features.
                        </p>
                    </div>

                    <div>
                        <h2 className='text-lg font-semibold text-teal-900 mb-2'>How We Use Your Information</h2>
                        <p>
                            Your information is used to provide core platform functionality — creating and
                            securing your account, connecting patients with doctors, processing appointment
                            bookings, generating AI-powered health insights and sending you relevant
                            notifications such as appointment reminders and verification updates.
                        </p>
                    </div>

                    <div>
                        <h2 className='text-lg font-semibold text-teal-900 mb-2'>Data Security</h2>
                        <p>
                            Passwords are never stored in plain text — they are hashed using industry-standard
                            encryption before being saved. Access to your account is protected using JSON Web
                            Tokens (JWT), with optional two-factor authentication for an extra layer of security.
                            We do not sell, rent or share your personal information with third parties for
                            marketing purposes.
                        </p>
                    </div>

                    <div>
                        <h2 className='text-lg font-semibold text-teal-900 mb-2'>Your Rights</h2>
                        <p>
                            You are in control of your data. You may update your profile information at any time
                            and you may permanently delete your account and associated data through your account
                            settings whenever you choose.
                        </p>
                    </div>

                    <div>
                        <h2 className='text-lg font-semibold text-teal-900 mb-2'>Contact</h2>
                        <p>
                            If you have any questions about this Privacy Policy or how your data is handled,
                            please reach out to us at{' '}
                            <a href="mailto:support.healthassistant@gmail.com" className='text-gray-900 hover:underline'>
                                support.healthassistant@gmail.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PrivacyPolicyPage;