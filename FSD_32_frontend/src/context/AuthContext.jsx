import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Hydrate user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        // Accept either full API response ({ success, message, token, user })
        // or a plain user object. Normalize to the user object.
        const normalized = userData?.user ? userData.user : userData;
        // Preserve token from API response so axios interceptor can use it
        if (userData?.token) {
            normalized.token = userData.token;
        }
        setUser(normalized);
        localStorage.setItem('user', JSON.stringify(normalized));
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
