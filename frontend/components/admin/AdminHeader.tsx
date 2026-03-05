import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { getSystemEvents } from '../../src/services/adminApi';
import { useAdmin } from '../../src/context/AdminContext';
import { SOCKET_ORIGIN } from '../../src/config/apiConfig';

interface SystemEvent {
    _id: string;
    type: string;
    title: string;
    description: string;
    createdAt: string;
    read: boolean;
}

interface AdminHeaderProps {
    title: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title }) => {
    const { admin, logout } = useAdmin();
    const [events, setEvents] = useState<SystemEvent[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getSystemEvents();
                setEvents(data);
                // Simple unread count for now (assuming all fetched are unread or we filter)
                // In a real app, we'd check 'read' status. 
                // Let's assume the top 5 are "new" for demo or check date.
                // Or just count all for now.
                setUnreadCount(data.filter((e) => !e.read).length);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            }
        };

        fetchEvents();

        const token = localStorage.getItem('adminToken');
        const socket = io(SOCKET_ORIGIN, {
            auth: { token }
        });
        socket.emit('join_admin');

        socket.on('system_event', (newEvent: SystemEvent) => {
            setEvents((prev) => [newEvent, ...prev]);
            setUnreadCount((prev) => prev + 1);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} mins ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        return date.toLocaleDateString();
    };

    return (
        <header className="bg-white shadow-sm p-6 mb-6 flex justify-between items-center relative z-20">
            <h2 className="text-2xl font-black capitalize">{title}</h2>

            <div className="flex items-center gap-6">
                {/* Notification Bell */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-600 text-2xl">notifications</span>
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </button>

                    {/* Dropdown */}
                    {isOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#1a1d21] text-white rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <div className="p-4 border-b border-gray-700/50 flex justify-between items-center">
                                <h3 className="font-bold text-sm">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full">New</span>
                                )}
                            </div>

                            <div className="max-h-[400px] overflow-y-auto">
                                {events.length === 0 ? (
                                    <div className="p-12 text-center flex flex-col items-center opacity-50">
                                        <span className="material-symbols-outlined text-4xl mb-2">notifications_off</span>
                                        <p className="text-sm font-bold">No new notifications</p>
                                    </div>
                                ) : (
                                    events.slice(0, 10).map((event) => (
                                        <div key={event._id} className="p-4 border-b border-gray-700/30 hover:bg-white/5 transition-colors cursor-pointer">
                                            <p className="text-sm font-medium mb-1">{event.title}</p>
                                            <p className="text-xs text-gray-400 mb-2">{event.description}</p>
                                            <p className="text-[10px] text-gray-500">{formatTime(event.createdAt)}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-3 bg-[#131619] border-t border-gray-700/50 text-center">
                                <button className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider">
                                    Mark all as read
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-6 border-l">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gray-900">{admin?.name}</p>
                        <p className="text-xs text-gray-500">{admin?.email}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
