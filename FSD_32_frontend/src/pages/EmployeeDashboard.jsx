import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const EmployeeDashboard = () => {
    const [trainings, setTrainings] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        trainer: '',
        from: '',
        to: '',
        availability: 'all'
    });

    const fetchTrainings = useCallback(async (nextFilters) => {
        try {
            const params = {};
            if (nextFilters.search.trim()) params.search = nextFilters.search.trim();
            if (nextFilters.trainer.trim()) params.trainer = nextFilters.trainer.trim();
            if (nextFilters.from) params.from = nextFilters.from;
            if (nextFilters.to) params.to = nextFilters.to;
            if (nextFilters.availability !== 'all') params.availability = nextFilters.availability;

            setError(null);
            const [trainingsRes, statsRes] = await Promise.all([
                api.get('/trainings', { params }),
                api.get('/stats/dashboard')
            ]);
            setTrainings(trainingsRes.data);
            setStats(statsRes.data);
        } catch {
            setError('Failed to fetch trainings');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTrainings({
            search: '',
            trainer: '',
            from: '',
            to: '',
            availability: 'all'
        });
    }, [fetchTrainings]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleApplyFilters = async (e) => {
        e.preventDefault();
        setLoading(true);
        await fetchTrainings(filters);
    };

    const handleClearFilters = async () => {
        const cleared = {
            search: '',
            trainer: '',
            from: '',
            to: '',
            availability: 'all'
        };

        setFilters(cleared);
        setLoading(true);
        await fetchTrainings(cleared);
    };

    const handleEnroll = async (trainingId) => {
        setError(null);
        setSuccessMsg('');
        try {
            await api.post(`/enrollments/${trainingId}`);
            setSuccessMsg('Successfully enrolled in training!');
            // Refresh to update seat count
            fetchTrainings(filters);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to enroll');
        }
    };

    if (loading) return <div className="page-center">Loading...</div>;

    return (
        <div className="container dashboard-content">
            <h2 className="mb-6">Available Training Sessions</h2>

            {error && <div className="alert alert-error">{error}</div>}
            {successMsg && <div className="alert" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{successMsg}</div>}

            {stats && (
                <div className="grid grid-cols-3 mb-6">
                    <div className="card">
                        <p className="text-secondary">Open Trainings</p>
                        <h3>{stats.availableTrainings}</h3>
                    </div>
                    <div className="card">
                        <p className="text-secondary">Upcoming Open Trainings</p>
                        <h3>{stats.upcomingAvailableTrainings}</h3>
                    </div>
                    <div className="card">
                        <p className="text-secondary">My Enrollments</p>
                        <h3>{stats.myEnrollments}</h3>
                    </div>
                </div>
            )}

            <form className="glass-panel mb-6" style={{ padding: '1.25rem' }} onSubmit={handleApplyFilters}>
                <div className="grid grid-cols-3">
                    <div className="input-group">
                        <label className="input-label">Search by title/description</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. React, leadership"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Trainer name</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. John"
                            value={filters.trainer}
                            onChange={(e) => handleFilterChange('trainer', e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Availability</label>
                        <select
                            className="input-field"
                            value={filters.availability}
                            onChange={(e) => handleFilterChange('availability', e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="open">Open</option>
                            <option value="full">Full</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label">From date</label>
                        <input
                            type="date"
                            className="input-field"
                            value={filters.from}
                            onChange={(e) => handleFilterChange('from', e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">To date</label>
                        <input
                            type="date"
                            className="input-field"
                            value={filters.to}
                            onChange={(e) => handleFilterChange('to', e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4" style={{ marginTop: '1.8rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Applying...' : 'Apply Filters'}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={handleClearFilters} disabled={loading}>
                            Clear
                        </button>
                    </div>
                </div>
            </form>

            <div className="grid grid-cols-3">
                {trainings.length === 0 ? (
                    <p className="text-secondary" style={{ gridColumn: 'span 3' }}>No active trainings available at the moment.</p>
                ) : (
                    trainings.map(t => {
                        const isFull = t.seatsFilled >= t.seatLimit;
                        return (
                            <div key={t._id} className="card flex" style={{ flexDirection: 'column' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 className="card-title">{t.title}</h3>
                                    <p className="mb-4">{t.description}</p>
                                    <div className="card-meta">
                                        <div className="meta-item">
                                            Trainer: <span style={{ color: 'white' }}>{t.trainerId?.name || 'Unknown'}</span>
                                        </div>
                                    </div>
                                    <div className="card-meta">
                                        <div className="meta-item">
                                            <span className="badge badge-blue">{new Date(t.startTime).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                                    <span className="text-secondary text-sm">
                                        Seats: {t.seatLimit - t.seatsFilled} left
                                    </span>
                                    <button
                                        onClick={() => handleEnroll(t._id)}
                                        disabled={isFull}
                                        className={`btn ${isFull ? 'btn-secondary' : 'btn-success'}`}
                                        style={{ opacity: isFull ? 0.5 : 1, cursor: isFull ? 'not-allowed' : 'pointer' }}
                                    >
                                        {isFull ? 'Full' : 'Enroll Now'}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default EmployeeDashboard;
