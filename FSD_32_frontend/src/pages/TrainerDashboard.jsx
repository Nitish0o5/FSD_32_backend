import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const TrainerDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    const [courseEnrollments, setCourseEnrollments] = useState(null);
    const [activeCourseId, setActiveCourseId] = useState(null);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setError(null);
            const coursesRes = await api.get('/courses/instructor/my-courses');
            setCourses(coursesRes.data.courses || coursesRes.data);

            // Stats fetch is non-blocking — instructors may not have admin access
            try {
                const statsRes = await api.get('/stats/dashboard');
                setStats(statsRes.data.stats);
            } catch {
                // Stats not available — not critical
            }
        } catch (err) {
            setError('Failed to load your courses');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseEnrollments = async (courseId) => {
        setActiveCourseId(courseId);
        setCourseEnrollments(null);
        try {
            setError(null);
            // For now, we'll fetch all enrollments - ideally backend would have GET /enrollments/course/:id
            const { data } = await api.get('/enrollments/my-learning');
            // Filter for this course
            const filtered = data.enrollments?.filter(e => e.course?._id === courseId) || [];
            setCourseEnrollments(filtered);
        } catch (err) {
            setError('Failed to fetch enrollments for this course');
        }
    };

    const handleUpdateCourseStatus = async (courseId, newStatus) => {
        try {
            setActionLoadingId(courseId);
            setError(null);
            setSuccessMsg('');

            await api.put(`/admin/courses/${courseId}/status`, { status: newStatus });
            setSuccessMsg('Course status updated successfully');
            await fetchCourses();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update course status');
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDeleteCourse = async (courseId) => {
        const confirmed = window.confirm('Delete this course? This action cannot be undone.');
        if (!confirmed) return;

        try {
            setActionLoadingId(courseId);
            setError(null);
            setSuccessMsg('');

            await api.delete(`/courses/${courseId}`);
            setSuccessMsg('Course deleted successfully');
            await fetchCourses();

            if (activeCourseId === courseId) {
                setActiveCourseId(null);
                setCourseEnrollments(null);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete course');
        } finally {
            setActionLoadingId(null);
        }
    };

    if (loading) return <div className="page-center">Loading...</div>;

    return (
        <div className="container dashboard-content">
            <div className="flex justify-between items-center mb-6">
                <h2>Your Courses</h2>
                <Link to="/create-course" className="btn btn-primary">
                    + Create Course
                </Link>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {successMsg && <div className="alert" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{successMsg}</div>}

            {stats && (
                <div className="grid grid-cols-4 mb-6">
                    <div className="card">
                        <p className="text-secondary">My Courses</p>
                        <h3>{stats.totalCourses || 0}</h3>
                    </div>
                    <div className="card">
                        <p className="text-secondary">Total Enrollments</p>
                        <h3>{stats.totalEnrollments || 0}</h3>
                    </div>
                    <div className="card">
                        <p className="text-secondary">Completion Rate</p>
                        <h3>{stats.completionRate || '0%'}</h3>
                    </div>
                    <div className="card">
                        <p className="text-secondary">Top Course</p>
                        <p style={{ color: 'var(--accent-primary)', marginTop: '0.5rem' }}>
                            {stats.topCourses?.[0]?.title || 'N/A'}
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
                <div>
                    <h3 className="mb-4">Your Courses</h3>
                    {courses.length === 0 ? (
                        <p className="text-secondary">You haven't created any courses yet.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {courses.map(course => (
                                <div
                                    key={course._id}
                                    className="card"
                                    onClick={() => fetchCourseEnrollments(course._id)}
                                    style={{
                                        cursor: 'pointer',
                                        border: activeCourseId === course._id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <h4 className="mb-2">{course.title}</h4>
                                    <p className="text-secondary text-sm mb-3">{course.shortDescription || course.description}</p>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                        <span className="badge badge-blue">{course.category}</span>
                                        <span className={`badge ${course.level === 'beginner' ? 'badge-green' : course.level === 'intermediate' ? 'badge-yellow' : 'badge-red'}`}>
                                            {course.level}
                                        </span>
                                        <span className={`badge ${course.status === 'published' ? 'badge-green' : course.status === 'draft' ? 'badge-yellow' : 'badge-red'}`}>
                                            {course.status}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                        <span className="text-secondary text-sm">
                                            {course.enrollmentCount} enrolled
                                        </span>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Link to={`/edit-course/${course._id}`} className="btn btn-sm" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
                                                Edit
                                            </Link>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteCourse(course._id);
                                                }}
                                                disabled={actionLoadingId === course._id}
                                                className="btn btn-danger"
                                                style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="mb-4">Enrollments</h3>
                    {activeCourseId ? (
                        courseEnrollments === null ? (
                            <p className="text-secondary">Loading enrollments...</p>
                        ) : courseEnrollments.length === 0 ? (
                            <p className="text-secondary">No enrollments for this course yet.</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {courseEnrollments.map((enrollment, idx) => (
                                    <div key={enrollment._id || idx} className="card">
                                        <p className="font-semibold">{enrollment.learner?.name || 'Unknown'}</p>
                                        <p className="text-secondary text-sm mb-2">{enrollment.learner?.email}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <span className="text-secondary text-sm">Progress:</span>
                                            <span className="font-semibold">{enrollment.progress || 0}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    width: `${enrollment.progress || 0}%`,
                                                    height: '100%',
                                                    backgroundColor: 'var(--accent-primary)',
                                                    transition: 'width 0.3s ease'
                                                }}
                                            />
                                        </div>
                                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <span className={`badge badge-sm ${enrollment.status === 'completed' ? 'badge-green' : enrollment.status === 'active' ? 'badge-blue' : 'badge-yellow'}`}>
                                                {enrollment.status}
                                            </span>
                                            {enrollment.certificate?.issued && (
                                                <span className="badge badge-green">Certified</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        <p className="text-secondary">Select a course to view enrollments</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainerDashboard;
