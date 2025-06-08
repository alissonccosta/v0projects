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

  static async activities(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await db.query(
        'SELECT * FROM atividades WHERE id_projeto=$1 ORDER BY data_meta',
        [id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao listar atividades do projeto' });
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
    const { nome } = req.body as Project;
    try {
      const codeRes = await db.query(
        'SELECT COALESCE(MAX(CAST(codigo_projeto AS INTEGER)),0) + 1 AS code FROM projetos'
      );
      const codigo = codeRes.rows[0].code;
      const result = await db.query(
        'INSERT INTO projetos(codigo_projeto, nome) VALUES($1,$2) RETURNING id_projeto, nome',
        [codigo, nome]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao criar projeto' });
    }
  }

  static async nextCode(_req: Request, res: Response): Promise<void> {
    try {
      const result = await db.query(
        'SELECT COALESCE(MAX(CAST(codigo_projeto AS INTEGER)),0) + 1 AS code FROM projetos'
      );
      res.json({ code: result.rows[0].code });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao gerar código' });
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
