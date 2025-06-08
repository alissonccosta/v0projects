import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import db from '../services/db';
import { User } from '../models/User';

const ALLOWED_FIELDS = ['nome', 'email', 'senha', 'perfil_id'];

export default class UserController {
  static async list(_req: Request, res: Response): Promise<void> {
    try {
      const result = await db.query(
        'SELECT u.id, u.nome, u.email, u.perfil_id, p.nome AS perfil_nome FROM usuarios u LEFT JOIN perfis_acesso p ON u.perfil_id = p.id ORDER BY u.nome'
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao listar usuarios' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    const fields = req.body as any;
    const invalid = Object.keys(fields).filter(k => !ALLOWED_FIELDS.includes(k));
    if (invalid.length) {
      res.status(400).json({ message: `Campos nao permitidos: ${invalid.join(', ')}` });
      return;
    }
    const { nome, email, senha, perfil_id } = fields;
    try {
      const hash = await bcrypt.hash(senha || '123456', 10);
      const result = await db.query(
        'INSERT INTO usuarios(nome, email, senha_hash, perfil_id) VALUES($1,$2,$3,$4) RETURNING id, nome, email, perfil_id',
        [nome, email, hash, perfil_id]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao criar usuario' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const fields = req.body as Partial<User> & { senha?: string };
    const invalid = Object.keys(fields).filter(k => !ALLOWED_FIELDS.includes(k));
    if (invalid.length) {
      res.status(400).json({ message: `Campos nao permitidos: ${invalid.join(', ')}` });
      return;
    }
    const keys = Object.keys(fields).filter(k => ALLOWED_FIELDS.includes(k));
    const values = keys.map(k => (fields as any)[k]);
    const sets = keys.map((k, i) => `${k === 'senha' ? 'senha_hash' : k}=$${i + 1}`);
    try {
      if (fields.senha) {
        const hash = await bcrypt.hash(fields.senha, 10);
        values[keys.indexOf('senha')] = hash;
        keys[keys.indexOf('senha')] = 'senha_hash';
      }
      const result = await db.query(
        `UPDATE usuarios SET ${sets.join(', ')} WHERE id=$${keys.length + 1} RETURNING id, nome, email, perfil_id`,
        [...values, id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Usuario nao encontrado' });
        return;
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao atualizar usuario' });
    }
  }

  static async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await db.query('DELETE FROM usuarios WHERE id=$1 RETURNING id', [id]);
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Usuario nao encontrado' });
        return;
      }
      res.json({});
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao remover usuario' });
    }
  }
}
