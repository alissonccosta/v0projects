import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import TimeController from '../controllers/TimeController';

const router = Router();
router.use(authMiddleware);

router.get('/', TimeController.list);
router.get('/:id', TimeController.get);
router.post('/', TimeController.create);
router.put('/:id', TimeController.update);
router.delete('/:id', TimeController.remove);

export default router;
