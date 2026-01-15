import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AllMembers from './pages/AllMembers';
import ExpiringMembers from './pages/ExpiringMembers';
import Statistics from './pages/Statistics';
import ActivityLogs from './pages/ActivityLogs';
import AdminTools from './pages/AdminTools';
import ExportPDF from './pages/ExportPDF';
import UserProfile from './pages/UserProfile';
import MemberDetail from './pages/MemberDetail';
import AddMember from './pages/AddMember';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute roles={['superadmin']}>
                <SuperAdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/members"
            element={
              <PrivateRoute roles={['superadmin']}>
                <AllMembers />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/add-member"
            element={
              <PrivateRoute roles={['superadmin']}>
                <AddMember />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/expiring"
            element={
              <PrivateRoute roles={['superadmin']}>
                <ExpiringMembers />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/statistics"
            element={
              <PrivateRoute roles={['superadmin']}>
                <Statistics />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <PrivateRoute roles={['superadmin']}>
                <ActivityLogs />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/tools"
            element={
              <PrivateRoute roles={['superadmin']}>
                <AdminTools />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/export"
            element={
              <PrivateRoute roles={['superadmin']}>
                <ExportPDF />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/members/:id"
            element={
              <PrivateRoute roles={['superadmin']}>
                <MemberDetail />
              </PrivateRoute>
            }
          />

          {/* User Routes */}
          <Route
            path="/profile"
            element={
              <PrivateRoute roles={['user', 'superadmin']}>
                <UserProfile />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
