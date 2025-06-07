import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

export default function logMiddleware(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user?.id || 'anonymous';
  const logEntry = {
    user,
    method: req.method,
    url: req.originalUrl,
    timestamp: new Date().toISOString()
  };
  const logsDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);
  fs.appendFileSync(path.join(logsDir, 'actions.log'), JSON.stringify(logEntry) + '\n');
  next();
}
