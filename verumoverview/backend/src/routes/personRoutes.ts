import { Router } from 'express';
import PersonController from '../controllers/PersonController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/', PersonController.list);
router.get('/:id', PersonController.get);
router.post('/', PersonController.create);
router.put('/:id', PersonController.update);
router.delete('/:id', PersonController.remove);

export default router;
