import { Request, Response } from 'express';
import db from '../services/db';

export default class ProfileController {
  static async list(_req: Request, res: Response): Promise<void> {
    try {
      const result = await db.query('SELECT * FROM perfis_acesso ORDER BY nome');
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao listar perfis' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    const { nome, permissoes } = req.body;
    try {
      const result = await db.query(
        'INSERT INTO perfis_acesso(nome, permissoes) VALUES($1,$2) RETURNING *',
        [nome, JSON.stringify(permissoes)]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao criar perfil' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const fields = req.body as any;
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const sets = keys.map((k, i) => `${k}=$${i + 1}`);
    try {
      const result = await db.query(
        `UPDATE perfis_acesso SET ${sets.join(', ')} WHERE id=$${keys.length + 1} RETURNING *`,
        [...values.map(v => (typeof v === 'object' ? JSON.stringify(v) : v)), id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Perfil nao encontrado' });
        return;
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao atualizar perfil' });
    }
  }

  static async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await db.query('DELETE FROM perfis_acesso WHERE id=$1 RETURNING id', [id]);
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Perfil nao encontrado' });
        return;
      }
      res.json({});
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao remover perfil' });
    }
  }
}
