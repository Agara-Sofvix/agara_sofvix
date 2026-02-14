import React from 'react';
import { AdminProvider, useAdmin } from './src/context/AdminContext';
import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminUsers from './components/admin/AdminUsers';
import AdminContent from './components/admin/AdminContent';
import AdminLogs from './components/admin/AdminLogs';
import AdminTournaments from './components/admin/AdminTournaments';
import AdminAnalytics from './components/admin/AdminAnalytics';
import AdminLeaderboards from './components/admin/AdminLeaderboards';
import AdminSettings from './components/admin/AdminSettings';
import AdminAdvertisements from './components/admin/AdminAdvertisements';

const AdminApp: React.FC = () => {
    const { isAuthenticated } = useAdmin();
    const [currentPage, setCurrentPage] = React.useState('dashboard');

    if (!isAuthenticated) {
        return <AdminLogin />;
    }

    const renderPage = () => {
        switch (currentPage) {
            case 'users':
                return <AdminUsers />;
            case 'tournaments':
                return <AdminTournaments />;
            case 'content':
                return <AdminContent />;
            case 'analytics':
                return <AdminAnalytics />;
            case 'leaderboards':
                return <AdminLeaderboards />;
            case 'logs':
                return <AdminLogs />;
            case 'settings':
                return <AdminSettings />;
            case 'advertisements':
                return <AdminAdvertisements />;
            default:
                return <AdminDashboard />;
        }
    };

    return (
        <AdminLayout currentPage={currentPage} onNavigate={setCurrentPage}>
            {renderPage()}
        </AdminLayout>
    );
};

const AdminRoot: React.FC = () => {
    return (
        <AdminProvider>
            <AdminApp />
        </AdminProvider>
    );
};

export default AdminRoot;
