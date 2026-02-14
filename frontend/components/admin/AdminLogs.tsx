import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '../../src/services/adminApi';

const AdminLogs: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);

    const fetchLogs = async () => {
        try {
            const data = await getAuditLogs({ page, limit: 20 });
            setLogs(data.logs);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const getActionColor = (action: string) => {
        if (action.includes('DELETE')) return 'bg-red-100 text-red-600';
        if (action.includes('CREATE') || action.includes('ADD')) return 'bg-green-100 text-green-600';
        if (action.includes('UPDATE') || action.includes('BAN')) return 'bg-yellow-100 text-yellow-600';
        return 'bg-blue-100 text-blue-600';
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div>
            <div className="bg-white rounded-2xl shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left py-4 px-6 text-sm font-bold">Timestamp</th>
                            <th className="text-left py-4 px-6 text-sm font-bold">Admin</th>
                            <th className="text-left py-4 px-6 text-sm font-bold">Action</th>
                            <th className="text-left py-4 px-6 text-sm font-bold">Target</th>
                            <th className="text-left py-4 px-6 text-sm font-bold">IP Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log._id} className="border-t">
                                <td className="py-4 px-6 text-sm opacity-60">
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className="py-4 px-6 text-sm">
                                    {log.admin?.name || 'System'}
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getActionColor(log.action)}`}>
                                        {log.action.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-sm">
                                    {log.targetType}
                                </td>
                                <td className="py-4 px-6 text-sm opacity-60">
                                    {log.ipAddress || 'N/A'}
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

export default AdminLogs;
