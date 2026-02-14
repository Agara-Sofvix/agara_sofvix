import React, { useEffect, useState } from 'react';
import { getUsers, deleteUser, toggleUserBan } from '../../src/services/adminApi';

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);

    const fetchUsers = async () => {
        try {
            const data = await getUsers({ page, search, limit: 10 });
            setUsers(data.users);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, search]);

    const handleDelete = async (id: string, username: string) => {
        if (!confirm(`Are you sure you want to delete user "${username}"?`)) return;

        try {
            await deleteUser(id);
            fetchUsers();
        } catch (error) {
            alert('Failed to delete user');
        }
    };

    const handleToggleBan = async (id: string, username: string, isBanned: boolean) => {
        try {
            await toggleUserBan(id);
            fetchUsers();
        } catch (error) {
            alert('Failed to update user');
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary outline-none w-96"
                />
                <div className="text-sm opacity-60">
                    Total: {pagination?.total || 0} users
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left py-4 px-6 text-sm font-bold">Name</th>
                            <th className="text-left py-4 px-6 text-sm font-bold">Username</th>
                            <th className="text-left py-4 px-6 text-sm font-bold">Email</th>
                            <th className="text-left py-4 px-6 text-sm font-bold">Status</th>
                            <th className="text-left py-4 px-6 text-sm font-bold">Joined</th>
                            <th className="text-left py-4 px-6 text-sm font-bold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id} className="border-t">
                                <td className="py-4 px-6 text-sm">{user.name}</td>
                                <td className="py-4 px-6 text-sm">{user.username}</td>
                                <td className="py-4 px-6 text-sm">{user.email}</td>
                                <td className="py-4 px-6">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.isBanned ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        {user.isBanned ? 'Banned' : 'Active'}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-sm opacity-60">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleToggleBan(user._id, user.username, user.isBanned)}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold ${user.isBanned ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'}`}
                                        >
                                            {user.isBanned ? 'Unban' : 'Ban'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user._id, user.username)}
                                            className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="px-4 py-2 bg-white rounded-lg font-bold text-sm disabled:opacity-30"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm">
                        Page {page} of {pagination.pages}
                    </span>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === pagination.pages}
                        className="px-4 py-2 bg-white rounded-lg font-bold text-sm disabled:opacity-30"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
