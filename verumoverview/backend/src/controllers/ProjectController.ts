import { Request, Response } from 'express';
import db from '../services/db';
import { Project } from '../models/Project';

export default class ProjectController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await db.query('SELECT * FROM projetos ORDER BY nome');
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao listar projetos' });
    }
  }

  static async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await db.query('SELECT * FROM projetos WHERE id_projeto=$1', [id]);
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Projeto nao encontrado' });
        return;
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao buscar projeto' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    const {
      nome,
      codigo_projeto,
      objetivo,
      justificativa,
      stakeholders,
      status,
      data_inicio_prevista,
      data_fim_prevista,
      prioridade,
      criticidade,
      orcamento_planejado,
      time_responsavel
    } = req.body as Project;
    try {
      const result = await db.query(
        `INSERT INTO projetos(
          nome, codigo_projeto, objetivo, justificativa, stakeholders, status,
          data_inicio_prevista, data_fim_prevista, prioridade, criticidade,
          orcamento_planejado, time_responsavel
        ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
        [
          nome,
          codigo_projeto,
          objetivo,
          justificativa,
          JSON.stringify(stakeholders || {}),
          status,
          data_inicio_prevista,
          data_fim_prevista,
          prioridade,
          criticidade,
          orcamento_planejado,
          JSON.stringify(time_responsavel || {})
        ]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao criar projeto' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const fields = req.body as Project;
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const sets = keys.map((k, i) => `${k}=$${i + 1}`);
    try {
      const result = await db.query(
        `UPDATE projetos SET ${sets.join(', ')} WHERE id_projeto=$${keys.length + 1} RETURNING *`,
        [...values.map(v => typeof v === 'object' ? JSON.stringify(v) : v), id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Projeto nao encontrado' });
        return;
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao atualizar projeto' });
    }
  }

  static async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await db.query('DELETE FROM projetos WHERE id_projeto=$1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        res.status(404).json({ message: 'Projeto nao encontrado' });
        return;
      }
      res.json({});
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao remover projeto' });
    }
  }
}
