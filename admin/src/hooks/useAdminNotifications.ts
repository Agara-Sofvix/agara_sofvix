import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { ADMIN_API_URL, SOCKET_ORIGIN } from '../config/apiConfig';

// Define the interface for SystemEvent
export interface SystemEvent {
    _id: string;
    type: string;
    title: string;
    description: string;
    metadata?: any;
    read: boolean;
    createdAt: string;
}

export const useAdminNotifications = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState<SystemEvent[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState<Socket | null>(null);

    // Initial fetch of events
    const fetchEvents = useCallback(async () => {
        if (!user?.token) return;

        try {
            const response = await fetch(`${ADMIN_API_URL}/events`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            if (response.ok) {
                const json = await response.json();
                const eventsData = json.data || [];
                setEvents(eventsData);
                setUnreadCount(eventsData.filter((e: SystemEvent) => !e.read).length);
            }
        } catch (error) {
            console.error('Failed to fetch admin events:', error);
        }
    }, [user?.token]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Socket connection
    useEffect(() => {
        if (!user?.token) return;

        // Connect to the backend socket server
        // Assuming backend runs on port 5001 based on previous interactions
        const newSocket = io(SOCKET_ORIGIN, {
            auth: {
                token: user.token
            }
        });

        newSocket.on('connect', () => {
            console.log('Admin socket connected');
            newSocket.emit('join_admin');
        });

        newSocket.on('system_event', (newEvent: SystemEvent) => {
            console.log('New system event received:', newEvent);
            setEvents(prev => [newEvent, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Optional: Play a sound or show browser notification
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user?.token]);

    const markAsRead = async () => {
        // Optimistic update
        const updatedEvents = events.map(e => ({ ...e, read: true }));
        setEvents(updatedEvents);
        setUnreadCount(0); // This ensures red dot disappears immediately

        // API call to mark all as read
        try {
            await fetch(`${ADMIN_API_URL}/events/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    return { events, unreadCount, markAsRead };
};
