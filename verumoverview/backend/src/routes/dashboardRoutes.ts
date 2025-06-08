import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import DashboardController from '../controllers/DashboardController';

const router = Router();
router.use(authMiddleware);

router.get('/metrics', DashboardController.metrics);
router.get('/activities', DashboardController.recentActivities);
router.get('/alerts', DashboardController.alerts);

export default router;
