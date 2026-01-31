import express from 'express';
import { enrollInTraining, getMyEnrollments, getTrainingEnrollments } from '../Controller/enrollmentController.js';
import { protect, authorize } from '../Middleware/authMiddleware.js';

const router = express.Router();

// Employee routes
router.post('/:trainingId', protect, authorize('EMPLOYEE'), enrollInTraining);
router.get('/my-enrollments', protect, authorize('EMPLOYEE'), getMyEnrollments);

// Trainer routes
router.get('/training/:trainingId', protect, authorize('TRAINER'), getTrainingEnrollments);

export default router;
