import express from 'express';
import { getDashboardStats } from '../Controller/statsController.js';
import { protect } from '../Middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);

export default router;
