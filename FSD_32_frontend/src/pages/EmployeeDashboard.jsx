import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const EmployeeDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        level: 'all'
    });

    const fetchCourses = useCallback(async (nextFilters) => {
        try {
            const params = {};
            if (nextFilters.search.trim()) params.search = nextFilters.search.trim();
            if (nextFilters.category.trim()) params.category = nextFilters.category.trim();
            if (nextFilters.level !== 'all') params.level = nextFilters.level;

            setError(null);
            const coursesRes = await api.get('/courses', { params });
            setCourses(coursesRes.data.courses);

            // Stats fetch is non-blocking — may fail for non-admin users
            try {
                const statsRes = await api.get('/stats/dashboard');
                setStats(statsRes.data);
            } catch {
                // Stats not available — not critical
            }
        } catch {
            setError('Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses({
            search: '',
            category: '',
            level: 'all'
        });
    }, [fetchCourses]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleApplyFilters = async (e) => {
        e.preventDefault();
        setLoading(true);
        await fetchCourses(filters);
    };

    const handleClearFilters = async () => {
        const cleared = {
            search: '',
            category: '',
            level: 'all'
        };

        setFilters(cleared);
        setLoading(true);
        await fetchCourses(cleared);
    };

    const handleEnroll = async (courseId) => {
        setError(null);
        setSuccessMsg('');
        try {
            await api.post(`/enrollments/${courseId}`);
            setSuccessMsg('Successfully enrolled in course!');
            fetchCourses(filters);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to enroll');
        }
    };

    if (loading) return <div className="page-center">Loading...</div>;

    return (
        <div className="container dashboard-content">
            <h2 className="mb-6">Available Courses</h2>

            {error && <div className="alert alert-error">{error}</div>}
            {successMsg && <div className="alert" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{successMsg}</div>}

            {stats && (
                <div className="grid grid-cols-3 mb-6">
                    <div className="card">
                        <p className="text-secondary">Total Courses</p>
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
                </div>
            )}

            <form className="glass-panel mb-6" style={{ padding: '1.25rem' }} onSubmit={handleApplyFilters}>
                <div className="grid grid-cols-3">
                    <div className="input-group">
                        <label className="input-label">Search courses</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. React, Python"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Category</label>
                        <select
                            className="input-field"
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                        >
                            <option value="">All Categories</option>
                            <option value="Web Development">Web Development</option>
                            <option value="Data Science">Data Science</option>
                            <option value="Design">Design</option>
                            <option value="Mobile Development">Mobile Development</option>
                            <option value="DevOps">DevOps</option>
                            <option value="AI & Machine Learning">AI & Machine Learning</option>
                            <option value="Business">Business</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Level</label>
                        <select
                            className="input-field"
                            value={filters.level}
                            onChange={(e) => handleFilterChange('level', e.target.value)}
                        >
                            <option value="all">All Levels</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-4" style={{ marginTop: '1.8rem', gridColumn: 'span 3' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={handleClearFilters} disabled={loading}>
                            Clear Filters
                        </button>
                    </div>
                </div>
            </form>

            <div className="grid grid-cols-3">
                {courses.length === 0 ? (
                    <p className="text-secondary" style={{ gridColumn: 'span 3' }}>No courses available at the moment.</p>
                ) : (
                    courses.map(course => (
                        <div key={course._id} className="card flex" style={{ flexDirection: 'column' }}>
                            <div style={{ flex: 1 }}>
                                <h3 className="card-title">{course.title}</h3>
                                <p className="mb-4" style={{ fontSize: '0.9rem' }}>{course.shortDescription || course.description}</p>
                                <div className="card-meta">
                                    <div className="meta-item">
                                        <span className="badge badge-blue">{course.category}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className={`badge ${course.level === 'beginner' ? 'badge-green' : course.level === 'intermediate' ? 'badge-yellow' : 'badge-red'}`}>
                                            {course.level}
                                        </span>
                                    </div>
                                </div>
                                {course.isFree ? (
                                    <p style={{ color: '#34d399', marginTop: '0.5rem', fontWeight: 'bold' }}>FREE</p>
                                ) : (
                                    <p style={{ color: 'var(--accent-primary)', marginTop: '0.5rem', fontWeight: 'bold' }}>${course.price}</p>
                                )}
                                <div className="card-meta" style={{ marginTop: '0.5rem' }}>
                                    <div className="meta-item">
                                        Instructor: <span style={{ color: 'white' }}>{course.instructor?.name || 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                                <span className="text-secondary text-sm">
                                    {course.enrollmentCount} enrolled
                                </span>
                                <button
                                    onClick={() => handleEnroll(course._id)}
                                    className="btn btn-success"
                                >
                                    Enroll Now
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default EmployeeDashboard;
