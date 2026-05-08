import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateCourse = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [category, setCategory] = useState('Web Development');
    const [level, setLevel] = useState('beginner');
    const [price, setPrice] = useState('0');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await api.post('/courses', {
                title,
                description,
                shortDescription,
                category,
                level,
                price: Number(price),
                status: 'published'
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container dashboard-content">
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2 className="mb-6">Create New Course</h2>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="input-label">Title</label>
                            <input
                                type="text"
                                className="input-field"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Description</label>
                            <textarea
                                className="input-field"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="4"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Short Description</label>
                            <input
                                type="text"
                                className="input-field"
                                value={shortDescription}
                                onChange={(e) => setShortDescription(e.target.value)}
                                placeholder="Brief summary (max 200 chars)"
                                maxLength="200"
                            />
                        </div>
                        <div className="grid grid-cols-2">
                            <div className="input-group">
                                <label className="input-label">Category</label>
                                <select
                                    className="input-field"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                >
                                    <option>Web Development</option>
                                    <option>Data Science</option>
                                    <option>Design</option>
                                    <option>Mobile Development</option>
                                    <option>DevOps</option>
                                    <option>AI & Machine Learning</option>
                                    <option>Business</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Level</label>
                                <select
                                    className="input-field"
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                    required
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Price ($)</label>
                            <input
                                type="number"
                                className="input-field"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="flex gap-4 mt-4">
                            <button type="button" className="btn btn-secondary btn-full" onClick={() => navigate('/')}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Course'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateCourse;
