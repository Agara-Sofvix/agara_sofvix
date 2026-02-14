import { useState, useEffect, useCallback } from 'react';
import { getNotifications, markNotificationsAsRead } from '../src/services/api';

export interface Notification {
    _id: string;
    title: string;
    description: string;
    createdAt: string;
    tag?: 'Update' | 'Exam' | 'New' | 'Notice';
}

export const useNotifications = (isLoggedIn: boolean, lastReadAt?: string | Date) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getNotifications();
            setNotifications(data);

            if (isLoggedIn && lastReadAt) {
                const lastRead = new Date(lastReadAt).getTime();
                const unread = data.filter((n: Notification) => new Date(n.createdAt).getTime() > lastRead).length;
                setUnreadCount(unread);
            } else {
                // Guest mode or no lastReadAt
                const localLastRead = localStorage.getItem('lastNotificationReadAt');
                if (localLastRead) {
                    const lastRead = new Date(localLastRead).getTime();
                    const unread = data.filter((n: Notification) => new Date(n.createdAt).getTime() > lastRead).length;
                    setUnreadCount(unread);
                } else {
                    // If no lastReadAt, assume everything since last visit? Or show all?
                    // Let's default to showing all unread if never read before
                    setUnreadCount(data.length);
                }
            }
        } catch (err) {
            console.error("Failed to load notifications", err);
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn, lastReadAt]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = async () => {
        try {
            if (isLoggedIn) {
                const token = localStorage.getItem('token');
                if (token) {
                    const res = await markNotificationsAsRead(token);
                    setUnreadCount(0);
                    return res.lastNotificationReadAt;
                }
            } else {
                // Guest mode - use local storage
                const now = new Date().toISOString();
                localStorage.setItem('lastNotificationReadAt', now);
                setUnreadCount(0);
                return now;
            }
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        refresh: fetchNotifications
    };
};
