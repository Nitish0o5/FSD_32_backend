import Enrollment from '../Models/enrollmentModel.js';
import Training from '../Models/trainingModel.js';
import mongoose from 'mongoose';

// @desc    Enroll in a training
// @route   POST /api/enrollments/:trainingId
// @access  Private/Employee
export const enrollInTraining = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { trainingId } = req.params;
        const userId = req.user._id;

        // 1. Check if training exists
        const training = await Training.findById(trainingId).session(session);
        if (!training) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Training not found' });
        }

        // 2. Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({ userId, trainingId }).session(session);
        if (existingEnrollment) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'You are already enrolled in this training' });
        }

        // 3. CRITICAL: Check Seat Limit
        if (training.seatsFilled >= training.seatLimit) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Enrollment full. Seat limit reached.' });
        }

        // 4. Create Enrollment
        await Enrollment.create([{ userId, trainingId }], { session });

        // 5. Update Training seat count
        training.seatsFilled += 1;
        await training.save({ session });

        await session.commitTransaction();
        res.status(201).json({ message: 'Enrolled successfully' });

    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    } finally {
        session.endSession();
    }
};

// @desc    Get my enrollments
// @route   GET /api/enrollments/my-enrollments
// @access  Private/Employee
export const getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ userId: req.user._id })
            .populate('trainingId')
            .populate({
                path: 'trainingId',
                populate: { path: 'trainerId', select: 'name email' }
            });
        res.status(200).json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get enrollments for a specific training (For Trainer)
// @route   GET /api/enrollments/training/:trainingId
// @access  Private/Trainer
export const getTrainingEnrollments = async (req, res) => {
    try {
        const { trainingId } = req.params;

        // Check if the trainer owns this training
        const training = await Training.findById(trainingId);
        if (!training) {
            return res.status(404).json({ message: 'Training not found' });
        }

        // Ensure only the creator or an admin (if we had one) can view this
        if (training.trainerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view enrollments for this training' });
        }

        const enrollments = await Enrollment.find({ trainingId })
            .populate('userId', 'name email');

        res.status(200).json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
