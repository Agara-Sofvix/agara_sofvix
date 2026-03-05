import {
    Users,
    Zap,
    Calendar,
    Timer,
    MoreHorizontal,
    TrendingUp,
    Clock,
    UserPlus,
    AlertCircle,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Database,
    Globe
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from 'recharts';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { ADMIN_API_URL, PUBLIC_API_URL } from '../config/apiConfig';

interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    bannedUsers: number;
    activeTournaments: number;
    totalTournaments: number;
    avgWpm: number;
}

interface RecentUser {
    _id: string;
    name: string;
    username: string;
    createdAt: string;
}

interface ChartData {
    _id: string;
    count: number;
}

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        activeUsers: 0,
        bannedUsers: 0,
        activeTournaments: 0,
        totalTournaments: 0,
        avgWpm: 0
    });
    const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
    const [activeTournamentsList, setActiveTournamentsList] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDiagnosing, setIsDiagnosing] = useState(false);
    const [diagResult, setDiagResult] = useState<{ status: 'ok' | 'error' | null, message: string }>({ status: null, message: '' });

    useEffect(() => {
        const fetchDashboardData = async () => {
            setError(null);
            try {
                const userString = localStorage.getItem('adminUser');
                if (!userString) {
                    setError("No admin session found. Please login.");
                    setLoading(false);
                    return;
                }

                const user = JSON.parse(userString);
                const token = user.token;

                if (!token) {
                    setError("No valid token found. Please login again.");
                    setLoading(false);
                    return;
                }

                const [statsRes, analyticsRes, tournamentsRes] = await Promise.all([
                    axios.get(`${ADMIN_API_URL}/dashboard/stats`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${ADMIN_API_URL}/analytics/users?days=30`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${PUBLIC_API_URL}/tournaments`)
                ]);

                if (statsRes.data?.data?.stats) {
                    setStats(statsRes.data.data.stats);
                    setRecentUsers(statsRes.data.data.recentUsers || []);
                }

                // Format chart data with safety
                const analyticsData = analyticsRes.data?.data || [];
                const formattedChartData = (Array.isArray(analyticsData) ? analyticsData : []).map((item: ChartData) => {
                    try {
                        return {
                            name: item._id ? format(new Date(item._id), 'MMM d') : 'N/A',
                            value: item.count || 0
                        };
                    } catch (e) {
                        return { name: 'N/A', value: item.count || 0 };
                    }
                });
                setChartData(formattedChartData);

                // Filter for live tournaments for the dashboard table
                const tournamentsData = tournamentsRes.data?.data || [];
                const liveTournaments = (Array.isArray(tournamentsData) ? tournamentsData : []).filter((t: any) => t.status === 'live');
                setActiveTournamentsList(liveTournaments);

            } catch (err: any) {
                console.error("Failed to fetch dashboard stats", err);
                const msg = err.response?.data?.message || err.message || "Connection failed";
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const runDiagnostics = async () => {
        setIsDiagnosing(true);
        setDiagResult({ status: null, message: 'Testing backend connection...' });

        try {
            const start = Date.now();
            const rootUrl = PUBLIC_API_URL.startsWith('http')
                ? PUBLIC_API_URL.replace(/\/api\/?$/, '')
                : `${window.location.origin}/api`;
            const res = await axios.get(rootUrl, { timeout: 5000 });
            const latency = Date.now() - start;

            if (res.status === 200) {
                setDiagResult({
                    status: 'ok',
                    message: `Connection Successful! Backend reached in ${latency}ms.`
                });
            } else {
                setDiagResult({
                    status: 'error',
                    message: `Backend returned status ${res.status}. Expected 200.`
                });
            }
        } catch (err: any) {
            setDiagResult({
                status: 'error',
                message: `Connection Failed: ${err.message}. Ensure backend is reachable.`
            });
        } finally {
            setIsDiagnosing(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-wide">Dashboard Overview</h2>
                    <p className="text-slate-500 text-xs mt-1">Welcome back to Ezhuthidu. Here's what's happening with the platform today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={runDiagnostics}
                        disabled={isDiagnosing}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1d21] border border-slate-800 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:border-slate-700 hover:text-white transition-all disabled:opacity-50"
                    >
                        {isDiagnosing ? <RefreshCw size={12} className="animate-spin" /> : <Database size={12} />}
                        {isDiagnosing ? 'Diagnosing...' : 'Check Connection'}
                    </button>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-[#1a1d21] px-3 py-1.5 rounded border border-slate-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Live Status
                    </div>
                </div>
            </div>

            {diagResult.status && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${diagResult.status === 'ok'
                    ? 'bg-green-500/10 border-green-500/30 text-green-500'
                    : 'bg-red-500/10 border-red-500/30 text-red-500'
                    }`}>
                    {diagResult.status === 'ok' ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-1">
                            {diagResult.status === 'ok' ? 'System Reachable' : 'Connection Warning'}
                        </p>
                        <p className="text-sm opacity-90">{diagResult.message}</p>
                    </div>
                    <button
                        onClick={() => setDiagResult({ status: null, message: '' })}
                        className="ml-auto p-1 hover:bg-black/10 rounded"
                    >
                        <XCircle size={14} />
                    </button>
                </div>
            )}

            {error && !diagResult.status && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle size={18} className="shrink-0" />
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest">Dashboard Error</p>
                        <p className="text-sm opacity-80">{error}</p>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Users */}
                <div className="bg-[#1a1d21] p-5 rounded-lg border border-slate-800 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Users</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <h3 className="text-2xl font-bold text-white">{stats.totalUsers}</h3>
                                {/* Show 0% change if we don't have historical data for now */}
                                <span className="text-[10px] font-bold text-slate-500">--</span>
                            </div>
                            <p className="text-[9px] text-slate-600 mt-1 uppercase font-bold">Total Registered</p>
                        </div>
                        <div className="p-2 bg-slate-800/50 rounded text-slate-500">
                            <Users size={18} />
                        </div>
                    </div>
                </div>

                {/* Active Players */}
                <div className="bg-[#1a1d21] p-5 rounded-lg border border-slate-800 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Active Accounts</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <h3 className="text-2xl font-bold text-white">{stats.activeUsers}</h3>
                                <span className="text-[10px] font-bold text-green-500">Good Standing</span>
                            </div>
                            <p className="text-[9px] text-slate-600 mt-1 uppercase font-bold">Non-banned Users</p>
                        </div>
                        <div className="p-2 bg-slate-800/50 rounded text-slate-500">
                            <Zap size={18} />
                        </div>
                    </div>
                </div>

                {/* Active Tournaments */}
                <div className="bg-[#1a1d21] p-5 rounded-lg border border-slate-800 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Active Tournaments</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <h3 className="text-2xl font-bold text-white">{stats.activeTournaments}</h3>
                                <span className="text-[10px] font-bold text-blue-500">Live Now</span>
                            </div>
                            <p className="text-[9px] text-slate-600 mt-1 uppercase font-bold">Of {stats.totalTournaments} Total</p>
                        </div>
                        <div className="p-2 bg-slate-800/50 rounded text-slate-500">
                            <Calendar size={18} />
                        </div>
                    </div>
                </div>

                {/* Average WPM */}
                <div className="bg-[#1a1d21] p-5 rounded-lg border border-slate-800 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Average WPM</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <h3 className="text-2xl font-bold text-white">{stats.avgWpm}</h3>
                                <span className="text-[10px] font-bold text-green-500">Platform Wide</span>
                            </div>
                            <p className="text-[9px] text-slate-600 mt-1 uppercase font-bold">Global Average</p>
                        </div>
                        <div className="p-2 bg-slate-800/50 rounded text-slate-500">
                            <Timer size={18} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-[#1a1d21] rounded-lg border border-slate-800 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-sm font-bold text-white">User Growth Analytics</h4>
                        <select className="bg-[#0f1214] text-xs text-slate-400 border border-slate-800 rounded px-2 py-1 outline-none">
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-[250px] w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#64748b' }}
                                        dy={10}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '4px', fontSize: '12px' }}
                                        itemStyle={{ color: '#e2e8f0' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                                <TrendingUp className="mb-2 opacity-50" size={24} />
                                No growth data available yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-[#1a1d21] rounded-lg border border-slate-800 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-sm font-bold text-white">Recent Registrations</h4>
                        <button
                            onClick={() => navigate('/users')}
                            className="text-[10px] text-blue-500 font-bold hover:underline"
                        >
                            View All
                        </button>
                    </div>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {recentUsers.length === 0 ? (
                            <div className="py-8 text-center">
                                <UserPlus className="mx-auto mb-2 text-slate-600 opacity-50" size={24} />
                                <p className="text-xs text-slate-500">No recent signups found.</p>
                            </div>
                        ) : (
                            recentUsers.map(user => (
                                <div key={user._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/30 transition-colors group">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                            <span className="text-blue-500 font-bold text-sm">{user.name?.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <p className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">{user.name}</p>
                                            <p className="text-[10px] text-slate-600">@{user.username || 'user'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-slate-500 font-medium">
                                            {(() => {
                                                try {
                                                    return format(new Date(user.createdAt), 'MMM d');
                                                } catch (e) {
                                                    return 'Recent';
                                                }
                                            })()}
                                        </div>
                                        <div className="text-[8px] text-slate-700 uppercase font-bold tracking-tighter">New Base</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Active Tournaments - Keeping table structure but using stats for counts */}
            <div className="bg-[#1a1d21] rounded-lg border border-slate-800">
                <div className="p-6 border-b border-slate-800">
                    <h4 className="text-sm font-bold text-white">Active Tournaments</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#1e2227] border-b border-slate-800">
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Tournament Name</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Players</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Difficulty</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-400 text-xs">

                            {/* Hardcoded sample row for visualization, but using real counts where possible or removing if strict fairness needed */}
                            {activeTournamentsList.length > 0 ? (
                                activeTournamentsList.map((t) => (
                                    <tr key={t._id} className="hover:bg-[#1e293b] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center">
                                                    <Clock size={16} className="text-red-500" />
                                                </div>
                                                <span className="font-semibold text-white">{t.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-widest rounded">{t.status}</span>
                                        </td>
                                        <td className="px-6 py-4">{t.participants?.length || 0} Players</td>
                                        <td className="px-6 py-4 text-blue-400 font-bold">
                                            {t.difficulty || 'Medium'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <MoreHorizontal size={16} className="text-slate-600 cursor-pointer hover:text-white" />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No active tournaments found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
