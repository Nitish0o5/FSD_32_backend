import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateTraining = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [seatLimit, setSeatLimit] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await api.post('/trainings', {
                title,
                description,
                startTime,
                seatLimit: Number(seatLimit)
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create training');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container dashboard-content">
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h2 className="mb-6">Create New Training Session</h2>
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
                        <div className="grid grid-cols-2">
                            <div className="input-group">
                                <label className="input-label">Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className="input-field"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Seat Limit</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={seatLimit}
                                    onChange={(e) => setSeatLimit(e.target.value)}
                                    min="1"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <button type="button" className="btn btn-secondary btn-full" onClick={() => navigate('/')}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Training'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateTraining;
