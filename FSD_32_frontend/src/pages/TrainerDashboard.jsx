import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const TrainerDashboard = () => {
    const [trainings, setTrainings] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [enrollments, setEnrollments] = useState(null); // specific training enrollments
    const [activeTrainingId, setActiveTrainingId] = useState(null);
    const [editingTrainingId, setEditingTrainingId] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        startTime: '',
        seatLimit: ''
    });
    const [actionLoadingId, setActionLoadingId] = useState(null);

    useEffect(() => {
        fetchTrainings();
    }, []);

    const fetchTrainings = async () => {
        try {
            setError(null);
            const [trainingsRes, statsRes] = await Promise.all([
                api.get('/trainings/trainer'),
                api.get('/stats/dashboard')
            ]);
            setTrainings(trainingsRes.data);
            setStats(statsRes.data);
        } catch {
            setError('Failed to load your trainings');
        } finally {
            setLoading(false);
        }
    };

    const fetchEnrollments = async (id) => {
        setActiveTrainingId(id);
        setEnrollments(null); // start loading
        try {
            setError(null);
            const { data } = await api.get(`/enrollments/training/${id}`);
            setEnrollments(data);
        } catch {
            setError('Failed to fetch enrollments for this training');
        }
    };

    const toInputDateTime = (dateString) => {
        const date = new Date(dateString);
        const pad = (n) => String(n).padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const startEdit = (training) => {
        setEditingTrainingId(training._id);
        setEditForm({
            title: training.title,
            description: training.description,
            startTime: toInputDateTime(training.startTime),
            seatLimit: String(training.seatLimit)
        });
        setError(null);
    };

    const cancelEdit = () => {
        setEditingTrainingId(null);
        setEditForm({ title: '', description: '', startTime: '', seatLimit: '' });
    };

    const handleUpdate = async (trainingId) => {
        try {
            setActionLoadingId(trainingId);
            setError(null);

            await api.put(`/trainings/${trainingId}`, {
                title: editForm.title,
                description: editForm.description,
                startTime: editForm.startTime,
                seatLimit: Number(editForm.seatLimit)
            });

            cancelEdit();
            await fetchTrainings();

            if (activeTrainingId === trainingId) {
                await fetchEnrollments(trainingId);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update training');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDelete = async (trainingId) => {
        const confirmed = window.confirm('Delete this training session? This will remove related enrollments too.');
        if (!confirmed) return;

        try {
            setActionLoadingId(trainingId);
            setError(null);

            await api.delete(`/trainings/${trainingId}`);
            await fetchTrainings();

            if (activeTrainingId === trainingId) {
                setActiveTrainingId(null);
                setEnrollments(null);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete training');
        } finally {
            setActionLoadingId(null);
        }
    };

    if (loading) return <div className="page-center">Loading...</div>;

    return (
        <div className="container dashboard-content">
            <div className="flex justify-between items-center mb-6">
                <h2>Your Training Sessions</h2>
                <Link to="/create-training" className="btn btn-primary">
                    + Create Session
                </Link>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {stats && (
                <div className="grid grid-cols-4 mb-6">
                    <div className="card">
                        <p className="text-secondary">My Trainings</p>
                        <h3>{stats.totalMyTrainings}</h3>
                    </div>
                    <div className="card">
                        <p className="text-secondary">Total Enrollments</p>
                        <h3>{stats.totalMyEnrollments}</h3>
                    </div>
                    <div className="card">
                        <p className="text-secondary">Upcoming Trainings</p>
                        <h3>{stats.upcomingMyTrainings}</h3>
                    </div>
                    <div className="card">
                        <p className="text-secondary">Seats Remaining</p>
                        <h3>{stats.seatsRemaining}</h3>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2">
                <div>
                    {trainings.length === 0 ? (
                        <p className="text-secondary">You haven't created any training sessions yet.</p>
                    ) : (
                        <div className="grid grid-cols-1">
                            {trainings.map(t => (
                                <div key={t._id} className="card" onClick={() => fetchEnrollments(t._id)} style={{ cursor: 'pointer', border: activeTrainingId === t._id ? '1px solid var(--accent-primary)' : '' }}>
                                    {editingTrainingId === t._id ? (
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <div className="input-group">
                                                <label className="input-label">Title</label>
                                                <input
                                                    type="text"
                                                    className="input-field"
                                                    value={editForm.title}
                                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label className="input-label">Description</label>
                                                <textarea
                                                    className="input-field"
                                                    rows="3"
                                                    value={editForm.description}
                                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="grid grid-cols-2">
                                                <div className="input-group">
                                                    <label className="input-label">Date & Time</label>
                                                    <input
                                                        type="datetime-local"
                                                        className="input-field"
                                                        value={editForm.startTime}
                                                        onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="input-group">
                                                    <label className="input-label">Seat Limit</label>
                                                    <input
                                                        type="number"
                                                        className="input-field"
                                                        min="1"
                                                        value={editForm.seatLimit}
                                                        onChange={(e) => setEditForm({ ...editForm, seatLimit: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-4 mt-4">
                                                <button
                                                    className="btn btn-secondary btn-full"
                                                    onClick={cancelEdit}
                                                    disabled={actionLoadingId === t._id}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    className="btn btn-primary btn-full"
                                                    onClick={() => handleUpdate(t._id)}
                                                    disabled={actionLoadingId === t._id}
                                                >
                                                    {actionLoadingId === t._id ? 'Saving...' : 'Save Changes'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="card-title">{t.title}</h3>
                                            <p>{t.description}</p>
                                            <div className="card-meta">
                                                <div className="meta-item">
                                                    <span className="badge badge-blue">{new Date(t.startTime).toLocaleString()}</span>
                                                </div>
                                                <div className="meta-item">
                                                    Seats: {t.seatsFilled} / {t.seatLimit}
                                                </div>
                                            </div>
                                            <div className="flex gap-4 mt-4" onClick={(e) => e.stopPropagation()}>
                                                <button className="btn btn-secondary btn-full" onClick={() => fetchEnrollments(t._id)}>
                                                    View Enrollments
                                                </button>
                                                <button className="btn btn-secondary btn-full" onClick={() => startEdit(t)}>
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-full"
                                                    style={{ background: '#ef4444', color: '#fff' }}
                                                    onClick={() => handleDelete(t._id)}
                                                    disabled={actionLoadingId === t._id}
                                                >
                                                    {actionLoadingId === t._id ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Enrollments Sidebar */}
                <div>
                    {activeTrainingId && (
                        <div className="card" style={{ position: 'sticky', top: '6rem' }}>
                            <h3>Enrolled Students</h3>
                            {!enrollments ? (
                                <p>Loading enrollments...</p>
                            ) : enrollments.length === 0 ? (
                                <p className="text-secondary">No one has enrolled in this session yet.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {enrollments.map(e => (
                                        <li key={e._id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                                            <div style={{ fontWeight: '500' }}>{e.userId.name}</div>
                                            <div className="text-secondary" style={{ fontSize: '0.875rem' }}>{e.userId.email}</div>
                                            <div className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                                                Enrolled: {new Date(e.enrolledAt).toLocaleDateString()}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainerDashboard;
