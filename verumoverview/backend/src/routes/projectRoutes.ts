import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import ProjectController from '../controllers/ProjectController';

const router = Router();
router.use(authMiddleware);

router.get('/', ProjectController.list);
router.get('/next-code', ProjectController.nextCode);
router.get('/:id', ProjectController.get);
router.post('/', ProjectController.create);
router.put('/:id', ProjectController.update);
router.delete('/:id', ProjectController.remove);

export default router;
