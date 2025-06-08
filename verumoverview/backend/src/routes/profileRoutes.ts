import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import ProfileController from '../controllers/ProfileController';

const router = Router();
router.use(authMiddleware);

router.get('/', ProfileController.list);
router.post('/', ProfileController.create);
router.put('/:id', ProfileController.update);
router.delete('/:id', ProfileController.remove);

export default router;
