const Enrollment = require("../Models/enrollmentModel");
const Course = require("../Models/courseModel");
const Certificate = require("../Models/certificateModel");
const { asyncHandler } = require("../Middleware/errorMiddleware");

// @desc    Enroll in a course
// @route   POST /api/enrollments/:courseId
// @access  Private (Learner)
const enrollInCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return res
      .status(404)
      .json({ success: false, message: "Course not found." });
  }

  if (course.status !== "published") {
    return res
      .status(400)
      .json({ success: false, message: "Course is not available for enrollment." });
  }

  // Check max enrollment cap
  if (course.maxEnrollments && course.enrollmentCount >= course.maxEnrollments) {
    // Auto-waitlist
    const waitlist = await Enrollment.create({
      learner: req.user.id,
      course: course._id,
      status: "waitlisted",
    });
    return res.status(200).json({
      success: true,
      message: "Course is full. You've been added to the waitlist.",
      enrollment: waitlist,
    });
  }

  // Check if already enrolled
  const existing = await Enrollment.findOne({
    learner: req.user.id,
    course: course._id,
  });

  if (existing) {
    return res
      .status(400)
      .json({ success: false, message: "You are already enrolled in this course." });
  }

  const enrollment = await Enrollment.create({
    learner: req.user.id,
    course: course._id,
    payment: {
      amount: course.price,
      status: course.isFree ? "free" : "paid",
    },
  });

  // Increment enrollment count
  await Course.findByIdAndUpdate(course._id, {
    $inc: { enrollmentCount: 1 },
  });

  res.status(201).json({
    success: true,
    message: `Successfully enrolled in "${course.title}"!`,
    enrollment,
  });
});

// @desc    Get all enrollments for logged-in learner
// @route   GET /api/enrollments/my-learning
// @access  Private (Learner)
const getMyLearning = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({
    learner: req.user.id,
    status: { $in: ["active", "completed"] },
  }).populate("course", "title thumbnail category level totalLessons instructor");

  res.status(200).json({ success: true, enrollments });
});

// @desc    Mark a lesson as completed and update progress
// @route   PUT /api/enrollments/:courseId/progress
// @access  Private (Learner)
const updateProgress = asyncHandler(async (req, res) => {
  const { lessonId } = req.body;

  const enrollment = await Enrollment.findOne({
    learner: req.user.id,
    course: req.params.courseId,
    status: "active",
  });

  if (!enrollment) {
    return res
      .status(404)
      .json({ success: false, message: "Enrollment not found." });
  }

  // Add lesson if not already completed
  if (!enrollment.completedLessons.includes(lessonId)) {
    enrollment.completedLessons.push(lessonId);
    enrollment.lastAccessedLesson = lessonId;
  }

  // Recalculate progress
  const course = await Course.findById(req.params.courseId);
  const progressPercent = Math.round(
    (enrollment.completedLessons.length / course.totalLessons) * 100
  );
  enrollment.progress = progressPercent;

  // Auto-complete course
  if (progressPercent === 100) {
    enrollment.status = "completed";
    enrollment.completedAt = Date.now();

    // Issue certificate if course offers one
    if (course.certificate) {
      const cert = await Certificate.create({
        learner: req.user.id,
        course: course._id,
        enrollment: enrollment._id,
      });
      enrollment.certificate = {
        issued: true,
        issuedAt: Date.now(),
        certificateId: cert.certificateId,
      };
    }
  }

  await enrollment.save();

  res.status(200).json({
    success: true,
    message: progressPercent === 100 ? "🎉 Course completed!" : "Progress updated.",
    progress: enrollment.progress,
    status: enrollment.status,
    certificate: enrollment.certificate,
  });
});

// @desc    Submit a rating and review for a course
// @route   PUT /api/enrollments/:courseId/review
// @access  Private (Learner who completed the course)
const submitReview = asyncHandler(async (req, res) => {
  const { score, review } = req.body;

  const enrollment = await Enrollment.findOne({
    learner: req.user.id,
    course: req.params.courseId,
    status: "completed",
  });

  if (!enrollment) {
    return res
      .status(400)
      .json({ success: false, message: "Complete the course before reviewing." });
  }

  enrollment.rating = { score, review, reviewedAt: Date.now() };
  await enrollment.save();

  // Update course average rating
  const allRatings = await Enrollment.find({
    course: req.params.courseId,
    "rating.score": { $ne: null },
  });
  const avg =
    allRatings.reduce((sum, e) => sum + e.rating.score, 0) / allRatings.length;

  await Course.findByIdAndUpdate(req.params.courseId, {
    "ratings.average": avg.toFixed(1),
    "ratings.count": allRatings.length,
  });

  res
    .status(200)
    .json({ success: true, message: "Review submitted. Thank you!" });
});

// @desc    Drop a course
// @route   DELETE /api/enrollments/:courseId
// @access  Private (Learner)
const dropCourse = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOneAndUpdate(
    { learner: req.user.id, course: req.params.courseId, status: "active" },
    { status: "dropped" },
    { new: true }
  );

  if (!enrollment) {
    return res
      .status(404)
      .json({ success: false, message: "Active enrollment not found." });
  }

  await Course.findByIdAndUpdate(req.params.courseId, {
    $inc: { enrollmentCount: -1 },
  });

  res.status(200).json({ success: true, message: "You have dropped the course." });
});

module.exports = {
  enrollInCourse,
  getMyLearning,
  updateProgress,
  submitReview,
  dropCourse,
};
