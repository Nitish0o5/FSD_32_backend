import express from 'express';
import {
  enrollInCourse,
  getMyLearning,
  updateProgress,
  submitReview,
  dropCourse,
} from '../Controller/enrollmentController.js';
import { protect, authorize } from '../Middleware/authMiddleware.js';

const router = express.Router();

router.post('/:courseId', protect, authorize('learner'), enrollInCourse);
router.get('/my-learning', protect, authorize('learner'), getMyLearning);
router.put('/:courseId/progress', protect, authorize('learner'), updateProgress);
router.put('/:courseId/review', protect, authorize('learner'), submitReview);
router.delete('/:courseId', protect, authorize('learner'), dropCourse);

export default router;
