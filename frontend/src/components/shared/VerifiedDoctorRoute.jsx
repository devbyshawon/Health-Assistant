import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const VerifiedDoctorRoute = () => {
    const { isDoctor, doctorVerified } = useAuth();

    if (!isDoctor) {
        return <Outlet />;
    }

    if (doctorVerified === null) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <p className='text-gray-400 text-sm'>Loading...</p>
            </div>
        );
    }

    if (!doctorVerified) {
        return <Navigate to="/doctor/upload-docs" replace />;
    }

    return <Outlet />;
};

export default VerifiedDoctorRoute;