import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Token missing' });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
    return;
  }
}
