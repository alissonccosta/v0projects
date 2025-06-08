import { Request, Response } from 'express';
import db from '../services/db';

export default class AccessRequestController {
  static async create(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: 'Email obrigatorio' });
      return;
    }
    try {
      const result = await db.query(
        'INSERT INTO solicitacoes_acesso(email) VALUES($1) RETURNING *',
        [email]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao registrar solicitacao' });
    }
  }

  static async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await db.query(
        'SELECT * FROM solicitacoes_acesso ORDER BY criado_em DESC'
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao listar solicitacoes' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { status } = req.body;
    if (!['aprovado', 'rejeitado', 'pendente'].includes(status)) {
      res.status(400).json({ message: 'Status invalido' });
      return;
    }
    try {
      const result = await db.query(
        'UPDATE solicitacoes_acesso SET status=$1 WHERE id=$2 RETURNING *',
        [status, id]
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
