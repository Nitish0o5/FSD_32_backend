import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'EMPLOYEE'
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', formData);
            login(data);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-center">
            <div className="glass-panel auth-card">
                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p>Join TrainHub to manage your learning</p>
                </div>
                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="input-field"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="input-field"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@company.com"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="input-field"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Account Type</label>
                        <select
                            name="role"
                            className="input-field"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="EMPLOYEE">Employee (Learn)</option>
                            <option value="TRAINER">Trainer (Teach)</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-center mt-4">
                    Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)' }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
