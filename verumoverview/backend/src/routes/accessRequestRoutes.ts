import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import AccessRequestController from '../controllers/AccessRequestController';

const router = Router();
router.use(authMiddleware);

router.get('/', AccessRequestController.list);
router.post('/', AccessRequestController.create);
router.put('/:id', AccessRequestController.update);

export default router;
