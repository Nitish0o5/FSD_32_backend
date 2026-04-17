import Training from '../Models/trainingModel.js';
import Enrollment from '../Models/enrollmentModel.js';
import User from '../Models/userModel.js';

// @desc    Create a new training
// @route   POST /api/trainings
// @access  Private/Trainer
export const createTraining = async (req, res) => {
    try {
        const { title, description, startTime, seatLimit } = req.body;

        const training = await Training.create({
            title,
            description,
            trainerId: req.user._id,
            startTime,
            seatLimit,
            seatsFilled: 0
        });

        res.status(201).json(training);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all trainings
// @route   GET /api/trainings
// @access  Private (Employee/Trainer)
export const getAllTrainings = async (req, res) => {
    try {
        const { search, trainer, from, to, availability } = req.query;
        const query = {};

        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [
                { title: regex },
                { description: regex }
            ];
        }

        if (trainer && trainer.trim()) {
            const matchingTrainers = await User.find({
                role: 'TRAINER',
                name: { $regex: trainer.trim(), $options: 'i' }
            }).select('_id');

            query.trainerId = { $in: matchingTrainers.map((t) => t._id) };
        }

        if (from || to) {
            query.startTime = {};
            if (from) {
                query.startTime.$gte = new Date(from);
            }
            if (to) {
                const endDate = new Date(to);
                endDate.setHours(23, 59, 59, 999);
                query.startTime.$lte = endDate;
            }
        }

        if (availability === 'open') {
            query.$expr = { $lt: ['$seatsFilled', '$seatLimit'] };
        }

        if (availability === 'full') {
            query.$expr = { $gte: ['$seatsFilled', '$seatLimit'] };
        }

        const trainings = await Training.find(query)
            .populate('trainerId', 'name email')
            .sort({ startTime: 1 });
        res.status(200).json(trainings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get trainings by logged-in trainer
// @route   GET /api/trainings/trainer
// @access  Private/Trainer
export const getMyTrainings = async (req, res) => {
    try {
        const trainings = await Training.find({ trainerId: req.user._id });
        res.status(200).json(trainings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a training created by logged-in trainer
// @route   PUT /api/trainings/:id
// @access  Private/Trainer
export const updateTraining = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, startTime, seatLimit } = req.body;

        const training = await Training.findById(id);
        if (!training) {
            return res.status(404).json({ message: 'Training not found' });
        }

        if (training.trainerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this training' });
        }

        const nextSeatLimit = seatLimit !== undefined ? Number(seatLimit) : training.seatLimit;
        if (!Number.isFinite(nextSeatLimit) || nextSeatLimit < 1) {
            return res.status(400).json({ message: 'Seat limit must be a number greater than 0' });
        }

        if (nextSeatLimit < training.seatsFilled) {
            return res.status(400).json({
                message: `Seat limit cannot be less than enrolled seats (${training.seatsFilled})`
            });
        }

        training.title = title ?? training.title;
        training.description = description ?? training.description;
        training.startTime = startTime ?? training.startTime;
        training.seatLimit = nextSeatLimit;

        const updatedTraining = await training.save();
        res.status(200).json(updatedTraining);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a training created by logged-in trainer
// @route   DELETE /api/trainings/:id
// @access  Private/Trainer
export const deleteTraining = async (req, res) => {
    try {
        const { id } = req.params;

        const training = await Training.findById(id);
        if (!training) {
            return res.status(404).json({ message: 'Training not found' });
        }

        if (training.trainerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this training' });
        }

        await Enrollment.deleteMany({ trainingId: training._id });
        await training.deleteOne();

        res.status(200).json({ message: 'Training deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
