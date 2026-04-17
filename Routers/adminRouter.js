import express from 'express';
import { getAllUsers, updateUserRole, getAdminStats } from '../Controller/adminController.js';
import { protect, authorize } from '../Middleware/authMiddleware.js';

const router = express.Router();

router.get('/users', protect, authorize('ADMIN'), getAllUsers);
router.put('/users/:id/role', protect, authorize('ADMIN'), updateUserRole);
router.get('/stats', protect, authorize('ADMIN'), getAdminStats);

export default router;
