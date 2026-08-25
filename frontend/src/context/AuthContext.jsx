import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [doctorVerified, setDoctorVerified] = useState(null);

    useEffect(() => {
        if (user?.role === 'doctor') {
            api.get('/doctor/me')
                .then(res => setDoctorVerified(res.data.doctor?.credentials?.status === 'Verified'))
                .catch(() => setDoctorVerified(false));
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDoctorVerified(null);
        }
    }, [user]);

    const login = (userData, newToken) => {
        setToken(newToken);
        setUser(userData);

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        if (userData.role === 'doctor') {
            setDoctorVerified(null);
        }

    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setDoctorVerified(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const isAdmin = user?.role === 'admin';
    const isDoctor = user?.role === 'doctor';
    const isPatient = user?.role === 'user';

    const updateUser = (updatedFields) => {
        setUser(prev => {
            const newUser = { ...prev, ...updatedFields };
            localStorage.setItem('user', JSON.stringify(newUser));
            return newUser;
        });
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAdmin, isDoctor, isPatient, updateUser, doctorVerified }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

// eslint-disable-next-line react-refresh/only-export-components
export { AuthContext, AuthProvider, useAuth};