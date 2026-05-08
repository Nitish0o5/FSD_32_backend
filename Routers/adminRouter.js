import express from 'express';
import { getStats, getAllUsers, toggleUserStatus, updateCourseStatus } from '../Controller/adminController.js';
import { protect, authorize } from '../Middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.put('/courses/:id/status', updateCourseStatus);

export default router;
