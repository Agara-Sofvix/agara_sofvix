import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search,
    Slash,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Eye,
    X,
    Trophy,
    Keyboard,
    Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { ADMIN_API_URL } from '../config/apiConfig';

interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    isBanned: boolean;
    createdAt: string;
    avgWpm?: number;
    accuracy?: number;
    tournamentsJoined?: number;
}

interface UserStats {
    totalUsers: number;
    activeToday: number;
    newThisWeek: number;
    reportedIssues: number;
}

const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<UserStats>({
        totalUsers: 0,
        activeToday: 0,
        newThisWeek: 0,
        reportedIssues: 0
    });
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    // Detail Modal State
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [page, search]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
            const token = user.token;
            const response = await axios.get(`${ADMIN_API_URL}/users/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const statsData = response.data?.data || {};
            setStats(statsData);
            setTotalUsers(statsData.totalUsers || 0);
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
            const token = user.token;

            const response = await axios.get(`${ADMIN_API_URL}/users?page=${page}&limit=10&search=${search}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const usersData = response.data?.data || {};
            setUsers(usersData.users || []);
            setTotalPages(usersData.pagination?.pages || 1);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDetails = async (userId: string) => {
        setDetailLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
            const token = user.token;
            const response = await axios.get(`${ADMIN_API_URL}/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedUser(response.data.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleBanToggle = async (userId: string, currentStatus: boolean) => {
        // Optimistic update
        setUsers(users.map(u => u._id === userId ? { ...u, isBanned: !currentStatus } : u));

        try {
            const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
            const token = user.token;
            await axios.put(`${ADMIN_API_URL}/users/${userId}/ban`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Error toggling ban:', error);
            // Revert on error
            setUsers(users.map(u => u._id === userId ? { ...u, isBanned: currentStatus } : u));
            alert('Failed to update user status.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">User Management</h2>
                    <p className="text-slate-500 mt-1">Oversee player accounts, performance metrics, and platform access.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#1a1d21] p-4 rounded-xl border border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Users</p>
                    <h3 className="text-xl font-bold mt-1 text-white">{stats.totalUsers}</h3>
                </div>
                <div className="bg-[#1a1d21] p-4 rounded-xl border border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Today</p>
                    <h3 className="text-xl font-bold mt-1 text-green-500">{stats.activeToday}</h3>
                </div>
                <div className="bg-[#1a1d21] p-4 rounded-xl border border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">New This Week</p>
                    <h3 className="text-xl font-bold mt-1 text-blue-500">{stats.newThisWeek}</h3>
                </div>
                <div className="bg-[#1a1d21] p-4 rounded-xl border border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reported Issues</p>
                    <h3 className="text-xl font-bold mt-1 text-red-500">{stats.reportedIssues}</h3>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                    type="text"
                    placeholder="Search users by name, email..."
                    className="w-full pl-10 pr-4 py-2 bg-[#1a1d21] border border-slate-800 rounded-lg text-sm text-slate-300 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-slate-600"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="bg-[#1a1d21] rounded-lg border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#1e2227] border-b border-slate-800">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">User</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Email</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Joined Date</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={5} className="p-6 text-center text-slate-500">Loading...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={5} className="p-6 text-center text-slate-500">No users found.</td></tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-[#1e293b] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                                                    <span className="text-lg font-bold text-slate-400 group-hover:text-blue-500 transition-colors">{user.name.charAt(0).toUpperCase()}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-200">{user.name}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase">@{user.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">{user.email}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-400">
                                            {(() => {
                                                try {
                                                    return format(new Date(user.createdAt), 'MMM d, yyyy');
                                                } catch (e) {
                                                    return 'Unknown Date';
                                                }
                                            })()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.isBanned ? (
                                                <span className="px-2.5 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-full">Banned</span>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-widest rounded-full">Active</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => fetchUserDetails(user._id)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-500 hover:text-blue-500 transition-all border border-transparent hover:border-slate-700"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleBanToggle(user._id, user.isBanned)}
                                                    className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700 ${user.isBanned ? 'text-red-500 hover:text-green-500' : 'text-slate-500 hover:text-red-500'}`}
                                                    title={user.isBanned ? "Unban User" : "Ban User"}
                                                >
                                                    {user.isBanned ? <CheckCircle size={16} /> : <Slash size={16} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 border-t border-slate-800 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, totalUsers)} of {totalUsers} players
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="w-8 h-8 flex items-center justify-center rounded border border-slate-700 text-slate-400 hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-xs font-bold px-2 text-slate-400">{page} / {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="w-8 h-8 flex items-center justify-center rounded border border-slate-700 text-slate-400 hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#1a1d21] border border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
                        {/* Sidebar info */}
                        <div className="w-full md:w-80 bg-[#1e2227] p-8 border-b md:border-b-0 md:border-r border-slate-800">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full bg-blue-500/10 border-4 border-slate-800 flex items-center justify-center mb-4">
                                    <span className="text-4xl font-black text-blue-500">{selectedUser.user?.name?.charAt(0).toUpperCase() || '?'}</span>
                                </div>
                                <h3 className="text-xl font-bold text-white">{selectedUser.user?.name || 'Unknown User'}</h3>
                                <p className="text-xs text-slate-500 uppercase font-black tracking-widest mt-1">@{selectedUser.user?.username || 'user'}</p>

                                <div className="w-full mt-8 space-y-4">
                                    <div className="bg-[#1a1d21] p-3 rounded-xl border border-slate-800">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Email Address</p>
                                        <p className="text-sm text-slate-300 mt-1 truncate">{selectedUser.user.email}</p>
                                    </div>
                                    <div className="bg-[#1a1d21] p-3 rounded-xl border border-slate-800">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Member Since</p>
                                        <p className="text-sm text-slate-300 mt-1">
                                            {(() => {
                                                try {
                                                    return selectedUser.user?.createdAt ? format(new Date(selectedUser.user.createdAt), 'MMMM d, yyyy') : 'N/A';
                                                } catch (e) {
                                                    return 'Unknown Date';
                                                }
                                            })()}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="mt-12 w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                                >
                                    Close Portal
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-8 overflow-y-auto">
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Activity size={20} className="text-blue-500" />
                                    Performance Metrics
                                </h4>
                                <button onClick={() => setSelectedUser(null)} className="text-slate-500 hover:text-white p-2">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-[#1e2227] p-5 rounded-2xl border border-slate-800 relative group overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                                        <Trophy size={48} className="text-blue-500" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest relative z-10">Tournament Rank</p>
                                    <p className="text-3xl font-black text-white mt-2 relative z-10">
                                        {selectedUser.tournamentResults?.length || 0}
                                        <span className="text-xs text-slate-500 ml-2 font-normal">Entries</span>
                                    </p>
                                </div>
                                <div className="bg-[#1e2227] p-5 rounded-2xl border border-slate-800 relative group overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                                        <Keyboard size={48} className="text-emerald-500" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest relative z-10">Avg Speed</p>
                                    <p className="text-3xl font-black text-emerald-500 mt-2 relative z-10">
                                        {selectedUser.tournamentResults?.length > 0
                                            ? Math.round(selectedUser.tournamentResults.reduce((acc: any, r: any) => acc + r.wpm, 0) / selectedUser.tournamentResults.length)
                                            : 0}
                                        <span className="text-xs text-slate-500 ml-2 font-normal">WPM</span>
                                    </p>
                                </div>
                            </div>

                            {/* Results Table */}
                            <div className="space-y-6">
                                <div>
                                    <h5 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Recent Tournament Runs</h5>
                                    {selectedUser.tournamentResults?.length === 0 ? (
                                        <div className="p-8 text-center bg-slate-800/20 rounded-2xl border border-dashed border-slate-800 text-slate-600 text-xs italic">
                                            No tournament participation registered yet.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedUser.tournamentResults.map((result: any) => (
                                                <div key={result._id} className="flex items-center justify-between p-4 bg-[#1e2227] rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                            <Trophy size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-200">{result.tournament?.name || 'Tournament'}</p>
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                                                                {(() => {
                                                                    try {
                                                                        return result.createdAt ? format(new Date(result.createdAt), 'MMM d, h:mm a') : 'Recent';
                                                                    } catch (e) {
                                                                        return 'Recent';
                                                                    }
                                                                })()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-4">
                                                            <div>
                                                                <p className="text-xs font-black text-white">{result.wpm}</p>
                                                                <p className="text-[8px] text-slate-600 uppercase font-black">WPM</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black text-emerald-500">{result.accuracy}%</p>
                                                                <p className="text-[8px] text-slate-600 uppercase font-black">ACC</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h5 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Practice Session History</h5>
                                    {selectedUser.typingResults?.length === 0 ? (
                                        <div className="p-8 text-center bg-slate-800/20 rounded-2xl border border-dashed border-slate-800 text-slate-600 text-xs italic">
                                            No practice sessions recorded.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedUser.typingResults.map((result: any) => (
                                                <div key={result._id} className="flex items-center justify-between p-4 bg-[#1e2227] rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                            <Keyboard size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-200 truncate w-32">{result.text?.substring(0, 20)}...</p>
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                                                                {(() => {
                                                                    try {
                                                                        return result.createdAt ? format(new Date(result.createdAt), 'MMM d, h:mm a') : 'Recent';
                                                                    } catch (e) {
                                                                        return 'Recent';
                                                                    }
                                                                })()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-4">
                                                            <div>
                                                                <p className="text-xs font-black text-white">{result.wpm}</p>
                                                                <p className="text-[8px] text-slate-600 uppercase font-black">WPM</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black text-emerald-500">{result.accuracy}%</p>
                                                                <p className="text-[8px] text-slate-600 uppercase font-black">ACC</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;

