import User from '../Models/userModel.js';
import Training from '../Models/trainingModel.js';
import Enrollment from '../Models/enrollmentModel.js';

// @desc    List all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['EMPLOYEE', 'TRAINER', 'ADMIN'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent accidental lockout by changing your own role.
        if (user._id.toString() === req.user._id.toString() && role !== 'ADMIN') {
            return res.status(400).json({ message: 'You cannot remove your own admin role' });
        }

        user.role = role;
        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
    try {
        const [totalUsers, totalTrainings, totalEnrollments, openTrainings] = await Promise.all([
            User.countDocuments(),
            Training.countDocuments(),
            Enrollment.countDocuments(),
            Training.countDocuments({ $expr: { $lt: ['$seatsFilled', '$seatLimit'] } })
        ]);

        res.status(200).json({
            totalUsers,
            totalTrainings,
            totalEnrollments,
            openTrainings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
