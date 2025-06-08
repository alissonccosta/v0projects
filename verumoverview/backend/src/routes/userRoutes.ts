import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import UserController from '../controllers/UserController';

const router = Router();
router.use(authMiddleware);

router.get('/', UserController.list);
router.post('/', UserController.create);
router.put('/:id', UserController.update);
router.delete('/:id', UserController.remove);

export default router;
