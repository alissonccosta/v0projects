import request from 'supertest';
jest.mock('../src/services/db');
import bcrypt from 'bcrypt';
import app from '../src/app';
import db from '../src/services/db';
const mockedQuery = db.query as jest.Mock;

describe('Auth routes', () => {
  it('should login and return a token', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 1, senha_hash: bcrypt.hashSync('password', 10), permissoes: ['admin'] }]
    });
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@example.com', senha: 'password' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should reject invalid credentials', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 1, senha_hash: bcrypt.hashSync('password', 10), permissoes: ['admin'] }]
    });
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@example.com', senha: 'wrong' });
    expect(res.status).toBe(401);
  });
});
