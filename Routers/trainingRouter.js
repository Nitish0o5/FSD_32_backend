import express from 'express';
import { createTraining, getAllTrainings, getMyTrainings } from '../Controller/trainingController.js';
import { protect, authorize } from '../Middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllTrainings);
router.post('/', protect, authorize('TRAINER'), createTraining);
router.get('/trainer', protect, authorize('TRAINER'), getMyTrainings);

export default router;
