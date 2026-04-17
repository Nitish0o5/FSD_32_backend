import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (!user) return null; // Don't show navbar if not logged in

    return (
        <nav className="dashboard-nav">
            <div className="container nav-container">
                <Link to="/" className="nav-logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-primary)' }}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
                    TrainHub
                </Link>
                <div className="nav-links">
                    <span className="text-secondary" style={{ fontSize: '0.875rem' }}>
                        Hello, {user.name} ({user.role})
                    </span>
                    {user.role === 'TRAINER' ? (
                        <>
                            <Link to="/" className="nav-link">Dashboard</Link>
                            <Link to="/create-training" className="nav-link">Create Training</Link>
                        </>
                    ) : user.role === 'ADMIN' ? (
                        <>
                            <Link to="/" className="nav-link">Admin Dashboard</Link>
                            <Link to="/admin" className="nav-link">Manage Users</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/" className="nav-link">Trainings</Link>
                            <Link to="/my-enrollments" className="nav-link">My Enrollments</Link>
                        </>
                    )}
                    <button onClick={handleLogout} className="btn btn-secondary">
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
