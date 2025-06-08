import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import LogController from '../controllers/LogController';

const router = Router();
router.use(authMiddleware);

router.get('/', LogController.list);

export default router;
