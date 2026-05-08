import express from 'express';
import {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getMyCourses,
} from '../Controller/courseController.js';
import { protect, authorize } from '../Middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllCourses);

// Instructor/Admin routes (must be above /:slug to avoid being caught by it)
router.get('/instructor/my-courses', protect, authorize('instructor', 'admin'), getMyCourses);
router.post('/', protect, authorize('instructor', 'admin'), createCourse);
router.put('/:id', protect, authorize('instructor', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);

// Parameterized route last (catches anything like /some-slug)
router.get('/:slug', getCourse);

export default router;
