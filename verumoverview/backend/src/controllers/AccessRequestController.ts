import { Request, Response } from 'express';
import db from '../services/db';
import { AccessRequest } from '../models/AccessRequest';

const ALLOWED_FIELDS = ['email', 'status'];

export default class AccessRequestController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await db.query('SELECT * FROM solicitacoes_acesso ORDER BY id');
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao listar solicitacoes' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    const fields = req.body as AccessRequest;
    const invalid = Object.keys(fields).filter(k => !ALLOWED_FIELDS.includes(k));
    if (invalid.length) {
      res.status(400).json({ message: `Campos nao permitidos: ${invalid.join(', ')}` });
      return;
    }
    const { email, status = 'pendente' } = fields;
    try {
      const result = await db.query(
        'INSERT INTO solicitacoes_acesso(email, status) VALUES($1,$2) RETURNING *',
        [email, status]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao criar solicitacao' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const fields = req.body as AccessRequest;
    const invalid = Object.keys(fields).filter(k => !ALLOWED_FIELDS.includes(k));
    if (invalid.length) {
      res.status(400).json({ message: `Campos nao permitidos: ${invalid.join(', ')}` });
      return;
    }
    const keys = Object.keys(fields).filter(k => ALLOWED_FIELDS.includes(k));
    const values = keys.map(k => (fields as any)[k]);
    const sets = keys.map((k, i) => `${k}=$${i + 1}`);
    try {
      const result = await db.query(
        `UPDATE solicitacoes_acesso SET ${sets.join(', ')} WHERE id=$${keys.length + 1} RETURNING *`,
        [...values, id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Solicitacao nao encontrada' });
        return;
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao atualizar solicitacao' });
    }
  }
}
