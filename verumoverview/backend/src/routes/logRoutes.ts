import { Router } from 'express';

const router = Router();

router.post('/', (req, res) => {
  res.json({ status: 'logged' });
});

export default router;
