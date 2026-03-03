import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Tournaments from './pages/Tournaments';
import Users from './pages/Users';
import Leaderboards from './pages/Leaderboards';
import Content from './pages/Content';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import SEO from './pages/SEO';
import Advertisements from './pages/Advertisements';
import Login from './pages/Login'; // Enabled

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const basename = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin') ? '/admin' : '/';

  return (
    <div id="admin-root-container">
      <AuthProvider>
        <SettingsProvider>
          <BrowserRouter basename={basename}>
            <Routes>
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />

              <Route path="/" element={
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="tournaments" element={<Tournaments />} />
                <Route path="users" element={<Users />} />
                <Route path="leaderboards" element={<Leaderboards />} />
                <Route path="content" element={<Content />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="advertisements" element={<Advertisements />} />
                <Route path="settings" element={<Settings />} />
                <Route path="seo" element={<SEO />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SettingsProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
