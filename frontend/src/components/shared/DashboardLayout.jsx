import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
    return (
        <div className='flex min-h-screen bg-gray-50'>
            <Sidebar />
            <div className='flex-1 flex flex-col'>
                <main className='flex-1 p-6'>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;