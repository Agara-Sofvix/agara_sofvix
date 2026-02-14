import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getSystemEvents } from '../../src/services/adminApi';
import { SOCKET_ORIGIN } from '../../src/config/apiConfig';

interface SystemEvent {
    _id: string;
    type: string;
    title: string;
    description: string;
    createdAt: string;
}

const AdminNotifications: React.FC = () => {
    const [events, setEvents] = useState<SystemEvent[]>([]);

    useEffect(() => {
        // Fetch initial events
        const fetchEvents = async () => {
            try {
                const data = await getSystemEvents();
                setEvents(data);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            }
        };

        fetchEvents();

        // Socket.io connection
        const socket = io(SOCKET_ORIGIN);

        socket.emit('join_admin');

        socket.on('system_event', (newEvent: SystemEvent) => {
            setEvents((prev) => [newEvent, ...prev]);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'USER_SIGNUP': return '👤';
            case 'TOURNAMENT_REGISTER': return '🏆';
            case 'TOURNAMENT_END': return '🏁';
            case 'DAILY_LEADERBOARD': return '📊';
            case 'TEST_RESULT': return '📝';
            case 'TOURNAMENT_LEADERBOARD_UPDATE': return '📈';
            default: return '🔔';
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'USER_SIGNUP': return 'bg-blue-100 text-blue-800';
            case 'TOURNAMENT_REGISTER': return 'bg-yellow-100 text-yellow-800';
            case 'TOURNAMENT_END': return 'bg-red-100 text-red-800';
            case 'DAILY_LEADERBOARD': return 'bg-purple-100 text-purple-800';
            case 'TEST_RESULT': return 'bg-green-100 text-green-800';
            case 'TOURNAMENT_LEADERBOARD_UPDATE': return 'bg-indigo-100 text-indigo-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow p-6 h-[500px] flex flex-col">
            <h3 className="text-lg font-black mb-4">Recent Activity</h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {events.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                ) : (
                    events.map((event) => (
                        <div key={event._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0 ${getColor(event.type)}`}>
                                {getIcon(event.type)}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">{event.title}</h4>
                                <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                                <span className="text-[10px] text-gray-400 mt-2 block">
                                    {new Date(event.createdAt).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminNotifications;
