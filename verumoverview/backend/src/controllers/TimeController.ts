import { Request, Response } from 'express';
import db from '../services/db';
import { Time } from '../models/Time';

const ALLOWED_FIELDS = [
  'nome',
  'lider',
  'capacidade_total',
  'membros',
  'anexos',
  'historico_alteracoes',
  'comentarios'
];

export default class TimeController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await db.query('SELECT * FROM times ORDER BY nome');
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao listar times' });
    }
  }

  static async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await db.query('SELECT * FROM times WHERE id_time=$1', [id]);
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Time nao encontrado' });
        return;
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao buscar time' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    const fields = req.body as Time;
    const invalid = Object.keys(fields).filter(k => !ALLOWED_FIELDS.includes(k));
    if (invalid.length) {
      res.status(400).json({ message: `Campos nao permitidos: ${invalid.join(', ')}` });
      return;
    }
    try {
      const result = await db.query(
        `INSERT INTO times(
          nome, lider, capacidade_total, membros, anexos, historico_alteracoes, comentarios
        ) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [
          fields.nome,
          fields.lider,
          fields.capacidade_total,
          JSON.stringify(fields.membros || {}),
          JSON.stringify(fields.anexos || {}),
          JSON.stringify(fields.historico_alteracoes || {}),
          JSON.stringify(fields.comentarios || {})
        ]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao criar time' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const fields = req.body as Time;
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
        `UPDATE times SET ${sets.join(', ')} WHERE id_time=$${keys.length + 1} RETURNING *`,
        [...values.map(v => typeof v === 'object' ? JSON.stringify(v) : v), id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Time nao encontrado' });
        return;
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao atualizar time' });
    }
  }

  static async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await db.query('DELETE FROM times WHERE id_time=$1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Time nao encontrado' });
        return;
      }
      res.json({});
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao remover time' });
    }
  }
}
