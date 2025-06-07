import { Request, Response, NextFunction } from 'express';

export default function permissionMiddleware(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !user.permissoes?.includes(permission)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}
