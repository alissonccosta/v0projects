import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import ActivityController from '../controllers/ActivityController';

const router = Router();
router.use(authMiddleware);

router.get('/', ActivityController.list);
router.get('/:id', ActivityController.get);
router.post('/', ActivityController.create);
router.put('/:id', ActivityController.update);
router.delete('/:id', ActivityController.remove);

export default router;
