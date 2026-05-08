const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");
const { asyncHandler } = require("../Middleware/errorMiddleware");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Prevent self-assigning admin role
  const assignedRole = role === "instructor" ? "instructor" : "learner";

  const user = await User.create({ name, email, password, role: assignedRole });
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "Account created successfully!",
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
      .json({ success: false, message: "Email and password are required." });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password." });
  }

  if (!user.isActive) {
    return res
      .status(403)
      .json({ success: false, message: "Account has been deactivated." });
  }

  // Update last active
  user.lastActiveAt = Date.now();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Logged in successfully!",
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
    path: "enrolledCourses",
    populate: { path: "course", select: "title thumbnail category" },
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

module.exports = { register, login, getMe, updateProfile };
