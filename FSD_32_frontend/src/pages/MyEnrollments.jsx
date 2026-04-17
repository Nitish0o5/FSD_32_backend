import { useState, useEffect } from 'react';
import api from '../services/api';

const MyEnrollments = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMyEnrollments = async () => {
            try {
                const { data } = await api.get('/enrollments/my-enrollments');
                setEnrollments(data);
            } catch (err) {
                setError('Failed to fetch your enrollments');
            } finally {
                setLoading(false);
            }
        };

        fetchMyEnrollments();
    }, []);

    if (loading) return <div className="page-center">Loading...</div>;

    return (
        <div className="container dashboard-content">
            <h2 className="mb-6">My Enrolled Trainings</h2>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="grid grid-cols-2">
                {enrollments.length === 0 ? (
                    <p className="text-secondary" style={{ gridColumn: 'span 2' }}>You have not enrolled in any trainings yet.</p>
                ) : (
                    enrollments.map(e => (
                        <div key={e._id} className="card flex" style={{ flexDirection: 'column' }}>
                            <div style={{ flex: 1 }}>
                                <h3 className="card-title">{e.trainingId?.title || 'Training Deleted'}</h3>
                                <p className="mb-4">{e.trainingId?.description}</p>

                                <div className="card-meta">
                                    <div className="meta-item">
                                        <span className="badge badge-green">Enrolled</span>
                                    </div>
                                    {e.trainingId && (
                                        <div className="meta-item">
                                            Trainer: <span style={{ color: 'white' }}>{e.trainingId.trainerId?.name || 'Unknown'}</span>
                                        </div>
                                    )}
                                </div>
                                {e.trainingId && (
                                    <div className="card-meta">
                                        <div className="meta-item text-secondary" style={{ fontSize: '0.875rem' }}>
                                            Starts: {new Date(e.trainingId.startTime).toLocaleString()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyEnrollments;
