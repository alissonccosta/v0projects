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

describe('Time routes', () => {
  it('lists times', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id_time: '1', nome: 'T1' }] });
    const res = await request(app)
      .get('/api/times')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id_time: '1', nome: 'T1' }]);
  });

  it('creates time', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id_time: '2', nome: 'New' }] });
    const res = await request(app)
      .post('/api/times')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'New' });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id_time: '2', nome: 'New' });
  });

  it('updates time', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id_time: '2', nome: 'Upd' }] });
    const res = await request(app)
      .put('/api/times/2')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Upd' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id_time: '2', nome: 'Upd' });
  });

  it('deletes time', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id_time: '2' }] });
    const res = await request(app)
      .delete('/api/times/2')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });
});
