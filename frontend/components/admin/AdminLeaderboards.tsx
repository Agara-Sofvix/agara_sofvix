import React, { useEffect, useState } from 'react';
import { API_BASE } from '../../src/config/apiConfig';

const AdminLeaderboards: React.FC = () => {
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [selectedTournament, setSelectedTournament] = useState<string>('');
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const response = await fetch(`${API_BASE}/tournaments`);
                const data = await response.json();
                setTournaments(data);
                if (data.length > 0) {
                    setSelectedTournament(data[0]._id);
                }
            } catch (error) {
                console.error('Failed to fetch tournaments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTournaments();
    }, []);

    useEffect(() => {
        if (selectedTournament) {
            fetchLeaderboard();
        }
    }, [selectedTournament]);

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/tournaments/${selectedTournament}/leaderboard`);
            const data = await response.json();
            setLeaderboard(data);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
            setLeaderboard([]);
        }
    };

    const handleRemoveScore = async (resultId: string) => {
        if (!confirm('Are you sure you want to remove this score?')) return;

        try {
            const admin = localStorage.getItem('admin');
            if (!admin) return;
            const { token } = JSON.parse(admin);

            await fetch(`${API_BASE}/admin/leaderboards/${resultId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            fetchLeaderboard();
        } catch (error) {
            alert('Failed to remove score');
        }
    };

    const handleResetLeaderboard = async () => {
        if (!confirm('Are you sure you want to reset the entire leaderboard? This cannot be undone!')) return;

        try {
            const admin = localStorage.getItem('admin');
            if (!admin) return;
            const { token } = JSON.parse(admin);

            await fetch(`http://localhost:5000/api/admin/leaderboards/${selectedTournament}/reset`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            fetchLeaderboard();
        } catch (error) {
            alert('Failed to reset leaderboard');
        }
    };

    const handleExport = () => {
        const admin = localStorage.getItem('admin');
        if (!admin) return;
        const { token } = JSON.parse(admin);

        window.open(
            `${API_BASE}/admin/leaderboards/${selectedTournament}/export?token=${token}`,
            '_blank'
        );
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black">Leaderboard Management</h2>
                    <p className="text-sm opacity-60 mt-1">View and manage tournament leaderboards</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        disabled={!selectedTournament}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 disabled:opacity-30"
                    >
                        📥 Export CSV
                    </button>
                    <button
                        onClick={handleResetLeaderboard}
                        disabled={!selectedTournament}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 disabled:opacity-30"
                    >
                        🔄 Reset Leaderboard
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <select
                    value={selectedTournament}
                    onChange={(e) => setSelectedTournament(e.target.value)}
                    className="w-full md:w-96 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none font-bold"
                >
                    {tournaments.map((t) => (
                        <option key={t._id} value={t._id}>
                            {t.name} ({t.status})
                        </option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-2xl shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left py-4 px-6 text-sm font-bold">Rank</th>
                            <th className="text-left py-4 px-6 text-sm font-bold">User</th>
                            <th className="text-left py-4 px-6 text-sm font-bold">WPM</th>
                            <th className="text-left py-4 px-6 text-sm font-bold">Accuracy</th>
                            <th className="text-left py-4 px-6 text-sm font-bold">Score</th>
                            <th className="text-left py-4 px-6 text-sm font-bold">Date</th>
                            <th className="text-left py-4 px-6 text-sm font-bold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.length > 0 ? (
                            leaderboard.map((entry, index) => (
                                <tr key={entry._id} className="border-t">
                                    <td className="py-4 px-6">
                                        <span className="text-xl font-black italic text-slate-400">
                                            {index + 1 < 10 ? `0${index + 1}` : index + 1}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm font-bold">
                                        {entry.user?.username || entry.user?.name || 'Unknown'}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-lg font-black text-primary">
                                            {entry.wpm}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm">
                                        {entry.accuracy}%
                                    </td>
                                    <td className="py-4 px-6 text-sm font-bold">
                                        {entry.score}
                                    </td>
                                    <td className="py-4 px-6 text-sm opacity-60">
                                        {new Date(entry.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-6">
                                        <button
                                            onClick={() => handleRemoveScore(entry._id)}
                                            className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="text-center py-12 opacity-60">
                                    No leaderboard entries yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminLeaderboards;
