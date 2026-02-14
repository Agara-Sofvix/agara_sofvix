import React, { useEffect, useState } from 'react';
import { deleteTournament, updateTournamentStatus } from '../../src/services/adminApi';
import { API_BASE } from '../../src/config/apiConfig';

const AdminTournaments: React.FC = () => {
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTournaments = async () => {
        try {
            const response = await fetch(`${API_BASE}/tournaments`);
            const data = await response.json();
            setTournaments(data);
        } catch (error) {
            console.error('Failed to fetch tournaments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await updateTournamentStatus(id, newStatus);
            fetchTournaments();
        } catch (error) {
            alert('Failed to update tournament status');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete tournament "${name}"?`)) return;

        try {
            await deleteTournament(id);
            fetchTournaments();
        } catch (error) {
            alert('Failed to delete tournament');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'live':
                return 'bg-green-100 text-green-600';
            case 'upcoming':
                return 'bg-blue-100 text-blue-600';
            case 'completed':
                return 'bg-gray-100 text-gray-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-black">Tournament Management</h2>
                <p className="text-sm opacity-60 mt-1">Manage tournament status and lifecycle</p>
            </div>

            <div className="space-y-4">
                {tournaments.length > 0 ? (
                    tournaments.map((tournament) => (
                        <div key={tournament._id} className="bg-white rounded-2xl shadow p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-black mb-2">{tournament.name}</h3>
                                    <div className="flex gap-2 items-center text-sm opacity-60">
                                        <span>🕐 {new Date(tournament.startTime).toLocaleString()}</span>
                                        <span>→</span>
                                        <span>{new Date(tournament.endTime).toLocaleString()}</span>
                                    </div>
                                </div>
                                <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(tournament.status)}`}>
                                    {tournament.status.toUpperCase()}
                                </span>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <select
                                    value={tournament.status}
                                    onChange={(e) => handleStatusChange(tournament._id, e.target.value)}
                                    className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-primary outline-none text-sm font-bold"
                                >
                                    <option value="upcoming">Upcoming</option>
                                    <option value="live">Live</option>
                                    <option value="completed">Completed</option>
                                </select>

                                <button
                                    onClick={() => handleDelete(tournament._id, tournament.name)}
                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100"
                                >
                                    Delete Tournament
                                </button>

                                <div className="flex-1 text-right">
                                    <span className="text-sm opacity-60">
                                        {tournament.participants?.length || 0} participants
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-2xl shadow p-12 text-center">
                        <p className="text-lg opacity-60">No tournaments found</p>
                        <p className="text-sm opacity-40 mt-2">Tournaments can be created through the main application</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTournaments;
