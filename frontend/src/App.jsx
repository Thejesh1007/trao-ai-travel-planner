import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// ProtectedRoute: if user is not logged in, redirect to login
// Used to guard the dashboard route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Still checking localStorage — don't redirect yet
  if (loading) return null;

  // Not logged in → send to login page
  if (!user) return <Navigate to="/login" />;

  // Logged in → show the actual page
  return children;
};

const App = () => {
  return (
    <Routes>
      {/* Default route → go to dashboard (which will redirect to login if not authed) */}
      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Dashboard is protected — only accessible when logged in */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;