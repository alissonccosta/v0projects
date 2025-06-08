import { Request, Response } from 'express';
import db from '../services/db';

export default class LogController {
  static async list(req: Request, res: Response): Promise<void> {
    const { usuario, de, ate } = req.query as any;
    const params: any[] = [];
    const conditions: string[] = [];
    if (usuario) {
      params.push(usuario);
      conditions.push(`usuario_id = $${params.length}`);
    }
    if (de) {
      params.push(de);
      conditions.push(`criado_em >= $${params.length}`);
    }
    if (ate) {
      params.push(ate);
      conditions.push(`criado_em <= $${params.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    try {
      const result = await db.query(
        `SELECT l.*, u.email FROM logs l LEFT JOIN usuarios u ON l.usuario_id=u.id ${where} ORDER BY l.criado_em DESC`,
        params
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao listar logs' });
    }
  }
}
