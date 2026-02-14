import React from 'react';
import { API_BASE } from '../config/apiConfig';

interface Admin {
    _id: string;
    name: string;
    email: string;
    token: string;
}

interface AdminContextType {
    admin: Admin | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AdminContext = React.createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [admin, setAdmin] = React.useState<Admin | null>(() => {
        const stored = localStorage.getItem('admin');
        return stored ? JSON.parse(stored) : null;
    });

    const login = async (email: string, password: string) => {
        const response = await fetch(`${API_BASE}/admin/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        localStorage.setItem('admin', JSON.stringify(data));
        setAdmin(data);
    };

    const logout = () => {
        localStorage.removeItem('admin');
        setAdmin(null);
    };

    return (
        <AdminContext.Provider value={{ admin, login, logout, isAuthenticated: !!admin }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = React.useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within AdminProvider');
    }
    return context;
};
