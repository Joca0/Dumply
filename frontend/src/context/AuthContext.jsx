import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { profile } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const refreshUser = async () => {
        const token = localStorage.getItem('@dumply:token');
        if (!token) {
            setUser(null);
            navigate('/auth/login');
            return;
        }

        try {
            const res = await profile();
            setUser(res.data);
        } catch (err) {
            setUser(null);
            navigate('/auth/login');
        }
    };

    useEffect(() => {
        refreshUser().finally(() => setLoading(false));
    }, []);

    const logout = (reason) => {
        localStorage.removeItem('@dumply:token');
        setUser(null);
        if (reason === 'expired') {
            toast.warning("Sua sessão expirou faça login novamente para continuar.");
        }

        navigate('/auth/login');
    };

    useEffect(() => {
        const handler = (e) => logout(e.detail.reason);

        window.addEventListener('auth:logout', handler);

        return () => window.removeEventListener('auth:logout', handler);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    return context;
};