import Training from '../Models/trainingModel.js';
import Enrollment from '../Models/enrollmentModel.js';

// @desc    Role-aware dashboard stats
// @route   GET /api/stats/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
    try {
        if (req.user.role === 'TRAINER') {
            const myTrainings = await Training.find({ trainerId: req.user._id }).select('_id startTime seatLimit seatsFilled');
            const trainingIds = myTrainings.map((t) => t._id);

            const [totalMyTrainings, totalMyEnrollments] = await Promise.all([
                Promise.resolve(myTrainings.length),
                Enrollment.countDocuments({ trainingId: { $in: trainingIds } })
            ]);

            const upcomingMyTrainings = myTrainings.filter(
                (t) => new Date(t.startTime) >= new Date()
            ).length;

            const seatsRemaining = myTrainings.reduce(
                (sum, t) => sum + Math.max(0, t.seatLimit - t.seatsFilled),
                0
            );

            return res.status(200).json({
                role: 'TRAINER',
                totalMyTrainings,
                totalMyEnrollments,
                upcomingMyTrainings,
                seatsRemaining
            });
        }

        const [availableTrainings, myEnrollments] = await Promise.all([
            Training.countDocuments({ $expr: { $lt: ['$seatsFilled', '$seatLimit'] } }),
            Enrollment.countDocuments({ userId: req.user._id })
        ]);

        const upcomingAvailableTrainings = await Training.countDocuments({
            $expr: { $lt: ['$seatsFilled', '$seatLimit'] },
            startTime: { $gte: new Date() }
        });

        return res.status(200).json({
            role: 'EMPLOYEE',
            availableTrainings,
            upcomingAvailableTrainings,
            myEnrollments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
