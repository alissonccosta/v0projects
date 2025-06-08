import { Request, Response, NextFunction } from 'express';
import logger from '../services/logger';
import db from '../services/db';

export default async function logMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
import { promises as fs } from 'fs';
import path from 'path';
import db from '../services/db';

export default async function logMiddleware(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user?.id || 'anonymous';
  const logEntry = {
    user,
    method: req.method,
    url: req.originalUrl,
    timestamp: new Date().toISOString()
  };
  logger.info(logEntry);
  try {
  const logsDir = path.join(__dirname, '../../logs');
  const logFile = path.join(logsDir, 'actions.log');
  try {
    await fs.mkdir(logsDir, { recursive: true });
    try {
      const { size } = await fs.stat(logFile);
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (size >= maxSize) {
        const rotated = path.join(logsDir, `actions-${Date.now()}.log`);
        await fs.rename(logFile, rotated);
      }
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        console.error('Failed to check log file size', err);
      }
    }
    await fs.appendFile(logFile, JSON.stringify(logEntry) + '\n');
  } catch (err) {
    console.error('Failed to write log file', err);
  }
  try {
    await db.query('INSERT INTO logs(usuario_id, acao, detalhes) VALUES($1,$2,$3)', [
      user === 'anonymous' ? null : Number(user),
      `${req.method} ${req.originalUrl}`,
      JSON.stringify(logEntry)
    ]);
  } catch (err) {
    logger.error({ message: 'Failed to write log to DB', error: (err as Error).message });
  }
  next();
}
