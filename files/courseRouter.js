const express = require("express");
const router = express.Router();
const {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getMyCourses,
} = require("../Controllers/courseController");
const { protect, authorize } = require("../Middleware/authMiddleware");

// Public routes
router.get("/", getAllCourses);
router.get("/:slug", getCourse);

// Instructor routes
router.post("/", protect, authorize("instructor", "admin"), createCourse);
router.get("/instructor/my-courses", protect, authorize("instructor", "admin"), getMyCourses);
router.put("/:id", protect, authorize("instructor", "admin"), updateCourse);
router.delete("/:id", protect, authorize("instructor", "admin"), deleteCourse);

module.exports = router;
