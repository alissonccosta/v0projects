import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from '../services/db';

export default class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    const { email, senha } = req.body;
    try {
      const result = await db.query(
        `SELECT u.id, u.senha_hash, p.permissoes
         FROM usuarios u
         JOIN perfis_acesso p ON u.perfil_id = p.id
         WHERE u.email = $1`,
        [email]
      );
      if (result.rows.length === 0) {
        res.status(401).json({ message: 'Usuário não encontrado' });
        return;
      }
      const user = result.rows[0];
      const valid = await bcrypt.compare(senha, user.senha_hash);
      if (!valid) {
        res.status(401).json({ message: 'Credenciais inválidas' });
        return;
      }
      const token = jwt.sign(
        { id: user.id, permissoes: user.permissoes },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1h' }
      );
      res.json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro no login' });
    }
  }
}
