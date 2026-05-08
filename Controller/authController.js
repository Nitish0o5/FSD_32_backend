import User from '../Models/userModel.js';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../Middleware/errorMiddleware.js';

// Use the more complete auth implementation from files/
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    // Prevent self-assigning admin role
    const assignedRole = role === 'instructor' ? 'instructor' : 'learner';

    const user = await User.create({ name, email, password, role: assignedRole });
    const token = generateToken(user._id);

    res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
        },
    });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res
            .status(400)
            .json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
        return res
            .status(401)
            .json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
        return res
            .status(403)
            .json({ success: false, message: 'Account has been deactivated.' });
    }

    // Update last active
    user.lastActiveAt = Date.now();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.status(200).json({
        success: true,
        message: 'Logged in successfully!',
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
        },
    });
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).populate({
        path: 'enrolledCourses',
        populate: { path: 'course', select: 'title thumbnail category' },
    });

    res.status(200).json({ success: true, user });
});

// @desc    Update profile
// @route   PUT /api/auth/me
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const { name, bio, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user.id,
        { name, bio, avatar },
        { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, user });
});

export { register, login, getMe, updateProfile };

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = generateToken(user._id);
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
};
