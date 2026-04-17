import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div className="page-center text-center">Loading...</div>;

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" />; // Redirect to home/dashboard if not authorized
    }

    return children;
};

export default ProtectedRoute;
