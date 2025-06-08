import { Request, Response } from 'express';
import db from '../services/db';

export default class DashboardController {
  static async metrics(_req: Request, res: Response): Promise<void> {
    try {
      const proj = await db.query(
        'SELECT COUNT(*) AS total, COALESCE(AVG(percentual_concluido),0) AS avg FROM projetos'
      );
      const people = await db.query(
        "SELECT COUNT(*) FILTER (WHERE status = 'Ativo') AS active, COALESCE(AVG(engajamento),0) AS eng FROM pessoas"
      );
      res.json({
        totalProjects: Number(proj.rows[0].total),
        projectChange: 0,
        completedPercent: Math.round(Number(proj.rows[0].avg)),
        activePeople: Number(people.rows[0].active),
        performance: Math.round(Number(people.rows[0].eng))
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao obter métricas' });
    }
  }

  static async recentActivities(_req: Request, res: Response): Promise<void> {
    try {
      const result = await db.query(
        `SELECT p.nome AS project, u.nome AS person, a.status, to_char(a.criado_em, 'YYYY-MM-DD') AS date
         FROM atividades a
         LEFT JOIN projetos p ON a.id_projeto = p.id_projeto
         LEFT JOIN usuarios u ON a.responsavel = u.id
         ORDER BY a.criado_em DESC
         LIMIT 10`
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao listar atividades recentes' });
    }
  }

  static async alerts(_req: Request, res: Response): Promise<void> {
    try {
      const result = await db.query(
        `SELECT 'Prazo do projeto ' || nome || ' termina em breve' AS text,
                CASE
                  WHEN data_fim_prevista <= CURRENT_DATE THEN 'high'
                  WHEN data_fim_prevista <= CURRENT_DATE + INTERVAL '3 days' THEN 'medium'
                  ELSE 'low'
                END AS priority
         FROM projetos
         WHERE data_fim_prevista IS NOT NULL
           AND data_fim_prevista <= CURRENT_DATE + INTERVAL '7 days'
         ORDER BY data_fim_prevista`
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao listar alertas' });
    }
  }
}
