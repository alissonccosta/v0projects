import { Request, Response, NextFunction } from 'express';
import logger from '../services/logger';
import db from '../services/db';

export default async function logMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = (req as any).user?.id || 'anonymous';
  const logEntry = {
    user,
    method: req.method,
    url: req.originalUrl,
    timestamp: new Date().toISOString()
  };
  logger.info(logEntry);
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
