import Training from '../Models/trainingModel.js';

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
        const trainings = await Training.find().populate('trainerId', 'name email');
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
