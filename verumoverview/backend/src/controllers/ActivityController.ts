import { Request, Response } from 'express';
import db from '../services/db';
import { Activity } from '../models/Activity';

export default class ActivityController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await db.query('SELECT * FROM atividades ORDER BY data_meta');
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao listar atividades' });
    }
  }

  static async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await db.query('SELECT * FROM atividades WHERE id_atividade=$1', [id]);
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Atividade nao encontrada' });
        return;
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao buscar atividade' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    const fields = req.body as Activity;
    try {
      const result = await db.query(
        `INSERT INTO atividades(
          id_projeto, titulo, descricao, responsavel, time, status,
          data_meta, data_limite, horas_estimadas, horas_gastas, prioridade,
          dependencias, anexos, historico_atualizacoes, comentarios
        ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
        [
          fields.id_projeto,
          fields.titulo,
          fields.descricao,
          fields.responsavel,
          fields.time,
          fields.status,
          fields.data_meta,
          fields.data_limite,
          fields.horas_estimadas,
          fields.horas_gastas,
          fields.prioridade,
          JSON.stringify(fields.dependencias || {}),
          JSON.stringify(fields.anexos || {}),
          JSON.stringify(fields.historico_atualizacoes || {}),
          JSON.stringify(fields.comentarios || {})
        ]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao criar atividade' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const fields = req.body as Activity;
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const sets = keys.map((k, i) => `${k}=$${i + 1}`);
    try {
      const result = await db.query(
        `UPDATE atividades SET ${sets.join(', ')} WHERE id_atividade=$${keys.length + 1} RETURNING *`,
        [...values.map(v => typeof v === 'object' ? JSON.stringify(v) : v), id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Atividade nao encontrada' });
        return;
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao atualizar atividade' });
    }
  }

  static async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await db.query('DELETE FROM atividades WHERE id_atividade=$1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Atividade nao encontrada' });
        return;
      }
      res.json({});
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao remover atividade' });
    }
  }
}
