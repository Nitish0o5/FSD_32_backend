import express from 'express';
import {
	createTraining,
	getAllTrainings,
	getMyTrainings,
	updateTraining,
	deleteTraining
} from '../Controller/trainingController.js';
import { protect, authorize } from '../Middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllTrainings);
router.post('/', protect, authorize('TRAINER'), createTraining);
router.get('/trainer', protect, authorize('TRAINER'), getMyTrainings);
router.put('/:id', protect, authorize('TRAINER'), updateTraining);
router.delete('/:id', protect, authorize('TRAINER'), deleteTraining);

export default router;
