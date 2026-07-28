import Footer from '../components/shared/Footer';

const TermsOfServicePage = () => {
    return (
        <div>
            <div className='max-w-4xl mx-auto px-6 py-16'>
                <h1 className='text-3xl font-bold text-teal-900 mb-6'>Terms of Service</h1>
                <p className='text-sm text-gray-400 mb-8'>Last updated: July 2026</p>
                <div className='space-y-8 text-gray-600 leading-relaxed'>
                    <div>
                        <h2 className='text-lg font-semibold text-teal-900 mb-2'>Acceptance of Terms</h2>
                        <p>
                            By creating an account and using Health Assistant, you agree to be bound by these
                            Terms of Service. If you do not agree with any part of these terms, please do not use
                            the platform.
                        </p>
                    </div>

                    <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-5'>
                        <h2 className='text-lg font-semibold text-teal-900 mb-2'>Medical Disclaimer</h2>
                        <p>
                            Health Assistant's AI symptom checker, medical term simplifier and doctor directory
                            are provided for informational and convenience purposes only. They are{' '}
                            <strong>not a substitute for professional medical advice, diagnosis or treatment</strong>.
                            Always seek the advice of a licensed physician or other qualified health provider with
                            any questions you may have regarding a medical condition. Never disregard professional
                            medical advice or delay seeking it because of information provided through this
                            platform. In case of a medical emergency, contact your local emergency services
                            immediately.
                        </p>
                    </div>

                    <div>
                        <h2 className='text-lg font-semibold text-teal-900 mb-2'>User Responsibilities</h2>
                        <p>
                            You agree to provide accurate and truthful information when registering and using the
                            platform, including health logs, appointment details and doctor credential
                            submissions. You are responsible for maintaining the confidentiality of your account
                            credentials and for all activity that occurs under your account. Misuse of the
                            platform, including submitting false medical credentials or abusing AI features, is
                            strictly prohibited.
                        </p>
                    </div>

                    <div>
                        <h2 className='text-lg font-semibold text-teal-900 mb-2'>Account Termination</h2>
                        <p>
                            Health Assistant reserves the right to suspend, block or permanently delete any
                            account found to be in violation of these terms, engaging in fraudulent activity or
                            misusing the platform in a way that could harm other users. Administrators may review
                            account activity as part of this process.
                        </p>
                    </div>

                    <div>
                        <h2 className='text-lg font-semibold text-teal-900 mb-2'>Limitation of Liability</h2>
                        <p>
                            Health Assistant is provided on an "as is" basis. To the fullest extent permitted by
                            law, we are not liable for any damages, medical outcomes or losses arising from the
                            use of this platform, including reliance on AI-generated content or information
                            provided by doctors listed on the platform. Use of the platform is at your own risk.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TermsOfServicePage;