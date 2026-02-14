import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io } from 'socket.io-client';
import { fetchPublicSettings, PublicSettings } from '../services/settingsApi';
import { SOCKET_ORIGIN } from '../config/apiConfig';

interface SettingsContextType {
    settings: PublicSettings | null;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useState<PublicSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const loadSettings = async () => {
        try {
            console.log('Fetching public settings...');
            const data = await fetchPublicSettings();
            console.log('Public settings loaded:', data);
            setSettings(data);
            setLoading(false);

            // Apply theme color
            if (data.branding.primaryColor) {
                document.documentElement.style.setProperty('--primary-color', data.branding.primaryColor);
            }

            // Update page title
            if (data.siteName) {
                document.title = data.siteName;
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();

        // Socket.io connection for real-time updates
        const socket = io(SOCKET_ORIGIN, {
            transports: ['websocket', 'polling']
        });

        socket.on('MAINTENANCE_TOGGLE', (data: { enabled: boolean }) => {
            console.log('Maintenance mode socket event received:', data.enabled);
            setSettings(prev => {
                const updated = prev ? { ...prev, maintenanceMode: !!data.enabled } : {
                    // Fallback in case settings weren't loaded yet
                    siteName: document.title || 'エழத்திடு',
                    contactEmail: '',
                    maintenanceMode: !!data.enabled,
                    branding: { primaryColor: '#135bec' }
                };
                console.log('Updated settings state:', updated);
                return updated;
            });
        });

        // Refresh settings every 5 minutes as a fallback
        const interval = setInterval(loadSettings, 5 * 60 * 1000);
        return () => {
            clearInterval(interval);
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
