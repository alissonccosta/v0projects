import request from 'supertest';
jest.mock('../src/services/db');
import app from '../src/app';

describe('Auth routes', () => {
  it('should login and return a token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@example.com', senha: 'password' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@example.com', senha: 'wrong' });
    expect(res.status).toBe(401);
  });
});
