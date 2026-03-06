import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search,
    FileText,
    RefreshCw, // restart_alt alternative
    Flag,
    Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { ADMIN_API_URL, PUBLIC_API_URL } from '../config/apiConfig';

interface Tournament {
    _id: string;
    name: string;
    status: string;
}

interface LeaderboardEntry {
    _id: string;
    user: {
        _id: string;
        name: string;
        username: string;
        email: string;
    };
    tournament: {
        name: string;
    };
    wpm: number;
    accuracy: number;
    score: number;
    isSuspicious?: boolean;
    createdAt: string;
}

const Leaderboards = () => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [selectedTournament, setSelectedTournament] = useState<string>('global');
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchTournaments();
    }, []);

    useEffect(() => {
        fetchLeaderboard();
    }, [selectedTournament]);

    const fetchTournaments = async () => {
        try {
            // Fetch all tournaments for the filter dropdown
            const response = await axios.get(`${PUBLIC_API_URL}/tournaments`);
            setTournaments(response.data?.data || []);
        } catch (error) {
            console.error('Error fetching tournaments:', error);
        }
    };

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
            const token = user.token;

            let url = `${ADMIN_API_URL}/leaderboards`;
            if (selectedTournament !== 'global') {
                url += `?tournamentId=${selectedTournament}`;
            }

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setLeaderboard(response.data?.data || []);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            setLeaderboard([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteScore = async (resultId: string) => {
        if (!confirm('Are you sure you want to remove this score?')) return;

        try {
            const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
            const token = user.token;
            await axios.delete(`${ADMIN_API_URL}/leaderboards/${resultId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchLeaderboard(); // Refresh
        } catch (error) {
            console.error('Error deleting score:', error);
            alert('Failed to delete score.');
        }
    };

    const handleResetLeaderboard = async () => {
        const isGlobal = selectedTournament === 'global';
        const tournamentName = tournaments.find(t => t._id === selectedTournament)?.name || 'the Global Leaderboard';

        const warningMessage = isGlobal
            ? "CRITICAL WARNING: This will delete ALL scores across EVERY tournament in the system.\n\nThis will effectively wipe the entire dashboard's performance data.\n\nAre you absolutely sure you want to proceed?"
            : `WARNING: This will delete ALL scores for "${tournamentName}".\n\nThis action cannot be undone. Are you sure you want to proceed?`;

        if (!confirm(warningMessage)) return;

        try {
            const userString = localStorage.getItem('adminUser');
            if (!userString) {
                alert('Session expired. Please log in again.');
                return;
            }

            const user = JSON.parse(userString);
            const token = user.token;

            if (!token) {
                alert('Authentication failed. Please log in again.');
                return;
            }

            setLoading(true);
            console.log(`[Admin] Initiating reset for tournament: ${selectedTournament}`);
            const response = await axios.post(`${ADMIN_API_URL}/leaderboards/${selectedTournament}/reset`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                console.log('[Admin] Leaderboard reset success');
                await fetchLeaderboard();
                alert('Success: The tournament leaderboard has been wiped clean.');
            } else {
                throw new Error(response.data?.message || 'Failed to reset');
            }
        } catch (error: any) {
            console.error('[Admin] Reset failed:', error);
            const message = error.response?.data?.message || error.message || 'Unknown error';
            alert(`Error: Failed to reset leaderboard - ${message}`);
        } finally {
            setLoading(false);
        }
    };

    // Reset individual score (not used by the 2 buttons but part of leaderboard management)

    const handleExport = async () => {
        console.log('[Admin] Export to PDF clicked. Selected:', selectedTournament);

        try {
            const userString = localStorage.getItem('adminUser');
            if (!userString) {
                alert('Connection lost. Please log in again.');
                return;
            }

            const user = JSON.parse(userString);
            const token = user.token;

            if (!token) {
                alert('Your session has no valid token. Please log in again.');
                return;
            }

            const exportUrl = `${ADMIN_API_URL}/leaderboards/${selectedTournament}/export?token=${token}`;

            // Log for debugging
            console.log(`[Admin] Triggering PDF download via direct navigation: ${exportUrl}`);
            window.location.assign(exportUrl);

        } catch (error: any) {
            console.error('Export failed:', error);
            alert(`Failed to initiate export: ${error.message}`);
        }
    };

    const handleToggleFlag = async (resultId: string) => {
        try {
            const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
            const token = user.token;
            await axios.put(`${ADMIN_API_URL}/leaderboards/${resultId}/flag`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchLeaderboard(); // Refresh
        } catch (error) {
            console.error('Error toggling flag:', error);
            alert('Failed to toggle flag.');
        }
    };

    const filteredLeaderboard = leaderboard.filter(entry =>
        entry.user?.name.toLowerCase().includes(search.toLowerCase()) ||
        entry.user?.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Leaderboard Management</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage global rankings, monitor fair play, and analyze performance trends.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-1">View Type</label>
                        <select
                            className="bg-[#1a1d21] border-slate-800 rounded-lg text-xs font-semibold py-2 px-3 focus:ring-1 focus:ring-blue-500 text-slate-300 outline-none min-w-[180px]"
                            value={selectedTournament}
                            onChange={(e) => setSelectedTournament(e.target.value)}
                        >
                            <option value="global">Global Leaderboard</option>
                            <option disabled>──────────</option>
                            {tournaments.map(t => (
                                <option key={t._id} value={t._id}>{t.name} ({t.status})</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4 bg-[#1a1d21] p-4 rounded-xl border border-slate-800">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search players in ranking..."
                        className="w-full pl-10 pr-4 py-2 bg-[#0f1214] border border-slate-800 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all text-slate-300 placeholder-slate-600"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 flex items-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
                    >
                        <FileText size={16} />
                        Export to PDF
                    </button>
                    <button
                        onClick={handleResetLeaderboard}
                        className="px-4 py-2 flex items-center gap-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-sm font-medium transition-colors"
                    >
                        <RefreshCw size={16} />
                        Reset Data
                    </button>
                </div>
            </div>

            <div className="bg-[#1a1d21] rounded-xl border border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 bg-[#1e2227] flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-blue-500">
                        {selectedTournament === 'global' ? 'Global Ranking' : tournaments.find(t => t._id === selectedTournament)?.name || 'Tournament Ranking'}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Updated just now</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#1e2227] border-b border-slate-800">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Rank</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Player</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">WPM</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center">Accuracy</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Score</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center">Date</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={7} className="p-6 text-center text-slate-500">Loading...</td></tr>
                            ) : filteredLeaderboard.length === 0 ? (
                                <tr><td colSpan={7} className="p-6 text-center text-slate-500">No records found.</td></tr>
                            ) : (
                                filteredLeaderboard.map((entry, index) => (
                                    <tr key={entry._id} className={`hover:bg-[#1e293b] transition-colors ${entry.isSuspicious ? 'bg-orange-500/5' : ''}`}>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center justify-center w-7 h-7 rounded font-bold text-xs ${index < 3 ? 'bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/30' : 'bg-slate-800 text-slate-500'}`}>
                                                #{index + 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 font-bold">
                                                    {entry.user?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-semibold text-slate-200">{entry.user?.name || 'Unknown'}</p>
                                                        {entry.isSuspicious && (
                                                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter bg-orange-500/20 text-orange-500 border border-orange-500/30">
                                                                <Flag size={8} fill="currentColor" /> Suspicious
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 uppercase">@{entry.user?.username || 'unknown'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-bold text-blue-500">{entry.wpm}</span>
                                                <span className="text-[10px] text-slate-500 uppercase">WPM</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-semibold text-green-500">{entry.accuracy}%</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-bold text-slate-200">{entry.score}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-[10px] text-slate-500 font-medium">
                                            {(() => {
                                                try {
                                                    return format(new Date(entry.createdAt), 'MMM d, h:mm a');
                                                } catch (e) {
                                                    return 'N/A';
                                                }
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggleFlag(entry._id)}
                                                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${entry.isSuspicious ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'hover:bg-slate-800 text-slate-500 hover:text-orange-500'}`}
                                                    title={entry.isSuspicious ? "Unflag score" : "Flag suspicious score"}
                                                >
                                                    <Flag size={16} fill={entry.isSuspicious ? "currentColor" : "none"} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteScore(entry._id)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-500 hover:text-red-500 transition-all"
                                                    title="Remove from board"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Leaderboards;
