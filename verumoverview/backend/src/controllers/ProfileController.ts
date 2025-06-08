import { Request, Response } from 'express';
import db from '../services/db';

const ALLOWED_FIELDS = ['nome', 'permissoes'];

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
    const fields = req.body as any;
    const invalid = Object.keys(fields).filter(k => !ALLOWED_FIELDS.includes(k));
    if (invalid.length) {
      res.status(400).json({ message: `Campos nao permitidos: ${invalid.join(', ')}` });
      return;
    }
    const { nome, permissoes } = fields;
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
    const invalid = Object.keys(fields).filter(k => !ALLOWED_FIELDS.includes(k));
    if (invalid.length) {
      res.status(400).json({ message: `Campos nao permitidos: ${invalid.join(', ')}` });
      return;
    }
    const keys = Object.keys(fields).filter(k => ALLOWED_FIELDS.includes(k));
    const values = keys.map(k => (typeof fields[k] === 'object' ? JSON.stringify(fields[k]) : fields[k]));
    const sets = keys.map((k, i) => `${k}=$${i + 1}`);
    try {
      const result = await db.query(
        `UPDATE perfis_acesso SET ${sets.join(', ')} WHERE id=$${keys.length + 1} RETURNING *`,
        [...values, id]
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
