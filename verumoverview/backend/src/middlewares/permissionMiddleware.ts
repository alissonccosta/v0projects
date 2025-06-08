import { Request, Response, NextFunction } from 'express';

export default function permissionMiddleware(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user || !user.permissoes?.includes(permission)) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
