import { Request, Response } from 'express';
import db from '../services/db';
import { Person } from '../models/Person';

const ALLOWED_FIELDS = [
  'nome_completo',
  'email',
  'cargo_funcao',
  'time',
  'status',
  'perfil_comportamental',
  'engajamento',
  'projetos_vinculados',
  'anexos',
  'historico_movimentacoes',
  'comentarios'
];

export default class PersonController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await db.query('SELECT * FROM pessoas ORDER BY nome_completo');
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao listar pessoas' });
    }
  }

  static async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await db.query('SELECT * FROM pessoas WHERE id_pessoa=$1', [id]);
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Pessoa nao encontrada' });
        return;
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao buscar pessoa' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    const fields = req.body as Person;
    const invalid = Object.keys(fields).filter(k => !ALLOWED_FIELDS.includes(k));
    if (invalid.length) {
      res.status(400).json({ message: `Campos nao permitidos: ${invalid.join(', ')}` });
      return;
    }
    try {
      const result = await db.query(
        `INSERT INTO pessoas(
          nome_completo, email, cargo_funcao, time, status,
          perfil_comportamental, engajamento, projetos_vinculados,
          anexos, historico_movimentacoes, comentarios
        ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [
          fields.nome_completo,
          fields.email,
          fields.cargo_funcao,
          fields.time,
          fields.status,
          JSON.stringify(fields.perfil_comportamental || {}),
          fields.engajamento,
          JSON.stringify(fields.projetos_vinculados || {}),
          JSON.stringify(fields.anexos || {}),
          JSON.stringify(fields.historico_movimentacoes || {}),
          JSON.stringify(fields.comentarios || {})
        ]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao criar pessoa' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const fields = req.body as Person;
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
        `UPDATE pessoas SET ${sets.join(', ')} WHERE id_pessoa=$${keys.length + 1} RETURNING *`,
        [...values.map(v => typeof v === 'object' ? JSON.stringify(v) : v), id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Pessoa nao encontrada' });
        return;
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao atualizar pessoa' });
    }
  }

  static async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await db.query('DELETE FROM pessoas WHERE id_pessoa=$1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Pessoa nao encontrada' });
        return;
      }
      res.json({});
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao remover pessoa' });
    }
  }
}
