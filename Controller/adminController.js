import User from '../Models/userModel.js';
import Course from '../Models/courseModel.js';
import Enrollment from '../Models/enrollmentModel.js';
import { asyncHandler } from '../Middleware/errorMiddleware.js';

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = asyncHandler(async (req, res) => {
    const [totalUsers, totalCourses, totalEnrollments, completedEnrollments] =
        await Promise.all([
            User.countDocuments(),
            Course.countDocuments({ status: 'published' }),
            Enrollment.countDocuments({ status: { $in: ['active', 'completed'] } }),
            Enrollment.countDocuments({ status: 'completed' }),
        ]);

    const learners = await User.countDocuments({ role: 'learner' });
    const instructors = await User.countDocuments({ role: 'instructor' });

    // Top 5 courses by enrollment
    const topCourses = await Course.find({ status: 'published' })
        .sort('-enrollmentCount')
        .limit(5)
        .select('title enrollmentCount ratings category');

    res.status(200).json({
        success: true,
        stats: {
            totalUsers,
            learners,
            instructors,
            totalCourses,
            totalEnrollments,
            completedEnrollments,
            completionRate:
                totalEnrollments > 0
                    ? ((completedEnrollments / totalEnrollments) * 100).toFixed(1) + '%'
                    : '0%',
        },
        topCourses,
    });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = role ? { role } : {};
    const skip = (page - 1) * limit;

    const users = await User.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({ success: true, total, users });
});

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle
// @access  Private (Admin)
const toggleUserStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
        success: true,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
    });
});

// @desc    Publish or unpublish a course
// @route   PUT /api/admin/courses/:id/status
// @access  Private (Admin)
const updateCourseStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const course = await Course.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
    );

    if (!course) {
        return res
            .status(404)
            .json({ success: false, message: 'Course not found.' });
    }

    res.status(200).json({
        success: true,
        message: `Course "${course.title}" is now ${status}.`,
        course,
    });
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;

    if (!['learner', 'instructor', 'admin'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.role = role;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: `User role updated to ${role}.`,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
});

export { getStats, getAllUsers, toggleUserStatus, updateCourseStatus, updateUserRole };
