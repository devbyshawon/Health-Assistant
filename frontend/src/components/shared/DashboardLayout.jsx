import Sidebar from './Sidebar';
import Footer from './Footer';

const DashboardLayout = ({ children, showFooter = false, hideSidebar = false }) => {
    return (
        <div className='min-h-screen flex flex-col bg-gray-50'>
            <div className='flex flex-1'>
                {!hideSidebar && <Sidebar />}
                <main className='flex-1 p-6'>
                    {children}
                </main>
            </div>
            {showFooter && <Footer />}
        </div>
    );
};

export default DashboardLayout;