import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../../src/services/adminApi';
import AdminNotifications from './AdminNotifications';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Total Users"
                    value={stats?.stats?.totalUsers || 0}
                    icon="👥"
                    color="blue"
                />
                <StatCard
                    title="Active Users"
                    value={stats?.stats?.activeUsers || 0}
                    icon="✅"
                    color="green"
                />
                <StatCard
                    title="Banned Users"
                    value={stats?.stats?.bannedUsers || 0}
                    icon="🚫"
                    color="red"
                />
                <StatCard
                    title="Active Tournaments"
                    value={stats?.stats?.activeTournaments || 0}
                    icon="🏆"
                    color="yellow"
                />
                <StatCard
                    title="Average WPM"
                    value={stats?.stats?.avgWpm || 0}
                    icon="⚡"
                    color="purple"
                />
                <StatCard
                    title="Total Tournaments"
                    value={stats?.stats?.totalTournaments || 0}
                    icon="📊"
                    color="indigo"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
                    <h3 className="text-lg font-black mb-4">Recent Users</h3>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2 text-sm font-bold opacity-60">Name</th>
                                <th className="text-left py-2 text-sm font-bold opacity-60">Username</th>
                                <th className="text-left py-2 text-sm font-bold opacity-60">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.recentUsers?.map((user: any) => (
                                <tr key={user._id} className="border-b">
                                    <td className="py-3 text-sm">{user.name}</td>
                                    <td className="py-3 text-sm">{user.username}</td>
                                    <td className="py-3 text-sm opacity-60">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div>
                    <AdminNotifications />
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({
    title,
    value,
    icon,
    color,
}) => {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        red: 'bg-red-50 text-red-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        purple: 'bg-purple-50 text-purple-600',
        indigo: 'bg-indigo-50 text-indigo-600',
    };

    return (
        <div className={`${colors[color]} p-6 rounded-2xl`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{icon}</span>
                <span className="text-3xl font-black">{value}</span>
            </div>
            <p className="text-sm font-bold opacity-70">{title}</p>
        </div>
    );
};

export default AdminDashboard;
