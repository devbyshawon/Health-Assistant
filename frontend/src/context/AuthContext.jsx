import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);


const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

    const login = (userData, newToken) => {
        setToken(newToken);
        setUser(userData);

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setToken(null);
        setUser(null);

        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const isAdmin = user?.role === 'admin';
    const isDoctor = user?.role === 'doctor';
    const isPatient = user?.role === 'user';

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAdmin, isDoctor, isPatient }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

// eslint-disable-next-line react-refresh/only-export-components
export { AuthContext, AuthProvider, useAuth};