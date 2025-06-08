import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import AccessRequestController from '../controllers/AccessRequestController';
import authMiddleware from '../middlewares/authMiddleware';
import permissionMiddleware from '../middlewares/permissionMiddleware';

const router = Router();
router.post('/login', AuthController.login);
router.post('/solicitar', AccessRequestController.create);
router.get(
  '/solicitacoes',
  authMiddleware,
  permissionMiddleware('admin'),
  AccessRequestController.list
);
router.put(
  '/solicitacoes/:id',
  authMiddleware,
  permissionMiddleware('admin'),
  AccessRequestController.update
);
export default router;
