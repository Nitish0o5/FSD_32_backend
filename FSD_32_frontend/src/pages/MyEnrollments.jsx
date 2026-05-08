import { useState, useEffect } from 'react';
import api from '../services/api';

const MyEnrollments = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMyLearning = async () => {
            try {
                const { data } = await api.get('/enrollments/my-learning');
                setEnrollments(data.enrollments || data);
            } catch (err) {
                setError('Failed to fetch your courses');
            } finally {
                setLoading(false);
            }
        };

        fetchMyLearning();
    }, []);

    if (loading) return <div className="page-center">Loading...</div>;

    return (
        <div className="container dashboard-content">
            <h2 className="mb-6">My Learning</h2>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="grid grid-cols-2">
                {enrollments.length === 0 ? (
                    <p className="text-secondary" style={{ gridColumn: 'span 2' }}>No courses to show.</p>
                ) : (
                    enrollments.map(enrollment => (
                        <div key={enrollment._id} className="card flex" style={{ flexDirection: 'column' }}>
                            <div style={{ flex: 1 }}>
                                <h3 className="card-title">{enrollment.course?.title || 'Course Deleted'}</h3>
                                <p className="mb-3" style={{ fontSize: '0.9rem' }}>{enrollment.course?.shortDescription || enrollment.course?.description}</p>

                                <div className="card-meta mb-3">
                                    <div className="meta-item">
                                        <span className={`badge ${enrollment.status === 'completed' ? 'badge-green' : enrollment.status === 'active' ? 'badge-blue' : 'badge-yellow'}`}>
                                            {enrollment.status}
                                        </span>
                                    </div>
                                    {enrollment.course && (
                                        <div className="meta-item">
                                            <span className="badge badge-blue">{enrollment.course.category}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span className="text-secondary text-sm">Progress</span>
                                        <span style={{ color: 'white', fontWeight: 'bold' }}>{enrollment.progress || 0}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div
                                            style={{
                                                width: `${enrollment.progress || 0}%`,
                                                height: '100%',
                                                backgroundColor: 'var(--accent-primary)',
                                                transition: 'width 0.3s ease'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="card-meta">
                                    {enrollment.certificate?.issued && (
                                        <div className="meta-item">
                                            <span className="badge badge-green">✓ Certified</span>
                                        </div>
                                    )}
                                    {enrollment.rating?.score && (
                                        <div className="meta-item">
                                            <span className="badge badge-yellow">⭐ {enrollment.rating.score}/5</span>
                                        </div>
                                    )}
                                </div>

                                {enrollment.course?.instructor && (
                                    <div className="card-meta">
                                        <div className="meta-item">
                                            Instructor: <span style={{ color: 'white' }}>{enrollment.course.instructor.name}</span>
                                        </div>
                                    </div>
                                )}

                                                        <div className="flex justify-between items-center mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                                                            <span className="text-secondary text-sm">
                                                                {enrollment.completedLessons?.length || 0} lessons completed
                                                            </span>
                                                            <button className="btn btn-primary">Continue Learning</button>
                                                        </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyEnrollments;
