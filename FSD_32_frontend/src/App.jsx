import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthContext } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import TrainerDashboard from './pages/TrainerDashboard';
import CreateTraining from './pages/CreateTraining';
import EmployeeDashboard from './pages/EmployeeDashboard';
import MyEnrollments from './pages/MyEnrollments';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="page-center">Initializing...</div>;

  return (
    <div className="dashboard-layout">
      {user && <Navbar />}

      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

        {/* Dynamic Home Route based on Role */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {user?.role === 'TRAINER'
                ? <TrainerDashboard />
                : user?.role === 'ADMIN'
                  ? <AdminDashboard />
                  : <EmployeeDashboard />}
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Trainer Routes */}
        <Route
          path="/create-training"
          element={
            <ProtectedRoute roles={['TRAINER']}>
              <CreateTraining />
            </ProtectedRoute>
          }
        />

        {/* Employee Routes */}
        <Route
          path="/my-enrollments"
          element={
            <ProtectedRoute roles={['EMPLOYEE']}>
              <MyEnrollments />
            </ProtectedRoute>
          }
        />

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
