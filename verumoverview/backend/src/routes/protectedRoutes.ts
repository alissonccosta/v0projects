import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();
router.use(authMiddleware);
router.get('/protected', (req, res) => {
  res.json({ message: 'Access granted' });
});
export default router;
