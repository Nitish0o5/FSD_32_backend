const Course = require("../Models/courseModel");
const Enrollment = require("../Models/enrollmentModel");
const { asyncHandler } = require("../Middleware/errorMiddleware");

// @desc    Get all published courses (with filters)
// @route   GET /api/courses
// @access  Public
const getAllCourses = asyncHandler(async (req, res) => {
  const {
    category,
    level,
    isFree,
    search,
    page = 1,
    limit = 12,
    sort = "-createdAt",
  } = req.query;

  const filter = { status: "published" };
  if (category) filter.category = category;
  if (level) filter.level = level;
  if (isFree !== undefined) filter.isFree = isFree === "true";
  if (search) filter.$text = { $search: search };

  const skip = (page - 1) * limit;
  const total = await Course.countDocuments(filter);
  const courses = await Course.find(filter)
    .populate("instructor", "name avatar")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    courses,
  });
});

// @desc    Get single course by slug
// @route   GET /api/courses/:slug
// @access  Public
const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug })
    .populate("instructor", "name avatar bio")
    .populate("lessons", "title order type duration isPreview");

  if (!course) {
    return res
      .status(404)
      .json({ success: false, message: "Course not found." });
  }

  res.status(200).json({ success: true, course });
});

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Instructor, Admin)
const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create({
    ...req.body,
    instructor: req.user.id,
    isFree: !req.body.price || req.body.price === 0,
  });

  res.status(201).json({
    success: true,
    message: "Course created successfully!",
    course,
  });
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor who owns it, Admin)
const updateCourse = asyncHandler(async (req, res) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return res
      .status(404)
      .json({ success: false, message: "Course not found." });
  }

  // Only the owning instructor or admin can update
  if (
    course.instructor.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({ success: false, message: "Access denied." });
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, course });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor who owns it, Admin)
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res
      .status(404)
      .json({ success: false, message: "Course not found." });
  }

  if (
    course.instructor.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({ success: false, message: "Access denied." });
  }

  await course.deleteOne();

  res
    .status(200)
    .json({ success: true, message: "Course deleted successfully." });
});

// @desc    Get instructor's own courses
// @route   GET /api/courses/my-courses
// @access  Private (Instructor)
const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user.id }).sort(
    "-createdAt"
  );
  res.status(200).json({ success: true, courses });
});

module.exports = {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getMyCourses,
};
