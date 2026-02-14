import React, { useEffect, useState } from 'react';
import { getUserAnalytics, getPerformanceAnalytics } from '../../src/services/adminApi';

const AdminAnalytics: React.FC = () => {
    const [userGrowth, setUserGrowth] = useState<any[]>([]);
    const [performance, setPerformance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [userGrowthData, performanceData] = await Promise.all([
                    getUserAnalytics(days),
                    getPerformanceAnalytics(days),
                ]);
                setUserGrowth(userGrowthData);
                setPerformance(performanceData);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [days]);

    if (loading) {
        return <div className="text-center py-12">Loading analytics...</div>;
    }

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-black">Analytics Dashboard</h2>
                <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary outline-none"
                >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                </select>
            </div>

            {/* User Growth */}
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h3 className="text-lg font-black mb-4">User Growth</h3>
                <div className="space-y-2">
                    {userGrowth.length > 0 ? (
                        userGrowth.map((data) => (
                            <div key={data._id} className="flex justify-between items-center py-2 border-b">
                                <span className="text-sm font-bold">{data._id}</span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                                    +{data.count} users
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm opacity-60 text-center py-4">No data available</p>
                    )}
                </div>
            </div>

            {/* Performance Trends */}
            <div className="bg-white rounded-2xl shadow p-6">
                <h3 className="text-lg font-black mb-4">Performance Trends</h3>
                <div className="space-y-4">
                    {performance.length > 0 ? (
                        performance.map((data) => (
                            <div key={data._id} className="border-b pb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold">{data._id}</span>
                                    <span className="text-xs opacity-60">{data.count} tests</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-purple-50 p-3 rounded-lg">
                                        <p className="text-xs opacity-60 mb-1">Avg WPM</p>
                                        <p className="text-xl font-black text-purple-600">
                                            {Math.round(data.avgWpm)}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <p className="text-xs opacity-60 mb-1">Avg Accuracy</p>
                                        <p className="text-xl font-black text-green-600">
                                            {Math.round(data.avgAccuracy)}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm opacity-60 text-center py-4">No data available</p>
                    )}
                </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> For advanced charts, integrate Chart.js or Recharts library for visual data representation.
                </p>
            </div>
        </div>
    );
};

export default AdminAnalytics;
