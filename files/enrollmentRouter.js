const express = require("express");
const router = express.Router();
const {
  enrollInCourse,
  getMyLearning,
  updateProgress,
  submitReview,
  dropCourse,
} = require("../Controllers/enrollmentController");
const { protect, authorize } = require("../Middleware/authMiddleware");

router.post("/:courseId", protect, authorize("learner"), enrollInCourse);
router.get("/my-learning", protect, authorize("learner"), getMyLearning);
router.put("/:courseId/progress", protect, authorize("learner"), updateProgress);
router.put("/:courseId/review", protect, authorize("learner"), submitReview);
router.delete("/:courseId", protect, authorize("learner"), dropCourse);

module.exports = router;
