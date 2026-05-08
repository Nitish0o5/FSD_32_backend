import express from 'express';
import {
	createTraining,
	getAllTrainings,
	getMyTrainings,
	updateTraining,
	deleteTraining
} from '../Controller/trainingController.js';
import { protect, authorize } from '../Middleware/authMiddleware.js';
import { validateTrainingCreation } from '../Middleware/validationMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllTrainings);
router.post('/', protect, authorize('TRAINER'), validateTrainingCreation, createTraining);
router.get('/trainer', protect, authorize('TRAINER'), getMyTrainings);
router.put('/:id', protect, authorize('TRAINER'), updateTraining);
router.delete('/:id', protect, authorize('TRAINER'), deleteTraining);

export default router;
