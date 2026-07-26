import Footer from '../components/shared/Footer';

const AboutPage = () => {
    return (
        <div>
            <div className='max-w-4xl mx-auto px-6 py-16'>
                <h1 className='text-3xl font-bold text-teal-900 mb-6'>About Health Assistant</h1>
                <div className='space-y-4 text-gray-600 leading-relaxed'>
                    <p>
                        Health Assistant is a healthcare platform designed to connect patients with verified
                        doctors, simplify appointment booking and support everyday health management. Patients
                        can browse a directory of admin-verified doctors, search by specialty or location, book
                        and manage appointments, track health logs, set medicine reminders, upload prescriptions
                        for instant text extraction and use an AI-powered assistant to better understand
                        symptoms and prepare for doctor visits.
                    </p>
                    <p>
                        This platform was built as a course project for CSE470 (Software Engineering) at BRAC
                        University. It was developed to demonstrate a complete, production-style full-stack
                        application — covering secure authentication, role-based access control, file handling,
                        third-party API integration and real-world healthcare workflows, all built from the
                        ground up.
                    </p>
                    <p>
                        Under the hood, Health Assistant is built with React and Tailwind CSS on the frontend
                        and Node.js with Express on the backend. Data is stored in MongoDB, authentication is
                        handled with JWT and two-factor verification, prescription scanning uses OCR technology
                        and the AI assistant features are powered by large language model APIs.
                    </p>
                    <p>
                        Health Assistant was designed and built by Md. Shawon Hossain. You can find more of his
                        work on{' '}
                        <a
                            href="https://github.com/devbyshawon"
                            target="_blank"
                            rel="noreferrer"
                            className='text-teal-600 hover:underline'
                        >
                            GitHub
                        </a>.
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AboutPage;