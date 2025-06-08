import request from 'supertest';
jest.mock('../src/services/db');
import app from '../src/app';
import bcrypt from 'bcrypt';
import db from '../src/services/db';
const mockedQuery = db.query as jest.Mock;

let token: string;

beforeAll(async () => {
  mockedQuery.mockResolvedValueOnce({
    rows: [{ id: 1, senha_hash: bcrypt.hashSync('password', 10), permissoes: ['admin'] }]
  });
  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'admin@example.com', senha: 'password' });
  token = res.body.token;
});

afterEach(() => mockedQuery.mockReset());

describe('Misc routes', () => {
  it('should access protected endpoint with token', async () => {
    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Access granted' });
  });

  it('should record log', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] });
    const res = await request(app)
      .post('/logs')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'logged' });
  });
});
