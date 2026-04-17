import { useEffect, useState } from 'react';
import api from '../services/api';

const roleOptions = ['EMPLOYEE', 'TRAINER', 'ADMIN'];

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [savingId, setSavingId] = useState(null);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            setError(null);
            const [usersRes, statsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/stats')
            ]);

            setUsers(usersRes.data);
            setStats(statsRes.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId, nextRole) => {
        try {
            setSavingId(userId);
            setError(null);

            const { data } = await api.put(`/admin/users/${userId}/role`, { role: nextRole });
            setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: data.role } : u)));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update role');
        } finally {
            setSavingId(null);
        }
    };

    if (loading) return <div className="page-center">Loading...</div>;

    return (
        <div className="container dashboard-content">
            <h2 className="mb-6">Admin Dashboard</h2>

            {error && <div className="alert alert-error">{error}</div>}

            {stats && (
                <div className="grid grid-cols-4 mb-6">
                    <div className="card">
                        <p className="text-secondary">Total Users</p>
                        <h3>{stats.totalUsers}</h3>
                    </div>
                    <div className="card">
                        <p className="text-secondary">Total Trainings</p>
                        <h3>{stats.totalTrainings}</h3>
                    </div>
                    <div className="card">
                        <p className="text-secondary">Total Enrollments</p>
                        <h3>{stats.totalEnrollments}</h3>
                    </div>
                    <div className="card">
                        <p className="text-secondary">Open Trainings</p>
                        <h3>{stats.openTrainings}</h3>
                    </div>
                </div>
            )}

            <div className="card">
                <h3 className="mb-4">User Management</h3>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={{ padding: '0.75rem' }}>Name</th>
                                <th style={{ padding: '0.75rem' }}>Email</th>
                                <th style={{ padding: '0.75rem' }}>Role</th>
                                <th style={{ padding: '0.75rem' }}>Update</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '0.75rem' }}>{u.name}</td>
                                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <select
                                            className="input-field"
                                            style={{ maxWidth: '160px' }}
                                            value={u.role}
                                            onChange={(e) => handleRoleUpdate(u._id, e.target.value)}
                                            disabled={savingId === u._id}
                                        >
                                            {roleOptions.map((r) => (
                                                <option key={r} value={r}>{r}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>
                                        {savingId === u._id ? 'Saving...' : 'Ready'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
