import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { io } from 'socket.io-client';
import { fetchSettings } from '../services/settingsApi';
import type { Settings } from '../services/settingsApi';
import { SOCKET_ORIGIN } from '../config/apiConfig';

interface SettingsContextType {
    settings: Settings | null;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);

    const loadSettings = async () => {
        try {
            // Only try to fetch if we have an admin session
            const adminUser = localStorage.getItem('adminUser');
            if (!adminUser) {
                setLoading(false);
                return;
            }

            const data = await fetchSettings();
            setSettings(data);

            // Apply theme color
            if (data.branding?.primaryColor) {
                document.documentElement.style.setProperty('--primary-color', data.branding?.primaryColor);
            }
        } catch (error) {
            console.error('Failed to load admin settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();

        // Socket.io connection for real-time updates
        const adminUser = localStorage.getItem('adminUser');
        const token = adminUser ? JSON.parse(adminUser).token : null;

        const socket = io(SOCKET_ORIGIN, {
            transports: ['websocket', 'polling'],
            auth: { token }
        });

        socket.on('MAINTENANCE_TOGGLE', (data: { enabled: boolean }) => {
            console.log('Maintenance mode socket event received in admin:', data.enabled);
            setSettings(prev => prev ? { ...prev, maintenanceMode: !!data.enabled } : null);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings: loadSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
