import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const dummyUser = {
  id: 1,
  email: 'admin@example.com',
  senha_hash: bcrypt.hashSync('password', 10),
  permissoes: ['admin']
};

export default class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    const { email, senha } = req.body;
    if (email !== dummyUser.email) {
      res.status(401).json({ message: 'User not found' });
      return;
    }
    const valid = await bcrypt.compare(senha, dummyUser.senha_hash);
    if (!valid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const token = jwt.sign({ id: dummyUser.id, permissoes: dummyUser.permissoes }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1h'
    });
    res.json({ token });
  }
}
